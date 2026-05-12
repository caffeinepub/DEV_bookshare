import Time "mo:core/Time";

module {
  public type ConversationId = Nat;
  public type MessageId = Nat;

  public type MessageRole = { #user; #assistant };

  public type Message = {
    id : MessageId;
    role : MessageRole;
    content : Text;
    timestamp : Time.Time;
  };

  public type Conversation = {
    id : ConversationId;
    owner : Principal;
    var title : Text;
    var messages : [Message];
    createdAt : Time.Time;
    var updatedAt : Time.Time;
  };

  public type ConversationSummary = {
    id : ConversationId;
    title : Text;
    createdAt : Time.Time;
    updatedAt : Time.Time;
  };

  public type NewMessageResult = {
    userMessage : Message;
    assistantMessage : Message;
  };
};
