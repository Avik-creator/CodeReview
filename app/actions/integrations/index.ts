"use server";

import prisma from "@/lib/db";
import { encrypt, decrypt } from "@/lib/encryption";
import { LinearClient } from "@/lib/integrations/linear";
import { JiraClient } from "@/lib/integrations/jira";
import { inngest } from "@/inngest/client";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

interface ConnectLinearParams {
  apiKey: string; // Linear personal API key
}

interface ConnectJiraParams {
  email: string;
  apiToken: string;
  cloudUrl: string; // e.g., https://yoursite.atlassian.net
  projectKeys?: string[];
}

/**
 * Get the current user from session
 */
async function getCurrentUser() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    throw new Error("Not authenticated");
  }

  return session.user;
}

/**
 * Connect Linear integration using API key
 */
export async function connectLinear(params: ConnectLinearParams) {
  const { apiKey } = params;
  const user = await getCurrentUser();
  const userId = user.id;

  try {
    // Validate the API key by fetching workspace info
    const client = new LinearClient({
      provider: "linear",
      accessToken: apiKey,
    });

    const workspace = await client.getWorkspace();

    // Store the integration
    const integration = await prisma.integration.upsert({
      where: {
        userId_provider: {
          userId,
          provider: "linear",
        },
      },
      create: {
        userId,
        provider: "linear",
        accessToken: encrypt(apiKey),
        workspaceId: workspace.id,
        workspaceName: workspace.name,
      },
      update: {
        accessToken: encrypt(apiKey),
        workspaceId: workspace.id,
        workspaceName: workspace.name,
        updatedAt: new Date(),
      },
    });

    // Trigger initial sync
    await inngest.send({
      name: "integration.sync.requested",
      data: {
        userId,
        provider: "linear",
      },
    });

    return {
      success: true,
      integration: {
        id: integration.id,
        provider: "linear",
        workspaceName: workspace.name,
      },
    };
  } catch (error) {
    console.error("[Linear Connect] Error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to connect Linear",
    };
  }
}

/**
 * Connect Jira integration using API token
 */
export async function connectJira(params: ConnectJiraParams) {
  const { email, apiToken, cloudUrl, projectKeys } = params;
  const user = await getCurrentUser();
  const userId = user.id;

  try {
    // Validate cloudUrl format
    if (!cloudUrl || !cloudUrl.includes("atlassian.net")) {
      throw new Error(
        "Invalid Jira cloud URL. Expected format: https://yoursite.atlassian.net"
      );
    }

    // Validate by fetching projects
    const client = new JiraClient({
      provider: "jira",
      accessToken: apiToken,
      metadata: { email, cloudUrl },
    });

    console.log("[Jira Connect] Fetching projects from:", cloudUrl);
    let projects: Array<{ id: string; key: string; name: string }> = [];

    try {
      projects = await client.getProjects();
      console.log("[Jira Connect] Found projects:", projects);
    } catch (projectError) {
      console.error("[Jira Connect] Error fetching projects:", projectError);
      // Even if we can't fetch projects, continue to setup if we have projectKeys
      if (!projectKeys || projectKeys.length === 0) {
        throw projectError;
      }
      console.log(
        "[Jira Connect] Using provided projectKeys since fetch failed:",
        projectKeys
      );
    }

    // Extract cloud ID from URL
    const cloudId = cloudUrl
      .replace("https://", "")
      .replace(".atlassian.net", "");

    // Store the integration
    const integration = await prisma.integration.upsert({
      where: {
        userId_provider: {
          userId,
          provider: "jira",
        },
      },
      create: {
        userId,
        provider: "jira",
        accessToken: encrypt(apiToken),
        workspaceId: cloudId,
        workspaceName: cloudUrl,
        metadata: {
          email,
          cloudUrl,
          projectKeys:
            projectKeys ||
            (projects.length > 0 ? projects.map((p) => p.key) : []),
        },
      },
      update: {
        accessToken: encrypt(apiToken),
        workspaceId: cloudId,
        workspaceName: cloudUrl,
        metadata: {
          email,
          cloudUrl,
          projectKeys:
            projectKeys ||
            (projects.length > 0 ? projects.map((p) => p.key) : []),
        },
        updatedAt: new Date(),
      },
    });

    // Trigger initial sync
    await inngest.send({
      name: "integration.sync.requested",
      data: {
        userId,
        provider: "jira",
      },
    });

    return {
      success: true,
      integration: {
        id: integration.id,
        provider: "jira",
        workspaceName: cloudUrl,
        projects:
          projects.length > 0
            ? projects.map((p) => ({ key: p.key, name: p.name }))
            : projectKeys?.map((key) => ({ key, name: key })) || [],
      },
    };
  } catch (error) {
    console.error("[Jira Connect] Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to connect Jira",
    };
  }
}

/**
 * Get user's integrations
 */
export async function getIntegrations() {
  const user = await getCurrentUser();
  const userId = user.id;

  const integrations = await prisma.integration.findMany({
    where: { userId },
    select: {
      id: true,
      provider: true,
      workspaceId: true,
      workspaceName: true,
      metadata: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return integrations.map((i) => ({
    id: i.id,
    provider: i.provider,
    workspaceName: i.workspaceName,
    metadata: i.metadata,
    createdAt: i.createdAt,
    updatedAt: i.updatedAt,
  }));
}

/**
 * Disconnect an integration
 */
export async function disconnectIntegration(provider: "linear" | "jira") {
  const user = await getCurrentUser();
  const userId = user.id;

  try {
    // Delete integration
    await prisma.integration.deleteMany({
      where: {
        userId,
        provider,
      },
    });

    // Delete associated issues
    await prisma.issue.deleteMany({
      where: {
        userId,
        source: provider,
      },
    });

    return { success: true };
  } catch (error) {
    console.error(`[${provider} Disconnect] Error:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to disconnect",
    };
  }
}

/**
 * Trigger a manual sync for an integration
 */
export async function syncIntegration(provider: "linear" | "jira") {
  const user = await getCurrentUser();
  const userId = user.id;

  const integration = await prisma.integration.findUnique({
    where: {
      userId_provider: {
        userId,
        provider,
      },
    },
  });

  if (!integration) {
    return { success: false, error: "Integration not found" };
  }

  await inngest.send({
    name: "integration.sync.requested",
    data: {
      userId,
      provider,
    },
  });

  return { success: true, message: "Sync started" };
}

/**
 * Get Linear teams for project selection
 */
export async function getLinearTeams() {
  const user = await getCurrentUser();
  const userId = user.id;

  const integration = await prisma.integration.findUnique({
    where: {
      userId_provider: {
        userId,
        provider: "linear",
      },
    },
  });

  if (!integration) {
    return { success: false, error: "Linear not connected" };
  }

  const client = new LinearClient({
    provider: "linear",
    accessToken: decrypt(integration.accessToken),
  });

  const teams = await client.getTeams();

  return { success: true, teams };
}

/**
 * Get Jira projects for selection
 */
export async function getJiraProjects() {
  const user = await getCurrentUser();
  const userId = user.id;

  try {
    const integration = await prisma.integration.findUnique({
      where: {
        userId_provider: {
          userId,
          provider: "jira",
        },
      },
    });

    if (!integration) {
      return { success: false, error: "Jira not connected" };
    }

    const metadata = integration.metadata as Record<string, unknown>;
    const client = new JiraClient({
      provider: "jira",
      accessToken: decrypt(integration.accessToken),
      metadata,
    });

    const projects = await client.getProjects();

    return { success: true, projects };
  } catch (error) {
    console.error("[Get Jira Projects] Error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to fetch projects",
    };
  }
}

/**
 * Get issue counts by source for a user
 */
export async function getIssueStats() {
  const user = await getCurrentUser();
  const userId = user.id;

  const stats = await prisma.issue.groupBy({
    by: ["source"],
    where: { userId },
    _count: { id: true },
  });

  const embedded = await prisma.issue.count({
    where: { userId, embedded: true },
  });

  const total = await prisma.issue.count({
    where: { userId },
  });

  return {
    bySource: stats.reduce(
      (acc, s) => ({ ...acc, [s.source]: s._count.id }),
      {} as Record<string, number>
    ),
    embedded,
    total,
    pendingEmbedding: total - embedded,
  };
}
