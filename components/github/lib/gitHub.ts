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

export const createWebhook = async (owner: string, repo: string) => {
  const token = await getGitHubToken();
  const octokit = new Octokit({ auth: token });
  const webHookURL = `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/github`;

  const { data: hooks } = await octokit.rest.repos.listWebhooks({
    owner,
    repo,
  });

  const existingHook = hooks.find((hook) => hook.config.url === webHookURL);

  if (existingHook) {
    return existingHook;
  }

  const response = await octokit.rest.repos.createWebhook({
    owner,
    repo,
    config: {
      url: webHookURL,
      content_type: "json",
    },
    events: ["pull_request"],
  });

  return response.data;
};

export const deleteWebhook = async (owner: string, repo: string) => {
  const token = await getGitHubToken();
  const octokit = new Octokit({ auth: token });
  const webhookURL = `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/github`;

  try {
    const { data: hooks } = await octokit.rest.repos.listWebhooks({
      owner,
      repo,
    });

    const existingHook = hooks.find((hook) => hook.config.url === webhookURL);

    if (existingHook) {
      await octokit.rest.repos.deleteWebhook({
        owner,
        repo,
        hook_id: existingHook.id,
      });
    }
    return {
      success: true,
      message: "Webhook deleted successfully",
    };
  } catch {
    return {
      success: false,
      error: "Failed to delete webhook",
    };
  }
};

export const getRepoFileContents = async (
  owner: string,
  repo: string,
  token: string,
  path: string = ""
): Promise<{ path: string; content: string }[]> => {
  const octokit = new Octokit({ auth: token });
  const { data } = await octokit.rest.repos.getContent({
    owner,
    repo,
    path,
  });

  if (!Array.isArray(data)) {
    if (data.type === "file" && data.content) {
      return [
        {
          path: data.path,
          content: Buffer.from(data.content, "base64").toString("utf-8"),
        },
      ];
    }
    return [];
  }

  let files: { path: string; content: string }[] = [];

  // Handling the case of directories
  for (const item of data) {
    if (item.type === "file") {
      const { data: fileData } = await octokit.rest.repos.getContent({
        owner,
        repo,
        path: item.path,
      });

      if (
        !Array.isArray(fileData) &&
        fileData.type === "file" &&
        fileData.content
      ) {
        if (
          !item.path.match(
            /\.(png|jpg|jpeg|gif|svg|pdf|zip|exe|dll|class|jar|war|ear)$/i
          )
        ) {
          files.push({
            path: item.path,
            content: Buffer.from(fileData.content, "base64").toString("utf-8"),
          });
        }
      }
    } else if (item.type === "dir") {
      const subFiles = await getRepoFileContents(owner, repo, token, item.path);
      files = files.concat(subFiles);
    }
  }
  return files;
};

export const getPullRequestDiff = async (
  token: string,
  owner: string,
  repo: string,
  prNumber: number
): Promise<{ title: string; diff: string; description: string }> => {
  const octokit = new Octokit({ auth: token });

  const { data: pr } = await octokit.rest.pulls.get({
    owner,
    repo,
    pull_number: prNumber,
  });

  const { data: diffData } = await octokit.rest.pulls.get({
    owner,
    repo,
    pull_number: prNumber,
    mediaType: {
      format: "diff",
    },
  });

  return {
    title: pr.title,
    diff: diffData as unknown as string,
    description: pr.body || "",
  };
};
