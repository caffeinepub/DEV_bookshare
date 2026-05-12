import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import AccessControl "mo:caffeineai-authorization/access-control";
import Types "../types/chatbot";
import ChatbotLib "../lib/chatbot";
import OpenAI "../lib/openai";
import Array "mo:core/Array";

mixin (
  accessControlState : AccessControl.AccessControlState,
  conversations : Map.Map<Types.ConversationId, Types.Conversation>,
  nextConversationId : { var value : Nat },
  nextMessageId : { var value : Nat },
  openAIApiKey : { var value : ?Text },
) {
  // ── OpenAI API key management (admin-only) ────────────────────────────────

  public query func isOpenAIConfigured() : async Bool {
    openAIApiKey.value != null;
  };

  public shared ({ caller }) func setOpenAIApiKey(key : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can set the OpenAI API key");
    };
    openAIApiKey.value := ?key;
  };

  // ── Conversation management ───────────────────────────────────────────────

  /// Returns all conversations for the authenticated caller, most recent first.
  public query ({ caller }) func listMyConversations() : async [Types.ConversationSummary] {
    if (caller.isAnonymous()) Runtime.trap("Sign in to use this feature");
    ChatbotLib.listConversations(conversations, caller);
  };

  /// Creates a new empty conversation and returns its summary.
  public shared ({ caller }) func createConversation() : async Types.ConversationSummary {
    if (caller.isAnonymous()) Runtime.trap("Sign in to use this feature");
    let conv = ChatbotLib.createConversation(conversations, nextConversationId, caller);
    ChatbotLib.toSummary(conv);
  };

  /// Deletes the specified conversation owned by the caller.
  public shared ({ caller }) func deleteConversation(id : Types.ConversationId) : async Bool {
    if (caller.isAnonymous()) Runtime.trap("Sign in to use this feature");
    ChatbotLib.deleteConversation(conversations, caller, id);
  };

  /// Renames the specified conversation owned by the caller.
  public shared ({ caller }) func renameConversation(id : Types.ConversationId, newTitle : Text) : async Bool {
    if (caller.isAnonymous()) Runtime.trap("Sign in to use this feature");
    ChatbotLib.renameConversation(conversations, caller, id, newTitle);
  };

  // ── Messaging & AI integration ────────────────────────────────────────────

  /// Returns all messages in the specified conversation.
  public query ({ caller }) func getConversationMessages(id : Types.ConversationId) : async ?[Types.Message] {
    if (caller.isAnonymous()) Runtime.trap("Sign in to use this feature");
    switch (ChatbotLib.getConversation(conversations, caller, id)) {
      case (?conv) ?conv.messages;
      case null null;
    };
  };

  /// Sends a user message in a conversation and returns the AI reply.
  public shared ({ caller }) func sendMessage(
    conversationId : Types.ConversationId,
    userText : Text,
  ) : async Types.NewMessageResult {
    if (caller.isAnonymous()) Runtime.trap("Sign in to use this feature");
    let ?key = openAIApiKey.value else Runtime.trap("OpenAI is not configured");
    // Verify the conversation exists and belongs to the caller
    let ?conv = ChatbotLib.getConversation(conversations, caller, conversationId)
      else Runtime.trap("Conversation not found");
    // Build message history for context
    let history : [{ role : { #user; #assistant }; content : Text }] = conv.messages.map(
      func(m : Types.Message) : { role : { #user; #assistant }; content : Text } {
        { role = m.role; content = m.content }
      }
    );
    // Append the new user message to the history for the API call
    let fullHistory = history.concat([{ role = #user; content = userText }]);
    let config = OpenAI.configForKey(key);
    let assistantText = await* OpenAI.runChatCompletionWithHistory(config, fullHistory);
    switch (ChatbotLib.appendMessages(conversations, nextMessageId, caller, conversationId, userText, assistantText)) {
      case (?result) result;
      case null Runtime.trap("Failed to append messages");
    };
  };
};
