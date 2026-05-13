import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/use-auth";
import { useGetUserName } from "@/hooks/use-backend";
import type { AppRoute } from "@/types";
import {
  ArrowLeftRight,
  BookMarked,
  BookOpen,
  LogOut,
  Menu,
  Settings,
  X,
} from "lucide-react";
import { useState } from "react";
import type { ReactNode } from "react";

interface LayoutProps {
  currentRoute: AppRoute;
  onNavigate: (route: AppRoute) => void;
  onLogout?: () => void;
  children: ReactNode;
}

const NAV_ITEMS: { id: AppRoute; label: string; icon: typeof BookOpen }[] = [
  { id: "dashboard", label: "Dashboard", icon: BookOpen },
  { id: "my-books", label: "My Books", icon: BookMarked },
  { id: "requests", label: "Requests", icon: ArrowLeftRight },
];

export default function Layout({
  currentRoute,
  onNavigate,
  onLogout,
  children,
}: LayoutProps) {
  const { logout, principalText } = useAuth();
  const handleLogout = onLogout ?? logout;
  const { data: userName } = useGetUserName();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const displayName = userName?.trim() || "Anonymous";
  const shortPrincipal = principalText
    ? `${principalText.slice(0, 5)}...${principalText.slice(-4)}`
    : "";

  const handleNavigate = (route: AppRoute) => {
    onNavigate(route);
    setMobileMenuOpen(false);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Top Navigation Header */}
      <header className="sticky top-0 z-40 bg-card border-b border-border shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-4">
            {/* Logo */}
            <button
              type="button"
              className="flex items-center gap-2.5 flex-shrink-0 hover:opacity-80 transition-opacity"
              onClick={() => handleNavigate("dashboard")}
              data-ocid="nav.logo_button"
            >
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <BookOpen className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-display font-bold text-xl text-foreground tracking-tight hidden sm:block">
                BookShare
              </span>
            </button>

            {/* Desktop Nav */}
            <nav
              className="hidden md:flex items-center gap-1"
              aria-label="Main navigation"
            >
              {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => handleNavigate(id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-smooth ${
                    currentRoute === id
                      ? "bg-primary/10 text-primary border-b-2 border-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                  data-ocid={`nav.${id}_link`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => handleNavigate("settings")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-smooth ${
                  currentRoute === "settings"
                    ? "bg-primary/10 text-primary border-b-2 border-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
                data-ocid="nav.settings_link"
              >
                <Settings className="h-4 w-4" />
                Settings
              </button>
            </nav>

            {/* Right side: user + logout */}
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/60">
                <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-[10px] font-bold text-primary">
                    {displayName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="text-xs text-foreground font-medium max-w-[120px] truncate">
                  {displayName}
                </span>
                {shortPrincipal && (
                  <span className="text-[10px] text-muted-foreground font-mono hidden lg:block">
                    ({shortPrincipal})
                  </span>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="hidden sm:flex items-center gap-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                data-ocid="nav.logout_button"
              >
                <LogOut className="h-4 w-4" />
                <span className="text-xs">Sign out</span>
              </Button>

              {/* Mobile hamburger */}
              <button
                type="button"
                className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
                onClick={() => setMobileMenuOpen((v) => !v)}
                aria-label="Toggle menu"
                data-ocid="nav.mobile_menu_toggle"
              >
                {mobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-card">
            <div className="px-4 py-3 space-y-1">
              {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => handleNavigate(id)}
                  className={`flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-smooth ${
                    currentRoute === id
                      ? "bg-primary/10 text-primary"
                      : "text-foreground hover:bg-muted"
                  }`}
                  data-ocid={`nav.mobile_${id}_link`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => handleNavigate("settings")}
                className={`flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-smooth ${
                  currentRoute === "settings"
                    ? "bg-primary/10 text-primary"
                    : "text-foreground hover:bg-muted"
                }`}
                data-ocid="nav.mobile_settings_link"
              >
                <Settings className="h-4 w-4" />
                Settings
              </button>
              <Separator className="my-2" />
              <div className="flex items-center justify-between px-3 py-2">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-[10px] font-bold text-primary">
                      {displayName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-xs text-foreground font-medium max-w-[100px] truncate">
                    {displayName}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive transition-colors"
                  data-ocid="nav.mobile_logout_button"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Sign out
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Page content */}
      <main className="flex-1 min-w-0">{children}</main>

      {/* Footer */}
      <footer className="bg-card border-t border-border mt-auto">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-xs text-muted-foreground text-center">
            © {new Date().getFullYear()}. Built with love using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
