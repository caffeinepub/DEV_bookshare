import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Int "mo:core/Int";
import Time "mo:core/Time";
import Types "../types/chatbot";

module {
  /// Converts an internal Conversation to a shared ConversationSummary.
  public func toSummary(conv : Types.Conversation) : Types.ConversationSummary {
    { id = conv.id; title = conv.title; createdAt = conv.createdAt; updatedAt = conv.updatedAt };
  };

  /// Returns all conversation summaries for a user, most recent first.
  public func listConversations(
    conversations : Map.Map<Types.ConversationId, Types.Conversation>,
    owner : Principal,
  ) : [Types.ConversationSummary] {
    let summaries = conversations.entries()
      .filter(func((_, conv) : (Types.ConversationId, Types.Conversation)) : Bool {
        Principal.equal(conv.owner, owner)
      })
      .map(func((_, conv) : (Types.ConversationId, Types.Conversation)) : Types.ConversationSummary { toSummary(conv) })
      .toArray();
    // Sort by updatedAt descending (most recent first)
    summaries.sort(func(a : Types.ConversationSummary, b : Types.ConversationSummary) : { #less; #equal; #greater } {
      Int.compare(b.updatedAt, a.updatedAt)
    });
  };

  /// Returns a single conversation if it exists and belongs to owner.
  public func getConversation(
    conversations : Map.Map<Types.ConversationId, Types.Conversation>,
    owner : Principal,
    id : Types.ConversationId,
  ) : ?Types.Conversation {
    switch (conversations.get(id)) {
      case (?conv) {
        if (Principal.equal(conv.owner, owner)) ?conv else null;
      };
      case null null;
    };
  };

  /// Creates a new conversation for owner and returns it.
  public func createConversation(
    conversations : Map.Map<Types.ConversationId, Types.Conversation>,
    nextId : { var value : Nat },
    owner : Principal,
  ) : Types.Conversation {
    let id = nextId.value;
    nextId.value += 1;
    let now = Time.now();
    let conv : Types.Conversation = {
      id;
      owner;
      var title = "New Conversation";
      var messages = [];
      createdAt = now;
      var updatedAt = now;
    };
    conversations.add(id, conv);
    conv;
  };

  /// Deletes a conversation owned by owner. Returns true if found and deleted.
  public func deleteConversation(
    conversations : Map.Map<Types.ConversationId, Types.Conversation>,
    owner : Principal,
    id : Types.ConversationId,
  ) : Bool {
    switch (conversations.get(id)) {
      case (?conv) {
        if (Principal.equal(conv.owner, owner)) {
          conversations.remove(id);
          true;
        } else false;
      };
      case null false;
    };
  };

  /// Renames a conversation. Returns true if found and updated.
  public func renameConversation(
    conversations : Map.Map<Types.ConversationId, Types.Conversation>,
    owner : Principal,
    id : Types.ConversationId,
    newTitle : Text,
  ) : Bool {
    switch (conversations.get(id)) {
      case (?conv) {
        if (Principal.equal(conv.owner, owner)) {
          conv.title := newTitle;
          conv.updatedAt := Time.now();
          true;
        } else false;
      };
      case null false;
    };
  };

  /// Appends a user message and an assistant reply to a conversation.
  /// Returns the two new messages. Caller must have already validated the key.
  public func appendMessages(
    conversations : Map.Map<Types.ConversationId, Types.Conversation>,
    nextMessageId : { var value : Nat },
    owner : Principal,
    id : Types.ConversationId,
    userText : Text,
    assistantText : Text,
  ) : ?Types.NewMessageResult {
    switch (conversations.get(id)) {
      case (?conv) {
        if (not Principal.equal(conv.owner, owner)) return null;
        let now = Time.now();
        let userMsg : Types.Message = {
          id = nextMessageId.value;
          role = #user;
          content = userText;
          timestamp = now;
        };
        nextMessageId.value += 1;
        let assistantMsg : Types.Message = {
          id = nextMessageId.value;
          role = #assistant;
          content = assistantText;
          timestamp = now;
        };
        nextMessageId.value += 1;
        conv.messages := conv.messages.concat([userMsg, assistantMsg]);
        conv.updatedAt := now;
        ?{ userMessage = userMsg; assistantMessage = assistantMsg };
      };
      case null null;
    };
  };
};
