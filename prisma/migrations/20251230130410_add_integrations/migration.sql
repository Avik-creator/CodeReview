-- CreateTable
CREATE TABLE "integration" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT,
    "expiresAt" TIMESTAMP(3),
    "workspaceId" TEXT,
    "workspaceName" TEXT,
    "webhookSecret" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "integration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "issue" (
    "id" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "sourceUrl" TEXT,
    "projectKey" TEXT,
    "projectName" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT,
    "priority" TEXT,
    "assignee" TEXT,
    "labels" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "issueType" TEXT,
    "userId" TEXT NOT NULL,
    "repositoryId" TEXT,
    "embedded" BOOLEAN NOT NULL DEFAULT false,
    "embeddedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "sourceCreatedAt" TIMESTAMP(3),
    "sourceUpdatedAt" TIMESTAMP(3),

    CONSTRAINT "issue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_conversation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "repositoryId" TEXT,
    "reviewId" TEXT,
    "model" TEXT NOT NULL,
    "messages" JSONB NOT NULL,
    "context" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_conversation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "integration_userId_idx" ON "integration"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "integration_userId_provider_key" ON "integration"("userId", "provider");

-- CreateIndex
CREATE INDEX "issue_userId_idx" ON "issue"("userId");

-- CreateIndex
CREATE INDEX "issue_source_idx" ON "issue"("source");

-- CreateIndex
CREATE INDEX "issue_projectKey_idx" ON "issue"("projectKey");

-- CreateIndex
CREATE INDEX "issue_status_idx" ON "issue"("status");

-- CreateIndex
CREATE UNIQUE INDEX "issue_source_externalId_userId_key" ON "issue"("source", "externalId", "userId");

-- CreateIndex
CREATE INDEX "ai_conversation_userId_idx" ON "ai_conversation"("userId");

-- CreateIndex
CREATE INDEX "ai_conversation_repositoryId_idx" ON "ai_conversation"("repositoryId");
