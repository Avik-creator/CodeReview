"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";

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
