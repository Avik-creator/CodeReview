// Canonical issue type - normalized across all sources
export interface NormalizedIssue {
  externalId: string;
  source: "linear" | "jira" | "github";
  sourceUrl?: string;
  projectKey?: string;
  projectName?: string;
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  assignee?: string;
  labels: string[];
  issueType?: string;
  sourceCreatedAt?: Date;
  sourceUpdatedAt?: Date;
}

// Integration configuration
export interface IntegrationConfig {
  provider: "linear" | "jira";
  accessToken: string;
  refreshToken?: string;
  workspaceId?: string;
  workspaceName?: string;
  webhookSecret?: string;
  metadata?: Record<string, unknown>;
}

// Webhook event types
export type WebhookEventType =
  | "issue.created"
  | "issue.updated"
  | "issue.deleted"
  | "comment.created"
  | "comment.updated";

export interface WebhookEvent {
  type: WebhookEventType;
  source: "linear" | "jira";
  timestamp: Date;
  issue: NormalizedIssue;
  rawPayload?: unknown;
}

// Context retrieval types
export interface IssueContext {
  issue: NormalizedIssue;
  score: number;
  snippet: string;
}

export interface ContextQuery {
  query: string;
  userId: string;
  filters?: {
    sources?: ("linear" | "jira" | "github")[];
    projectKeys?: string[];
    statuses?: string[];
    assignees?: string[];
    labels?: string[];
    dateRange?: {
      from?: Date;
      to?: Date;
    };
  };
  topK?: number;
}

// AI mention types
export interface MentionMatch {
  fullMatch: string;
  query: string;
  startIndex: number;
  endIndex: number;
}
