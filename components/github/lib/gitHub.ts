import { Octokit } from "octokit";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { headers } from "next/headers";

// Getting the Github Access Token
export const getGitHubToken = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("UnAuthorized");
  }
  const account = await prisma.account.findFirst({
    where: {
      userId: session.user.id,
      providerId: "github",
    },
  });

  if (!account?.accessToken) {
    throw new Error("GitHub account not linked");
  }

  return account.accessToken;
};

export async function fetchUserContribution(token: string, username: string) {
  const octokit = new Octokit({ auth: token });
  const query = `
    query ($username: String!) {
      user(login: $username) {
        contributionsCollection {
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                date
                contributionCount
                color
              }
            }
          }
        }
      }
    }
  `;

  interface contributionData {
    user: {
      contributionsCollection: {
        contributionCalendar: {
          totalContributions: number;
          weeks: {
            contributionDays: {
              date: string;
              contributionCount: number;
              color: string;
            }[];
          }[];
        };
      };
    };
  }

  try {
    const response: contributionData = await octokit.graphql(query, {
      username,
    });
    return response.user.contributionsCollection.contributionCalendar;
  } catch (error) {
    throw new Error("Failed to fetch contribution data", {
      cause: error,
    });
  }
}

export const getRepositories = async (
  page: number = 1,
  perPage: number = 10
) => {
  try {
    const token = await getGitHubToken();
    const octokit = new Octokit({ auth: token });

    const response = await octokit.rest.repos.listForAuthenticatedUser({
      sort: "updated",
      direction: "desc",
      visibility: "all",
      per_page: perPage,
      page: page,
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching repositories:", error);
    return [];
  }
};
