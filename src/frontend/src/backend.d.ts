import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type Time = bigint;
export interface BorrowRequestSummary {
    id: RequestId;
    status: RequestStatus;
    borrowerId: Principal;
    createdAt: Time;
    lenderId: Principal;
    bookId: BookId;
}
export interface BookUpdateFields {
    title?: string;
    author?: string;
    location?: string;
    condition?: BookCondition;
}
export interface BookSummary {
    id: BookId;
    title: string;
    ownerId: Principal;
    createdAt: Time;
    author: string;
    available: boolean;
    location: string;
    condition: BookCondition;
}
export type RequestId = bigint;
export type BookId = bigint;
export enum BookCondition {
    new_ = "new",
    fair = "fair",
    good = "good",
    poor = "poor"
}
export enum RequestStatus {
    pending = "pending",
    approved = "approved",
    rejected = "rejected"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addBook(title: string, author: string, condition: BookCondition, location: string): Promise<BookSummary>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteBook(bookId: BookId): Promise<boolean>;
    getAIBookRecommendation(userPrompt: string): Promise<string>;
    getCallerUserRole(): Promise<UserRole>;
    isCallerAdmin(): Promise<boolean>;
    isMyOpenAIConfigured(): Promise<boolean>;
    isOpenAIConfigured(): Promise<boolean>;
    listAllBooks(): Promise<Array<BookSummary>>;
    listMyBooks(): Promise<Array<BookSummary>>;
    listMyReceivedRequests(): Promise<Array<BorrowRequestSummary>>;
    listMySentRequests(): Promise<Array<BorrowRequestSummary>>;
    respondToBorrowRequest(requestId: RequestId, approve: boolean): Promise<boolean>;
    sendBorrowRequest(bookId: BookId): Promise<BorrowRequestSummary | null>;
    setMyOpenAIApiKey(key: string): Promise<void>;
    updateBook(bookId: BookId, fields: BookUpdateFields): Promise<boolean>;
}
