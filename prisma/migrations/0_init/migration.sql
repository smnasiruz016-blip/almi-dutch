-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Locale" AS ENUM ('EN', 'UR', 'AR', 'HI');

-- CreateEnum
CREATE TYPE "SubscriptionTier" AS ENUM ('FREE', 'PREMIUM');

-- CreateEnum
CREATE TYPE "DutchTrack" AS ENUM ('NT2', 'INBURGERING');

-- CreateEnum
CREATE TYPE "DutchExam" AS ENUM ('PROGRAMMA_I', 'PROGRAMMA_II', 'INBURGERING_A2', 'INBURGERING_B1');

-- CreateEnum
CREATE TYPE "DutchSkill" AS ENUM ('READING', 'LISTENING', 'WRITING', 'SPEAKING', 'KNM', 'ONA');

-- CreateEnum
CREATE TYPE "DutchTaskType" AS ENUM ('MCQ_SINGLE', 'MATCHING', 'CLOZE', 'ORDERING', 'TRUE_FALSE', 'WRITING_PROMPT', 'SPEAKING_PROMPT', 'ONA_TASK');

-- CreateEnum
CREATE TYPE "DutchDifficulty" AS ENUM ('FOUNDATION', 'CORE', 'STRETCH');

-- CreateEnum
CREATE TYPE "DutchAttemptStatus" AS ENUM ('PENDING', 'SCORED', 'EVALUATED', 'FAILED');

-- CreateEnum
CREATE TYPE "DutchSessionMode" AS ENUM ('PRACTICE', 'MOCK');

-- CreateEnum
CREATE TYPE "DutchSessionStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED', 'ABANDONED');

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
    "targetExam" "DutchExam",
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
CREATE TABLE "DutchItem" (
    "id" TEXT NOT NULL,
    "track" "DutchTrack" NOT NULL,
    "exam" "DutchExam" NOT NULL,
    "skill" "DutchSkill" NOT NULL,
    "taskType" "DutchTaskType" NOT NULL,
    "difficulty" "DutchDifficulty" NOT NULL DEFAULT 'CORE',
    "title" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "answer" JSONB,
    "maxPoints" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DutchItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DutchAttempt" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "sessionId" TEXT,
    "status" "DutchAttemptStatus" NOT NULL DEFAULT 'PENDING',
    "response" JSONB,
    "points" INTEGER,
    "maxPoints" INTEGER,
    "aiFeedback" JSONB,
    "readiness" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "submittedAt" TIMESTAMP(3),

    CONSTRAINT "DutchAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DutchSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "track" "DutchTrack" NOT NULL,
    "exam" "DutchExam" NOT NULL,
    "mode" "DutchSessionMode" NOT NULL DEFAULT 'PRACTICE',
    "status" "DutchSessionStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "aggregate" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "DutchSession_pkey" PRIMARY KEY ("id")
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
CREATE INDEX "DutchItem_track_exam_skill_active_idx" ON "DutchItem"("track", "exam", "skill", "active");

-- CreateIndex
CREATE INDEX "DutchItem_exam_skill_idx" ON "DutchItem"("exam", "skill");

-- CreateIndex
CREATE INDEX "DutchAttempt_userId_createdAt_idx" ON "DutchAttempt"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "DutchAttempt_itemId_idx" ON "DutchAttempt"("itemId");

-- CreateIndex
CREATE INDEX "DutchAttempt_sessionId_idx" ON "DutchAttempt"("sessionId");

-- CreateIndex
CREATE INDEX "DutchSession_userId_createdAt_idx" ON "DutchSession"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PasswordResetToken" ADD CONSTRAINT "PasswordResetToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DutchAttempt" ADD CONSTRAINT "DutchAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DutchAttempt" ADD CONSTRAINT "DutchAttempt_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "DutchItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DutchAttempt" ADD CONSTRAINT "DutchAttempt_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "DutchSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DutchSession" ADD CONSTRAINT "DutchSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

