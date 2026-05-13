// Re-export legacy backend types that still exist
export type { UserRole } from "@/backend";

// Book condition — matches backend BookCondition enum values
export type BookCondition = "new" | "good" | "fair" | "poor";

// Request status — matches backend RequestStatus enum values
export type RequestStatus = "pending" | "approved" | "rejected";

// Book summary used in the frontend (mapped from backend BookSummary)
export interface BookSummary {
  id: bigint;
  title: string;
  author: string;
  condition: BookCondition;
  isAvailable: boolean;
  /** Principal stringified for display */
  ownerId: string;
  /** Display name of the owner, or null if not set */
  ownerName: string | null;
  /** Pickup/collection location provided by the lender (empty string if not set) */
  location: string;
  /** Photo data URLs (base64), up to 10 */
  photoUrls: string[];
}

// Borrow request summary used in the frontend (mapped from backend BorrowRequestSummary)
export interface BorrowRequestSummary {
  id: bigint;
  bookId: bigint;
  /** Principal stringified for display */
  borrowerId: string;
  /** Principal stringified for display */
  lenderId: string;
  status: RequestStatus;
  createdAt: bigint;
  /** Display name of the requester, or null if not set */
  requesterName: string | null;
  /** Display name of the book owner, or null if not set */
  ownerName: string | null;
}

// AI recommendation result
export interface AIRecommendationResult {
  message: string;
  suggestedBookIds: bigint[];
}

// App-level route
export type AppRoute = "dashboard" | "my-books" | "requests" | "settings";

// App-level state shape
export interface BookLendingState {
  currentRoute: AppRoute;
}
