"use server";

import { getPullRequestDiff } from "@/components/github/lib/gitHub";
import { inngest } from "@/inngest/client";
import prisma from "@/lib/db";

export async function reviewPullRequest(
  owner: string,
  repo: string,
  prNumber: number
) {
  try {
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
  }
}
