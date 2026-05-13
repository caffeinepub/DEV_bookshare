import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import Types "../types/books";

module {
  /// Converts a mutable Book to a shared BookSummary.
  public func toBookSummary(book : Types.Book, displayNames : Map.Map<Principal, Text>) : Types.BookSummary {
    {
      id = book.id;
      ownerId = book.ownerId;
      ownerName = displayNames.get(book.ownerId);
      title = book.title;
      author = book.author;
      condition = book.condition;
      location = book.location;
      createdAt = book.createdAt;
      available = book.available;
      photoUrls = book.photoUrls;
    };
  };

  /// Converts a mutable BorrowRequest to a shared BorrowRequestSummary.
  public func toRequestSummary(req : Types.BorrowRequest, displayNames : Map.Map<Principal, Text>) : Types.BorrowRequestSummary {
    {
      id = req.id;
      bookId = req.bookId;
      borrowerId = req.borrowerId;
      lenderId = req.lenderId;
      requesterName = displayNames.get(req.borrowerId);
      ownerName = displayNames.get(req.lenderId);
      status = req.status;
      createdAt = req.createdAt;
    };
  };

  /// Returns all available books (available = true) across all users.
  public func listAvailableBooks(
    books : Map.Map<Types.BookId, Types.Book>,
    displayNames : Map.Map<Principal, Text>,
  ) : [Types.BookSummary] {
    books.entries()
      .filter(func((_, book) : (Types.BookId, Types.Book)) : Bool { book.available })
      .map(func((_, book) : (Types.BookId, Types.Book)) : Types.BookSummary { toBookSummary(book, displayNames) })
      .toArray();
  };

  /// Returns all books owned by a given principal.
  public func listMyBooks(
    books : Map.Map<Types.BookId, Types.Book>,
    owner : Principal,
    displayNames : Map.Map<Principal, Text>,
  ) : [Types.BookSummary] {
    books.entries()
      .filter(func((_, book) : (Types.BookId, Types.Book)) : Bool { Principal.equal(book.ownerId, owner) })
      .map(func((_, book) : (Types.BookId, Types.Book)) : Types.BookSummary { toBookSummary(book, displayNames) })
      .toArray();
  };

  /// Adds a new book listing and returns it.
  public func addBook(
    books : Map.Map<Types.BookId, Types.Book>,
    nextId : { var value : Nat },
    owner : Principal,
    title : Text,
    author : Text,
    condition : Types.BookCondition,
    location : Text,
    photoUrls : [Text],
    displayNames : Map.Map<Principal, Text>,
  ) : Types.BookSummary {
    let id = nextId.value;
    nextId.value += 1;
    let book : Types.Book = {
      id;
      ownerId = owner;
      title;
      author;
      condition;
      location;
      createdAt = Time.now();
      var available = true;
      var photoUrls;
    };
    books.add(id, book);
    toBookSummary(book, displayNames);
  };

  /// Deletes a book owned by owner. Returns true if found and deleted.
  public func deleteBook(
    books : Map.Map<Types.BookId, Types.Book>,
    owner : Principal,
    bookId : Types.BookId,
  ) : Bool {
    switch (books.get(bookId)) {
      case (?book) {
        if (Principal.equal(book.ownerId, owner)) {
          books.remove(bookId);
          true;
        } else false;
      };
      case null false;
    };
  };

  /// Creates a borrow request from borrower to lender for a specific book.
  /// Returns null if the book is not found, not available, or owned by the borrower.
  public func sendBorrowRequest(
    books : Map.Map<Types.BookId, Types.Book>,
    requests : Map.Map<Types.RequestId, Types.BorrowRequest>,
    nextId : { var value : Nat },
    borrower : Principal,
    bookId : Types.BookId,
    displayNames : Map.Map<Principal, Text>,
  ) : ?Types.BorrowRequestSummary {
    switch (books.get(bookId)) {
      case (?book) {
        if (not book.available) return null;
        if (Principal.equal(book.ownerId, borrower)) return null;
        let id = nextId.value;
        nextId.value += 1;
        let req : Types.BorrowRequest = {
          id;
          bookId;
          borrowerId = borrower;
          lenderId = book.ownerId;
          var status = #pending;
          createdAt = Time.now();
        };
        requests.add(id, req);
        ?toRequestSummary(req, displayNames);
      };
      case null null;
    };
  };

  /// Allows the lender to approve or reject a borrow request.
  /// Returns false if the request is not found or the caller is not the lender.
  public func respondToBorrowRequest(
    requests : Map.Map<Types.RequestId, Types.BorrowRequest>,
    books : Map.Map<Types.BookId, Types.Book>,
    lender : Principal,
    requestId : Types.RequestId,
    approve : Bool,
  ) : Bool {
    switch (requests.get(requestId)) {
      case (?req) {
        if (not Principal.equal(req.lenderId, lender)) return false;
        if (req.status != #pending) return false;
        if (approve) {
          req.status := #approved;
          switch (books.get(req.bookId)) {
            case (?book) { book.available := false };
            case null {};
          };
        } else {
          req.status := #rejected;
        };
        true;
      };
      case null false;
    };
  };

  /// Returns all requests received by the caller as a lender.
  public func listReceivedRequests(
    requests : Map.Map<Types.RequestId, Types.BorrowRequest>,
    lender : Principal,
    displayNames : Map.Map<Principal, Text>,
  ) : [Types.BorrowRequestSummary] {
    requests.entries()
      .filter(func((_, req) : (Types.RequestId, Types.BorrowRequest)) : Bool { Principal.equal(req.lenderId, lender) })
      .map(func((_, req) : (Types.RequestId, Types.BorrowRequest)) : Types.BorrowRequestSummary { toRequestSummary(req, displayNames) })
      .toArray();
  };

  /// Returns all requests sent by the caller as a borrower.
  public func listSentRequests(
    requests : Map.Map<Types.RequestId, Types.BorrowRequest>,
    borrower : Principal,
    displayNames : Map.Map<Principal, Text>,
  ) : [Types.BorrowRequestSummary] {
    requests.entries()
      .filter(func((_, req) : (Types.RequestId, Types.BorrowRequest)) : Bool { Principal.equal(req.borrowerId, borrower) })
      .map(func((_, req) : (Types.RequestId, Types.BorrowRequest)) : Types.BorrowRequestSummary { toRequestSummary(req, displayNames) })
      .toArray();
  };

  /// Updates fields on a book. Only the owner may call this.
  /// Returns true if found and updated, false if not found or not the owner.
  public func updateBook(
    books : Map.Map<Types.BookId, Types.Book>,
    owner : Principal,
    bookId : Types.BookId,
    fields : Types.BookUpdateFields,
  ) : Bool {
    switch (books.get(bookId)) {
      case (?book) {
        if (not Principal.equal(book.ownerId, owner)) return false;
        let updated : Types.Book = {
          id = book.id;
          ownerId = book.ownerId;
          title = switch (fields.title) { case (?t) t; case null book.title };
          author = switch (fields.author) { case (?a) a; case null book.author };
          condition = switch (fields.condition) { case (?c) c; case null book.condition };
          location = switch (fields.location) { case (?l) l; case null book.location };
          createdAt = book.createdAt;
          var available = book.available;
          var photoUrls = switch (fields.photoUrls) { case (?urls) urls; case null book.photoUrls };
        };
        books.add(bookId, updated);
        true;
      };
      case null false;
    };
  };

  /// Builds a text context listing all available books for the AI prompt.
  public func buildBooksContext(
    books : Map.Map<Types.BookId, Types.Book>,
    displayNames : Map.Map<Principal, Text>,
  ) : Text {
    let available = listAvailableBooks(books, displayNames);
    if (available.size() == 0) {
      return "No books are currently available for lending.";
    };
    var ctx = "Available books for lending:\n";
    for (book in available.values()) {
      let condText = switch (book.condition) {
        case (#new_) "new";
        case (#good) "good";
        case (#fair) "fair";
        case (#poor) "poor";
      };
      let ownerText = switch (book.ownerName) {
        case (?name) name;
        case null "Anonymous";
      };
      let locationText = if (book.location == "") "" else ", location: " # book.location;
      ctx := ctx # "- \"" # book.title # "\" by " # book.author
        # " (condition: " # condText # locationText # ", listed by: " # ownerText # ")\n";
    };
    ctx;
  };
};
