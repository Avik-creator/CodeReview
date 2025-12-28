"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Message,
  MessageContent,
  MessageResponse,
  MessageToolbar,
  MessageActions,
  MessageAction,
} from "@/components/ai-elements/message";
import {
  ExternalLink,
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  GitPullRequest,
  AlertCircle,
  Loader2,
  GitBranch,
  Calendar,
  Copy,
} from "lucide-react";
import { getReviews } from "@/app/actions/reviews";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

export default function ReviewsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const {
    data: reviews,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["reviews"],
    queryFn: async () => await getReviews(),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  const filteredReviews = reviews?.filter((review) => {
    const matchesSearch =
      review.prTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.repository.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      review.repository.owner.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || review.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return <CheckCircle2 className="h-4 w-4" />;
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "failed":
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "default";
      case "pending":
        return "secondary";
      case "failed":
        return "destructive";
      default:
        return "outline";
    }
  };

  const handleCopy = (content: string, id: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            PR Reviews
          </h1>
          <p className="text-muted-foreground mt-2">
            Your pull request code reviews
          </p>
        </div>

        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading reviews...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            PR Reviews
          </h1>
          <p className="text-muted-foreground mt-2">
            Your pull request code reviews
          </p>
        </div>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load reviews. Please try refreshing the page or contact
            support if the problem persists.
          </AlertDescription>
        </Alert>

        <div className="flex justify-center py-8">
          <Button onClick={() => window.location.reload()} variant="outline">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!reviews || reviews.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            PR Reviews
          </h1>
          <p className="text-muted-foreground mt-2">
            You haven&apos;t received any PR reviews yet. Connect your
            repositories and start reviewing pull requests to see them here.
          </p>
        </div>

        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 px-4">
            <div className="rounded-full bg-muted p-4 mb-4">
              <GitPullRequest className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No reviews yet</h3>
            <p className="text-sm text-muted-foreground text-center mb-6 max-w-md">
              You haven&apos;t received any PR reviews yet. Connect your
              repositories and start reviewing pull requests to see them here.
            </p>
            <Button asChild>
              <Link href="/dashboard/repositories">Connect Repositories</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            PR Reviews
          </h1>
          <p className="text-muted-foreground mt-2">
            {reviews.length} review{reviews.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by PR title, repository name, or owner..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex items-center gap-2 sm:w-48">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {filteredReviews && filteredReviews.length === 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No reviews match your filters. Try adjusting your search criteria or
            clearing filters.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6">
        {filteredReviews?.map((review) => (
          <Card
            key={review.id}
            className="overflow-hidden hover:shadow-lg transition-shadow"
          >
            <CardHeader className="border-b bg-muted/30">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <Badge
                      variant={getStatusVariant(review.status)}
                      className="gap-1"
                    >
                      {getStatusIcon(review.status)}
                      {review.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDistanceToNow(new Date(review.createdAt), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                  <CardTitle className="text-lg sm:text-xl mb-2 wrap-break-words">
                    {review.prTitle}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2 flex-wrap">
                    <span className="flex items-center gap-1">
                      <GitBranch className="h-3 w-3" />
                      {review.repository.owner}/{review.repository.name}
                    </span>
                    <span className="text-muted-foreground">•</span>
                    <span>PR #{review.prNumber}</span>
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="shrink-0 bg-transparent"
                >
                  <a
                    href={review.prUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="gap-2"
                  >
                    View PR
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </Button>
              </div>
            </CardHeader>

            <CardContent className="pt-6">
              <Message from="assistant">
                <MessageContent>
                  <MessageResponse>{review.review}</MessageResponse>
                </MessageContent>
                <MessageToolbar>
                  <MessageActions>
                    <MessageAction
                      label="Copy"
                      onClick={() => handleCopy(review.review, review.id)}
                      tooltip={
                        copiedId === review.id ? "Copied!" : "Copy to clipboard"
                      }
                    >
                      <Copy className="h-4 w-4" />
                    </MessageAction>
                  </MessageActions>
                </MessageToolbar>
              </Message>

              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <a
                  href={review.repository.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                >
                  <GitBranch className="h-3 w-3" />
                  View Repository
                </a>
                <span className="text-xs text-muted-foreground">
                  Review ID: {review.id.slice(0, 8)}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
