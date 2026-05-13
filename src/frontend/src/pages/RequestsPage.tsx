import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useListMyReceivedRequests,
  useListMySentRequests,
  useRespondToBorrowRequest,
} from "@/hooks/use-backend";
import type { BorrowRequestSummary, RequestStatus } from "@/types";
import {
  BookOpen,
  Check,
  Clock,
  Inbox,
  Loader2,
  Send,
  ThumbsDown,
  ThumbsUp,
  X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const STATUS_BADGE: Record<
  RequestStatus | string,
  { cls: string; icon: typeof Clock }
> = {
  pending: {
    cls: "bg-primary/10 text-primary border-primary/30",
    icon: Clock,
  },
  approved: {
    cls: "bg-accent/20 text-accent-foreground border-accent/40",
    icon: ThumbsUp,
  },
  rejected: {
    cls: "bg-destructive/10 text-destructive border-destructive/30",
    icon: ThumbsDown,
  },
};

function RequestCard({
  req,
  isReceived,
  onApprove,
  onReject,
  isResponding,
  index,
}: {
  req: BorrowRequestSummary;
  isReceived: boolean;
  onApprove?: () => void;
  onReject?: () => void;
  isResponding: boolean;
  index: number;
}) {
  const status = STATUS_BADGE[req.status] ?? STATUS_BADGE.pending;
  const StatusIcon = status.icon;
  const personLabel = isReceived
    ? (req.requesterName ?? "Anonymous")
    : (req.ownerName ?? "Anonymous");
  const personRole = isReceived ? "Requested by" : "Lender";

  return (
    <Card className="flex flex-col border-border hover:shadow-md transition-smooth">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <BookOpen className="h-4 w-4 text-primary" />
          </div>
          <Badge
            variant="outline"
            className={`text-xs flex items-center gap-1 ${status.cls}`}
          >
            <StatusIcon className="h-3 w-3" />
            {req.status}
          </Badge>
        </div>
        <CardTitle className="font-display text-base leading-snug mt-2">
          Book #{String(req.bookId)}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 flex-1 space-y-1">
        <p className="text-xs text-muted-foreground">
          <span className="font-medium">{personRole}:</span>{" "}
          <span className="font-mono">{personLabel}</span>
        </p>
      </CardContent>
      {isReceived && req.status === "pending" && (
        <CardFooter className="gap-2 pt-0">
          <Button
            size="sm"
            onClick={onApprove}
            disabled={isResponding}
            className="flex-1"
            data-ocid={`requests.approve_button.${index}`}
          >
            {isResponding ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <>
                <Check className="h-3.5 w-3.5 mr-1" />
                Approve
              </>
            )}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={onReject}
            disabled={isResponding}
            className="flex-1 text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30"
            data-ocid={`requests.reject_button.${index}`}
          >
            <X className="h-3.5 w-3.5 mr-1" />
            Reject
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}

export default function RequestsPage() {
  const { data: received, isLoading: loadingReceived } =
    useListMyReceivedRequests();
  const { data: sent, isLoading: loadingSent } = useListMySentRequests();
  const respondMutation = useRespondToBorrowRequest();
  const [respondingId, setRespondingId] = useState<bigint | null>(null);

  const pendingCount =
    received?.filter((r) => r.status === "pending").length ?? 0;

  const handleRespond = async (req: BorrowRequestSummary, approve: boolean) => {
    setRespondingId(req.id);
    try {
      await respondMutation.mutateAsync({ requestId: req.id, approve });
      toast.success(
        approve
          ? `Approved request for book #${String(req.bookId)}`
          : `Rejected request for book #${String(req.bookId)}`,
      );
    } catch {
      toast.error("Failed to respond. Please try again.");
    } finally {
      setRespondingId(null);
    }
  };

  return (
    <div className="min-h-full" data-ocid="requests.page">
      {/* Header */}
      <section className="bg-card border-b border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="font-display text-3xl font-bold text-foreground">
            Requests
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage borrow requests you've received and sent
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="received" data-ocid="requests.tabs">
          <TabsList className="mb-6">
            <TabsTrigger
              value="received"
              className="gap-2"
              data-ocid="requests.received_tab"
            >
              <Inbox className="h-4 w-4" />
              Received
              {pendingCount > 0 && (
                <Badge className="ml-1 h-5 min-w-5 text-xs bg-primary text-primary-foreground">
                  {pendingCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="sent"
              className="gap-2"
              data-ocid="requests.sent_tab"
            >
              <Send className="h-4 w-4" />
              Sent
              {sent && sent.length > 0 && (
                <Badge className="ml-1 h-5 min-w-5 text-xs bg-muted text-muted-foreground">
                  {sent.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="received">
            {loadingReceived ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-44 rounded-xl" />
                ))}
              </div>
            ) : received && received.length > 0 ? (
              <div
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                data-ocid="requests.received_list"
              >
                {received.map((req, idx) => (
                  <div
                    key={String(req.id)}
                    data-ocid={`requests.received_item.${idx + 1}`}
                  >
                    <RequestCard
                      req={req}
                      isReceived
                      onApprove={() => handleRespond(req, true)}
                      onReject={() => handleRespond(req, false)}
                      isResponding={respondingId === req.id}
                      index={idx + 1}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div
                className="flex flex-col items-center justify-center py-20 text-center rounded-2xl bg-muted/20 border border-dashed border-border"
                data-ocid="requests.received_empty_state"
              >
                <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                  <Inbox className="h-7 w-7 text-primary/40" />
                </div>
                <h3 className="font-display font-semibold text-lg text-foreground">
                  No incoming requests
                </h3>
                <p className="text-sm text-muted-foreground mt-1.5 max-w-xs">
                  When someone requests one of your books, it'll appear here.
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="sent">
            {loadingSent ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-36 rounded-xl" />
                ))}
              </div>
            ) : sent && sent.length > 0 ? (
              <div
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                data-ocid="requests.sent_list"
              >
                {sent.map((req, idx) => (
                  <div
                    key={String(req.id)}
                    data-ocid={`requests.sent_item.${idx + 1}`}
                  >
                    <RequestCard
                      req={req}
                      isReceived={false}
                      isResponding={false}
                      index={idx + 1}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div
                className="flex flex-col items-center justify-center py-20 text-center rounded-2xl bg-muted/20 border border-dashed border-border"
                data-ocid="requests.sent_empty_state"
              >
                <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                  <Send className="h-7 w-7 text-primary/40" />
                </div>
                <h3 className="font-display font-semibold text-lg text-foreground">
                  No sent requests
                </h3>
                <p className="text-sm text-muted-foreground mt-1.5 max-w-xs">
                  Browse the Dashboard and send a borrow request to a lender.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
