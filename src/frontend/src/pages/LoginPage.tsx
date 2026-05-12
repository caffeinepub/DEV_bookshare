import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import {
  BookOpen,
  BookUp,
  HandHelping,
  Loader2,
  Sparkles,
  Users,
} from "lucide-react";

const features = [
  {
    icon: BookUp,
    title: "List Your Books",
    desc: "Share the books you love. Add title, author, and condition — go live in seconds.",
  },
  {
    icon: HandHelping,
    title: "Request & Approve",
    desc: "Borrowers send requests; lenders approve. Physical handoff happens your way.",
  },
  {
    icon: Sparkles,
    title: "AI Book Recommendations",
    desc: "Describe what you're in the mood for and the AI librarian finds available matches nearby.",
  },
  {
    icon: Users,
    title: "Community First",
    desc: "Built on the Internet Computer — your data is yours, no middlemen, no ads.",
  },
];

export default function LoginPage() {
  const { login, isInitializing, isLoggingIn } = useAuth();
  const isLoading = isInitializing || isLoggingIn;

  return (
    <div
      className="min-h-screen flex flex-col bg-background"
      data-ocid="login.page"
    >
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-4 bg-card border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-xl bg-primary flex items-center justify-center shadow-sm">
            <BookOpen className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-display font-bold text-xl tracking-tight text-foreground">
            OpenShelf
          </span>
        </div>
        <Button
          onClick={login}
          disabled={isLoading}
          data-ocid="login.sign_in_button"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Connecting...
            </>
          ) : (
            "Sign In"
          )}
        </Button>
      </header>

      {/* Hero */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-16">
        <div className="max-w-2xl w-full">
          {/* Hero image */}
          <div className="rounded-2xl overflow-hidden border border-border mb-10 shadow-sm">
            <img
              src="/assets/generated/bookshare-hero.dim_1200x500.jpg"
              alt="Community book sharing"
              className="w-full h-52 object-cover object-center"
            />
          </div>

          <div className="text-center space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-4 py-1.5 text-sm text-primary font-medium">
              <Sparkles className="h-3.5 w-3.5" />
              P2P book lending, powered by AI
            </div>

            <h1 className="font-display text-5xl font-bold tracking-tight text-foreground leading-tight">
              Your community <span className="text-primary">library</span>,{" "}
              reimagined
            </h1>

            <p className="text-lg text-muted-foreground leading-relaxed max-w-xl mx-auto">
              Lend your books to neighbours, discover new reads from people
              nearby, and let the AI librarian guide you to your next favourite
              story.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                size="lg"
                onClick={login}
                disabled={isLoading}
                className="gap-2 px-8"
                data-ocid="login.get_started_button"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <BookOpen className="h-4 w-4" />
                )}
                Join the Shelf
              </Button>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl w-full">
          {features.map((f) => (
            <div
              key={f.title}
              className="flex items-start gap-3 rounded-xl bg-card border border-border p-4 transition-smooth hover:border-primary/30"
            >
              <div className="mt-0.5 h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <f.icon className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-sm text-foreground">
                  {f.title}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                  {f.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-muted-foreground bg-muted/40 border-t border-border">
        © {new Date().getFullYear()}. Built with love using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          caffeine.ai
        </a>
      </footer>
    </div>
  );
}
