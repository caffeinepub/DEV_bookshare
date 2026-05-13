import Layout from "@/components/Layout";
import NamePromptModal from "@/components/NamePromptModal";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "@/components/ui/sonner";
import { useAuth } from "@/hooks/use-auth";
import { useGetUserName } from "@/hooks/use-backend";
import SettingsPage from "@/pages/SettingsPage";
import type { AppRoute } from "@/types";
import { Component, Suspense, lazy, useState } from "react";
import type { ErrorInfo, ReactNode } from "react";

const DashboardPage = lazy(() => import("@/pages/DashboardPage"));
const MyBooksPage = lazy(() => import("@/pages/MyBooksPage"));
const RequestsPage = lazy(() => import("@/pages/RequestsPage"));

function PageLoader() {
  return (
    <div className="p-8 space-y-4 max-w-7xl mx-auto">
      <Skeleton className="h-10 w-64" />
      <Skeleton className="h-6 w-48" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} className="h-48 w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class PageErrorBoundary extends Component<
  { children: ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Page error:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4 p-8">
          <p className="text-muted-foreground text-sm">
            Something went wrong loading this page.
          </p>
          <button
            type="button"
            className="text-sm text-primary hover:underline"
            onClick={() => this.setState({ hasError: false })}
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function AppContent() {
  const [currentRoute, setCurrentRoute] = useState<AppRoute>("dashboard");
  const { logout } = useAuth();
  const { data: userName, isLoading: nameLoading } = useGetUserName();

  // Block the UI until we know if a name has been set
  const nameIsReady = !nameLoading;
  const needsName =
    nameIsReady &&
    (userName === null || userName === undefined || userName.trim() === "");

  const handleLogout = () => {
    setCurrentRoute("dashboard");
    logout();
  };

  const renderPage = () => {
    switch (currentRoute) {
      case "dashboard":
        return <DashboardPage onNavigate={setCurrentRoute} />;
      case "my-books":
        return <MyBooksPage />;
      case "requests":
        return <RequestsPage />;
      case "settings":
        return <SettingsPage onBack={() => setCurrentRoute("dashboard")} />;
      default:
        return <DashboardPage onNavigate={setCurrentRoute} />;
    }
  };

  return (
    <ProtectedRoute>
      <Layout
        currentRoute={currentRoute}
        onNavigate={setCurrentRoute}
        onLogout={handleLogout}
      >
        <PageErrorBoundary>
          <Suspense fallback={<PageLoader />}>{renderPage()}</Suspense>
        </PageErrorBoundary>
      </Layout>
      <Toaster richColors closeButton />
      {/* Blocking name prompt — only shown when actor is ready and name is missing */}
      {nameIsReady && needsName && (
        <NamePromptModal
          onNameSet={() => {
            /* query invalidated by mutation */
          }}
        />
      )}
    </ProtectedRoute>
  );
}

export default function App() {
  return <AppContent />;
}
