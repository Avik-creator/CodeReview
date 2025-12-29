import { reviewPullRequest } from "@/app/actions/ai";
import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/db";
import { decrypt } from "@/lib/encryption";

export async function POST(requst: NextRequest) {
  try {
    const payload = await requst.json();
    const event = requst.headers.get("X-gitHub-event");
    if (event === "ping") {
      return NextResponse.json({ msg: "pong" });
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
    return NextResponse.json(
      { error: `Failed to process webhook: ${error}` },
      { status: 500 }
    );
  }
}
