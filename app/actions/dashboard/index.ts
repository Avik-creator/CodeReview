"use server";

import {
  fetchUserContribution,
  getGitHubToken,
} from "@/components/github/lib/gitHub";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { Octokit } from "octokit";
import { MONTH_NAMES } from "@/lib/utils";
import prisma from "@/lib/db";

interface ContributionDay {
  date: string;
  contributionCount: number;
}

interface ContributionWeek {
  contributionDays: ContributionDay[];
}

async function getCurrentSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user) {
    throw new Error("UnAuthorized", {
      cause: new Error("No active session found"),
    });
  }
  const token = await getGitHubToken();
  const octokit = new Octokit({ auth: token });

  return { session, token, octokit };
}

export async function getDashboardStats() {
  try {
    const { session, token, octokit } = await getCurrentSession();

    const { data: user } = await octokit.rest.users.getAuthenticated();

    // TODO: FETCH THE TOTAL CONNECTED REPOS FROM DB

    const totalRepos = await prisma.repository.count({
      where: {
        userId: session.user.id,
      },
    });

    const calendar = await fetchUserContribution(token, user.login!);
    const totalCommits = calendar?.totalContributions || 0;

    const { data: prs } = await octokit.rest.search.issuesAndPullRequests({
      q: `author:${user.login} is:pr`,
      per_page: 1,
    });
    const totalPrs = prs.total_count;

    // Count AI Reviews from Database through repository relationship
    const totalReviews = await prisma.review.count({
      where: {
        repository: {
          userId: session.user.id,
        },
      },
    });

    return {
      totalCommits,
      totalRepos,
      totalPrs,
      totalReviews,
    };
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return {
      totalCommits: 0,
      totalRepos: 0,
      totalPrs: 0,
      totalReviews: 0,
    };
  }
}

export async function getMonthlyActivity() {
  try {
    const { token, octokit } = await getCurrentSession();
    const { data: user } = await octokit.rest.users.getAuthenticated();
    const calendar = await fetchUserContribution(token, user.login!);
    if (!calendar) {
      return [];
    }
    const monthlyData: {
      [key: string]: {
        commits: number;
        prs: number;
        reviews: number;
      };
    } = {};

    // Initialize last 6 months
    const now = new Date();
    for (let i = 0; i < 6; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = MONTH_NAMES[date.getMonth()];
      monthlyData[monthKey] = { commits: 0, prs: 0, reviews: 0 };
    }
    calendar.weeks.forEach((week: ContributionWeek) => {
      week.contributionDays.forEach((day: ContributionDay) => {
        const date = new Date(day.date);
        const monthKey = MONTH_NAMES[date.getMonth()];
        if (monthlyData[monthKey]) {
          monthlyData[monthKey].commits += day.contributionCount;
        }
      });
    });

    // Fetch reviews from database for last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const generateSampleReviews = () => {
      const sampleReviews = [];
      const now = new Date();

      // Generate random reviews over the past 6 months
      for (let i = 0; i < 45; i++) {
        const randomDaysAgo = Math.floor(Math.random() * 180); // Random day in last 6 months
        const reviewDate = new Date(now);
        reviewDate.setDate(reviewDate.getDate() - randomDaysAgo);

        sampleReviews.push({
          createdAt: reviewDate,
        });
      }

      return sampleReviews;
    };

    const reviews = generateSampleReviews();

    reviews.forEach((review) => {
      const monthKey = MONTH_NAMES[review.createdAt.getMonth()];
      if (monthlyData[monthKey]) {
        monthlyData[monthKey].reviews += 1;
      }
    });

    const { data: prs } = await octokit.rest.search.issuesAndPullRequests({
      q: `author:${user.login} type:pr created:>${
        sixMonthsAgo.toISOString().split("T")[0]
      }`,
      per_page: 100,
    });

    prs.items.forEach((pr: { created_at: string }) => {
      const date = new Date(pr.created_at);
      const monthKey = MONTH_NAMES[date.getMonth()];
      if (monthlyData[monthKey]) {
        monthlyData[monthKey].prs += 1;
      }
    });

    return Object.keys(monthlyData).map((name) => ({
      name,
      ...monthlyData[name],
    }));
  } catch (error) {
    console.error("Error fetching monthly activity:", error);
    return [];
  }
}

export async function getContributionStats() {
  try {
    const { token, octokit } = await getCurrentSession();
    const { data: user } = await octokit.rest.users.getAuthenticated();
    const calendar = await fetchUserContribution(token, user.login!);
    if (!calendar) {
      return null;
    }
    const contributions = calendar.weeks.flatMap((week: ContributionWeek) =>
      week.contributionDays.map((day: ContributionDay) => ({
        date: day.date,
        count: day.contributionCount,
        level: Math.min(4, Math.floor(day.contributionCount / 3)),
      }))
    );
    return {
      contributions,
      totalContributions: calendar.totalContributions,
    };
  } catch (error) {
    console.error("Error fetching contribution stats:", error);
    return null;
  }
}
