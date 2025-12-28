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
import { ExternalLink, Search } from "lucide-react";
import Link from "next/link";
import { useRef, useState } from "react";
import { useRepositories } from "@/hooks/repositories/use-repositories";
import { RepositoryListSkeleton } from "@/components/skeleton/repositorySkeleton";

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

  const observerTarget = useRef({
    onIntersect: () => {
      if (hasNextPage) {
        fetchNextPage();
      }
    },
  });

  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useRepositories();

  const allRepositories: RepositoryInterface[] =
    data?.pages.flatMap((page) => page) || [];

  const filteredRepositories = allRepositories.filter(
    (repo) =>
      repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      repo.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleConnect = async (repo: RepositoryInterface) => {
    try {
      setLocalConnectingRepoId(repo.id);

      // TODO: replace with real API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      console.log("Connected repo:", repo.full_name);
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
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Repositories</h1>
        <p className="text-muted-foreground">
          Manage and connect your GitHub repositories to enable AI-powered code
          reviews.
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search repositories"
          className="pl-8"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="grid gap-4">
        {filteredRepositories.map((repo) => (
          <Card key={repo.id} className="transition-shadow hover:shadow-md">
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <CardTitle className="text-lg">{repo.name}</CardTitle>
                    {repo.language && (
                      <Badge variant="outline">{repo.language}</Badge>
                    )}
                    {repo.isConnected && (
                      <Badge variant="secondary">Connected</Badge>
                    )}
                  </div>

                  <CardDescription>
                    {repo.description ||
                      "No description provided for this repository."}
                  </CardDescription>
                </div>

                <div className="flex gap-2">
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
                    disabled={
                      localConnectingRepoId === repo.id || repo.isConnected
                    }
                    variant={repo.isConnected ? "outline" : "default"}
                  >
                    {localConnectingRepoId === repo.id
                      ? "Connecting..."
                      : repo.isConnected
                      ? "Connected"
                      : "Connect"}
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
          <p className="text-center text-sm text-muted-foreground">
            You have reached the end of the list.
          </p>
        )}
      </div>
    </div>
  );
};

export default RepositoryPage;
