import type { backendInterface, BookSummary, BorrowRequestSummary } from "../backend";
import { BookCondition, RequestStatus, UserRole } from "../backend";
import { Principal } from "@icp-sdk/core/principal";

const samplePrincipal = Principal.fromText("aaaaa-aa");

const sampleBooks: BookSummary[] = [
  {
    id: BigInt(1),
    title: "The Midnight Library",
    author: "Matt Haig",
    ownerId: samplePrincipal,
    createdAt: BigInt(Date.now()),
    available: true,
    condition: BookCondition.good,
    location: "Central Library, Shelf B3",
    photoUrls: [],
  },
  {
    id: BigInt(2),
    title: "Dune",
    author: "Frank Herbert",
    ownerId: samplePrincipal,
    createdAt: BigInt(Date.now()),
    available: false,
    condition: BookCondition.fair,
    location: "",
    photoUrls: [],
  },
  {
    id: BigInt(3),
    title: "Sapiens",
    author: "Yuval Noah Harari",
    ownerId: samplePrincipal,
    createdAt: BigInt(Date.now()),
    available: true,
    condition: BookCondition.new_,
    location: "Downtown Community Centre",
    photoUrls: [],
  },
  {
    id: BigInt(4),
    title: "The Name of the Wind",
    author: "Patrick Rothfuss",
    ownerId: samplePrincipal,
    createdAt: BigInt(Date.now()),
    available: true,
    condition: BookCondition.good,
    location: "",
    photoUrls: [],
  },
];

const myBooks: BookSummary[] = [
  {
    id: BigInt(5),
    title: "Normal People",
    author: "Sally Rooney",
    ownerId: samplePrincipal,
    createdAt: BigInt(Date.now()),
    available: true,
    condition: BookCondition.new_,
    location: "My home — ask for pickup details",
    photoUrls: [],
  },
  {
    id: BigInt(6),
    title: "1984",
    author: "George Orwell",
    ownerId: samplePrincipal,
    createdAt: BigInt(Date.now()),
    available: false,
    condition: BookCondition.poor,
    location: "",
    photoUrls: [],
  },
];

const receivedRequests: BorrowRequestSummary[] = [
  {
    id: BigInt(1),
    bookId: BigInt(5),
    borrowerId: samplePrincipal,
    lenderId: samplePrincipal,
    status: RequestStatus.pending,
    createdAt: BigInt(Date.now()),
  },
];

const sentRequests: BorrowRequestSummary[] = [
  {
    id: BigInt(2),
    bookId: BigInt(2),
    borrowerId: samplePrincipal,
    lenderId: samplePrincipal,
    status: RequestStatus.approved,
    createdAt: BigInt(Date.now()),
  },
];

export const mockBackend: backendInterface = {
  addBook: async (title, author, condition, location) => ({
    id: BigInt(Math.floor(Math.random() * 1000)),
    title,
    author,
    ownerId: samplePrincipal,
    createdAt: BigInt(Date.now()),
    available: true,
    condition,
    location,
    photoUrls: [],
  }),
  assignCallerUserRole: async () => undefined,
  deleteBook: async () => true,
  getAIBookRecommendation: async () =>
    "Based on the available books, I'd recommend **The Midnight Library** by Matt Haig — it's a beautiful story about second chances and the lives we could have lived. It's currently available nearby!",
  getCallerUserRole: async () => UserRole.user,
  isCallerAdmin: async () => false,
  isOpenAIConfigured: async () => true,
  isMyOpenAIConfigured: async () => false,
  listAllBooks: async () => sampleBooks,
  listMyBooks: async () => myBooks,
  listMyReceivedRequests: async () => receivedRequests,
  listMySentRequests: async () => sentRequests,
  respondToBorrowRequest: async () => true,
  sendBorrowRequest: async (bookId) => ({
    id: BigInt(Math.floor(Math.random() * 1000)),
    bookId,
    borrowerId: samplePrincipal,
    lenderId: samplePrincipal,
    status: RequestStatus.pending,
    createdAt: BigInt(Date.now()),
  }),
  setMyOpenAIApiKey: async () => undefined,
  updateBook: async () => true,
  _initializeAccessControl: async () => undefined,
  getUserName: async () => "BookShare User",
  getUserNameByPrincipal: async () => "BookShare User",
  setUserName: async () => undefined,
};
