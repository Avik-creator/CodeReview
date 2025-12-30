import { inngest } from "../client";
import prisma from "@/lib/db";
import { decrypt } from "@/lib/encryption";
import { LinearClient } from "@/lib/integrations/linear";
import { JiraClient } from "@/lib/integrations/jira";
import { generateEmbeddings } from "@/components/ai/lib/rag";
import { pineconeIndex } from "@/lib/pineCone";
import { NormalizedIssue } from "@/lib/integrations/types";

const ISSUE_NAMESPACE = "issues";

/**
 * Sync integration issues and create embeddings
 */
export const syncIntegrationIssues = inngest.createFunction(
  { id: "sync-integration-issues" },
  { event: "integration.sync.requested" },
  async ({ event, step }) => {
    const { userId, provider } = event.data;

    console.log(
      `[Integration Sync] Starting sync for ${provider} user: ${userId}`
    );

    // Check if the integration exists
    const integrationExists = await step.run("check-integration", async () => {
      const integration = await prisma.integration.findUnique({
        where: {
          userId_provider: {
            userId,
            provider,
          },
        },
        select: { id: true },
      });
      return !!integration;
    });

    if (!integrationExists) {
      console.log(`[Integration Sync] Integration not found: ${provider}`);
      return { success: false, reason: "Integration not found" };
    }

    // Get user's API key for embeddings
    const user = await step.run("get-user", async () => {
      return prisma.user.findUnique({
        where: { id: userId },
        select: { encryptedApiKey: true },
      });
    });

    if (!user?.encryptedApiKey) {
      console.log(
        `[Integration Sync] User API key not configured for ${userId}`
      );
      return {
        success: false,
        reason: "User API key not configured",
      };
    }

    const decryptedApiKey = decrypt(user.encryptedApiKey);

    if (provider === "linear") {
      return await step.run("sync-linear", async () => {
        return syncLinearIssues(userId, provider, decryptedApiKey);
      });
    } else if (provider === "jira") {
      return await step.run("sync-jira", async () => {
        return syncJiraIssues(userId, provider, decryptedApiKey);
      });
    }

    return { success: false, reason: "Unknown provider" };
  }
);

/**
 * Sync issues from Linear
 */
async function syncLinearIssues(
  userId: string,
  provider: string,
  apiKey: string
) {
  try {
    const integration = await prisma.integration.findUnique({
      where: {
        userId_provider: {
          userId,
          provider,
        },
      },
    });

    if (!integration) {
      throw new Error("Integration not found");
    }

    const client = new LinearClient({
      provider: "linear",
      accessToken: decrypt(integration.accessToken),
    });

    console.log(
      `[Linear Sync] Fetching issues for workspace: ${integration.workspaceName}`
    );

    // Get all issues from Linear
    const response = await client.getIssues();
    const issues = response.issues;

    console.log(`[Linear Sync] Found ${issues.length} issues`);

    // Process each issue
    for (const issue of issues) {
      await processAndEmbedIssue(userId, issue, "linear", apiKey);
    }

    console.log(`[Linear Sync] Successfully synced ${issues.length} issues`);
    return { success: true, issuesCount: issues.length };
  } catch (error) {
    console.error("[Linear Sync] Error:", error);
    throw error;
  }
}

/**
 * Sync issues from Jira
 */
async function syncJiraIssues(
  userId: string,
  provider: string,
  apiKey: string
) {
  try {
    const integration = await prisma.integration.findUnique({
      where: {
        userId_provider: {
          userId,
          provider,
        },
      },
    });

    if (!integration) {
      throw new Error("Integration not found");
    }

    const metadata = integration.metadata as Record<string, unknown>;
    const client = new JiraClient({
      provider: "jira",
      accessToken: decrypt(integration.accessToken),
      metadata,
    });

    console.log(
      `[Jira Sync] Fetching issues for site: ${integration.workspaceName}`
    );

    // Get all issues from Jira
    const response = await client.getIssues();
    const issues = response.issues;

    console.log(`[Jira Sync] Found ${issues.length} issues`);

    // Process each issue
    for (const issue of issues) {
      await processAndEmbedIssue(userId, issue, "jira", apiKey);
    }

    console.log(`[Jira Sync] Successfully synced ${issues.length} issues`);
    return { success: true, issuesCount: issues.length };
  } catch (error) {
    console.error("[Jira Sync] Error:", error);
    throw error;
  }
}

/**
 * Process a single issue and create embeddings
 */
async function processAndEmbedIssue(
  userId: string,
  issue: NormalizedIssue,
  source: "linear" | "jira",
  apiKey: string
) {
  try {
    // Store or update the issue in the database
    const storedIssue = await prisma.issue.upsert({
      where: {
        source_externalId_userId: {
          externalId: issue.externalId,
          source,
          userId,
        },
      },
      create: {
        userId,
        externalId: issue.externalId,
        source,
        title: issue.title || "",
        description: issue.description || "",
        sourceUrl: issue.sourceUrl || "",
      },
      update: {
        title: issue.title || "",
        description: issue.description || "",
        sourceUrl: issue.sourceUrl || "",
      },
    });

    // Create embeddings for the issue
    const content = `${storedIssue.title}\n${storedIssue.description}`;

    if (content.trim().length > 0) {
      const embeddings = await generateEmbeddings(content, apiKey);

      if (embeddings && embeddings.length > 0) {
        // Store embeddings in Pinecone
        const vectors = [
          {
            id: `issue-${storedIssue.id}`,
            values: embeddings,
            metadata: {
              issueId: storedIssue.id,
              externalId: storedIssue.externalId,
              source,
              userId,
              title: storedIssue.title,
              url: storedIssue.sourceUrl || "",
            },
          },
        ];

        await pineconeIndex.namespace(ISSUE_NAMESPACE).upsert(vectors);

        // Mark as embedded in database
        await prisma.issue.update({
          where: { id: storedIssue.id },
          data: { embedded: true },
        });

        console.log(
          `[Issue Embed] Embedded issue: ${storedIssue.externalId} from ${source}`
        );
      }
    }
  } catch (error) {
    console.error(`[Issue Process] Error processing issue:`, error);
    // Continue with next issue instead of failing completely
  }
}
