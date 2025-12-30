import { inngest } from "@/inngest/client";
import {
  getPullRequestDiff,
  postReviewComment,
} from "@/components/github/lib/gitHub";
import { retrieveContext } from "@/components/ai/lib/rag";
import {
  retrieveIssueContext,
  buildIssueContextPrompt,
} from "@/components/ai/lib/issueContext";
import prisma from "@/lib/db";
import { generateText } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";

export const generateReview = inngest.createFunction(
  {
    id: "generate-review",
    concurrency: 5,
  },
  { event: "pr.review.requested" },

  async ({ event, step }) => {
    const { owner, repo, prNumber, userId, title } = event.data;
    const {
      diff,
      title: PrTitle,
      description,
      token,
    } = await step.run("fetch-pr-data", async () => {
      const account = await prisma.account.findFirst({
        where: {
          userId,
          providerId: "github",
        },
      });

      if (!account?.accessToken) {
        throw new Error(`GitHub access token not found for user ${userId}`);
      }

      const data = await getPullRequestDiff(
        account.accessToken,
        owner,
        repo,
        prNumber
      );

      return { ...data, token: account.accessToken };
    });

    const context = await step.run("retrieve-context", async () => {
      const { apiKey } = event.data as { apiKey?: string };
      if (!apiKey) {
        throw new Error(
          "Google Generative AI API key is required in event data"
        );
      }
      const query = `${PrTitle}\n${description}`;

      // Retrieve code context
      const codeContext = await retrieveContext(
        query,
        `${owner}/${repo}`,
        apiKey
      );

      // Retrieve issue context from Linear/Jira
      const issueContext = await retrieveIssueContext(
        {
          query,
          userId,
          topK: 5,
        },
        apiKey
      );

      return {
        code: codeContext,
        issues: issueContext,
        issuePrompt: buildIssueContextPrompt(issueContext),
      };
    });
    const review = await step.run("generate-ai-review", async () => {
      const { apiKey, goodRules, badRules } = event.data as {
        apiKey?: string;
        goodRules?: string[];
        badRules?: string[];
      };

      if (!apiKey) {
        throw new Error(
          "Google Generative AI API key is required in event data"
        );
      }

      let rulesPrompt = "";
      if (goodRules?.length || badRules?.length) {
        rulesPrompt += "\n\n**Custom Review Rules:**\n";
        if (goodRules?.length) {
          rulesPrompt +=
            "Please follow these GOOD practices:\n" +
            goodRules.map((r: string) => `- ${r}`).join("\n") +
            "\n";
        }
        if (badRules?.length) {
          rulesPrompt +=
            "Please avoid these BAD practices:\n" +
            badRules.map((r: string) => `- ${r}`).join("\n") +
            "\n";
        }
        rulesPrompt += "\nJudge the code based on these rules.";
      }

      const prompt = `You are an expert code reviewer. Analyze the following pull request and provide a detailed, constructive code review.

PR Title: ${title}
PR Description: ${description || "No description provided"}

Context from Codebase:
${context.code.join("\n\n")}

${context.issuePrompt}

Code Changes:
\`\`\`diff
${diff}
\`\`\`
${rulesPrompt}

Please provide:
1. **Walkthrough**: A file-by-file explanation of the changes.
2. **Related Issues**: If any issues from Linear/Jira are relevant, mention them with their IDs.
3. **Sequence Diagram**: A Mermaid JS sequence diagram visualizing the flow of the changes (if applicable). Use \`\`\`mermaid ... \`\`\` block. **IMPORTANT**: Ensure the Mermaid syntax is valid. Do not use special characters (like quotes, braces, parentheses) inside Note text or labels as it breaks rendering. Keep the diagram simple.
4. **Summary**: Brief overview.
5. **Strengths**: What's done well.
6. **Issues**: Bugs, security concerns, code smells.
7. **Suggestions**: Specific code improvements.
7. **Roast**: Dark Humored Code Feedback.

Format your response in markdown.`;

      const google = createGoogleGenerativeAI({
        apiKey: apiKey,
      });
      const model = google("gemini-2.5-flash");

      const { text } = await generateText({
        model,
        prompt,
      });

      return text;
    });

    await step.run("post-comment", async () => {
      await postReviewComment(token, owner, repo, prNumber, review);
    });

    await step.run("save-review", async () => {
      const repository = await prisma.repository.findFirst({
        where: {
          owner,
          name: repo,
        },
      });

      if (repository) {
        await prisma.review.create({
          data: {
            repositoryId: repository.id,
            prNumber,
            prTitle: title,
            prUrl: `https://github.com/${owner}/${repo}/pull/${prNumber}`,
            review,
            status: "completed",
          },
        });
      }
    });
    return { success: true };
  }
);
