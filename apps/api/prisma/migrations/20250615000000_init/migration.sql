-- CreateEnum
CREATE TYPE "LegalArea" AS ENUM ('LABORAL', 'CIVIL', 'PENAL', 'FAMILIA', 'FISCAL', 'TRAFICO', 'CONSUMIDOR', 'MERCANTIL', 'EXTRANJERIA');

-- CreateEnum
CREATE TYPE "UserPlan" AS ENUM ('FREE', 'STARTER', 'PROFESSIONAL', 'ENTERPRISE');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'TRIALING', 'PAST_DUE', 'CANCELED', 'UNPAID', 'INCOMPLETE', 'PAUSED');

-- CreateEnum
CREATE TYPE "CaseStatus" AS ENUM ('DRAFT', 'ACTIVE', 'ON_HOLD', 'CLOSED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "CasePriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "ConsultationStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'AWAITING_USER', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "MessageRole" AS ENUM ('USER', 'ASSISTANT', 'SYSTEM');

-- CreateEnum
CREATE TYPE "DocumentSemaphore" AS ENUM ('GREEN', 'YELLOW', 'RED');

-- CreateEnum
CREATE TYPE "LegalDocumentType" AS ENUM ('BUROFAX', 'CARTA_DESPIDO', 'DENUNCIA', 'RECURSO_MULTA', 'CONTRATO_ARRENDAMIENTO', 'DEMANDA_CIVIL', 'RECURSO_CONTENCIOSO', 'ESCRITO_ALEGACIONES', 'SOLICITUD_CONCILIACION', 'RECURSO_DE_ALZADA', 'CONTRATO_COMPRAVENTA', 'PODER_NOTARIAL', 'RECLAMACION_CONSUMO', 'SOLICITUD_NACIONALIDAD', 'RECURSO_SANCION');

-- CreateEnum
CREATE TYPE "DeadlineUrgency" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "DeadlineStatus" AS ENUM ('PENDING', 'COMPLETED', 'MISSED', 'EXTENDED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "TimelineEventType" AS ENUM ('CASE_CREATED', 'CASE_UPDATED', 'CONSULTATION_STARTED', 'CONSULTATION_COMPLETED', 'DOCUMENT_UPLOADED', 'DOCUMENT_ANALYZED', 'LEGAL_DOCUMENT_GENERATED', 'DEADLINE_CREATED', 'DEADLINE_COMPLETED', 'VOICE_SESSION_STARTED', 'VOICE_SESSION_ENDED', 'STATUS_CHANGED', 'NOTE_ADDED', 'PAYMENT_RECEIVED', 'SUBSCRIPTION_CHANGED');

-- CreateEnum
CREATE TYPE "VoiceSessionStatus" AS ENUM ('SCHEDULED', 'CONNECTING', 'ACTIVE', 'COMPLETED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ConsentType" AS ENUM ('TERMS_OF_SERVICE', 'PRIVACY_POLICY', 'MARKETING_EMAILS', 'ANALYTICS_COOKIES', 'AI_PROCESSING', 'VOICE_RECORDING', 'DATA_SHARING');

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('CREATE', 'READ', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'EXPORT', 'SHARE', 'CONSENT_GRANTED', 'CONSENT_REVOKED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "passwordHash" TEXT,
    "name" TEXT,
    "image" TEXT,
    "stripeCustomerId" TEXT,
    "plan" "UserPlan" NOT NULL DEFAULT 'FREE',
    "locale" TEXT NOT NULL DEFAULT 'es-ES',
    "encryptionKeyId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "stripeSubscriptionId" TEXT NOT NULL,
    "stripePriceId" TEXT NOT NULL,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
    "currentPeriodStart" TIMESTAMP(3) NOT NULL,
    "currentPeriodEnd" TIMESTAMP(3) NOT NULL,
    "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
    "canceledAt" TIMESTAMP(3),
    "trialStart" TIMESTAMP(3),
    "trialEnd" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usage_meters" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "consultationsUsed" INTEGER NOT NULL DEFAULT 0,
    "consultationsLimit" INTEGER NOT NULL DEFAULT 10,
    "documentsUsed" INTEGER NOT NULL DEFAULT 0,
    "documentsLimit" INTEGER NOT NULL DEFAULT 20,
    "voiceMinutesUsed" INTEGER NOT NULL DEFAULT 0,
    "voiceMinutesLimit" INTEGER NOT NULL DEFAULT 60,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usage_meters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cases" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "CaseStatus" NOT NULL DEFAULT 'DRAFT',
    "priority" "CasePriority" NOT NULL DEFAULT 'MEDIUM',
    "legalArea" "LegalArea" NOT NULL,
    "reference" TEXT,
    "metadata" JSONB,
    "closedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consultations" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "agentId" TEXT,
    "status" "ConsultationStatus" NOT NULL DEFAULT 'PENDING',
    "topic" TEXT,
    "summary" TEXT,
    "metadata" JSONB,
    "startedAt" TIMESTAMP(3),
    "endedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "consultations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" TEXT NOT NULL,
    "consultationId" TEXT NOT NULL,
    "role" "MessageRole" NOT NULL,
    "content" TEXT NOT NULL,
    "metadata" JSONB,
    "tokenCount" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documents" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "r2Key" TEXT NOT NULL,
    "encrypted" BOOLEAN NOT NULL DEFAULT true,
    "size" INTEGER NOT NULL,
    "checksum" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document_analyses" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "riskScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "semaphore" "DocumentSemaphore" NOT NULL DEFAULT 'GREEN',
    "clauses" JSONB,
    "summary" TEXT,
    "metadata" JSONB,
    "analyzedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "document_analyses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "legal_documents" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "type" "LegalDocumentType" NOT NULL,
    "title" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "legal_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "legal_document_versions" (
    "id" TEXT NOT NULL,
    "legalDocumentId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "htmlContent" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "legal_document_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "deadlines" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "urgency" "DeadlineUrgency" NOT NULL DEFAULT 'MEDIUM',
    "status" "DeadlineStatus" NOT NULL DEFAULT 'PENDING',
    "reminderAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "deadlines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "timeline_events" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "type" "TimelineEventType" NOT NULL,
    "title" TEXT,
    "description" TEXT NOT NULL,
    "metadata" JSONB,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "timeline_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "voice_sessions" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "livekitRoomId" TEXT,
    "twilioCallSid" TEXT,
    "status" "VoiceSessionStatus" NOT NULL DEFAULT 'SCHEDULED',
    "duration" INTEGER,
    "startedAt" TIMESTAMP(3),
    "endedAt" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "voice_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "voice_transcripts" (
    "id" TEXT NOT NULL,
    "voiceSessionId" TEXT NOT NULL,
    "segments" JSONB NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'es',
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "voice_transcripts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "post_call_summaries" (
    "id" TEXT NOT NULL,
    "voiceSessionId" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "actions" JSONB,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "post_call_summaries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" "AuditAction" NOT NULL,
    "resource" TEXT NOT NULL,
    "resourceId" TEXT,
    "metadata" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consent_records" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "ConsentType" NOT NULL,
    "granted" BOOLEAN NOT NULL,
    "ip" TEXT,
    "userAgent" TEXT,
    "version" TEXT,
    "metadata" JSONB,
    "grantedAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "consent_records_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE UNIQUE INDEX "users_stripeCustomerId_key" ON "users"("stripeCustomerId");
CREATE INDEX "users_plan_idx" ON "users"("plan");
CREATE INDEX "users_createdAt_idx" ON "users"("createdAt");

CREATE UNIQUE INDEX "subscriptions_stripeSubscriptionId_key" ON "subscriptions"("stripeSubscriptionId");
CREATE INDEX "subscriptions_userId_idx" ON "subscriptions"("userId");
CREATE INDEX "subscriptions_status_idx" ON "subscriptions"("status");
CREATE INDEX "subscriptions_currentPeriodEnd_idx" ON "subscriptions"("currentPeriodEnd");

CREATE UNIQUE INDEX "usage_meters_userId_periodStart_key" ON "usage_meters"("userId", "periodStart");
CREATE INDEX "usage_meters_userId_idx" ON "usage_meters"("userId");
CREATE INDEX "usage_meters_periodEnd_idx" ON "usage_meters"("periodEnd");

CREATE INDEX "cases_userId_idx" ON "cases"("userId");
CREATE INDEX "cases_status_idx" ON "cases"("status");
CREATE INDEX "cases_legalArea_idx" ON "cases"("legalArea");
CREATE INDEX "cases_priority_idx" ON "cases"("priority");
CREATE INDEX "cases_createdAt_idx" ON "cases"("createdAt");
CREATE INDEX "cases_userId_status_idx" ON "cases"("userId", "status");

CREATE INDEX "consultations_caseId_idx" ON "consultations"("caseId");
CREATE INDEX "consultations_status_idx" ON "consultations"("status");
CREATE INDEX "consultations_agentId_idx" ON "consultations"("agentId");
CREATE INDEX "consultations_createdAt_idx" ON "consultations"("createdAt");

CREATE INDEX "messages_consultationId_idx" ON "messages"("consultationId");
CREATE INDEX "messages_role_idx" ON "messages"("role");
CREATE INDEX "messages_createdAt_idx" ON "messages"("createdAt");

CREATE UNIQUE INDEX "documents_r2Key_key" ON "documents"("r2Key");
CREATE INDEX "documents_caseId_idx" ON "documents"("caseId");
CREATE INDEX "documents_mimeType_idx" ON "documents"("mimeType");
CREATE INDEX "documents_createdAt_idx" ON "documents"("createdAt");

CREATE UNIQUE INDEX "document_analyses_documentId_key" ON "document_analyses"("documentId");
CREATE INDEX "document_analyses_riskScore_idx" ON "document_analyses"("riskScore");
CREATE INDEX "document_analyses_semaphore_idx" ON "document_analyses"("semaphore");

CREATE INDEX "legal_documents_caseId_idx" ON "legal_documents"("caseId");
CREATE INDEX "legal_documents_type_idx" ON "legal_documents"("type");
CREATE INDEX "legal_documents_createdAt_idx" ON "legal_documents"("createdAt");

CREATE UNIQUE INDEX "legal_document_versions_legalDocumentId_version_key" ON "legal_document_versions"("legalDocumentId", "version");
CREATE INDEX "legal_document_versions_legalDocumentId_idx" ON "legal_document_versions"("legalDocumentId");

CREATE INDEX "deadlines_caseId_idx" ON "deadlines"("caseId");
CREATE INDEX "deadlines_dueDate_idx" ON "deadlines"("dueDate");
CREATE INDEX "deadlines_status_idx" ON "deadlines"("status");
CREATE INDEX "deadlines_urgency_idx" ON "deadlines"("urgency");

CREATE INDEX "timeline_events_caseId_idx" ON "timeline_events"("caseId");
CREATE INDEX "timeline_events_type_idx" ON "timeline_events"("type");
CREATE INDEX "timeline_events_occurredAt_idx" ON "timeline_events"("occurredAt");

CREATE UNIQUE INDEX "voice_sessions_livekitRoomId_key" ON "voice_sessions"("livekitRoomId");
CREATE UNIQUE INDEX "voice_sessions_twilioCallSid_key" ON "voice_sessions"("twilioCallSid");
CREATE INDEX "voice_sessions_caseId_idx" ON "voice_sessions"("caseId");
CREATE INDEX "voice_sessions_status_idx" ON "voice_sessions"("status");
CREATE INDEX "voice_sessions_createdAt_idx" ON "voice_sessions"("createdAt");

CREATE UNIQUE INDEX "voice_transcripts_voiceSessionId_key" ON "voice_transcripts"("voiceSessionId");

CREATE UNIQUE INDEX "post_call_summaries_voiceSessionId_key" ON "post_call_summaries"("voiceSessionId");

CREATE INDEX "audit_logs_userId_idx" ON "audit_logs"("userId");
CREATE INDEX "audit_logs_action_idx" ON "audit_logs"("action");
CREATE INDEX "audit_logs_resource_idx" ON "audit_logs"("resource");
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");
CREATE INDEX "audit_logs_userId_createdAt_idx" ON "audit_logs"("userId", "createdAt");

CREATE INDEX "consent_records_userId_idx" ON "consent_records"("userId");
CREATE INDEX "consent_records_type_idx" ON "consent_records"("type");
CREATE INDEX "consent_records_granted_idx" ON "consent_records"("granted");

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "usage_meters" ADD CONSTRAINT "usage_meters_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "cases" ADD CONSTRAINT "cases_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "consultations" ADD CONSTRAINT "consultations_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "messages" ADD CONSTRAINT "messages_consultationId_fkey" FOREIGN KEY ("consultationId") REFERENCES "consultations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "documents" ADD CONSTRAINT "documents_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "document_analyses" ADD CONSTRAINT "document_analyses_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "legal_documents" ADD CONSTRAINT "legal_documents_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "legal_document_versions" ADD CONSTRAINT "legal_document_versions_legalDocumentId_fkey" FOREIGN KEY ("legalDocumentId") REFERENCES "legal_documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "deadlines" ADD CONSTRAINT "deadlines_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "timeline_events" ADD CONSTRAINT "timeline_events_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "voice_sessions" ADD CONSTRAINT "voice_sessions_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "voice_transcripts" ADD CONSTRAINT "voice_transcripts_voiceSessionId_fkey" FOREIGN KEY ("voiceSessionId") REFERENCES "voice_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "post_call_summaries" ADD CONSTRAINT "post_call_summaries_voiceSessionId_fkey" FOREIGN KEY ("voiceSessionId") REFERENCES "voice_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "consent_records" ADD CONSTRAINT "consent_records_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;