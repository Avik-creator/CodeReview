import { serve } from "inngest/next";
import { inngest } from "../../../inngest/client";
import { indexRepo } from "@/inngest/functions";
import { generateReview } from "@/inngest/functions/review";
import { syncIntegrationIssues } from "@/inngest/functions/integrationSync";
import { handlePRMention } from "@/inngest/functions/prMention";
import { scheduledIntegrationSync } from "@/inngest/functions/scheduledSync";

// Create an API that serves zero functions
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    /* your functions will be passed here later! */
    indexRepo,
    generateReview,
    syncIntegrationIssues,
    handlePRMention,
    scheduledIntegrationSync,
  ],
});
