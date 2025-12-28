"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";
import { deleteWebhook } from "@/components/github/lib/gitHub";

export async function getUserProfile() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user) {
      throw new Error("No active session found", { cause: "Unauthorized" });
    }
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!user) {
      throw new Error("User not found", { cause: "Not Found" });
    }
    return user;
  } catch (error) {
    throw new Error("Failed to fetch user profile", {
      cause: error,
    });
  }
}

export async function updateUserProfile(data: {
  name?: string;
  email?: string;
}) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user) {
      throw new Error("No active session found", { cause: "Unauthorized" });
    }
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: data.name,
        email: data.email,
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });
    revalidatePath("/dashboard/settings", "page");

    return {
      success: true,
      user: updatedUser,
    };
  } catch {
    return {
      success: false,
      error: "Failed to update user profile",
    };
  }
}

export async function getConnectedRepositories() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user) {
      throw new Error("No active session found", { cause: "Unauthorized" });
    }
    const repositories = await prisma.repository.findMany({
      where: { userId: session.user.id },
      select: {
        id: true,
        name: true,
        url: true,
        fullName: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return repositories;
  } catch {
    throw new Error("Failed to fetch connected repositories", {
      cause: "Database Error",
    });
  }
}

export async function disconnectRepository(repoId: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user) {
      throw new Error("No active session found", { cause: "Unauthorized" });
    }
    const repository = await prisma.repository.findUnique({
      where: { id: repoId, userId: session.user.id },
    });
    if (!repository) {
      return {
        success: false,
        error: "Repository not found",
      };
    }
    await deleteWebhook(repository.owner, repository.name);
    await prisma.repository.delete({
      where: { id: repoId, userId: session.user.id },
    });
    revalidatePath("/dashboard/settings", "page");
    revalidatePath("/dashboard/repository", "page");

    return {
      success: true,
    };
  } catch {
    return {
      success: false,
      error: "Failed to disconnect repository",
    };
  }
}

export async function disconnectAllRepositories() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user) {
      throw new Error("No active session found", { cause: "Unauthorized" });
    }
    const repositories = await prisma.repository.findMany({
      where: { userId: session.user.id },
    });
    await Promise.all(
      repositories.map(async (repo) => {
        await deleteWebhook(repo.owner, repo.name);
      })
    );
    await prisma.repository.deleteMany({
      where: { userId: session.user.id },
    });
    revalidatePath("/dashboard/settings", "page");
    revalidatePath("/dashboard/repository", "page");

    return {
      success: true,
    };
  } catch {
    return {
      success: false,
      error: "Failed to disconnect all repositories",
    };
  }
}
