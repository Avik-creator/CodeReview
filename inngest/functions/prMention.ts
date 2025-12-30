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
import { reviewPullRequest } from "@/app/actions/ai";

// Keywords that trigger a full PR re-review
const REVIEW_KEYWORDS = [
  "review",
  "re-review",
  "rereview",
  "review again",
  "check again",
  "review changes",
  "review the changes",
  "review this",
  "analyze",
  "analyze again",
];

/**
 * Check if the query is requesting a full PR re-review
 */
function isReviewRequest(query: string): boolean {
  const lowerQuery = query.toLowerCase().trim();
  return REVIEW_KEYWORDS.some(
    (keyword) =>
      lowerQuery.includes(keyword) ||
      lowerQuery === keyword ||
      lowerQuery.startsWith(keyword)
  );
}

/**
 * Handle @codereviewerai or @codereviewer mention in GitHub PR comments
 * Responds with context-aware AI response directly on the PR
 * Supports re-review requests when user asks to "review" or "re-review" the changes
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

    // Check if this is a request for a full PR re-review
    const shouldReReview = isReviewRequest(query);

    if (shouldReReview) {
      // Trigger a full PR re-review
      await step.run("trigger-re-review", async () => {
        // Notify user that re-review is starting
        await replyToComment(
          token,
          owner,
          repo,
          prNumber,
          `🔄 Starting a fresh review of the latest changes in this PR. I'll post a comprehensive review shortly...`,
          commentUser
        );

        // Trigger the full review
        await reviewPullRequest(owner, repo, prNumber, { apiKey });
      });

      console.log(
        `[PR Mention] Re-review triggered for ${owner}/${repo}#${prNumber} by @${commentUser}`
      );

      return { success: true, action: "re-review" };
    }

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
      // Add citations if issues were used, now with links
      let finalResponse = response;

      if (context.issues.length > 0) {
        const citations = context.issues
          .slice(0, 3)
          .map((ctx) => {
            const source = ctx.issue.source.toUpperCase();
            const id = ctx.issue.externalId;
            const title = ctx.issue.title;
            const url = ctx.issue.sourceUrl;

            // If URL is available, make the ID a clickable link
            if (url) {
              return `- [${source}] [${id}](${url}): ${title}`;
            }
            return `- [${source}] ${id}: ${title}`;
          })
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

    return { success: true, action: "question-response" };
  }
);
