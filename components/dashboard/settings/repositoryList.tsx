"use client";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getConnectedRepositories,
  disconnectRepository,
  disconnectAllRepositories,
} from "@/app/actions/settings";
import { toast } from "sonner";
import {
  ExternalLink,
  Trash2,
  AlertTriangle,
  GitBranch,
  Loader2,
  PackageOpen,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import Link from "next/link";

export function RepositoryList() {
  const queryClient = useQueryClient();
  const [disconnectAllOpen, setDisconnectAllOpen] = useState(false);
  const [disconnectRepoId, setDisconnectRepoId] = useState<string | null>(null);

  const {
    data: repositories,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["connectedRepositories"],
    queryFn: async () => await getConnectedRepositories(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });

  const disconnectMutation = useMutation({
    mutationFn: async (repoId: string) => {
      return await disconnectRepository(repoId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["connectedRepositories"],
      });
      queryClient.invalidateQueries({
        queryKey: ["repositories"],
      });
      setDisconnectRepoId(null);
      toast.success("Repository disconnected successfully");
    },
    onError: () => {
      toast.error("Failed to disconnect repository");
    },
  });

  const disconnectAllMutation = useMutation({
    mutationFn: async () => {
      return await disconnectAllRepositories();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["connectedRepositories"],
      });
      queryClient.invalidateQueries({
        queryKey: ["repositories"],
      });
      queryClient.invalidateQueries({
        queryKey: ["dashboard-stats"],
      });
      setDisconnectAllOpen(false);
      toast.success("All repositories disconnected successfully");
    },
    onError: () => {
      toast.error("Failed to disconnect all repositories");
    },
  });

  const handleDisconnect = (repoId: string) => {
    setDisconnectRepoId(repoId);
  };

  const handleConfirmDisconnect = () => {
    if (disconnectRepoId) {
      disconnectMutation.mutate(disconnectRepoId);
    }
  };

  const handleDisconnectAll = () => {
    setDisconnectAllOpen(true);
  };

  const handleConfirmDisconnectAll = () => {
    disconnectAllMutation.mutate();
  };

  // Loading state
  if (isLoading) {
    return (
      <Card className="border-border/50">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <GitBranch className="h-4 w-4 sm:h-5 sm:w-5 text-primary shrink-0" />
            <span>Connected Repositories</span>
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Repositories connected for AI code reviews
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className="border-border/50">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <GitBranch className="h-4 w-4 sm:h-5 sm:w-5 text-primary shrink-0" />
            <span>Connected Repositories</span>
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Repositories connected for AI code reviews
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          <Alert
            variant="destructive"
            className="border-destructive/50 bg-destructive/10"
          >
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error loading repositories</AlertTitle>
            <AlertDescription className="text-sm">
              Failed to fetch your connected repositories. Please try refreshing
              the page.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const hasRepositories = repositories && repositories.length > 0;

  return (
    <>
      <Card className="border-border/50">
        <CardHeader className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
            <div className="flex-1">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <GitBranch className="h-4 w-4 sm:h-5 sm:w-5 text-primary shrink-0" />
                <span>Connected Repositories</span>
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm mt-1">
                {hasRepositories
                  ? `${repositories.length} ${
                      repositories.length === 1 ? "repository" : "repositories"
                    } connected for AI code reviews`
                  : "No repositories connected yet"}
              </CardDescription>
            </div>
            {hasRepositories && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDisconnectAll}
                disabled={disconnectAllMutation.isPending}
                className="w-full sm:w-auto text-xs sm:text-sm"
              >
                {disconnectAllMutation.isPending ? (
                  <>
                    <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin mr-2" />
                    Disconnecting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                    Disconnect All
                  </>
                )}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          {!hasRepositories ? (
            // Empty state
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <div className="rounded-full bg-muted/50 p-4 mb-4">
                <PackageOpen className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2 text-center">
                No repositories connected
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground text-center max-w-md mb-6">
                Connect your GitHub repositories to start receiving AI-powered
                code reviews on your pull requests.
              </p>
              <Link href="/dashboard/repository">
                <Button
                  variant="default"
                  size="sm"
                  className="text-xs sm:text-sm"
                >
                  <GitBranch className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                  Connect Repository
                </Button>
              </Link>
            </div>
          ) : (
            <>
              {/* Warning about disconnecting repositories */}
              <Alert className="mb-4 border-orange-500/30 bg-orange-500/5">
                <AlertTriangle className="h-4 w-4 text-orange-500" />
                <AlertTitle className="text-sm font-semibold">
                  Important
                </AlertTitle>
                <AlertDescription className="text-xs sm:text-sm text-muted-foreground">
                  Disconnecting a repository will remove all webhooks and stop
                  AI reviews for that repository.
                </AlertDescription>
              </Alert>

              {/* Repository list */}
              <div className="space-y-3">
                {repositories.map((repo) => (
                  <div
                    key={repo.id}
                    className="group relative rounded-lg border border-border/50 bg-card hover:bg-accent/5 transition-colors p-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-2 mb-2">
                          <GitBranch className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-semibold text-foreground truncate">
                              {repo.fullName || repo.name}
                            </h4>
                            <p className="text-xs text-muted-foreground truncate">
                              {repo.name}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <Badge variant="secondary" className="text-xs">
                            Connected
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            Since{" "}
                            {new Date(repo.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          asChild
                          className="text-xs"
                        >
                          <a
                            href={repo.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1"
                          >
                            <ExternalLink className="h-3 w-3" />
                            <span className="hidden sm:inline">View</span>
                          </a>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDisconnect(repo.id)}
                          disabled={disconnectMutation.isPending}
                          className="text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-3 w-3 sm:mr-1" />
                          <span className="hidden sm:inline">Remove</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Disconnect single repository dialog */}
      <AlertDialog
        open={!!disconnectRepoId}
        onOpenChange={(open) => !open && setDisconnectRepoId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Disconnect Repository?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the GitHub webhook and stop AI code reviews for
              this repository. You can reconnect it anytime.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={disconnectMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDisconnect}
              disabled={disconnectMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {disconnectMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Disconnecting...
                </>
              ) : (
                "Disconnect"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Disconnect all repositories dialog */}
      <AlertDialog open={disconnectAllOpen} onOpenChange={setDisconnectAllOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Disconnect All Repositories?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will remove all GitHub webhooks and stop AI code reviews for
              all {repositories?.length} connected repositories. This action
              cannot be undone, but you can reconnect repositories anytime.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={disconnectAllMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDisconnectAll}
              disabled={disconnectAllMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {disconnectAllMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Disconnecting...
                </>
              ) : (
                "Disconnect All"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
