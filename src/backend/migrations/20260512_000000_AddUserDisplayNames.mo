import Map "mo:core/Map";
import Principal "mo:core/Principal";

module {
  type BookCondition = { #new_; #good; #fair; #poor };
  type RequestStatus = { #pending; #approved; #rejected };

  type UserRole = { #admin; #user; #guest };

  type AccessControlState = {
    var adminAssigned : Bool;
    userRoles : Map.Map<Principal, UserRole>;
  };

  type Book = {
    id : Nat;
    ownerId : Principal;
    title : Text;
    author : Text;
    condition : BookCondition;
    location : Text;
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

  type OldActor = {
    accessControlState : AccessControlState;
    books : Map.Map<Nat, Book>;
    requests : Map.Map<Nat, BorrowRequest>;
    nextBookId : { var value : Nat };
    nextRequestId : { var value : Nat };
    openAIApiKey : { var value : ?Text };
    userOpenAIKeys : Map.Map<Principal, Text>;
  };

  type NewActor = {
    accessControlState : AccessControlState;
    books : Map.Map<Nat, Book>;
    requests : Map.Map<Nat, BorrowRequest>;
    nextBookId : { var value : Nat };
    nextRequestId : { var value : Nat };
    openAIApiKey : { var value : ?Text };
    userOpenAIKeys : Map.Map<Principal, Text>;
    userDisplayNames : Map.Map<Principal, Text>;
  };

  public func migration(old : OldActor) : NewActor {
    {
      accessControlState = old.accessControlState;
      books = old.books;
      requests = old.requests;
      nextBookId = old.nextBookId;
      nextRequestId = old.nextRequestId;
      openAIApiKey = old.openAIApiKey;
      userOpenAIKeys = old.userOpenAIKeys;
      userDisplayNames = Map.empty<Principal, Text>();
    };
  };
};
