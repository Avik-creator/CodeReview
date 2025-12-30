import { inngest } from "../client";
import prisma from "@/lib/db";
import { decrypt } from "@/lib/encryption";
import { generateEmbeddings } from "@/components/ai/lib/rag";
import { pineconeIndex } from "@/lib/pineCone";
import { LinearClient } from "@/lib/integrations/linear";
import { JiraClient } from "@/lib/integrations/jira";
import type { NormalizedIssue } from "@/lib/integrations/types";

// Issue namespace in Pinecone for separating from code embeddings
const ISSUE_NAMESPACE = "issues";

/**
 * Sync a single issue and create embeddings
 */
export const syncIssue = inngest.createFunction(
  { id: "sync-issue" },
  { event: "issue.sync.requested" },
  async ({ event, step }) => {
    const { issueId, source, userId } = event.data;

    // Get the issue from our database
    const issue = await step.run("fetch-issue", async () => {
      return prisma.issue.findFirst({
        where: {
          externalId: issueId,
          source,
          userId,
        },
      });
    });

    if (!issue) {
      console.log(`[Issue Sync] Issue not found: ${source}/${issueId}`);
      return { success: false, reason: "Issue not found" };
    }

    // Get user's API key for embeddings
    const apiKey = await step.run("get-api-key", async () => {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { encryptedApiKey: true },
      });

      if (!user?.encryptedApiKey) {
        throw new Error("User API key not configured");
      }

      return decrypt(user.encryptedApiKey);
    });

    // Create embedding for the issue
    await step.run("create-embedding", async () => {
      // Combine title, description, and metadata for embedding
      const textForEmbedding = buildIssueEmbeddingText(issue);

      const embedding = await generateEmbeddings(textForEmbedding, apiKey);

      // Store in Pinecone with issue-specific metadata
      await pineconeIndex.namespace(ISSUE_NAMESPACE).upsert([
        {
          id: `${source}-${issueId}-${userId}`,
          values: embedding,
          metadata: {
            userId,
            source,
            externalId: issueId,
            issueId: issue.id,
            projectKey: issue.projectKey || "",
            projectName: issue.projectName || "",
            title: issue.title,
            status: issue.status || "",
            priority: issue.priority || "",
            assignee: issue.assignee || "",
            labels: issue.labels || [],
            issueType: issue.issueType || "",
            // Store truncated content for retrieval
            content: textForEmbedding.slice(0, 8000),
          },
        },
      ]);

      // Mark issue as embedded
      await prisma.issue.update({
        where: { id: issue.id },
        data: {
          embedded: true,
          embeddedAt: new Date(),
        },
      });
    });

    console.log(`[Issue Sync] Successfully synced issue: ${source}/${issueId}`);
    return { success: true, issueId: issue.id };
  }
);

/**
 * Bulk sync all issues for a user's integration
 */
export const syncAllIssues = inngest.createFunction(
  { id: "sync-all-issues", concurrency: 2 },
  { event: "integration.sync.requested" },
  async ({ event, step }) => {
    const { userId, provider } = event.data;

    // Get the integration
    const integration = await step.run("get-integration", async () => {
      return prisma.integration.findUnique({
        where: {
          userId_provider: {
            userId,
            provider,
          },
        },
      });
    });

    if (!integration) {
      return { success: false, reason: "Integration not found" };
    }

    const accessToken = decrypt(integration.accessToken);

    // Fetch all issues based on provider
    const issues = await step.run("fetch-issues", async () => {
      if (provider === "linear") {
        const client = new LinearClient({
          provider: "linear",
          accessToken,
          workspaceId: integration.workspaceId || undefined,
        });

        const allIssues = [];
        let hasNextPage = true;
        let cursor: string | undefined;

        while (hasNextPage) {
          const result = await client.getIssues({ after: cursor, first: 100 });
          allIssues.push(...result.issues);
          hasNextPage = result.hasNextPage;
          cursor = result.endCursor;

          // Limit to prevent infinite loops
          if (allIssues.length > 1000) break;
        }

        return allIssues;
      } else if (provider === "jira") {
        const metadata = integration.metadata as Record<string, unknown> | null;
        const client = new JiraClient({
          provider: "jira",
          accessToken,
          workspaceId: integration.workspaceId || undefined,
          metadata: metadata || undefined,
        });

        const allIssues: NormalizedIssue[] = [];
        let nextPageToken: string | undefined;
        const maxResults = 100;

        while (true) {
          const result = await client.getIssues({ nextPageToken, maxResults });
          allIssues.push(...result.issues);

          if (result.isLast || !result.nextPageToken) break;
          nextPageToken = result.nextPageToken;

          // Limit to prevent infinite loops
          if (allIssues.length > 1000) break;
        }

        return allIssues;
      }

      return [];
    });

    // Upsert all issues to database
    await step.run("upsert-issues", async () => {
      for (const issue of issues) {
        await prisma.issue.upsert({
          where: {
            source_externalId_userId: {
              source: provider,
              externalId: issue.externalId,
              userId,
            },
          },
          create: {
            ...issue,
            source: provider,
            userId,
            embedded: false,
          },
          update: {
            ...issue,
            embedded: false,
          },
        });
      }
    });

    // Trigger embeddings for all issues
    await step.run("trigger-embeddings", async () => {
      for (const issue of issues) {
        await inngest.send({
          name: "issue.sync.requested",
          data: {
            issueId: issue.externalId,
            source: provider,
            userId,
            action: "sync",
          },
        });
      }
    });

    return { success: true, syncedCount: issues.length };
  }
);

/**
 * Build text content for embedding an issue
 */
function buildIssueEmbeddingText(issue: {
  title: string;
  description?: string | null;
  projectKey?: string | null;
  projectName?: string | null;
  status?: string | null;
  priority?: string | null;
  assignee?: string | null;
  labels?: string[];
  issueType?: string | null;
}): string {
  const parts = [
    `Title: ${issue.title}`,
    issue.description ? `Description: ${issue.description}` : "",
    issue.projectKey ? `Project: ${issue.projectKey}` : "",
    issue.projectName ? `Project Name: ${issue.projectName}` : "",
    issue.status ? `Status: ${issue.status}` : "",
    issue.priority ? `Priority: ${issue.priority}` : "",
    issue.assignee ? `Assignee: ${issue.assignee}` : "",
    issue.labels?.length ? `Labels: ${issue.labels.join(", ")}` : "",
    issue.issueType ? `Type: ${issue.issueType}` : "",
  ];

  return parts.filter(Boolean).join("\n");
}
