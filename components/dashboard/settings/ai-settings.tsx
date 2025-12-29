"use client";

import { useState, useMemo } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus,
  Trash2,
  Save,
  Key,
  Sparkles,
  CheckCircle2,
  XCircle,
  Lock,
  Loader2,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";
import { getUserRules, updateUserRules } from "@/app/actions/settings";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AISettingsSkeleton } from "@/components/skeleton/aiSkeleton";

interface Rules {
  good: string[];
  bad: string[];
}

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

export const AISettings = () => {
  const { data: settingsData, isLoading } = useQuery({
    queryKey: ["aiSettings"],
    queryFn: async () => await getUserRules(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });

  // Create a key that changes when data changes to remount the inner component
  const formKey = useMemo(() => {
    return settingsData
      ? `${settingsData.apiKey || ""}-${settingsData.goodRules.length}-${
          settingsData.badRules.length
        }`
      : "initial";
  }, [settingsData]);

  if (isLoading) {
    return <AISettingsSkeleton />;
  }

  return <AISettingsInner key={formKey} settingsData={settingsData} />;
};

// Inner component that remounts with fresh data
const AISettingsInner = ({
  settingsData,
}: {
  settingsData?: {
    goodRules: string[];
    badRules: string[];
    apiKey: string | null;
  };
}) => {
  const queryClient = useQueryClient();

  // Initialize state from props - only runs once per mount
  const [apiKey, setApiKey] = useState(settingsData?.apiKey ?? "");
  const [rules, setRules] = useState<Rules>({
    good: settingsData?.goodRules ?? [],
    bad: settingsData?.badRules ?? [],
  });
  const [newGoodRule, setNewGoodRule] = useState("");
  const [newBadRule, setNewBadRule] = useState("");
  const [showKey, setShowKey] = useState(false);

  const updateMutation = useMutation({
    mutationFn: async (data: {
      goodRules: string[];
      badRules: string[];
      apiKey: string;
    }) => await updateUserRules(data),
    onSuccess: (result) => {
      if (result.success) {
        toast.success("Settings saved successfully");
        queryClient.invalidateQueries({ queryKey: ["aiSettings"] });
      } else {
        toast.error(result.error || "Failed to save settings");
      }
    },
    onError: () => {
      toast.error("An unexpected error occurred");
    },
  });

  const handleSave = () => {
    updateMutation.mutate({
      goodRules: rules.good,
      badRules: rules.bad,
      apiKey,
    });
  };

  const removeBadRule = (index: number) => {
    setRules((prev) => ({
      ...prev,
      bad: prev.bad.filter((_, i) => i !== index),
    }));
  };

  // Check if form has any unsaved changes
  const isFormChanged =
    apiKey !== (settingsData?.apiKey ?? "") ||
    rules.good.length !== (settingsData?.goodRules?.length ?? 0) ||
    rules.bad.length !== (settingsData?.badRules?.length ?? 0) ||
    JSON.stringify(rules.good) !==
      JSON.stringify(settingsData?.goodRules ?? []) ||
    JSON.stringify(rules.bad) !== JSON.stringify(settingsData?.badRules ?? []);

  const addGoodRule = () => {
    if (!newGoodRule.trim()) return;
    setRules((prev) => ({ ...prev, good: [...prev.good, newGoodRule.trim()] }));
    setNewGoodRule("");
  };

  const removeGoodRule = (index: number) => {
    setRules((prev) => ({
      ...prev,
      good: prev.good.filter((_, i) => i !== index),
    }));
  };

  const addBadRule = () => {
    if (!newBadRule.trim()) return;
    setRules((prev) => ({ ...prev, bad: [...prev.bad, newBadRule.trim()] }));
    setNewBadRule("");
  };

  const handleReset = () => {
    setApiKey(settingsData?.apiKey ?? "");
    setRules({
      good: settingsData?.goodRules ?? [],
      bad: settingsData?.badRules ?? [],
    });
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* API Key Card */}
      <Card className="border-border/50">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Key className="h-4 w-4 sm:h-5 sm:w-5 text-primary shrink-0" />
            <span>Gemini API Key</span>
          </CardTitle>
          <CardDescription className="text-sm">
            Your API key is encrypted and stored securely for AI-powered code
            reviews
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          <div className="space-y-3 sm:space-y-4">
            <div className="space-y-2">
              <Label
                htmlFor="api-key"
                className="text-sm font-medium text-foreground"
              >
                API Key
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground shrink-0" />
                <Input
                  id="api-key"
                  type={showKey ? "text" : "password"}
                  placeholder="Enter your Gemini API Key"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="pl-10 bg-background border-border focus:border-primary focus:ring-primary/20 text-sm sm:text-base font-mono"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground bg-muted/50 p-2.5 sm:p-3 rounded-lg">
              <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
              <p>
                Get your API key from{" "}
                <a
                  href="https://aistudio.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Google AI Studio
                </a>
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 pt-3 border-t border-border">
              <Button
                variant="outline"
                onClick={() => setShowKey(!showKey)}
                className="border-border hover:bg-muted w-full sm:w-auto text-sm sm:text-base"
              >
                {showKey ? "Hide Key" : "Show Key"}
              </Button>
              {apiKey && (
                <Badge
                  variant="secondary"
                  className="gap-1.5 justify-center sm:justify-start py-1.5"
                >
                  <CheckCircle2 className="h-3 w-3" />
                  Configured
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Rules Card */}
      <Card className="border-border/50">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-primary shrink-0" />
            <span>AI Review Rules</span>
          </CardTitle>
          <CardDescription className="text-sm">
            Define custom rules to guide the AI during code reviews
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          <div className="space-y-4 sm:space-y-6">
            {/* Rules Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="flex items-center gap-3 p-3 sm:p-4 border rounded-lg bg-green-500/5 border-green-500/20">
                <div className="p-2 rounded-full bg-green-500/10">
                  <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                    Good Practices
                  </p>
                  <p className="text-xl sm:text-2xl font-bold">
                    {rules.good.length}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 sm:p-4 border rounded-lg bg-red-500/5 border-red-500/20">
                <div className="p-2 rounded-full bg-red-500/10">
                  <XCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                    Anti-patterns
                  </p>
                  <p className="text-xl sm:text-2xl font-bold">
                    {rules.bad.length}
                  </p>
                </div>
              </div>
            </div>

            {/* Manage Rules Dialog */}
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full sm:w-auto bg-transparent"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Manage Rules
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl h-[85vh] flex flex-col p-0">
                <DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-4">
                  <DialogTitle className="text-xl sm:text-2xl">
                    Manage AI Rules
                  </DialogTitle>
                  <DialogDescription className="text-sm sm:text-base">
                    Add rules for best practices to encourage and anti-patterns
                    to avoid
                  </DialogDescription>
                </DialogHeader>
                <Tabs
                  defaultValue="good"
                  className="flex-1 flex flex-col min-h-0 px-4 sm:px-6 pb-4 sm:pb-6"
                >
                  <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger
                      value="good"
                      className="gap-1 sm:gap-2 text-xs sm:text-sm"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      <span className="hidden sm:inline">Good Practices</span>
                      <span className="sm:hidden">Good</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="bad"
                      className="gap-1 sm:gap-2 text-xs sm:text-sm"
                    >
                      <XCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      <span className="hidden sm:inline">Anti-patterns</span>
                      <span className="sm:hidden">Bad</span>
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent
                    value="good"
                    className="flex-1 flex flex-col min-h-0 gap-3 sm:gap-4 mt-0"
                  >
                    <div className="space-y-2">
                      <Textarea
                        placeholder={
                          "e.g., Use meaningful variable names\n\nOr add code samples:\nconst userAge = 25; // Good"
                        }
                        value={newGoodRule}
                        onChange={(e) => setNewGoodRule(e.target.value)}
                        onKeyDown={(e) => {
                          if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                            e.preventDefault();
                            addGoodRule();
                          }
                        }}
                        className="min-h-[100px] resize-y text-sm"
                        rows={4}
                      />
                      <Button
                        onClick={addGoodRule}
                        className="w-full"
                        disabled={!newGoodRule.trim()}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Good Practice
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Press{" "}
                      <kbd className="px-1.5 py-0.5 text-xs border rounded bg-muted">
                        Ctrl
                      </kbd>{" "}
                      +{" "}
                      <kbd className="px-1.5 py-0.5 text-xs border rounded bg-muted">
                        Enter
                      </kbd>{" "}
                      to add
                    </p>
                    <ScrollArea className="flex-1 border rounded-lg p-2 sm:p-3 bg-muted/20">
                      <div className="space-y-2">
                        {rules.good.map((rule, index) => (
                          <div
                            key={index}
                            className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg bg-background border hover:border-primary/50 transition-colors group"
                          >
                            <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                            <span className="flex-1 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-mono break-all">
                              {rule}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 sm:h-8 sm:w-8 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shrink-0"
                              onClick={() => removeGoodRule(index)}
                            >
                              <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground hover:text-destructive" />
                            </Button>
                          </div>
                        ))}
                        {rules.good.length === 0 && (
                          <div className="flex flex-col items-center justify-center py-8 sm:py-12 text-center">
                            <CheckCircle2 className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground/20 mb-3" />
                            <p className="text-sm text-muted-foreground">
                              No good practices defined yet
                            </p>
                            <p className="text-xs text-muted-foreground/70 mt-1">
                              Add rules to encourage best practices
                            </p>
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </TabsContent>

                  <TabsContent
                    value="bad"
                    className="flex-1 flex flex-col min-h-0 gap-3 sm:gap-4 mt-0"
                  >
                    <div className="space-y-2">
                      <Textarea
                        placeholder={
                          "e.g., Avoid using 'any' type in TypeScript\n\nOr add code samples:\nlet data: any; // Bad"
                        }
                        value={newBadRule}
                        onChange={(e) => setNewBadRule(e.target.value)}
                        onKeyDown={(e) => {
                          if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                            e.preventDefault();
                            addBadRule();
                          }
                        }}
                        className="min-h-[100px] resize-y text-sm"
                        rows={4}
                      />
                      <Button
                        onClick={addBadRule}
                        className="w-full"
                        disabled={!newBadRule.trim()}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Anti-pattern
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Press{" "}
                      <kbd className="px-1.5 py-0.5 text-xs border rounded bg-muted">
                        Ctrl
                      </kbd>{" "}
                      +{" "}
                      <kbd className="px-1.5 py-0.5 text-xs border rounded bg-muted">
                        Enter
                      </kbd>{" "}
                      to add
                    </p>
                    <ScrollArea className="flex-1 border rounded-lg p-2 sm:p-3 bg-muted/20">
                      <div className="space-y-2">
                        {rules.bad.map((rule, index) => (
                          <div
                            key={index}
                            className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg bg-background border hover:border-primary/50 transition-colors group"
                          >
                            <XCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                            <span className="flex-1 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-mono break-all">
                              {rule}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 sm:h-8 sm:w-8 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shrink-0"
                              onClick={() => removeBadRule(index)}
                            >
                              <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground hover:text-destructive" />
                            </Button>
                          </div>
                        ))}
                        {rules.bad.length === 0 && (
                          <div className="flex flex-col items-center justify-center py-8 sm:py-12 text-center">
                            <XCircle className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground/20 mb-3" />
                            <p className="text-sm text-muted-foreground">
                              No anti-patterns defined yet
                            </p>
                            <p className="text-xs text-muted-foreground/70 mt-1">
                              Add rules to flag problematic patterns
                            </p>
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </TabsContent>
                </Tabs>
              </DialogContent>
            </Dialog>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 pt-4 border-t border-border">
              <Button
                onClick={handleSave}
                disabled={updateMutation.isPending || !isFormChanged}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-md hover:shadow-lg transition-all w-full sm:w-auto text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updateMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleReset}
                disabled={updateMutation.isPending || !isFormChanged}
                className="border-border hover:bg-muted w-full sm:w-auto text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed bg-transparent"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
            </div>

            {isFormChanged && !updateMutation.isPending && (
              <p className="text-xs text-muted-foreground text-center sm:text-left">
                You have unsaved changes
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
