import { pineconeIndex } from "@/lib/pineCone";
import { generateEmbeddings } from "./rag";
import prisma from "@/lib/db";
import type { ContextQuery, IssueContext } from "@/lib/integrations/types";

const ISSUE_NAMESPACE = "issues";

/**
 * Retrieve relevant issues based on a query and filters
 */
export async function retrieveIssueContext(
  query: ContextQuery,
  apiKey: string
): Promise<IssueContext[]> {
  const { query: queryText, userId, filters, topK = 10 } = query;

  // Generate embedding for the query
  const queryEmbedding = await generateEmbeddings(queryText, apiKey);

  // Build Pinecone filter
  const pineconeFilter: Record<string, unknown> = {
    userId: { $eq: userId },
  };

  if (filters?.sources?.length) {
    pineconeFilter.source = { $in: filters.sources };
  }

  if (filters?.projectKeys?.length) {
    pineconeFilter.projectKey = { $in: filters.projectKeys };
  }

  if (filters?.statuses?.length) {
    pineconeFilter.status = { $in: filters.statuses };
  }

  if (filters?.assignees?.length) {
    pineconeFilter.assignee = { $in: filters.assignees };
  }

  // Query Pinecone
  const results = await pineconeIndex.namespace(ISSUE_NAMESPACE).query({
    vector: queryEmbedding,
    topK: topK * 2, // Fetch more for re-ranking
    filter: pineconeFilter,
    includeMetadata: true,
  });

  // Map results to IssueContext
  const issueContexts: IssueContext[] = results.matches.map((match) => {
    const metadata = match.metadata || {};
    return {
      issue: {
        externalId: metadata.externalId as string,
        source: metadata.source as "linear" | "jira" | "github",
        sourceUrl: metadata.sourceUrl as string | undefined,
        projectKey: metadata.projectKey as string | undefined,
        projectName: metadata.projectName as string | undefined,
        title: metadata.title as string,
        description: undefined, // Not stored in metadata to save space
        status: metadata.status as string | undefined,
        priority: metadata.priority as string | undefined,
        assignee: metadata.assignee as string | undefined,
        labels: (metadata.labels as string[]) || [],
        issueType: metadata.issueType as string | undefined,
      },
      score: match.score || 0,
      snippet: (metadata.content as string) || "",
    };
  });

  // Re-rank based on recency and priority
  const rankedContexts = await reRankIssueContexts(issueContexts, userId);

  return rankedContexts.slice(0, topK);
}

/**
 * Re-rank issue contexts based on multiple factors
 */
async function reRankIssueContexts(
  contexts: IssueContext[],
  userId: string
): Promise<IssueContext[]> {
  // Fetch full issue data for re-ranking
  const issueIds = contexts.map((c) => c.issue.externalId);

  const issues = await prisma.issue.findMany({
    where: {
      externalId: { in: issueIds },
      userId,
    },
  });

  const issueMap = new Map(issues.map((i) => [i.externalId, i]));

  // Priority weights
  const priorityWeights: Record<string, number> = {
    urgent: 1.0,
    high: 0.8,
    medium: 0.5,
    low: 0.2,
    none: 0.1,
  };

  // Calculate combined score
  return contexts
    .map((context) => {
      const issue = issueMap.get(context.issue.externalId);
      if (!issue) return context;

      // Vector similarity score (normalized)
      const vectorScore = context.score;

      // Recency score (issues updated recently get higher scores)
      const daysSinceUpdate = issue.sourceUpdatedAt
        ? (Date.now() - new Date(issue.sourceUpdatedAt).getTime()) /
          (1000 * 60 * 60 * 24)
        : 365;
      const recencyScore = Math.max(0, 1 - daysSinceUpdate / 30); // Decay over 30 days

      // Priority score
      const priorityScore =
        priorityWeights[issue.priority?.toLowerCase() || "none"] || 0.1;

      // Combined score with weights
      const combinedScore =
        vectorScore * 0.6 + // Vector similarity is most important
        recencyScore * 0.25 + // Recency matters
        priorityScore * 0.15; // Priority helps

      return {
        ...context,
        score: combinedScore,
      };
    })
    .sort((a, b) => b.score - a.score);
}

/**
 * Build context string for AI prompt from retrieved issues
 */
export function buildIssueContextPrompt(contexts: IssueContext[]): string {
  if (!contexts.length) {
    return "No relevant issues found in connected integrations.";
  }

  const issueBlocks = contexts.map((ctx, index) => {
    const { issue, score } = ctx;
    return `
### Issue ${index + 1} [${issue.source.toUpperCase()}] (Relevance: ${(
      score * 100
    ).toFixed(1)}%)
- **ID**: ${issue.externalId}
- **Title**: ${issue.title}
- **Project**: ${issue.projectKey || "N/A"} (${issue.projectName || "N/A"})
- **Status**: ${issue.status || "Unknown"}
- **Priority**: ${issue.priority || "None"}
- **Assignee**: ${issue.assignee || "Unassigned"}
- **Type**: ${issue.issueType || "Issue"}
- **Labels**: ${issue.labels.length ? issue.labels.join(", ") : "None"}
${issue.sourceUrl ? `- **URL**: ${issue.sourceUrl}` : ""}

${
  ctx.snippet
    ? `**Content:**\n${ctx.snippet.slice(0, 500)}${
        ctx.snippet.length > 500 ? "..." : ""
      }`
    : ""
}
`.trim();
  });

  return `
## Related Issues from Connected Integrations

The following issues from Linear and Jira may be relevant to this context:

${issueBlocks.join("\n\n---\n\n")}

---
*Use these issues as context when responding. Reference issue IDs when applicable.*
`.trim();
}

/**
 * Get issues for a specific project or set of filters
 */
export async function getIssuesForProject(
  userId: string,
  options?: {
    projectKey?: string;
    source?: "linear" | "jira";
    status?: string;
    limit?: number;
  }
): Promise<IssueContext[]> {
  const where: Record<string, unknown> = { userId };

  if (options?.projectKey) {
    where.projectKey = options.projectKey;
  }
  if (options?.source) {
    where.source = options.source;
  }
  if (options?.status) {
    where.status = options.status;
  }

  const issues = await prisma.issue.findMany({
    where,
    orderBy: { sourceUpdatedAt: "desc" },
    take: options?.limit || 20,
  });

  return issues.map((issue) => ({
    issue: {
      externalId: issue.externalId,
      source: issue.source as "linear" | "jira" | "github",
      sourceUrl: issue.sourceUrl || undefined,
      projectKey: issue.projectKey || undefined,
      projectName: issue.projectName || undefined,
      title: issue.title,
      description: issue.description || undefined,
      status: issue.status || undefined,
      priority: issue.priority || undefined,
      assignee: issue.assignee || undefined,
      labels: issue.labels || [],
      issueType: issue.issueType || undefined,
    },
    score: 1.0, // Direct fetch, no vector score
    snippet: issue.description?.slice(0, 500) || "",
  }));
}
