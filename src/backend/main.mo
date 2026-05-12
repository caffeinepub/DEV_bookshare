import Map "mo:core/Map";
import AccessControl "mo:caffeineai-authorization/access-control";
import MixinAuthorization "mo:caffeineai-authorization/MixinAuthorization";
import MixinBooks "mixins/books-api";
import BookTypes "types/books";

actor {
  // ── Authorization ────────────────────────────────────────────────────────────
  let accessControlState : AccessControl.AccessControlState;
  include MixinAuthorization(accessControlState);

  // ── Book lending state ───────────────────────────────────────────────────
  let books : Map.Map<BookTypes.BookId, BookTypes.Book>;
  let requests : Map.Map<BookTypes.RequestId, BookTypes.BorrowRequest>;
  let nextBookId : { var value : Nat };
  let nextRequestId : { var value : Nat };
  let openAIApiKey : { var value : ?Text };
  let userOpenAIKeys : Map.Map<Principal, Text>;

  include MixinBooks(
    accessControlState,
    books,
    requests,
    nextBookId,
    nextRequestId,
    openAIApiKey,
    userOpenAIKeys,
  );
};
