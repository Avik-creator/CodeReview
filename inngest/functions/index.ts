import prisma from "@/lib/db";
import { inngest } from "../client";
import { getRepoFileContents } from "@/components/github/lib/gitHub";

export const indexRepo = inngest.createFunction(
  { id: "index-repo" },
  { event: "repository.connected" },
  async ({ event, step }) => {
    const { owner, repo, userId } = event.data;
    const files = await step.run("fetch-files", async () => {
      const account = await prisma.account.findFirst({
        where: {
          userId: userId,
          providerId: "github",
        },
      });
      if (!account?.accessToken) {
        throw new Error("GitHub access token not found for the user.", {
          cause: new Error("Unauthorized"),
        });
      }

      return await getRepoFileContents(owner, repo, account.accessToken);
    });

    await step.run("index-codebase", async () => {
      // Logic to index the codebase using Pinecone
    });
  }
);
