import { inngest } from "@/inngest/client";

/**
 * Scheduled sync of all active integrations
 * Runs every 6 hours to sync issues from Linear and Jira
 */
export const scheduledIntegrationSync = inngest.createFunction(
  {
    id: "scheduled-integration-sync",
  },
  { cron: "0 */6 * * *" }, // Every 6 hours
  async ({ step }) => {
    // Fetch all users with integrations
    const usersWithIntegrations = await step.run(
      "fetch-users-with-integrations",
      async () => {
        const prisma = (await import("@/lib/db")).default;

        const integrations = await prisma.integration.findMany({
          select: {
            userId: true,
            provider: true,
          },
        });

        return integrations;
      }
    );

    // Group by user
    const userProviders = new Map<string, Set<string>>();
    for (const { userId, provider } of usersWithIntegrations) {
      if (!userProviders.has(userId)) {
        userProviders.set(userId, new Set());
      }
      userProviders.get(userId)?.add(provider);
    }

    // Trigger sync for each user's integrations
    for (const [userId, providers] of userProviders) {
      for (const provider of providers) {
        await step.sendEvent(`sync-${userId}-${provider}`, {
          name: "integration.sync.requested",
          data: {
            userId,
            provider,
          },
        });
      }
    }

    console.log(
      `[Scheduled Sync] Triggered sync for ${usersWithIntegrations.length} integrations`
    );

    return {
      success: true,
      syncedIntegrations: usersWithIntegrations.length,
    };
  }
);
