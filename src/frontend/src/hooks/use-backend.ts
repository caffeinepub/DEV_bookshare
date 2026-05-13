import { createActor } from "@/backend";
import type {
  BookSummary as BackendBookSummary,
  BorrowRequestSummary as BackendBorrowRequestSummary,
} from "@/backend";
import type {
  AIRecommendationResult,
  BookCondition,
  BookSummary,
  BorrowRequestSummary,
  RequestStatus,
} from "@/types";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

function useBackendActor() {
  return useActor(createActor);
}

// ── Admin / config ────────────────────────────────────────────────────────────

export function useIsOpenAIConfigured() {
  const { actor, isFetching } = useBackendActor();
  return useQuery<boolean>({
    queryKey: ["isOpenAIConfigured"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isOpenAIConfigured();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useIsMyOpenAIConfigured() {
  const { actor, isFetching } = useBackendActor();
  return useQuery<boolean>({
    queryKey: ["isMyOpenAIConfigured"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isMyOpenAIConfigured();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSetMyOpenAIApiKey() {
  const { actor } = useBackendActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (key: string) => {
      if (!actor) throw new Error("Actor not available");
      return actor.setMyOpenAIApiKey(key);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["isMyOpenAIConfigured"] });
    },
  });
}

export function useIsCallerAdmin() {
  const { actor, isFetching } = useBackendActor();
  return useQuery<boolean>({
    queryKey: ["isCallerAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSetOpenAIApiKey() {
  const { actor } = useBackendActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (key: string) => {
      if (!actor) throw new Error("Actor not available");
      return actor.setMyOpenAIApiKey(key);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["isOpenAIConfigured"] });
      queryClient.invalidateQueries({ queryKey: ["isMyOpenAIConfigured"] });
    },
  });
}

// ── User name ────────────────────────────────────────────────────────────────

export function useGetUserName() {
  const { actor, isFetching } = useBackendActor();
  return useQuery<string | null>({
    queryKey: ["userName"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getUserName();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSetUserName() {
  const { actor } = useBackendActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      if (!actor) throw new Error("Actor not available");
      return actor.setUserName(name);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userName"] });
      // Refresh book lists so ownerName reflects the new name
      queryClient.invalidateQueries({ queryKey: ["myBooks"] });
      queryClient.invalidateQueries({ queryKey: ["allBooks"] });
    },
  });
}

// ── Books ─────────────────────────────────────────────────────────────────────

function mapBookSummary(b: BackendBookSummary): BookSummary {
  return {
    id: b.id,
    title: b.title,
    author: b.author,
    condition: b.condition as BookCondition,
    isAvailable: b.available,
    ownerId: b.ownerId?.toString() ?? "",
    ownerName: b.ownerName ?? null,
    location: b.location,
    photoUrls: b.photoUrls ?? [],
  };
}

function mapRequestSummary(
  r: BackendBorrowRequestSummary,
): BorrowRequestSummary {
  return {
    id: r.id,
    bookId: r.bookId,
    borrowerId: r.borrowerId?.toString() ?? "",
    lenderId: r.lenderId?.toString() ?? "",
    status: r.status as RequestStatus,
    createdAt: r.createdAt,
    requesterName: r.requesterName ?? null,
    ownerName: r.ownerName ?? null,
  };
}

export function useListAllBooks() {
  const { actor, isFetching } = useBackendActor();
  return useQuery<BookSummary[]>({
    queryKey: ["allBooks"],
    queryFn: async () => {
      if (!actor) return [];
      const result = await actor.listAllBooks();
      return result.map(mapBookSummary);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useListMyBooks() {
  const { actor, isFetching } = useBackendActor();
  return useQuery<BookSummary[]>({
    queryKey: ["myBooks"],
    queryFn: async () => {
      if (!actor) return [];
      const result = await actor.listMyBooks();
      return result.map(mapBookSummary);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddBook() {
  const { actor } = useBackendActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      title: string;
      author: string;
      condition: BookCondition;
      location?: string;
      photoUrls?: string[];
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.addBook(
        params.title,
        params.author,
        params.condition as import("@/backend").BookCondition,
        params.location?.trim() ?? "",
        params.photoUrls ?? [],
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myBooks"] });
      queryClient.invalidateQueries({ queryKey: ["allBooks"] });
    },
  });
}

export function useDeleteBook() {
  const { actor } = useBackendActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (bookId: bigint) => {
      if (!actor) throw new Error("Actor not available");
      return actor.deleteBook(bookId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myBooks"] });
      queryClient.invalidateQueries({ queryKey: ["allBooks"] });
    },
  });
}
export function useUpdateBook() {
  const { actor } = useBackendActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      bookId: bigint;
      fields: {
        title?: string;
        author?: string;
        condition?: string;
        location?: string;
        photoUrls?: string[];
      };
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.updateBook(
        params.bookId,
        params.fields as import("@/backend").BookUpdateFields,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myBooks"] });
      queryClient.invalidateQueries({ queryKey: ["allBooks"] });
    },
  });
}

// ── Borrow requests ──────────────────────────────────────────────────────────

export function useSendBorrowRequest() {
  const { actor } = useBackendActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (bookId: bigint) => {
      if (!actor) throw new Error("Actor not available");
      return actor.sendBorrowRequest(bookId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sentRequests"] });
      queryClient.invalidateQueries({ queryKey: ["allBooks"] });
    },
  });
}

export function useRespondToBorrowRequest() {
  const { actor } = useBackendActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: { requestId: bigint; approve: boolean }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.respondToBorrowRequest(params.requestId, params.approve);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["receivedRequests"] });
      queryClient.invalidateQueries({ queryKey: ["myBooks"] });
      queryClient.invalidateQueries({ queryKey: ["allBooks"] });
    },
  });
}

export function useListMyReceivedRequests() {
  const { actor, isFetching } = useBackendActor();
  return useQuery<BorrowRequestSummary[]>({
    queryKey: ["receivedRequests"],
    queryFn: async () => {
      if (!actor) return [];
      const result = await actor.listMyReceivedRequests();
      return result.map(mapRequestSummary);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useListMySentRequests() {
  const { actor, isFetching } = useBackendActor();
  return useQuery<BorrowRequestSummary[]>({
    queryKey: ["sentRequests"],
    queryFn: async () => {
      if (!actor) return [];
      const result = await actor.listMySentRequests();
      return result.map(mapRequestSummary);
    },
    enabled: !!actor && !isFetching,
  });
}

// ── AI recommendations ────────────────────────────────────────────────────────

export function useGetAIBookRecommendation() {
  const { actor } = useBackendActor();
  return useMutation({
    mutationFn: async (prompt: string): Promise<AIRecommendationResult> => {
      if (!actor) throw new Error("Actor not available");
      const message = await actor.getAIBookRecommendation(prompt);
      return { message, suggestedBookIds: [] };
    },
  });
}
