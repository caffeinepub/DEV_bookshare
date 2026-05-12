import Map "mo:core/Map";
import Principal "mo:core/Principal";

module {
  type UserRole = { #admin; #user; #guest };

  type AccessControlState = {
    var adminAssigned : Bool;
    userRoles : Map.Map<Principal, UserRole>;
  };

  type BookCondition = { #new_; #good; #fair; #poor };
  type RequestStatus = { #pending; #approved; #rejected };

  type Book = {
    id : Nat;
    ownerId : Principal;
    title : Text;
    author : Text;
    condition : BookCondition;
    createdAt : Int;
    var available : Bool;
  };

  type BorrowRequest = {
    id : Nat;
    bookId : Nat;
    borrowerId : Principal;
    lenderId : Principal;
    var status : RequestStatus;
    createdAt : Int;
  };

  // Old actor had chatbot state
  type OldActor = {
    accessControlState : AccessControlState;
    conversations : Map.Map<Nat, {
      id : Nat;
      owner : Principal;
      var title : Text;
      var messages : [{
        id : Nat;
        role : { #user; #assistant };
        content : Text;
        timestamp : Int;
      }];
      createdAt : Int;
      var updatedAt : Int;
    }>;
    nextConversationId : { var value : Nat };
    nextMessageId : { var value : Nat };
    openAIApiKey : { var value : ?Text };
  };

  type NewActor = {
    accessControlState : AccessControlState;
    books : Map.Map<Nat, Book>;
    requests : Map.Map<Nat, BorrowRequest>;
    nextBookId : { var value : Nat };
    nextRequestId : { var value : Nat };
    openAIApiKey : { var value : ?Text };
  };

  public func migration(old : OldActor) : NewActor {
    {
      accessControlState = old.accessControlState;
      books = Map.empty<Nat, Book>();
      requests = Map.empty<Nat, BorrowRequest>();
      nextBookId = { var value = 0 };
      nextRequestId = { var value = 0 };
      openAIApiKey = old.openAIApiKey;
    };
  };
};
