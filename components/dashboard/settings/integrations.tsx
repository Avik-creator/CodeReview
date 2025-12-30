"use client";

import { useState } from "react";
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
import Linear from "@/public/linear.png";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  RefreshCw,
  Loader2,
  CheckCircle2,
  ExternalLink,
  Link2,
  Unlink,
} from "lucide-react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getIntegrations as getIntegrationsAction,
  connectLinear as connectLinearAction,
  connectJira as connectJiraAction,
  disconnectIntegration as disconnectIntegrationAction,
  syncIntegration as syncIntegrationAction,
  getIssueStats as getIssueStatsAction,
} from "@/app/actions/integrations";

// Linear icon
const LinearIcon = () => (
  <Image src={Linear} alt="Linear" className="w-4 h-4 md:w-8 h-8" />
);

// Jira icon
const JiraIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
    <path d="M11.571 11.513H0a5.218 5.218 0 0 0 5.232 5.215h2.13v2.057A5.215 5.215 0 0 0 12.575 24V12.518a1.005 1.005 0 0 0-1.005-1.005zm5.723-5.756H5.736a5.215 5.215 0 0 0 5.215 5.214h2.129v2.058a5.218 5.218 0 0 0 5.215 5.214V6.758a1.001 1.001 0 0 0-1.001-1.001zM23.013 0H11.455a5.215 5.215 0 0 0 5.215 5.215h2.129v2.057A5.215 5.215 0 0 0 24 12.483V1.005A1.005 1.005 0 0 0 23.013 0z" />
  </svg>
);

export const IntegrationsSettings = () => {
  const queryClient = useQueryClient();
  const [linearDialogOpen, setLinearDialogOpen] = useState(false);
  const [jiraDialogOpen, setJiraDialogOpen] = useState(false);

  // Linear form state
  const [linearApiKey, setLinearApiKey] = useState("");

  // Jira form state
  const [jiraEmail, setJiraEmail] = useState("");
  const [jiraApiToken, setJiraApiToken] = useState("");
  const [jiraCloudUrl, setJiraCloudUrl] = useState("");

  // Fetch integrations
  const { data: integrations } = useQuery({
    queryKey: ["integrations"],
    queryFn: async () => {
      return getIntegrationsAction();
    },
    staleTime: 1000 * 60 * 5,
  });

  // Fetch issue stats
  const { data: issueStats } = useQuery({
    queryKey: ["issueStats"],
    queryFn: async () => {
      return getIssueStatsAction();
    },
    staleTime: 1000 * 60 * 2,
  });

  // Connect Linear mutation
  const connectLinearMutation = useMutation({
    mutationFn: async (apiKey: string) => {
      return connectLinearAction({ apiKey });
    },
    onSuccess: (result) => {
      if (result.success) {
        toast.success("Linear connected successfully!");
        setLinearDialogOpen(false);
        setLinearApiKey("");
        queryClient.invalidateQueries({ queryKey: ["integrations"] });
        queryClient.invalidateQueries({ queryKey: ["issueStats"] });
      } else {
        toast.error(result.error || "Failed to connect Linear");
      }
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to connect");
    },
  });

  // Connect Jira mutation
  const connectJiraMutation = useMutation({
    mutationFn: async (params: {
      email: string;
      apiToken: string;
      cloudUrl: string;
    }) => {
      return connectJiraAction({
        email: params.email,
        apiToken: params.apiToken,
        cloudUrl: params.cloudUrl,
      });
    },
    onSuccess: (result) => {
      if (result.success) {
        toast.success("Jira connected successfully!");
        setJiraDialogOpen(false);
        setJiraEmail("");
        setJiraApiToken("");
        setJiraCloudUrl("");
        queryClient.invalidateQueries({ queryKey: ["integrations"] });
        queryClient.invalidateQueries({ queryKey: ["issueStats"] });
      } else {
        toast.error(result.error || "Failed to connect Jira");
      }
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to connect");
    },
  });

  // Disconnect mutation
  const disconnectMutation = useMutation({
    mutationFn: async (provider: "linear" | "jira") => {
      return disconnectIntegrationAction(provider);
    },
    onSuccess: (result) => {
      if (result.success) {
        toast.success("Integration disconnected");
        queryClient.invalidateQueries({ queryKey: ["integrations"] });
        queryClient.invalidateQueries({ queryKey: ["issueStats"] });
      }
    },
  });

  // Sync mutation
  const syncMutation = useMutation({
    mutationFn: async (provider: "linear" | "jira") => {
      return syncIntegrationAction(provider);
    },
    onSuccess: (result) => {
      if (result.success) {
        toast.success("Sync started! Issues will be updated shortly.");
      }
    },
  });

  const linearIntegration = integrations?.find((i) => i.provider === "linear");
  const jiraIntegration = integrations?.find((i) => i.provider === "jira");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Link2 className="h-5 w-5" />
          Integrations
        </CardTitle>
        <CardDescription>
          Connect Linear and Jira to include issue context in your AI code
          reviews. Use{" "}
          <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">
            @codereviewerai
          </code>{" "}
          in PR comments to ask questions with full context.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Stats */}

        {/* Integration Cards */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Linear */}
          <div className="border rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg">
                  <LinearIcon />
                </div>
                <div>
                  <h3 className="font-semibold">Linear</h3>
                  <p className="text-sm text-muted-foreground">
                    Issue tracking
                  </p>
                </div>
              </div>
              {linearIntegration && (
                <Badge variant="secondary" className="gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Connected
                </Badge>
              )}
            </div>

            {linearIntegration ? (
              <div className="space-y-3">
                <div className="text-sm">
                  <span className="text-muted-foreground">Workspace: </span>
                  <span className="font-medium">
                    {linearIntegration.workspaceName}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => syncMutation.mutate("linear")}
                    disabled={syncMutation.isPending}
                  >
                    {syncMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-1" />
                    ) : (
                      <RefreshCw className="h-4 w-4 mr-1" />
                    )}
                    Sync
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => disconnectMutation.mutate("linear")}
                    disabled={disconnectMutation.isPending}
                  >
                    <Unlink className="h-4 w-4 mr-1" />
                    Disconnect
                  </Button>
                </div>
              </div>
            ) : (
              <Dialog
                open={linearDialogOpen}
                onOpenChange={setLinearDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Connect Linear
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <LinearIcon />
                      Connect Linear
                    </DialogTitle>
                    <DialogDescription>
                      Enter your Linear API key to sync issues. You can create
                      one at{" "}
                      <a
                        href="https://linear.app/settings/api"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline inline-flex items-center gap-1"
                      >
                        linear.app/settings/api
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="linear-api-key">API Key</Label>
                      <Input
                        id="linear-api-key"
                        type="password"
                        placeholder="lin_api_..."
                        value={linearApiKey}
                        onChange={(e) => setLinearApiKey(e.target.value)}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setLinearDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={() => connectLinearMutation.mutate(linearApiKey)}
                      disabled={
                        !linearApiKey || connectLinearMutation.isPending
                      }
                    >
                      {connectLinearMutation.isPending && (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      )}
                      Connect
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>

          {/* Jira */}
          <div className="border rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600">
                  <JiraIcon />
                </div>
                <div>
                  <h3 className="font-semibold">Jira</h3>
                  <p className="text-sm text-muted-foreground">
                    Project management
                  </p>
                </div>
              </div>
              {jiraIntegration && (
                <Badge variant="secondary" className="gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Connected
                </Badge>
              )}
            </div>

            {jiraIntegration ? (
              <div className="space-y-3">
                <div className="text-sm">
                  <span className="text-muted-foreground">Site: </span>
                  <span className="font-medium">
                    {jiraIntegration.workspaceName}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => syncMutation.mutate("jira")}
                    disabled={syncMutation.isPending}
                  >
                    {syncMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-1" />
                    ) : (
                      <RefreshCw className="h-4 w-4 mr-1" />
                    )}
                    Sync
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => disconnectMutation.mutate("jira")}
                    disabled={disconnectMutation.isPending}
                  >
                    <Unlink className="h-4 w-4 mr-1" />
                    Disconnect
                  </Button>
                </div>
              </div>
            ) : (
              <Dialog open={jiraDialogOpen} onOpenChange={setJiraDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Connect Jira
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <JiraIcon />
                      Connect Jira
                    </DialogTitle>
                    <DialogDescription>
                      Connect your Jira Cloud instance. Create an API token at{" "}
                      <a
                        href="https://id.atlassian.com/manage-profile/security/api-tokens"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline inline-flex items-center gap-1"
                      >
                        Atlassian Account Settings
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="jira-url">Jira Cloud URL</Label>
                      <Input
                        id="jira-url"
                        type="url"
                        placeholder="https://yoursite.atlassian.net"
                        value={jiraCloudUrl}
                        onChange={(e) => setJiraCloudUrl(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="jira-email">Email</Label>
                      <Input
                        id="jira-email"
                        type="email"
                        placeholder="your@email.com"
                        value={jiraEmail}
                        onChange={(e) => setJiraEmail(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="jira-token">API Token</Label>
                      <Input
                        id="jira-token"
                        type="password"
                        placeholder="Your API token"
                        value={jiraApiToken}
                        onChange={(e) => setJiraApiToken(e.target.value)}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setJiraDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={() =>
                        connectJiraMutation.mutate({
                          email: jiraEmail,
                          apiToken: jiraApiToken,
                          cloudUrl: jiraCloudUrl,
                        })
                      }
                      disabled={
                        !jiraEmail ||
                        !jiraApiToken ||
                        !jiraCloudUrl ||
                        connectJiraMutation.isPending
                      }
                    >
                      {connectJiraMutation.isPending && (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      )}
                      Connect
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>

        {/* Usage hint */}
        <div className="text-sm text-muted-foreground bg-muted/50 p-4 rounded-lg">
          <strong>💡 How to use:</strong> After connecting your integrations,
          mention{" "}
          <code className="bg-background px-1.5 py-0.5 rounded font-mono">
            @codereviewerai
          </code>{" "}
          in any PR comment to ask questions. The AI will automatically include
          relevant issues from Linear and Jira in its response.
        </div>
      </CardContent>
    </Card>
  );
};
