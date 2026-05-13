import Map "mo:core/Map";
import Runtime "mo:core/Runtime";
import Types "../types/books";
import BooksLib "../lib/books";
import OpenAI "../lib/openai";
import Principal "mo:core/Principal";
import AccessControl "mo:caffeineai-authorization/access-control";

mixin (
  accessControlState : AccessControl.AccessControlState,
  books : Map.Map<Types.BookId, Types.Book>,
  requests : Map.Map<Types.RequestId, Types.BorrowRequest>,
  nextBookId : { var value : Nat },
  nextRequestId : { var value : Nat },
  openAIApiKey : { var value : ?Text },
  userOpenAIKeys : Map.Map<Principal, Text>,
  userDisplayNames : Map.Map<Principal, Text>,
) {
  // ── OpenAI API key management (admin-only) ────────────────────────────────

  /// Returns whether the global (admin-set) OpenAI key is configured.
  /// Kept for backward compatibility — always returns false now that per-user keys are used.
  public query func isOpenAIConfigured() : async Bool {
    false;
  };

  /// Returns whether the calling user has their own OpenAI key set.
  public query ({ caller }) func isMyOpenAIConfigured() : async Bool {
    switch (userOpenAIKeys.get(caller)) {
      case (?_) true;
      case null false;
    };
  };

  /// Sets the calling user’s own OpenAI API key.
  public shared ({ caller }) func setMyOpenAIApiKey(key : Text) : async () {
    userOpenAIKeys.add(caller, key);
  };

  // ── Book listings ─────────────────────────────────────────────────────────

  // ── User display names ────────────────────────────────────────────────────

  /// Sets the calling user's display name.
  public shared ({ caller }) func setUserName(name : Text) : async () {
    userDisplayNames.add(caller, name);
  };

  /// Returns the calling user's own display name, or null if not set.
  public query ({ caller }) func getUserName() : async ?Text {
    userDisplayNames.get(caller);
  };

  /// Returns the display name for any principal, or null if not set.
  public query func getUserNameByPrincipal(p : Principal) : async ?Text {
    userDisplayNames.get(p);
  };

  // ── Book listings ─────────────────────────────────────────────────────────

  /// Returns all available books listed by any user.
  public query func listAllBooks() : async [Types.BookSummary] {
    BooksLib.listAvailableBooks(books, userDisplayNames);
  };

  /// Returns all books listed by the authenticated caller.
  public query ({ caller }) func listMyBooks() : async [Types.BookSummary] {
    BooksLib.listMyBooks(books, caller, userDisplayNames);
  };

  /// Adds a new book to the caller's listings.
  public shared ({ caller }) func addBook(
    title : Text,
    author : Text,
    condition : Types.BookCondition,
    location : Text,
    photoUrls : [Text],
  ) : async Types.BookSummary {
    BooksLib.addBook(books, nextBookId, caller, title, author, condition, location, photoUrls, userDisplayNames);
  };

  /// Removes a book from the caller's listings.
  public shared ({ caller }) func deleteBook(bookId : Types.BookId) : async Bool {
    BooksLib.deleteBook(books, caller, bookId);
  };

  /// Updates editable fields of a book the caller owns.
  public shared ({ caller }) func updateBook(
    bookId : Types.BookId,
    fields : Types.BookUpdateFields,
  ) : async Bool {
    BooksLib.updateBook(books, caller, bookId, fields);
  };

  // ── Borrow requests ───────────────────────────────────────────────────────

  /// Sends a borrow request to the owner of the specified book.
  public shared ({ caller }) func sendBorrowRequest(bookId : Types.BookId) : async ?Types.BorrowRequestSummary {
    BooksLib.sendBorrowRequest(books, requests, nextRequestId, caller, bookId, userDisplayNames);
  };

  /// Responds to a borrow request (approve or reject). Only the lender may call this.
  public shared ({ caller }) func respondToBorrowRequest(requestId : Types.RequestId, approve : Bool) : async Bool {
    BooksLib.respondToBorrowRequest(requests, books, caller, requestId, approve);
  };

  /// Returns all borrow requests received by the caller (as lender).
  public query ({ caller }) func listMyReceivedRequests() : async [Types.BorrowRequestSummary] {
    BooksLib.listReceivedRequests(requests, caller, userDisplayNames);
  };

  /// Returns all borrow requests sent by the caller (as borrower).
  public query ({ caller }) func listMySentRequests() : async [Types.BorrowRequestSummary] {
    BooksLib.listSentRequests(requests, caller, userDisplayNames);
  };

  // ── AI Recommendations ────────────────────────────────────────────────────

  /// Fetches all available books, injects them as context, and asks OpenAI for a recommendation.
  /// Uses the calling user’s own OpenAI key — errors if not set.
  public shared ({ caller }) func getAIBookRecommendation(userPrompt : Text) : async Text {
    let key = switch (userOpenAIKeys.get(caller)) {
      case (?k) k;
      case null return "OpenAI API key not set. Please configure your key in Settings.";
    };
    let config = OpenAI.configForKey(key);
    let booksContext = BooksLib.buildBooksContext(books, userDisplayNames);
    let prompt = booksContext # "\n\nUser request: " # userPrompt;
    await* OpenAI.runChatCompletion(config, prompt);
  };
};
