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

  type OldBook = {
    id : Nat;
    ownerId : Principal;
    title : Text;
    author : Text;
    condition : BookCondition;
    createdAt : Int;
    var available : Bool;
  };

  type NewBook = {
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
    books : Map.Map<Nat, OldBook>;
    requests : Map.Map<Nat, BorrowRequest>;
    nextBookId : { var value : Nat };
    nextRequestId : { var value : Nat };
    openAIApiKey : { var value : ?Text };
  };

  type NewActor = {
    accessControlState : AccessControlState;
    books : Map.Map<Nat, NewBook>;
    requests : Map.Map<Nat, BorrowRequest>;
    nextBookId : { var value : Nat };
    nextRequestId : { var value : Nat };
    openAIApiKey : { var value : ?Text };
  };

  public func migration(old : OldActor) : NewActor {
    let books = old.books.map<Nat, OldBook, NewBook>(
      func(_, book) {
        {
          id = book.id;
          ownerId = book.ownerId;
          title = book.title;
          author = book.author;
          condition = book.condition;
          location = "";
          createdAt = book.createdAt;
          var available = book.available;
        };
      }
    );
    {
      accessControlState = old.accessControlState;
      books;
      requests = old.requests;
      nextBookId = old.nextBookId;
      nextRequestId = old.nextRequestId;
      openAIApiKey = old.openAIApiKey;
    };
  };
};
