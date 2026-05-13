import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useGetUserName,
  useIsMyOpenAIConfigured,
  useSetMyOpenAIApiKey,
  useSetUserName,
} from "@/hooks/use-backend";
import {
  ArrowLeft,
  CheckCircle2,
  Key,
  Loader2,
  User,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface SettingsPageProps {
  onBack: () => void;
}

export default function SettingsPage({ onBack }: SettingsPageProps) {
  const { data: isConfigured, isLoading: configuredLoading } =
    useIsMyOpenAIConfigured();
  const setKeyMutation = useSetMyOpenAIApiKey();
  const { data: currentName, isLoading: nameLoading } = useGetUserName();
  const setNameMutation = useSetUserName();

  const [apiKey, setApiKey] = useState("");
  // showForm: true when key is not set yet, or user clicked "Change key"
  const [showForm, setShowForm] = useState(false);

  const [displayName, setDisplayName] = useState("");
  const [nameError, setNameError] = useState("");
  const [nameSaved, setNameSaved] = useState(false);
  const didPrefill = { current: false };

  // Pre-fill display name when loaded (once only)
  useEffect(() => {
    if (currentName && !didPrefill.current) {
      didPrefill.current = true;
      setDisplayName(currentName);
    }
  }, [currentName]);

  const handleSaveKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim()) return;
    try {
      await setKeyMutation.mutateAsync(apiKey.trim());
      setApiKey("");
      setShowForm(false);
      toast.success("OpenAI API key saved successfully.");
    } catch {
      toast.error("Failed to save API key. Please try again.");
    }
  };

  const handleSaveName = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = displayName.trim();
    if (!trimmed) {
      setNameError("Display name cannot be empty.");
      return;
    }
    if (trimmed.length > 60) {
      setNameError("Name must be 60 characters or fewer.");
      return;
    }
    setNameError("");
    try {
      await setNameMutation.mutateAsync(trimmed);
      setNameSaved(true);
      setTimeout(() => setNameSaved(false), 3000);
      toast.success("Display name updated.");
    } catch {
      toast.error("Failed to update name. Please try again.");
    }
  };

  // Show loading only while checking key status
  const keyIsSet = !configuredLoading && isConfigured === true;
  const keyNotSet = !configuredLoading && isConfigured === false;
  // Auto-open form if key is not set
  const formVisible = showForm || keyNotSet;

  return (
    <div
      className="flex flex-1 flex-col h-full bg-background"
      data-ocid="settings.page"
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 bg-card border-b border-border">
        <button
          type="button"
          className="p-1.5 rounded-lg hover:bg-muted transition-colors"
          onClick={onBack}
          data-ocid="settings.back_button"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h1 className="font-display font-bold text-xl text-foreground">
          Settings
        </h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-xl mx-auto px-6 py-8 space-y-8">
          {/* Display Name Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold text-foreground">Display Name</h2>
                <p className="text-xs text-muted-foreground">
                  Shown on your book listings and borrow requests.
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-4">
              {nameLoading ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading...
                </div>
              ) : (
                <form onSubmit={handleSaveName} className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="display-name">Your name</Label>
                    <Input
                      id="display-name"
                      type="text"
                      placeholder="e.g. Alex Reader"
                      value={displayName}
                      onChange={(e) => {
                        setDisplayName(e.target.value);
                        if (nameError) setNameError("");
                        if (nameSaved) setNameSaved(false);
                      }}
                      maxLength={60}
                      data-ocid="settings.display_name_input"
                    />
                    {nameError && (
                      <p
                        className="text-xs text-destructive"
                        data-ocid="settings.name_field_error"
                      >
                        {nameError}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <Button
                      type="submit"
                      disabled={
                        !displayName.trim() ||
                        setNameMutation.isPending ||
                        displayName.trim() === (currentName ?? "")
                      }
                      data-ocid="settings.save_name_button"
                    >
                      {setNameMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        "Save Name"
                      )}
                    </Button>
                    {nameSaved && (
                      <span
                        className="text-xs text-success flex items-center gap-1"
                        data-ocid="settings.name_success_state"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Saved!
                      </span>
                    )}
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* OpenAI API Key Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center">
                <Key className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold text-foreground">
                  OpenAI API Key
                </h2>
                <p className="text-xs text-muted-foreground">
                  Your personal key for AI book recommendations.
                </p>
              </div>
              <div className="ml-auto" data-ocid="settings.key_status">
                {configuredLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                ) : keyIsSet ? (
                  <div className="flex items-center gap-1.5 text-xs font-medium text-success">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Key is set
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-xs font-medium text-destructive">
                    <XCircle className="h-3.5 w-3.5" />
                    Key not set
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-4 space-y-4">
              <p className="text-sm text-muted-foreground">
                Your OpenAI API key is stored securely on the canister and never
                exposed to the frontend. It powers the AI Librarian so you can
                get personalised book recommendations. Get your key at{" "}
                <a
                  href="https://platform.openai.com/api-keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  platform.openai.com/api-keys
                </a>
                .
              </p>

              {/* Status + change trigger */}
              {keyIsSet && !showForm && (
                <div className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2.5">
                  <span className="text-sm text-muted-foreground font-mono tracking-widest">
                    sk-••••••••••••••••••••
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowForm(true)}
                    data-ocid="settings.change_key_button"
                  >
                    Change key
                  </Button>
                </div>
              )}

              {/* Key entry form — shown when no key set, or user clicked Change */}
              {formVisible && (
                <form onSubmit={handleSaveKey} className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="api-key-input">New API Key</Label>
                    <Input
                      id="api-key-input"
                      type="password"
                      placeholder="sk-..."
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      className="font-mono text-sm"
                      autoComplete="off"
                      data-ocid="settings.api_key_input"
                    />
                    <p className="text-xs text-muted-foreground">
                      The key is only visible while you're typing. After saving,
                      only the indicator above will update.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {keyIsSet && (
                      <Button
                        type="button"
                        variant="outline"
                        className="flex-1"
                        onClick={() => {
                          setShowForm(false);
                          setApiKey("");
                        }}
                        data-ocid="settings.cancel_key_button"
                      >
                        Cancel
                      </Button>
                    )}
                    <Button
                      type="submit"
                      disabled={!apiKey.trim() || setKeyMutation.isPending}
                      className="flex-1"
                      data-ocid="settings.save_key_button"
                    >
                      {setKeyMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        "Save Key"
                      )}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
