import Time "mo:core/Time";

module {
  public type BookId = Nat;
  public type RequestId = Nat;
  /// Partial update fields for a book — all fields optional.
  public type BookUpdateFields = {
    title : ?Text;
    author : ?Text;
    condition : ?BookCondition;
    location : ?Text;
    photoUrls : ?[Text];
  };

  public type BookCondition = {
    #new_;
    #good;
    #fair;
    #poor;
  };

  public type RequestStatus = {
    #pending;
    #approved;
    #rejected;
  };

  public type Book = {
    id : BookId;
    ownerId : Principal;
    title : Text;
    author : Text;
    condition : BookCondition;
    location : Text;
    createdAt : Time.Time;
    var available : Bool;
    var photoUrls : [Text];
  };

  public type BookSummary = {
    id : BookId;
    ownerId : Principal;
    ownerName : ?Text;
    title : Text;
    author : Text;
    condition : BookCondition;
    location : Text;
    createdAt : Time.Time;
    available : Bool;
    photoUrls : [Text];
  };

  public type BorrowRequest = {
    id : RequestId;
    bookId : BookId;
    borrowerId : Principal;
    lenderId : Principal;
    var status : RequestStatus;
    createdAt : Time.Time;
  };

  public type BorrowRequestSummary = {
    id : RequestId;
    bookId : BookId;
    borrowerId : Principal;
    lenderId : Principal;
    requesterName : ?Text;
    ownerName : ?Text;
    status : RequestStatus;
    createdAt : Time.Time;
  };
};
