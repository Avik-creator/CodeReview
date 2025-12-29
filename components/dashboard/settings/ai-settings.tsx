"use client";

import { useState, useEffect } from "react";
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
} from "lucide-react";
import { toast } from "sonner";
import { getUserRules, updateUserRules } from "@/app/actions/settings";
import { Badge } from "@/components/ui/badge";

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
  const [apiKey, setApiKey] = useState("");
  const [rules, setRules] = useState<Rules>({ good: [], bad: [] });
  const [newGoodRule, setNewGoodRule] = useState("");
  const [newBadRule, setNewBadRule] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    const storedKey = localStorage.getItem("gemini_api_key");
    if (storedKey) setApiKey(storedKey);

    const fetchRules = async () => {
      try {
        const userRules = await getUserRules();
        setRules({
          good: userRules.goodRules,
          bad: userRules.badRules,
        });
      } catch (error) {
        console.error("Failed to fetch rules", error);
        toast.error("Failed to load settings");
      } finally {
        setIsLoaded(true);
      }
    };
    fetchRules();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const result = await updateUserRules({
        goodRules: rules.good,
        badRules: rules.bad,
        apiKey, // Also save encrypted version in DB for webhook support
      });

      if (result.success) {
        toast.success("Settings saved successfully");
      } else {
        toast.error(result.error || "Failed to save settings");
      }
    } catch (error) {
      toast.error("Failed to save settings");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

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

  const removeBadRule = (index: number) => {
    setRules((prev) => ({
      ...prev,
      bad: prev.bad.filter((_, i) => i !== index),
    }));
  };

  if (!isLoaded) return null;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* API Key Card */}
      <Card className="border-primary/20 bg-linear-to-br from-primary/5 to-transparent">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2 text-xl">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Key className="h-5 w-5 text-primary" />
                </div>
                Gemini API Key
              </CardTitle>
              <CardDescription className="text-base">
                Your API key is stored securely in your browser and used for
                AI-powered code reviews
              </CardDescription>
            </div>
            {apiKey && (
              <Badge variant="secondary" className="gap-1.5">
                <CheckCircle2 className="h-3 w-3" />
                Configured
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="api-key" className="text-sm font-medium">
              API Key
            </Label>
            <div className="flex gap-2">
              <Input
                id="api-key"
                type={showKey ? "text" : "password"}
                placeholder="Enter your Gemini API Key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="font-mono text-sm"
              />
              <Button
                variant="outline"
                onClick={() => setShowKey(!showKey)}
                className="px-3"
              >
                {showKey ? "Hide" : "Show"}
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
            <Sparkles className="h-4 w-4 shrink-0" />
            <p>
              Get your API key from Google AI Studio to enable AI-powered code
              reviews
            </p>
          </div>
        </CardContent>
      </Card>

      {/* AI Rules Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2 text-xl">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
                AI Review Rules
              </CardTitle>
              <CardDescription className="text-base">
                Define custom rules to guide the AI during code reviews
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Rules Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-4 border rounded-lg bg-green-500/5 border-green-500/20">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-green-500/10">
                  <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Good Practices
                  </p>
                  <p className="text-2xl font-bold">{rules.good.length}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg bg-red-500/5 border-red-500/20">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-red-500/10">
                  <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Anti-patterns
                  </p>
                  <p className="text-2xl font-bold">{rules.bad.length}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Manage Rules Dialog */}
          <Dialog>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto" size="lg">
                Manage Rules
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl h-[85vh] flex flex-col p-0">
              <DialogHeader className="px-6 pt-6 pb-4">
                <DialogTitle className="text-2xl">Manage AI Rules</DialogTitle>
                <DialogDescription className="text-base">
                  Add rules for best practices to encourage and anti-patterns to
                  avoid
                </DialogDescription>
              </DialogHeader>
              <Tabs
                defaultValue="good"
                className="flex-1 flex flex-col min-h-0 px-6"
              >
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="good" className="gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    Good Practices
                  </TabsTrigger>
                  <TabsTrigger value="bad" className="gap-2">
                    <XCircle className="h-4 w-4" />
                    Anti-patterns
                  </TabsTrigger>
                </TabsList>

                <TabsContent
                  value="good"
                  className="flex-1 flex flex-col min-h-0 gap-4 mt-0"
                >
                  <div className="space-y-2">
                    <Textarea
                      placeholder="e.g., Use meaningful variable names&#10;&#10;Or add code samples:&#10;const userAge = 25; // Good"
                      value={newGoodRule}
                      onChange={(e) => setNewGoodRule(e.target.value)}
                      onKeyDown={(e) => {
                        // Allow Ctrl+Enter or Cmd+Enter to submit
                        if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                          e.preventDefault();
                          addGoodRule();
                        }
                      }}
                      className="flex-1 min-h-25 resize-y"
                      rows={4}
                    />
                    <Button onClick={addGoodRule} className="w-full">
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
                  <ScrollArea className="flex-1 border rounded-lg p-3 bg-muted/20">
                    <div className="space-y-2">
                      {rules.good.map((rule, index) => (
                        <div
                          key={index}
                          className="flex items-start gap-3 p-3 rounded-lg bg-background border hover:border-primary/50 transition-colors group"
                        >
                          <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                          <span className="flex-1 text-sm leading-relaxed whitespace-pre-wrap font-mono">
                            {rule}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                            onClick={() => removeGoodRule(index)}
                          >
                            <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                          </Button>
                        </div>
                      ))}
                      {rules.good.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                          <CheckCircle2 className="h-12 w-12 text-muted-foreground/20 mb-3" />
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
                  className="flex-1 flex flex-col min-h-0 gap-4 mt-0"
                >
                  <div className="space-y-2">
                    <Textarea
                      placeholder="e.g., Avoid using 'any' type in TypeScript&#10;&#10;Or add code samples:&#10;let data: any; // Bad"
                      value={newBadRule}
                      onChange={(e) => setNewBadRule(e.target.value)}
                      onKeyDown={(e) => {
                        // Allow Ctrl+Enter or Cmd+Enter to submit
                        if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                          e.preventDefault();
                          addBadRule();
                        }
                      }}
                      className="flex-1 min-h-25 resize-y"
                      rows={4}
                    />
                    <Button onClick={addBadRule} className="w-full">
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
                  <ScrollArea className="flex-1 border rounded-lg p-3 bg-muted/20">
                    <div className="space-y-2">
                      {rules.bad.map((rule, index) => (
                        <div
                          key={index}
                          className="flex items-start gap-3 p-3 rounded-lg bg-background border hover:border-primary/50 transition-colors group"
                        >
                          <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                          <span className="flex-1 text-sm leading-relaxed whitespace-pre-wrap font-mono">
                            {rule}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                            onClick={() => removeBadRule(index)}
                          >
                            <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                          </Button>
                        </div>
                      ))}
                      {rules.bad.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                          <XCircle className="h-12 w-12 text-muted-foreground/20 mb-3" />
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
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end pt-4">
        <Button
          onClick={handleSave}
          size="lg"
          className="gap-2 min-w-40"
          disabled={isSaving}
        >
          {isSaving ? (
            <>
              <Sparkles className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save Settings
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
