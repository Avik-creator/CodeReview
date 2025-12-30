import { NormalizedIssue, IntegrationConfig } from "./types";
import crypto from "crypto";

interface JiraIssue {
  id: string;
  key: string;
  self: string;
  fields: {
    summary: string;
    description?:
      | string
      | { content: Array<{ content: Array<{ text: string }> }> };
    status: { name: string };
    priority?: { name: string };
    assignee?: { displayName: string; emailAddress: string };
    labels?: string[];
    issuetype: { name: string };
    project: { key: string; name: string };
    created: string;
    updated: string;
  };
}

interface JiraWebhookPayload {
  webhookEvent: string;
  issue: JiraIssue;
  timestamp: number;
}

export class JiraClient {
  private baseUrl: string;
  private email: string;
  private apiToken: string;
  private cloudId?: string;

  constructor(
    config: IntegrationConfig & { email?: string; cloudUrl?: string }
  ) {
    // For Jira Cloud, use the provided cloudUrl directly
    // e.g., https://yoursite.atlassian.net
    const cloudUrl = (config.metadata?.cloudUrl as string) || "";
    this.baseUrl = cloudUrl.replace(/\/$/, ""); // Remove trailing slash if present
    this.email = (config.metadata?.email as string) || "";
    this.apiToken = config.accessToken;
    this.cloudId = config.workspaceId;
  }

  private get authHeader(): string {
    // For Jira Cloud with API token
    return `Basic ${Buffer.from(`${this.email}:${this.apiToken}`).toString(
      "base64"
    )}`;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}/rest/api/3${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: this.authHeader,
        Accept: "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Jira API error: ${response.status} - ${error}`);
    }

    const text = await response.text();
    if (!text) {
      throw new Error("Empty response from Jira API");
    }

    try {
      return JSON.parse(text) as T;
    } catch {
      throw new Error(
        `Failed to parse Jira API response: ${text.slice(0, 200)}`
      );
    }
  }

  async getAccessibleResources(): Promise<
    Array<{ id: string; name: string; url: string }>
  > {
    // For OAuth flow - get accessible Jira sites
    const response = await fetch(
      "https://api.atlassian.com/oauth/token/accessible-resources",
      {
        headers: {
          Authorization: `Bearer ${this.apiToken}`,
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to get accessible Jira resources");
    }

    return response.json();
  }

  async getProjects(): Promise<
    Array<{ id: string; key: string; name: string }>
  > {
    try {
      // Try the search endpoint first (for Jira Cloud)
      const params = new URLSearchParams({
        maxResults: "50",
      });

      const data = await this.request<{
        values: Array<{ id: string; key: string; name: string }>;
      }>(`/project/search?${params}`);

      return data.values;
    } catch (error) {
      console.error("[Jira Projects] Search endpoint error:", error);
      // Fallback to the simpler list endpoint
      try {
        const data = await this.request<
          Array<{ id: string; key: string; name: string }>
        >("/project");

        return data;
      } catch (fallbackError) {
        console.error("[Jira Projects] List endpoint error:", fallbackError);
        throw new Error(
          `Failed to fetch Jira projects: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      }
    }
  }

  async getIssues(options?: {
    projectKeys?: string[];
    jql?: string;
    nextPageToken?: string;
    maxResults?: number;
  }): Promise<{
    issues: NormalizedIssue[];
    isLast: boolean;
    nextPageToken?: string;
  }> {
    let jql = options?.jql || "";

    // If no JQL provided, we need to create a bounded query
    // The enhanced search API requires bounded JQL queries
    if (!jql) {
      if (options?.projectKeys?.length) {
        jql = `project IN (${options.projectKeys.join(
          ","
        )}) ORDER BY updated DESC`;
      } else {
        // Fetch all projects and create a bounded query
        const projects = await this.getProjects();
        if (projects.length > 0) {
          const projectKeys = projects.map((p) => p.key).join(",");
          jql = `project IN (${projectKeys}) ORDER BY updated DESC`;
        } else {
          // Fallback to a time-based restriction if no projects found
          jql = "updated >= -30d ORDER BY updated DESC";
        }
      }
    }

    // Use the new enhanced /search/jql API (POST method)
    const data = await this.request<{
      issues: JiraIssue[];
      isLast: boolean;
      nextPageToken?: string;
    }>("/search/jql", {
      method: "POST",
      body: JSON.stringify({
        jql,
        maxResults: options?.maxResults ?? 50,
        ...(options?.nextPageToken && { nextPageToken: options.nextPageToken }),
        fields: [
          "summary",
          "description",
          "status",
          "priority",
          "assignee",
          "labels",
          "issuetype",
          "project",
          "created",
          "updated",
        ],
      }),
    });

    return {
      issues: data.issues.map((issue) => this.normalizeIssue(issue)),
      isLast: data.isLast,
      ...(data.nextPageToken && { nextPageToken: data.nextPageToken }),
    };
  }

  async getIssue(issueIdOrKey: string): Promise<NormalizedIssue> {
    const data = await this.request<JiraIssue>(`/issue/${issueIdOrKey}`);
    return this.normalizeIssue(data);
  }

  async registerWebhook(
    url: string,
    projectKeys?: string[]
  ): Promise<{
    webhookRegistrationResult: Array<{ createdWebhookId: number }>;
  }> {
    // For Jira Cloud, webhooks are registered via Connect app or Forge
    // This is a simplified example using the REST API
    const data = await this.request<{
      webhookRegistrationResult: Array<{ createdWebhookId: number }>;
    }>("/webhook", {
      method: "POST",
      body: JSON.stringify({
        webhooks: [
          {
            jqlFilter: projectKeys?.length
              ? `project IN (${projectKeys.join(",")})`
              : "*",
            events: [
              "jira:issue_created",
              "jira:issue_updated",
              "jira:issue_deleted",
              "comment_created",
              "comment_updated",
            ],
            url,
          },
        ],
      }),
    });

    return data;
  }

  private extractDescription(
    desc:
      | string
      | { content: Array<{ content: Array<{ text: string }> }> }
      | undefined
  ): string {
    if (!desc) return "";
    if (typeof desc === "string") return desc;

    // Atlassian Document Format (ADF) - extract text
    try {
      return desc.content
        .flatMap((block) => block.content?.map((item) => item.text) || [])
        .join("\n");
    } catch {
      return "";
    }
  }

  normalizeIssue(issue: JiraIssue): NormalizedIssue {
    // Use the baseUrl directly since it's already the proper Jira Cloud URL
    return {
      externalId: issue.id,
      source: "jira",
      sourceUrl: `${this.baseUrl}/browse/${issue.key}`,
      projectKey: issue.fields.project.key,
      projectName: issue.fields.project.name,
      title: issue.fields.summary,
      description: this.extractDescription(issue.fields.description),
      status: issue.fields.status.name,
      priority: issue.fields.priority?.name?.toLowerCase(),
      assignee: issue.fields.assignee?.displayName,
      labels: issue.fields.labels || [],
      issueType: issue.fields.issuetype.name.toLowerCase(),
      sourceCreatedAt: new Date(issue.fields.created),
      sourceUpdatedAt: new Date(issue.fields.updated),
    };
  }

  static parseWebhook(payload: JiraWebhookPayload): NormalizedIssue | null {
    if (!payload.issue) return null;

    const issue = payload.issue;
    return {
      externalId: issue.id,
      source: "jira",
      sourceUrl: issue.self,
      projectKey: issue.fields.project.key,
      projectName: issue.fields.project.name,
      title: issue.fields.summary,
      description:
        typeof issue.fields.description === "string"
          ? issue.fields.description
          : "",
      status: issue.fields.status.name,
      priority: issue.fields.priority?.name?.toLowerCase(),
      assignee: issue.fields.assignee?.displayName,
      labels: issue.fields.labels || [],
      issueType: issue.fields.issuetype.name.toLowerCase(),
      sourceCreatedAt: new Date(issue.fields.created),
      sourceUpdatedAt: new Date(issue.fields.updated),
    };
  }

  static verifyWebhook(
    payload: string,
    signature: string,
    secret: string
  ): boolean {
    // Jira Cloud webhooks use JWT verification
    // For simplicity, this example shows basic HMAC verification
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(payload)
      .digest("hex");

    try {
      return crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
      );
    } catch {
      return false;
    }
  }
}

// OAuth 2.0 helpers for Jira Cloud
export const JiraOAuth = {
  getAuthorizationUrl(
    clientId: string,
    redirectUri: string,
    state: string
  ): string {
    const params = new URLSearchParams({
      audience: "api.atlassian.com",
      client_id: clientId,
      scope: "read:jira-work read:jira-user write:jira-work offline_access",
      redirect_uri: redirectUri,
      state,
      response_type: "code",
      prompt: "consent",
    });

    return `https://auth.atlassian.com/authorize?${params}`;
  },

  async exchangeCodeForToken(
    clientId: string,
    clientSecret: string,
    code: string,
    redirectUri: string
  ): Promise<{
    access_token: string;
    refresh_token: string;
    expires_in: number;
    scope: string;
  }> {
    const response = await fetch("https://auth.atlassian.com/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        grant_type: "authorization_code",
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: redirectUri,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to exchange Jira OAuth code");
    }

    return response.json();
  },

  async refreshAccessToken(
    clientId: string,
    clientSecret: string,
    refreshToken: string
  ): Promise<{
    access_token: string;
    refresh_token: string;
    expires_in: number;
  }> {
    const response = await fetch("https://auth.atlassian.com/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        grant_type: "refresh_token",
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to refresh Jira access token");
    }

    return response.json();
  },
};
