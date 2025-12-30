import { reviewPullRequest } from "@/app/actions/ai";
import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/db";
import { decrypt } from "@/lib/encryption";
import { inngest } from "@/inngest/client";

export async function POST(requst: NextRequest) {
  try {
    const payload = await requst.json();
    const event =
      requst.headers.get("x-github-event") ||
      requst.headers.get("X-GitHub-Event");
    console.log(`[GitHub Webhook] Event received: ${event}`);
    if (event === "ping") {
      return NextResponse.json({ msg: "pong" });
    }

    // Handle @mentions in PR comments
    if (event === "issue_comment") {
      const action = payload.action;
      const comment = payload.comment;
      const issue = payload.issue;

      // Only handle new comments on PRs (issues with pull_request field)
      if (action === "created" && issue?.pull_request && comment?.body) {
        const commentBody = comment.body as string;

        // Check for @codereviewer or @codereviewerai mention (case-insensitive)
        const mentionPattern =
          /(^|\s)@(codereviewer(ai)?|codereviewerai)(\s|$|[.,!?:])/i;
        const mentionMatch = commentBody.match(mentionPattern);

        if (mentionMatch) {
          const repo = payload.repository.full_name;
          const prNumber = issue.number;
          const [owner, repoName] = repo.split("/");
          const commentUser = comment.user?.login;
          const commentId = comment.id;

          // Get repository and user info
          const repository = await prisma.repository.findFirst({
            where: {
              owner,
              name: repoName,
            },
            include: {
              user: {
                include: {
                  accounts: {
                    where: { providerId: "github" },
                    select: { accessToken: true },
                  },
                },
              },
            },
          });

          if (
            repository?.user?.encryptedApiKey &&
            repository.user.accounts[0]?.accessToken
          ) {
            const apiKey = decrypt(repository.user.encryptedApiKey);
            const token = repository.user.accounts[0].accessToken;

            // Extract the query after the @codereviewer mention (case-insensitive)
            const queryPattern =
              /@(codereviewer(ai)?|codereviewerai)\s+([\s\S]*)/i;
            const queryMatch = commentBody.match(queryPattern);
            const query = queryMatch?.[3]?.trim() || commentBody;

            // Trigger AI response via Inngest
            await inngest.send({
              name: "pr.mention.requested",
              data: {
                owner,
                repo: repoName,
                prNumber,
                userId: repository.user.id,
                query,
                commentUser,
                commentId,
                token,
                apiKey,
              },
            });

            console.log(
              `[Webhook] @mention detected in PR #${prNumber} by ${commentUser}`
            );
          }
        }
      }

      return NextResponse.json({ msg: "Comment event processed" });
    }

    if (event === "pull_request") {
      const action = payload.action;
      const repo = payload.repository.full_name;
      const prNumber = payload.number;

      const [owner, repoName] = repo.split("/");

      if (action === "opened" || action === "synchronize") {
        // Get the user's encrypted API key from the database
        const repository = await prisma.repository.findFirst({
          where: {
            owner,
            name: repoName,
          },
          include: {
            user: {
              select: {
                encryptedApiKey: true,
              },
            },
          },
        });

        console.log(`[Webhook] Repository found: ${!!repository}`);
        console.log(
          `[Webhook] User encryptedApiKey exists: ${!!repository?.user
            ?.encryptedApiKey}`
        );

        if (repository?.user?.encryptedApiKey) {
          try {
            const apiKey = decrypt(repository.user.encryptedApiKey);
            console.log(
              `[Webhook] API key decrypted successfully, length: ${
                apiKey?.length || 0
              }`
            );

            if (!apiKey) {
              console.error("[Webhook] Decrypted API key is empty!");
              return NextResponse.json({
                msg: "API key decryption resulted in empty value",
              });
            }

            reviewPullRequest(owner, repoName, prNumber, { apiKey })
              .then(() =>
                console.log(
                  "[Webhook] Pull request review triggered successfully"
                )
              )
              .catch((e) =>
                console.error(
                  "[Webhook] Failed to trigger pull request review",
                  e
                )
              );
          } catch (decryptError) {
            console.error("[Webhook] Failed to decrypt API key:", decryptError);
          }
        } else {
          console.warn(
            `[Webhook] No API key configured for repository ${owner}/${repoName}. Please save your API key in settings.`
          );
        }
      }
    }

    // Handle other GitHub webhook events here

    return NextResponse.json({ msg: "Event received" });
  } catch (error) {
    console.error("[GitHub Webhook] Error processing webhook:", error);
    return NextResponse.json(
      {
        error: `Failed to process webhook: ${
          error instanceof Error ? error.message : String(error)
        }`,
      },
      { status: 500 }
    );
  }
}
