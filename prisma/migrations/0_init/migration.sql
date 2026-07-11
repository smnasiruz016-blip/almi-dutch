-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Locale" AS ENUM ('EN', 'UR', 'AR', 'HI');

-- CreateEnum
CREATE TYPE "SubscriptionTier" AS ENUM ('FREE', 'PREMIUM');

-- CreateEnum
CREATE TYPE "PortugueseVariant" AS ENUM ('EUROPEAN', 'BRAZILIAN');

-- CreateEnum
CREATE TYPE "PortugueseExam" AS ENUM ('ACESSO', 'CIPLE', 'DEPLE', 'DIPLE', 'DAPLE', 'DUPLE', 'CELPE_BRAS');

-- CreateEnum
CREATE TYPE "PortugueseSkill" AS ENUM ('READING', 'LISTENING', 'WRITING', 'SPEAKING', 'ESCRITA', 'ORAL');

-- CreateEnum
CREATE TYPE "PortugueseTaskType" AS ENUM ('MCQ_SINGLE', 'MATCHING', 'CLOZE', 'ORDERING', 'TRUE_FALSE', 'WRITING_PROMPT', 'SPEAKING_PROMPT', 'ESCRITA_TASK', 'ORAL_INTERVIEW');

-- CreateEnum
CREATE TYPE "PortugueseDifficulty" AS ENUM ('FOUNDATION', 'CORE', 'STRETCH');

-- CreateEnum
CREATE TYPE "PortugueseAttemptStatus" AS ENUM ('PENDING', 'SCORED', 'EVALUATED', 'FAILED');

-- CreateEnum
CREATE TYPE "PortugueseSessionMode" AS ENUM ('PRACTICE', 'MOCK');

-- CreateEnum
CREATE TYPE "PortugueseSessionStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED', 'ABANDONED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "passwordHash" TEXT NOT NULL,
    "locale" "Locale" NOT NULL DEFAULT 'EN',
    "countryCode" TEXT,
    "referralCode" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "emailVerificationTokenHash" TEXT,
    "emailVerificationExpiresAt" TIMESTAMP(3),
    "emailVerificationLastSentAt" TIMESTAMP(3),
    "stripeCustomerId" TEXT,
    "stripeSubscriptionId" TEXT,
    "subscriptionStatus" TEXT,
    "subscriptionPlan" TEXT,
    "subscriptionCurrentPeriodEnd" TIMESTAMP(3),
    "subscriptionCancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
    "trialEndsAt" TIMESTAMP(3),
    "subscriptionTier" "SubscriptionTier" NOT NULL DEFAULT 'FREE',
    "compProUntil" TIMESTAMP(3),
    "compGrantedAt" TIMESTAMP(3),
    "compGrantedBy" TEXT,
    "compReason" TEXT,
    "targetExam" "PortugueseExam",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PasswordResetToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProcessedWebhook" (
    "id" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "processedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProcessedWebhook_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EarlyAccess" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "source" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EarlyAccess_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "approved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AICostLedger" (
    "id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT,
    "feature" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "inputTokens" INTEGER NOT NULL,
    "outputTokens" INTEGER NOT NULL,
    "cacheReadTokens" INTEGER NOT NULL DEFAULT 0,
    "cacheWriteTokens" INTEGER NOT NULL DEFAULT 0,
    "costCents" INTEGER NOT NULL,
    "success" BOOLEAN NOT NULL DEFAULT true,
    "errorMessage" TEXT,

    CONSTRAINT "AICostLedger_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PortugueseItem" (
    "id" TEXT NOT NULL,
    "variant" "PortugueseVariant" NOT NULL,
    "exam" "PortugueseExam" NOT NULL,
    "skill" "PortugueseSkill" NOT NULL,
    "taskType" "PortugueseTaskType" NOT NULL,
    "difficulty" "PortugueseDifficulty" NOT NULL DEFAULT 'CORE',
    "title" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "answer" JSONB,
    "maxPoints" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PortugueseItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PortugueseAttempt" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "sessionId" TEXT,
    "status" "PortugueseAttemptStatus" NOT NULL DEFAULT 'PENDING',
    "response" JSONB,
    "points" INTEGER,
    "maxPoints" INTEGER,
    "aiFeedback" JSONB,
    "readiness" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "submittedAt" TIMESTAMP(3),

    CONSTRAINT "PortugueseAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PortugueseSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "variant" "PortugueseVariant" NOT NULL,
    "exam" "PortugueseExam" NOT NULL,
    "mode" "PortugueseSessionMode" NOT NULL DEFAULT 'PRACTICE',
    "status" "PortugueseSessionStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "aggregate" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "PortugueseSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_referralCode_key" ON "User"("referralCode");

-- CreateIndex
CREATE UNIQUE INDEX "User_emailVerificationTokenHash_key" ON "User"("emailVerificationTokenHash");

-- CreateIndex
CREATE UNIQUE INDEX "User_stripeCustomerId_key" ON "User"("stripeCustomerId");

-- CreateIndex
CREATE UNIQUE INDEX "User_stripeSubscriptionId_key" ON "User"("stripeSubscriptionId");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_referralCode_idx" ON "User"("referralCode");

-- CreateIndex
CREATE INDEX "User_stripeCustomerId_idx" ON "User"("stripeCustomerId");

-- CreateIndex
CREATE INDEX "User_stripeSubscriptionId_idx" ON "User"("stripeSubscriptionId");

-- CreateIndex
CREATE INDEX "User_compProUntil_idx" ON "User"("compProUntil");

-- CreateIndex
CREATE UNIQUE INDEX "Session_tokenHash_key" ON "Session"("tokenHash");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "PasswordResetToken_tokenHash_key" ON "PasswordResetToken"("tokenHash");

-- CreateIndex
CREATE INDEX "PasswordResetToken_userId_idx" ON "PasswordResetToken"("userId");

-- CreateIndex
CREATE INDEX "PasswordResetToken_expiresAt_idx" ON "PasswordResetToken"("expiresAt");

-- CreateIndex
CREATE INDEX "ProcessedWebhook_processedAt_idx" ON "ProcessedWebhook"("processedAt");

-- CreateIndex
CREATE UNIQUE INDEX "EarlyAccess_email_key" ON "EarlyAccess"("email");

-- CreateIndex
CREATE INDEX "EarlyAccess_email_idx" ON "EarlyAccess"("email");

-- CreateIndex
CREATE INDEX "Review_userId_idx" ON "Review"("userId");

-- CreateIndex
CREATE INDEX "Review_approved_createdAt_idx" ON "Review"("approved", "createdAt");

-- CreateIndex
CREATE INDEX "AICostLedger_timestamp_idx" ON "AICostLedger"("timestamp" DESC);

-- CreateIndex
CREATE INDEX "AICostLedger_userId_timestamp_idx" ON "AICostLedger"("userId", "timestamp");

-- CreateIndex
CREATE INDEX "AICostLedger_feature_timestamp_idx" ON "AICostLedger"("feature", "timestamp");

-- CreateIndex
CREATE INDEX "PortugueseItem_variant_exam_skill_active_idx" ON "PortugueseItem"("variant", "exam", "skill", "active");

-- CreateIndex
CREATE INDEX "PortugueseItem_exam_skill_idx" ON "PortugueseItem"("exam", "skill");

-- CreateIndex
CREATE INDEX "PortugueseAttempt_userId_createdAt_idx" ON "PortugueseAttempt"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "PortugueseAttempt_itemId_idx" ON "PortugueseAttempt"("itemId");

-- CreateIndex
CREATE INDEX "PortugueseAttempt_sessionId_idx" ON "PortugueseAttempt"("sessionId");

-- CreateIndex
CREATE INDEX "PortugueseSession_userId_createdAt_idx" ON "PortugueseSession"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PasswordResetToken" ADD CONSTRAINT "PasswordResetToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PortugueseAttempt" ADD CONSTRAINT "PortugueseAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PortugueseAttempt" ADD CONSTRAINT "PortugueseAttempt_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "PortugueseItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PortugueseAttempt" ADD CONSTRAINT "PortugueseAttempt_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "PortugueseSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PortugueseSession" ADD CONSTRAINT "PortugueseSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

