"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ExternalLink, Loader2, Search } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRepositories } from "@/hooks/repositories/use-repositories";
import { RepositoryListSkeleton } from "@/components/skeleton/repositorySkeleton";
import { useConnectRepository } from "@/hooks/repositories/useConnectRepository";
interface RepositoryInterface {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  language: string | null;
  topics?: string[]; // ✅ FIX: optional
  isConnected?: boolean;
}

const RepositoryPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [localConnectingRepoId, setLocalConnectingRepoId] = useState<
    number | null
  >(null);

  const observerTarget = useRef<HTMLDivElement | null>(null);

  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useRepositories();

  const { mutate: connectRepository } = useConnectRepository();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      {
        threshold: 0.1,
      }
    );
    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }
    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Repositories</h1>
          <p className="text-muted-foreground">
            Manage and View all Github Repositories
          </p>
        </div>
        <RepositoryListSkeleton />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Repositories</h1>
          <p className="text-muted-foreground">
            Manage and View all Github Repositories
          </p>
        </div>
        <div className="text-red-500">Failed to load repositories.</div>
      </div>
    );
  }

  const allRepositories: RepositoryInterface[] =
    data?.pages.flatMap((page) => page) || [];

  const filteredRepositories = allRepositories.filter(
    (repo) =>
      repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      repo.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleConnect = (repo: RepositoryInterface) => {
    try {
      setLocalConnectingRepoId(repo.id);

      // TODO: replace with real API call
      connectRepository(
        {
          owner: repo.full_name.split("/")[0],
          repo: repo.name,
          githubId: repo.id,
        },
        {
          onSettled: () => setLocalConnectingRepoId(null),
        }
      );
    } catch (error) {
      console.error("Failed to connect repository", error);
    } finally {
      setLocalConnectingRepoId(null);
    }
  };

  if (isLoading) {
    return <div>Loading repositories...</div>;
  }

  if (isError) {
    return <div>Failed to load repositories.</div>;
  }

  return (
    <div className="space-y-4 px-4 sm:px-6 lg:px-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Repositories
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1">
          Manage and connect your GitHub repositories to enable AI-powered code
          reviews.
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search repositories"
          className="pl-9"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="grid gap-4">
        {filteredRepositories.map((repo) => (
          <Card key={repo.id} className="transition-shadow hover:shadow-md">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <CardTitle className="text-base sm:text-lg wrap-break-word">
                      {repo.name}
                    </CardTitle>
                    {repo.language && (
                      <Badge variant="outline" className="text-xs">
                        {repo.language}
                      </Badge>
                    )}
                    {repo.isConnected && (
                      <Badge variant="secondary" className="text-xs">
                        Connected
                      </Badge>
                    )}
                  </div>

                  <CardDescription className="text-sm wrap-break-word">
                    {repo.description ||
                      "No description provided for this repository."}
                  </CardDescription>
                </div>

                <div className="flex gap-2 shrink-0">
                  <Button variant="ghost" size="icon" asChild>
                    <Link
                      href={repo.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                  </Button>

                  <Button
                    onClick={() => handleConnect(repo)}
                    className="cursor-pointer"
                    disabled={
                      localConnectingRepoId === repo.id || repo.isConnected
                    }
                    variant={repo.isConnected ? "outline" : "default"}
                    size="sm"
                  >
                    {localConnectingRepoId === repo.id ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        <span className="hidden sm:inline">Connecting...</span>
                      </>
                    ) : repo.isConnected ? (
                      "Connected"
                    ) : (
                      "Connect"
                    )}
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>

      <div ref={observerTarget} className="py-4">
        {isFetchingNextPage && <RepositoryListSkeleton />}
        {!hasNextPage && allRepositories.length > 0 && (
          <p className="text-center text-xs sm:text-sm text-muted-foreground">
            You have reached the end of the list.
          </p>
        )}
      </div>
    </div>
  );
};

export default RepositoryPage;
