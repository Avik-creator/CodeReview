"use server";

import prisma from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getRepositories } from "@/components/github/lib/gitHub";

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
