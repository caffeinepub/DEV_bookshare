import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useGetAIBookRecommendation,
  useGetUserName,
  useIsMyOpenAIConfigured,
  useListAllBooks,
  useSendBorrowRequest,
} from "@/hooks/use-backend";
import type { AppRoute, BookSummary } from "@/types";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Images,
  Loader2,
  MapPin,
  Send,
  Sparkles,
  X,
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

interface DashboardPageProps {
  onNavigate: (route: AppRoute) => void;
}

const CONDITION_STYLE: Record<string, { badge: string; label: string }> = {
  new: {
    badge: "bg-accent/20 text-accent-foreground border-accent/40",
    label: "New",
  },
  good: {
    badge: "bg-secondary/20 text-secondary-foreground border-secondary/40",
    label: "Good",
  },
  fair: {
    badge: "bg-primary/10 text-primary border-primary/30",
    label: "Fair",
  },
  poor: {
    badge: "bg-destructive/10 text-destructive border-destructive/30",
    label: "Poor",
  },
};

// ── Photo gallery viewer ─────────────────────────────────────────────────────

function PhotoGallery({ photos }: { photos: string[] }) {
  const [active, setActive] = useState(0);
  if (photos.length === 0) return null;

  const prev = () => setActive((i) => (i - 1 + photos.length) % photos.length);
  const next = () => setActive((i) => (i + 1) % photos.length);

  return (
    <div className="space-y-2" data-ocid="dashboard.book_photo_gallery">
      {/* Main photo */}
      <div className="relative">
        <img
          src={photos[active]}
          alt={`${active + 1} of ${photos.length}`}
          className="w-full h-64 object-cover rounded-lg border border-border"
        />
        {photos.length > 1 && (
          <>
            <button
              type="button"
              aria-label="Previous photo"
              onClick={prev}
              className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm border border-border flex items-center justify-center hover:bg-muted transition-colors"
              data-ocid="dashboard.gallery_prev"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="Next photo"
              onClick={next}
              className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm border border-border flex items-center justify-center hover:bg-muted transition-colors"
              data-ocid="dashboard.gallery_next"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <span className="absolute bottom-2 right-2 bg-background/80 text-foreground text-xs px-2 py-0.5 rounded-full border border-border">
              {active + 1} / {photos.length}
            </span>
          </>
        )}
      </div>
      {/* Thumbnails */}
      {photos.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {photos.map((url, idx) => (
            <button
              key={url}
              type="button"
              aria-label={`View image ${idx + 1}`}
              onClick={() => setActive(idx)}
              className={`flex-shrink-0 h-14 w-14 rounded-md overflow-hidden border-2 transition-colors ${
                idx === active
                  ? "border-primary"
                  : "border-border hover:border-primary/50"
              }`}
              data-ocid={`dashboard.gallery_thumb.${idx + 1}`}
            >
              <img
                src={url}
                alt={`Thumbnail ${idx + 1}`}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Book card ────────────────────────────────────────────────────────────────

function BookCard({
  book,
  onClick,
}: {
  book: BookSummary;
  onClick: () => void;
}) {
  const cond = CONDITION_STYLE[book.condition];
  const photos = book.photoUrls ?? [];
  const coverPhoto = photos[0];
  return (
    <Card
      className="flex flex-col hover:shadow-md transition-smooth group border-border hover:-translate-y-0.5 cursor-pointer overflow-hidden"
      onClick={onClick}
    >
      {/* Cover with count badge */}
      <div className="relative">
        {coverPhoto ? (
          <img
            src={coverPhoto}
            alt={book.title}
            className="w-full h-40 object-cover rounded-t-lg"
          />
        ) : (
          <div className="w-full h-40 bg-muted/40 flex flex-col items-center justify-center gap-1.5 rounded-t-lg">
            <BookOpen className="h-8 w-8 text-muted-foreground/40" />
            <span className="text-xs text-muted-foreground/50">No photo</span>
          </div>
        )}
        {photos.length > 1 && (
          <span className="absolute bottom-2 right-2 flex items-center gap-1 bg-background/80 backdrop-blur-sm text-foreground text-xs px-1.5 py-0.5 rounded-full border border-border font-medium">
            <Images className="h-3 w-3" />
            {photos.length}
          </span>
        )}
      </div>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
            <BookOpen className="h-5 w-5 text-primary" />
          </div>
          <Badge
            variant="outline"
            className={`text-xs font-medium shrink-0 ${
              book.isAvailable
                ? "bg-accent/15 text-accent-foreground border-accent/35"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {book.isAvailable ? "Available" : "Borrowed"}
          </Badge>
        </div>
        <CardTitle className="font-display text-base leading-snug mt-2 line-clamp-2">
          {book.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-3 pt-0">
        <p className="text-sm text-muted-foreground italic">{book.author}</p>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className={`text-xs ${cond?.badge ?? ""}`}>
            {cond?.label ?? book.condition}
          </Badge>
          <span className="text-xs text-muted-foreground truncate">
            Listed by {book.ownerName ?? "Anonymous"}
          </span>
        </div>
        {book.location && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3 shrink-0 text-primary/60" />
            <span className="truncate">{book.location}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ── Chat types ─────────────────────────────────────────────────────────────────

interface ChatMessage {
  id: string;
  role: "user" | "ai";
  text: string;
}

// ── Book detail modal ────────────────────────────────────────────────────────

function BookDetailModal({
  book,
  onClose,
  onRequest,
  isRequesting,
}: {
  book: BookSummary;
  onClose: () => void;
  onRequest: () => void;
  isRequesting: boolean;
}) {
  const cond = CONDITION_STYLE[book.condition];
  const photos = book.photoUrls ?? [];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
      onKeyDown={(e) => e.key === "Escape" && onClose()}
      role="presentation"
      data-ocid="dashboard.book_detail_modal"
    >
      <div
        className="relative w-full max-w-lg bg-card rounded-2xl shadow-xl overflow-hidden border border-border max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-3 right-3 z-10 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm border border-border flex items-center justify-center hover:bg-muted transition-colors"
          data-ocid="dashboard.book_detail_close_button"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Photo section */}
        {photos.length > 0 ? (
          <div className="p-4 pb-0">
            <PhotoGallery photos={photos} />
          </div>
        ) : (
          <div className="w-full h-48 bg-muted/40 flex flex-col items-center justify-center gap-2">
            <BookOpen className="h-12 w-12 text-muted-foreground/40" />
            <span className="text-sm text-muted-foreground/50">
              No photos available
            </span>
          </div>
        )}

        {/* Details */}
        <div className="p-6 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h2 className="font-display font-bold text-xl text-foreground leading-tight">
                {book.title}
              </h2>
              <p className="text-muted-foreground italic mt-0.5">
                {book.author}
              </p>
            </div>
            <Badge
              variant="outline"
              className={`shrink-0 ${
                book.isAvailable
                  ? "bg-accent/15 text-accent-foreground border-accent/35"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {book.isAvailable ? "Available" : "Borrowed"}
            </Badge>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className={`text-xs ${cond?.badge ?? ""}`}>
              {cond?.label ?? book.condition}
            </Badge>
            <span className="text-sm text-muted-foreground">
              Listed by {book.ownerName ?? "Anonymous"}
            </span>
          </div>

          {book.location && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 shrink-0 text-primary/60" />
              <span>{book.location}</span>
            </div>
          )}

          {book.isAvailable && (
            <Button
              className="w-full mt-2"
              onClick={onRequest}
              disabled={isRequesting}
              data-ocid="dashboard.book_detail_request_button"
            >
              {isRequesting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Requesting...
                </>
              ) : (
                "Request to Borrow"
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function DashboardPage({ onNavigate }: DashboardPageProps) {
  const { data: books, isLoading } = useListAllBooks();
  const requestMutation = useSendBorrowRequest();
  const aiMutation = useGetAIBookRecommendation();
  const { data: myKeyConfigured } = useIsMyOpenAIConfigured();
  const { data: userName } = useGetUserName();
  const [aiPrompt, setAiPrompt] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [requestingId, setRequestingId] = useState<bigint | null>(null);
  const [selectedBook, setSelectedBook] = useState<BookSummary | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const handleRequest = async (book: BookSummary) => {
    setRequestingId(book.id);
    try {
      await requestMutation.mutateAsync(book.id);
      toast.success(`Borrow request sent for "${book.title}"!`);
      setSelectedBook(null);
    } catch {
      toast.error("Failed to send request. Please try again.");
    } finally {
      setRequestingId(null);
    }
  };

  const handleAskAI = async (e: React.FormEvent) => {
    e.preventDefault();
    const prompt = aiPrompt.trim();
    if (!prompt) return;
    setMessages((prev) => [
      ...prev,
      { id: `msg-${Date.now()}-user`, role: "user", text: prompt },
    ]);
    setAiPrompt("");
    try {
      const result = await aiMutation.mutateAsync(prompt);
      const isKeyMissing = result.message
        .toLowerCase()
        .includes("openai api key not set");
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now()}-ai`,
          role: "ai",
          text: isKeyMissing ? "__key_missing__" : result.message,
        },
      ]);
      setTimeout(
        () => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }),
        50,
      );
    } catch {
      toast.error(
        "AI is unavailable. Please set your OpenAI API key in Settings.",
      );
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now()}-ai-err`,
          role: "ai",
          text: "__key_missing__",
        },
      ]);
    }
  };

  return (
    <div className="min-h-full" data-ocid="dashboard.page">
      {/* Hero */}
      <section className="bg-card border-b border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground">
            {userName ? `Welcome back, ${userName}` : "Welcome to your"}
          </h1>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-primary mt-0.5">
            Community Library
          </h2>
          <p className="text-muted-foreground mt-3 max-w-lg">
            Browse books available to borrow from your neighbours, or ask the AI
            librarian for personalised recommendations.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {/* AI Librarian Chat */}
        <section data-ocid="dashboard.ai_section">
          <div className="rounded-2xl bg-card border border-border overflow-hidden">
            {/* Chat header */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-border bg-primary/5">
              <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
                <Sparkles className="h-4.5 w-4.5 text-primary-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-display font-bold text-base text-foreground">
                  AI Librarian
                </h3>
                <p className="text-xs text-muted-foreground">
                  {userName
                    ? `Hi ${userName}! Describe what you'd like to read.`
                    : "Describe what you want to read — I'll find it from available books"}
                </p>
              </div>
              {myKeyConfigured === false && (
                <button
                  type="button"
                  onClick={() => onNavigate("settings")}
                  className="text-xs text-destructive hover:underline font-medium shrink-0"
                  data-ocid="dashboard.ai_setup_key_link"
                >
                  Set API key →
                </button>
              )}
            </div>

            {/* Messages area */}
            {messages.length > 0 && (
              <div
                className="px-5 py-4 space-y-3 max-h-64 overflow-y-auto bg-muted/20"
                data-ocid="dashboard.ai_response"
              >
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex gap-3 ${
                      msg.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    {msg.role === "ai" && (
                      <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Sparkles className="h-3.5 w-3.5 text-primary" />
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] rounded-xl px-4 py-2.5 text-sm ${
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground rounded-br-sm"
                          : "bg-card border border-border text-foreground rounded-bl-sm"
                      }`}
                    >
                      {msg.text === "__key_missing__" ? (
                        <span>
                          OpenAI API key not configured.{" "}
                          <button
                            type="button"
                            onClick={() => onNavigate("settings")}
                            className="underline font-medium hover:opacity-80"
                            data-ocid="dashboard.ai_go_to_settings_link"
                          >
                            Go to Settings
                          </button>{" "}
                          to set your key.
                        </span>
                      ) : (
                        msg.text
                      )}
                    </div>
                  </div>
                ))}
                {aiMutation.isPending && (
                  <div className="flex gap-3 justify-start">
                    <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Sparkles className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <div className="bg-card border border-border rounded-xl rounded-bl-sm px-4 py-3">
                      <div className="typing-indicator">
                        <span />
                        <span />
                        <span />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
            )}

            {/* Key not set banner */}
            {myKeyConfigured === false && (
              <div className="px-5 py-3 bg-destructive/5 border-t border-destructive/20 flex items-center justify-between gap-3">
                <p className="text-xs text-destructive">
                  You need an OpenAI API key to use the AI Librarian.
                </p>
                <button
                  type="button"
                  onClick={() => onNavigate("settings")}
                  className="text-xs font-semibold text-destructive underline shrink-0 hover:opacity-80"
                  data-ocid="dashboard.ai_key_missing_settings_link"
                >
                  Set up now
                </button>
              </div>
            )}

            {/* Input bar */}
            <form
              onSubmit={handleAskAI}
              className="flex gap-3 p-4 border-t border-border bg-card"
            >
              <input
                type="text"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="e.g. I want something like Harry Potter but for adults..."
                aria-label="Ask the AI librarian"
                disabled={myKeyConfigured === false}
                className="flex-1 h-10 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed"
                data-ocid="dashboard.ai_input"
              />
              <Button
                type="submit"
                aria-label="Send message"
                disabled={
                  !aiPrompt.trim() ||
                  aiMutation.isPending ||
                  myKeyConfigured === false
                }
                data-ocid="dashboard.ai_submit_button"
              >
                {aiMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-1.5" />
                    Ask
                  </>
                )}
              </Button>
            </form>
          </div>
        </section>

        {/* Book Browse */}
        <section data-ocid="dashboard.books_section">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-display font-bold text-2xl text-foreground">
                Book Browse
              </h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                Books available to borrow from the community
              </p>
            </div>
            <Badge variant="outline" className="text-xs shrink-0">
              {books?.length ?? 0} listings
            </Badge>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="h-72 w-full rounded-xl" />
              ))}
            </div>
          ) : books && books.length > 0 ? (
            <div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
              data-ocid="dashboard.books_list"
            >
              {books.map((book, idx) => (
                <div
                  key={String(book.id)}
                  data-ocid={`dashboard.book_card.${idx + 1}`}
                >
                  <BookCard book={book} onClick={() => setSelectedBook(book)} />
                </div>
              ))}
            </div>
          ) : (
            <div
              className="flex flex-col items-center justify-center py-20 text-center rounded-2xl bg-muted/20 border border-dashed border-border"
              data-ocid="dashboard.books_empty_state"
            >
              <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                <BookOpen className="h-8 w-8 text-primary/50" />
              </div>
              <h3 className="font-display font-semibold text-lg text-foreground">
                No books available yet
              </h3>
              <p className="text-sm text-muted-foreground mt-1.5 max-w-xs">
                Be the first to list a book for your neighbours to borrow!
              </p>
            </div>
          )}
        </section>
      </div>

      {selectedBook && (
        <BookDetailModal
          book={selectedBook}
          onClose={() => setSelectedBook(null)}
          onRequest={() => handleRequest(selectedBook)}
          isRequesting={requestingId === selectedBook.id}
        />
      )}
    </div>
  );
}
