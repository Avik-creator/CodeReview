import { NormalizedIssue, IntegrationConfig } from "./types";
import crypto from "crypto";

const LINEAR_API_URL = "https://api.linear.app/graphql";

interface LinearIssue {
  id: string;
  identifier: string;
  title: string;
  description?: string;
  url: string;
  state: { name: string };
  priority: number;
  assignee?: { name: string; email: string };
  labels: { nodes: Array<{ name: string }> };
  team: { key: string; name: string };
  createdAt: string;
  updatedAt: string;
}

interface LinearWebhookPayload {
  action: "create" | "update" | "remove";
  type: "Issue" | "Comment";
  data: LinearIssue;
  createdAt: string;
}

const PRIORITY_MAP: Record<number, string> = {
  0: "none",
  1: "urgent",
  2: "high",
  3: "medium",
  4: "low",
};

export class LinearClient {
  private accessToken: string;

  constructor(config: IntegrationConfig) {
    this.accessToken = config.accessToken;
  }

  private async graphql<T>(
    query: string,
    variables?: Record<string, unknown>
  ): Promise<T> {
    const response = await fetch(LINEAR_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: this.accessToken,
      },
      body: JSON.stringify({ query, variables }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Linear API error: ${response.status} - ${error}`);
    }

    const json = await response.json();
    if (json.errors) {
      throw new Error(`Linear GraphQL error: ${JSON.stringify(json.errors)}`);
    }

    return json.data as T;
  }

  async getWorkspace(): Promise<{ id: string; name: string }> {
    const query = `
      query {
        organization {
          id
          name
        }
      }
    `;

    const data = await this.graphql<{
      organization: { id: string; name: string };
    }>(query);
    return data.organization;
  }

  async getIssues(options?: {
    teamKeys?: string[];
    after?: string;
    first?: number;
  }): Promise<{
    issues: NormalizedIssue[];
    hasNextPage: boolean;
    endCursor?: string;
  }> {
    const query = `
      query GetIssues($first: Int, $after: String, $filter: IssueFilter) {
        issues(first: $first, after: $after, filter: $filter) {
          pageInfo {
            hasNextPage
            endCursor
          }
          nodes {
            id
            identifier
            title
            description
            url
            state { name }
            priority
            assignee { name email }
            labels { nodes { name } }
            team { key name }
            createdAt
            updatedAt
          }
        }
      }
    `;

    const filter = options?.teamKeys?.length
      ? { team: { key: { in: options.teamKeys } } }
      : undefined;

    const data = await this.graphql<{
      issues: {
        pageInfo: { hasNextPage: boolean; endCursor?: string };
        nodes: LinearIssue[];
      };
    }>(query, {
      first: options?.first ?? 50,
      after: options?.after,
      filter,
    });

    return {
      issues: data.issues.nodes.map(this.normalizeIssue),
      hasNextPage: data.issues.pageInfo.hasNextPage,
      endCursor: data.issues.pageInfo.endCursor,
    };
  }

  async getIssue(issueId: string): Promise<NormalizedIssue> {
    const query = `
      query GetIssue($id: String!) {
        issue(id: $id) {
          id
          identifier
          title
          description
          url
          state { name }
          priority
          assignee { name email }
          labels { nodes { name } }
          team { key name }
          createdAt
          updatedAt
        }
      }
    `;

    const data = await this.graphql<{ issue: LinearIssue }>(query, {
      id: issueId,
    });
    return this.normalizeIssue(data.issue);
  }

  async getTeams(): Promise<Array<{ id: string; key: string; name: string }>> {
    const query = `
      query {
        teams {
          nodes {
            id
            key
            name
          }
        }
      }
    `;

    const data = await this.graphql<{
      teams: { nodes: Array<{ id: string; key: string; name: string }> };
    }>(query);
    return data.teams.nodes;
  }

  async createWebhook(
    url: string,
    teamId?: string
  ): Promise<{ id: string; secret: string }> {
    const query = `
      mutation CreateWebhook($input: WebhookCreateInput!) {
        webhookCreate(input: $input) {
          success
          webhook {
            id
            secret
          }
        }
      }
    `;

    const data = await this.graphql<{
      webhookCreate: {
        success: boolean;
        webhook: { id: string; secret: string };
      };
    }>(query, {
      input: {
        url,
        teamId,
        resourceTypes: ["Issue", "Comment"],
        allPublicTeams: !teamId,
      },
    });

    if (!data.webhookCreate.success) {
      throw new Error("Failed to create Linear webhook");
    }

    return data.webhookCreate.webhook;
  }

  normalizeIssue(issue: LinearIssue): NormalizedIssue {
    return {
      externalId: issue.id,
      source: "linear",
      sourceUrl: issue.url,
      projectKey: issue.team.key,
      projectName: issue.team.name,
      title: issue.title,
      description: issue.description,
      status: issue.state.name,
      priority: PRIORITY_MAP[issue.priority] || "none",
      assignee: issue.assignee?.name,
      labels: issue.labels.nodes.map((l) => l.name),
      issueType: "issue",
      sourceCreatedAt: new Date(issue.createdAt),
      sourceUpdatedAt: new Date(issue.updatedAt),
    };
  }

  static parseWebhook(payload: LinearWebhookPayload): NormalizedIssue | null {
    if (payload.type !== "Issue") return null;

    const issue = payload.data;
    return {
      externalId: issue.id,
      source: "linear",
      sourceUrl: issue.url,
      projectKey: issue.team?.key,
      projectName: issue.team?.name,
      title: issue.title,
      description: issue.description,
      status: issue.state?.name,
      priority: PRIORITY_MAP[issue.priority] || "none",
      assignee: issue.assignee?.name,
      labels: issue.labels?.nodes?.map((l) => l.name) || [],
      issueType: "issue",
      sourceCreatedAt: new Date(issue.createdAt),
      sourceUpdatedAt: new Date(issue.updatedAt),
    };
  }

  static verifyWebhook(
    payload: string,
    signature: string,
    secret: string
  ): boolean {
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(payload)
      .digest("hex");
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  }
}
