import prisma from "@/lib/db";
import { inngest } from "../client";
import { getRepoFileContents } from "@/components/github/lib/gitHub";
import { indexCodebase } from "@/components/ai/lib/rag";
import { decrypt } from "@/lib/encryption";

export const indexRepo = inngest.createFunction(
  { id: "index-repo" },
  { event: "repository.connected" },
  async ({ event, step }) => {
    const { owner, repo, userId } = event.data;
    const { files, apiKey } = await step.run("fetch-files", async () => {
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

      // Get user's encrypted API key
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { encryptedApiKey: true },
      });

      if (!user?.encryptedApiKey) {
        throw new Error(
          "Google Generative AI API key not configured. Please save your API key in settings."
        );
      }

      const decryptedApiKey = decrypt(user.encryptedApiKey);

      const repoFiles = await getRepoFileContents(
        owner,
        repo,
        account.accessToken
      );
      return { files: repoFiles, apiKey: decryptedApiKey };
    });

    await step.run("index-codebase", async () => {
      // Logic to index the codebase using Pinecone
      await indexCodebase(`${owner}/${repo}`, files, apiKey);
    });

    return { success: true, indexedFiles: files.length };
  }
);
