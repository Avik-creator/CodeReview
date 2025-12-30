import { inngest } from "@/inngest/client";
import {
  getPullRequestDiff,
  replyToComment,
  getPRComments,
} from "@/components/github/lib/gitHub";
import { retrieveContext } from "@/components/ai/lib/rag";
import {
  retrieveIssueContext,
  buildIssueContextPrompt,
} from "@/components/ai/lib/issueContext";
import { generateText } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";

/**
 * Handle @codereviewerai mention in GitHub PR comments
 * Responds with context-aware AI response directly on the PR
 */
export const handlePRMention = inngest.createFunction(
  {
    id: "handle-pr-mention",
    concurrency: 5,
  },
  { event: "pr.mention.requested" },
  async ({ event, step }) => {
    const { owner, repo, prNumber, userId, query, commentUser, token, apiKey } =
      event.data;

    // Fetch PR context
    const prContext = await step.run("fetch-pr-context", async () => {
      const { title, diff, description } = await getPullRequestDiff(
        token,
        owner,
        repo,
        prNumber
      );

      // Get recent comments for conversation context
      const comments = await getPRComments(token, owner, repo, prNumber);

      return { title, diff, description, comments };
    });

    // Retrieve relevant context
    const context = await step.run("retrieve-context", async () => {
      // Code context from repository
      const codeContext = await retrieveContext(
        query,
        `${owner}/${repo}`,
        apiKey,
        5
      );

      // Issue context from Linear/Jira
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

    // Generate AI response
    const response = await step.run("generate-response", async () => {
      const google = createGoogleGenerativeAI({ apiKey });

      // Build conversation context from recent comments
      const recentComments = prContext.comments
        .slice(-10)
        .map((c) => `@${c.user}: ${c.body}`)
        .join("\n\n");

      const prompt = `You are an AI assistant helping with a GitHub Pull Request. A user has mentioned you with a question or request.

## Pull Request Context
**Title**: ${prContext.title}
**Description**: ${prContext.description || "No description provided"}

## Code Changes (Diff)
\`\`\`diff
${prContext.diff.slice(0, 10000)}${
        prContext.diff.length > 10000 ? "\n... (diff truncated)" : ""
      }
\`\`\`

## Relevant Code from Repository
${
  context.code.length
    ? context.code.join("\n\n---\n\n")
    : "No additional code context found."
}

${context.issuePrompt}

## Recent PR Comments
${recentComments || "No previous comments."}

---

## User Question
@${commentUser} asked: ${query}

---

Please provide a helpful, concise response to the user's question. Consider:
1. The PR context and code changes
2. Any relevant issues from Linear or Jira
3. The codebase context
4. Keep your response focused and actionable
5. If referencing issues, include their IDs and source (Linear/Jira)
6. Use markdown formatting for code snippets if needed

Respond directly to the user's question:`;

      const { text } = await generateText({
        model: google("gemini-2.5-flash"),
        prompt,
      });

      return text;
    });

    // Post response as a comment on the PR
    await step.run("post-response", async () => {
      // Add citations if issues were used
      let finalResponse = response;

      if (context.issues.length > 0) {
        const citations = context.issues
          .slice(0, 3)
          .map(
            (ctx) =>
              `- [${ctx.issue.source.toUpperCase()}] ${ctx.issue.externalId}: ${
                ctx.issue.title
              }`
          )
          .join("\n");

        finalResponse += `\n\n<details>\n<summary>📋 Related Issues</summary>\n\n${citations}\n</details>`;
      }

      await replyToComment(
        token,
        owner,
        repo,
        prNumber,
        finalResponse,
        commentUser
      );
    });

    console.log(
      `[PR Mention] Responded to @codereviewerai mention in ${owner}/${repo}#${prNumber}`
    );

    return { success: true };
  }
);
