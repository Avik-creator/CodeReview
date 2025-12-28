"use server";

import prisma from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { createWebhook, getRepositories } from "@/components/github/lib/gitHub";
import { inngest } from "@/inngest/client";
import { prReviewRatelimit } from "@/lib/ratelimit";
import { revalidatePath } from "next/cache";

export const fetchRepositories = async (
  page: number = 1,
  perPage: number = 10
) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("UnAuthorized", {
      cause: new Error("No active session found"),
    });
  }

  const githubRepos = await getRepositories(page, perPage);
  const reposInDb = await prisma.repository.findMany({
    where: {
      userId: session.user.id,
    },
  });

  const connectedRepoIds = new Set(reposInDb.map((repo) => repo.githubId));

  const mergedRepos = githubRepos.map((repo) => ({
    ...repo,
    isConnected: connectedRepoIds.has(BigInt(repo.id)),
  }));

  return mergedRepos;
};

export const connectRepository = async (
  owner: string,
  repo: string,
  githubId: number
) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("UnAuthorized", {
      cause: new Error("No active session found"),
    });
  }

  const webHook = await createWebhook(owner, repo);

  if (!webHook) {
    throw new Error("Failed to create webhook for the repository.", {
      cause: new Error("Webhook creation failed"),
    });
  }

  // Check if the repository is already connected
  const existingRepo = await prisma.repository.findFirst({
    where: {
      githubId: BigInt(githubId),
      userId: session.user.id,
    },
  });

  if (existingRepo) {
    throw new Error("Repository is already connected.");
  }
  // Connect the repository
  await prisma.repository.create({
    data: {
      githubId: BigInt(githubId),
      owner,
      name: repo,
      userId: session.user.id,
      fullName: `${owner}/${repo}`,
      url: `https://github.com/${owner}/${repo}`,
    },
  });

  try {
    await inngest.send({
      name: "repository.connected",
      data: {
        owner,
        repo,
        userId: session.user.id,
      },
    });
  } catch (error) {
    console.error("Failed to Trigger Repository Indexing:", error);
  }

  // Revalidate paths to ensure other pages are updated
  revalidatePath("/dashboard/repository", "page");
  revalidatePath("/dashboard/settings", "page");
  revalidatePath("/dashboard", "page");

  return webHook;
};
