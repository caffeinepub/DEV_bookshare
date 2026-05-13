import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSetUserName } from "@/hooks/use-backend";
import { BookOpen, Loader2, User } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface NamePromptModalProps {
  onNameSet: (name: string) => void;
}

export default function NamePromptModal({ onNameSet }: NamePromptModalProps) {
  const setNameMutation = useSetUserName();
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Please enter a display name to continue.");
      return;
    }
    if (trimmed.length > 60) {
      setError("Name must be 60 characters or fewer.");
      return;
    }
    setError("");
    try {
      await setNameMutation.mutateAsync(trimmed);
      toast.success(`Welcome, ${trimmed}!`);
      onNameSet(trimmed);
    } catch {
      toast.error("Failed to save name. Please try again.");
    }
  };

  return (
    // Full-screen blocking overlay — no dismiss via outside click
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
      data-ocid="name_prompt.dialog"
    >
      <div className="w-full max-w-md mx-4 rounded-2xl bg-card border border-border shadow-xl">
        {/* Header */}
        <div className="flex flex-col items-center pt-8 pb-4 px-8">
          <div className="h-14 w-14 rounded-2xl bg-primary flex items-center justify-center mb-4">
            <BookOpen className="h-7 w-7 text-primary-foreground" />
          </div>
          <h2 className="font-display font-bold text-2xl text-foreground text-center">
            Welcome to BookShare
          </h2>
          <p className="text-sm text-muted-foreground text-center mt-2 max-w-xs">
            Choose a display name so the community knows who you are. You can
            change it anytime in Settings.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-8 pb-8 space-y-4">
          <div className="space-y-1.5">
            <Label
              htmlFor="display-name-input"
              className="flex items-center gap-2"
            >
              <User className="h-3.5 w-3.5 text-muted-foreground" />
              Display name
            </Label>
            <Input
              id="display-name-input"
              type="text"
              placeholder="e.g. Alex Reader"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError("");
              }}
              maxLength={60}
              autoFocus
              autoComplete="name"
              data-ocid="name_prompt.input"
            />
            {error && (
              <p
                className="text-xs text-destructive font-medium"
                data-ocid="name_prompt.field_error"
              >
                {error}
              </p>
            )}
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={!name.trim() || setNameMutation.isPending}
            data-ocid="name_prompt.submit_button"
          >
            {setNameMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Saving...
              </>
            ) : (
              "Continue to BookShare"
            )}
          </Button>
          <p className="text-[11px] text-muted-foreground text-center">
            A name is required to participate in the community.
          </p>
        </form>
      </div>
    </div>
  );
}
