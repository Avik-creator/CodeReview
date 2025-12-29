"use server";

import { getPullRequestDiff } from "@/components/github/lib/gitHub";
import { inngest } from "@/inngest/client";
import prisma from "@/lib/db";
import { prReviewRatelimit } from "@/lib/ratelimit";
import { headers } from "next/headers";

async function getClientIp(): Promise<string> {
  const headersList = await headers();
  // Try to get IP from various headers that proxies might set
  const ip =
    headersList.get("x-forwarded-for")?.split(",")[0].trim() ||
    headersList.get("x-real-ip") ||
    headersList.get("cf-connecting-ip") ||
    "unknown";
  return ip;
}

export async function reviewPullRequest(
  owner: string,
  repo: string,
  prNumber: number,
  settings?: {
    apiKey?: string;
    goodRules?: string[];
    badRules?: string[];
  }
) {
  try {
    // Rate limit by client IP address
    const ip = await getClientIp();
    const { success, limit, remaining, reset } = await prReviewRatelimit.limit(
      ip
    );

    if (!success) {
      const resetTime = new Date(reset);
      throw new Error(
        `Rate limit exceeded. Maximum 5 requests per minute. Resets at ${resetTime.toISOString()}. Remaining: ${remaining}`
      );
    }

    const repository = await prisma.repository.findFirst({
      where: {
        owner,
        name: repo,
      },
      include: {
        user: {
          include: {
            accounts: {
              where: {
                providerId: "github",
              },
            },
          },
        },
      },
    });

    if (!repository) {
      throw new Error(
        `Repository ${owner}/${repo} not found in the database. Please connect it first.`
      );
    }

    const githubAccount = repository.user.accounts[0];
    if (!githubAccount?.accessToken) {
      throw new Error(
        `GitHub account for user ${repository.user.id} not found.`
      );
    }

    const token = githubAccount.accessToken;

    const { title } = await getPullRequestDiff(token, owner, repo, prNumber);

    await inngest.send({
      name: "pr.review.requested",
      data: {
        owner,
        repo,
        prNumber,
        userId: repository.user.id,
        title,
        apiKey: settings?.apiKey,
        goodRules: settings?.goodRules || repository.user.goodRules,
        badRules: settings?.badRules || repository.user.badRules,
      },
    });

    return {
      success: true,
      message: `Pull request review for ${owner}/${repo}#${prNumber} has been queued.`,
    };
  } catch (error) {
    try {
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
            prTitle: "Failed to Fetch PR",
            prUrl: `https://github.com/${owner}/${repo}/pull/${prNumber}`,
            status: "failed",
            review: `Error ${
              error instanceof Error ? error.message : "unknown"
            }`,
          },
        });
      }
    } catch (dbError) {
      console.error("Failed to log PR review failure:", dbError);
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
