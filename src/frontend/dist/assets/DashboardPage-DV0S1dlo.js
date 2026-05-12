import { u as useListAllBooks, a as useSendBorrowRequest, b as useGetAIBookRecommendation, c as useIsMyOpenAIConfigured, r as reactExports, j as jsxRuntimeExports, S as Sparkles, B as Button, L as LoaderCircle, d as Skeleton, e as BookOpen, f as ue } from "./index-iI9L4DeR.js";
import { B as Badge, C as Card, a as CardHeader, b as CardTitle, c as CardContent } from "./card-CetsEPfx.js";
import { S as Send } from "./send-BXLLlw5D.js";
import { M as MapPin } from "./map-pin-CjFysJy9.js";
const CONDITION_STYLE = {
  new: {
    badge: "bg-accent/20 text-accent-foreground border-accent/40",
    label: "New"
  },
  good: {
    badge: "bg-secondary/20 text-secondary-foreground border-secondary/40",
    label: "Good"
  },
  fair: {
    badge: "bg-primary/10 text-primary border-primary/30",
    label: "Fair"
  },
  poor: {
    badge: "bg-destructive/10 text-destructive border-destructive/30",
    label: "Poor"
  }
};
function BookCard({
  book,
  onRequest,
  isRequesting
}) {
  const cond = CONDITION_STYLE[book.condition];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "flex flex-col hover:shadow-md transition-smooth group border-border hover:-translate-y-0.5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "pb-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors", children: /* @__PURE__ */ jsxRuntimeExports.jsx(BookOpen, { className: "h-5 w-5 text-primary" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Badge,
          {
            variant: "outline",
            className: `text-xs font-medium shrink-0 ${book.isAvailable ? "bg-accent/15 text-accent-foreground border-accent/35" : "bg-muted text-muted-foreground"}`,
            children: book.isAvailable ? "Available" : "Borrowed"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "font-display text-base leading-snug mt-2 line-clamp-2", children: book.title })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "flex-1 flex flex-col gap-3 pt-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground italic", children: book.author }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: `text-xs ${(cond == null ? void 0 : cond.badge) ?? ""}`, children: (cond == null ? void 0 : cond.label) ?? book.condition }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground truncate", children: [
          "by ",
          (book.ownerId ?? "").slice(0, 10) || "unknown",
          "..."
        ] })
      ] }),
      book.location && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 text-xs text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "h-3 w-3 shrink-0 text-primary/60" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate", children: book.location })
      ] }),
      book.isAvailable && /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          size: "sm",
          onClick: onRequest,
          disabled: isRequesting,
          className: "mt-auto w-full",
          "data-ocid": "dashboard.request_button",
          children: isRequesting ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-3.5 w-3.5 animate-spin mr-1" }),
            "Requesting..."
          ] }) : "Request to Borrow"
        }
      )
    ] })
  ] });
}
function DashboardPage({ onNavigate }) {
  const { data: books, isLoading } = useListAllBooks();
  const requestMutation = useSendBorrowRequest();
  const aiMutation = useGetAIBookRecommendation();
  const { data: myKeyConfigured } = useIsMyOpenAIConfigured();
  const [aiPrompt, setAiPrompt] = reactExports.useState("");
  const [messages, setMessages] = reactExports.useState([]);
  const [requestingId, setRequestingId] = reactExports.useState(null);
  const chatEndRef = reactExports.useRef(null);
  const handleRequest = async (book) => {
    setRequestingId(book.id);
    try {
      await requestMutation.mutateAsync(book.id);
      ue.success(`Borrow request sent for "${book.title}"!`);
    } catch {
      ue.error("Failed to send request. Please try again.");
    } finally {
      setRequestingId(null);
    }
  };
  const handleAskAI = async (e) => {
    e.preventDefault();
    const prompt = aiPrompt.trim();
    if (!prompt) return;
    setMessages((prev) => [
      ...prev,
      { id: `msg-${Date.now()}-user`, role: "user", text: prompt }
    ]);
    setAiPrompt("");
    try {
      const result = await aiMutation.mutateAsync(prompt);
      const isKeyMissing = result.message.toLowerCase().includes("openai api key not set");
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now()}-ai`,
          role: "ai",
          text: isKeyMissing ? "__key_missing__" : result.message
        }
      ]);
      setTimeout(
        () => {
          var _a;
          return (_a = chatEndRef.current) == null ? void 0 : _a.scrollIntoView({ behavior: "smooth" });
        },
        50
      );
    } catch {
      ue.error(
        "AI is unavailable. Please set your OpenAI API key in Settings."
      );
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now()}-ai-err`,
          role: "ai",
          text: "__key_missing__"
        }
      ]);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-full", "data-ocid": "dashboard.page", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "bg-card border-b border-border", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-3xl sm:text-4xl font-bold text-foreground", children: "Welcome to your" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-3xl sm:text-4xl font-bold text-primary mt-0.5", children: "Community Library" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground mt-3 max-w-lg", children: "Browse books available to borrow from your neighbours, or ask the AI librarian for personalised recommendations." })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-10", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("section", { "data-ocid": "dashboard.ai_section", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl bg-card border border-border overflow-hidden", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 px-5 py-4 border-b border-border bg-primary/5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-9 w-9 rounded-xl bg-primary flex items-center justify-center flex-shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-4.5 w-4.5 text-primary-foreground" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-display font-bold text-base text-foreground", children: "AI Librarian" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Describe what you want to read — I'll find it from available books" })
          ] }),
          myKeyConfigured === false && /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: () => onNavigate("settings"),
              className: "text-xs text-destructive hover:underline font-medium shrink-0",
              "data-ocid": "dashboard.ai_setup_key_link",
              children: "Set API key →"
            }
          )
        ] }),
        messages.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "px-5 py-4 space-y-3 max-h-64 overflow-y-auto bg-muted/20",
            "data-ocid": "dashboard.ai_response",
            children: [
              messages.map((msg) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "div",
                {
                  className: `flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`,
                  children: [
                    msg.role === "ai" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-3.5 w-3.5 text-primary" }) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "div",
                      {
                        className: `max-w-[80%] rounded-xl px-4 py-2.5 text-sm ${msg.role === "user" ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-card border border-border text-foreground rounded-bl-sm"}`,
                        children: msg.text === "__key_missing__" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                          "OpenAI API key not configured.",
                          " ",
                          /* @__PURE__ */ jsxRuntimeExports.jsx(
                            "button",
                            {
                              type: "button",
                              onClick: () => onNavigate("settings"),
                              className: "underline font-medium hover:opacity-80",
                              "data-ocid": "dashboard.ai_go_to_settings_link",
                              children: "Go to Settings"
                            }
                          ),
                          " ",
                          "to set your key."
                        ] }) : msg.text
                      }
                    )
                  ]
                },
                msg.id
              )),
              aiMutation.isPending && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3 justify-start", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-3.5 w-3.5 text-primary" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-card border border-border rounded-xl rounded-bl-sm px-4 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "typing-indicator", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", {}),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", {}),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", {})
                ] }) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { ref: chatEndRef })
            ]
          }
        ),
        myKeyConfigured === false && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-5 py-3 bg-destructive/5 border-t border-destructive/20 flex items-center justify-between gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-destructive", children: "You need an OpenAI API key to use the AI Librarian." }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: () => onNavigate("settings"),
              className: "text-xs font-semibold text-destructive underline shrink-0 hover:opacity-80",
              "data-ocid": "dashboard.ai_key_missing_settings_link",
              children: "Set up now"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "form",
          {
            onSubmit: handleAskAI,
            className: "flex gap-3 p-4 border-t border-border bg-card",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  type: "text",
                  value: aiPrompt,
                  onChange: (e) => setAiPrompt(e.target.value),
                  placeholder: "e.g. I want something like Harry Potter but for adults...",
                  "aria-label": "Ask the AI librarian",
                  disabled: myKeyConfigured === false,
                  className: "flex-1 h-10 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed",
                  "data-ocid": "dashboard.ai_input"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  type: "submit",
                  "aria-label": "Send message",
                  disabled: !aiPrompt.trim() || aiMutation.isPending || myKeyConfigured === false,
                  "data-ocid": "dashboard.ai_submit_button",
                  children: aiMutation.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { className: "h-4 w-4 mr-1.5" }),
                    "Ask"
                  ] })
                }
              )
            ]
          }
        )
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { "data-ocid": "dashboard.books_section", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display font-bold text-2xl text-foreground", children: "Book Browse" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-0.5", children: "Books available to borrow from the community" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "outline", className: "text-xs shrink-0", children: [
            (books == null ? void 0 : books.length) ?? 0,
            " listings"
          ] })
        ] }),
        isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4", children: [1, 2, 3, 4, 5, 6].map((i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-52 w-full rounded-xl" }, i)) }) : books && books.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4",
            "data-ocid": "dashboard.books_list",
            children: books.map((book, idx) => /* @__PURE__ */ jsxRuntimeExports.jsx(
              "div",
              {
                "data-ocid": `dashboard.book_card.${idx + 1}`,
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  BookCard,
                  {
                    book,
                    onRequest: () => handleRequest(book),
                    isRequesting: requestingId === book.id
                  }
                )
              },
              String(book.id)
            ))
          }
        ) : /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "flex flex-col items-center justify-center py-20 text-center rounded-2xl bg-muted/20 border border-dashed border-border",
            "data-ocid": "dashboard.books_empty_state",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(BookOpen, { className: "h-8 w-8 text-primary/50" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-display font-semibold text-lg text-foreground", children: "No books available yet" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-1.5 max-w-xs", children: "Be the first to list a book for your neighbours to borrow!" })
            ]
          }
        )
      ] })
    ] })
  ] });
}
export {
  DashboardPage as default
};
