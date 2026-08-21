import { PrismaClient } from '@prisma/client';

// Ensure process.env.DATABASE_URL has a safe fallback if not set in Vercel
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'file:/tmp/dev.db';
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasourceUrl: process.env.DATABASE_URL,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

let isDbInitialized = false;

export async function ensureDbInitialized() {
  if (isDbInitialized) return;

  try {
    const user = await prisma.user.findFirst();
    if (!user) {
      await prisma.user.create({
        data: {
          id: 'user_default_smriti',
          name: 'Smriti Priya Singh',
          email: 'smriti@example.com',
        },
      });
    }
    isDbInitialized = true;
  } catch (error: any) {
    const errorStr = String(error?.message || error);
    if (errorStr.includes('does not exist') || errorStr.includes('no such table')) {
      console.log('Database tables missing. Executing automatic self-healing DDL initialization...');
      try {
        await prisma.$executeRawUnsafe(`
          CREATE TABLE IF NOT EXISTS "User" (
            "id" TEXT NOT NULL PRIMARY KEY,
            "name" TEXT NOT NULL,
            "email" TEXT NOT NULL UNIQUE,
            "image" TEXT,
            "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
          );
        `);

        await prisma.$executeRawUnsafe(`
          CREATE TABLE IF NOT EXISTS "Company" (
            "id" TEXT NOT NULL PRIMARY KEY,
            "name" TEXT NOT NULL,
            "logo" TEXT,
            "website" TEXT,
            "glassdoor" TEXT,
            "industry" TEXT,
            "headquarters" TEXT,
            "careerPage" TEXT,
            "notes" TEXT,
            "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
          );
        `);

        await prisma.$executeRawUnsafe(`
          CREATE TABLE IF NOT EXISTS "JobPosting" (
            "id" TEXT NOT NULL PRIMARY KEY,
            "companyId" TEXT NOT NULL,
            "role" TEXT NOT NULL,
            "department" TEXT,
            "location" TEXT NOT NULL,
            "workMode" TEXT NOT NULL DEFAULT 'REMOTE',
            "jobType" TEXT NOT NULL DEFAULT 'FULL_TIME',
            "package" TEXT,
            "salaryMin" REAL,
            "salaryMax" REAL,
            "jobUrl" TEXT,
            "deadline" DATETIME,
            "description" TEXT,
            "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
          );
        `);

        await prisma.$executeRawUnsafe(`
          CREATE TABLE IF NOT EXISTS "Resume" (
            "id" TEXT NOT NULL PRIMARY KEY,
            "userId" TEXT NOT NULL,
            "title" TEXT NOT NULL,
            "fileUrl" TEXT NOT NULL,
            "fileSize" TEXT NOT NULL DEFAULT '1.2 MB',
            "versionTag" TEXT NOT NULL,
            "targetRole" TEXT,
            "skills" TEXT,
            "isDefault" BOOLEAN NOT NULL DEFAULT 0,
            "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
          );
        `);

        await prisma.$executeRawUnsafe(`
          CREATE TABLE IF NOT EXISTS "Application" (
            "id" TEXT NOT NULL PRIMARY KEY,
            "userId" TEXT NOT NULL,
            "jobPostingId" TEXT NOT NULL,
            "resumeId" TEXT,
            "appType" TEXT NOT NULL DEFAULT 'JOB',
            "source" TEXT NOT NULL DEFAULT 'LinkedIn',
            "status" TEXT NOT NULL DEFAULT 'APPLIED',
            "replyStatus" TEXT NOT NULL DEFAULT 'NO_REPLY',
            "replyChannel" TEXT,
            "replyDate" DATETIME,
            "isGhosted" BOOLEAN NOT NULL DEFAULT 0,
            "applicationDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "notes" TEXT,
            "rating" INTEGER DEFAULT 3,
            "extraData" TEXT,
            "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
          );
        `);

        await prisma.$executeRawUnsafe(`
          CREATE TABLE IF NOT EXISTS "ApplicationEvent" (
            "id" TEXT NOT NULL PRIMARY KEY,
            "applicationId" TEXT NOT NULL,
            "title" TEXT NOT NULL,
            "description" TEXT,
            "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "eventType" TEXT NOT NULL,
            "metadata" TEXT,
            "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
          );
        `);

        await prisma.$executeRawUnsafe(`
          CREATE TABLE IF NOT EXISTS "StatusHistory" (
            "id" TEXT NOT NULL PRIMARY KEY,
            "applicationId" TEXT NOT NULL,
            "fromStatus" TEXT,
            "toStatus" TEXT NOT NULL,
            "changedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "notes" TEXT
          );
        `);

        await prisma.$executeRawUnsafe(`
          CREATE TABLE IF NOT EXISTS "ActivityLog" (
            "id" TEXT NOT NULL PRIMARY KEY,
            "userId" TEXT NOT NULL,
            "applicationId" TEXT,
            "action" TEXT NOT NULL,
            "details" TEXT NOT NULL,
            "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
          );
        `);

        await prisma.$executeRawUnsafe(`
          CREATE TABLE IF NOT EXISTS "Goal" (
            "id" TEXT NOT NULL PRIMARY KEY,
            "userId" TEXT NOT NULL,
            "month" INTEGER NOT NULL,
            "year" INTEGER NOT NULL,
            "targetApplications" INTEGER NOT NULL DEFAULT 40,
            "currentApplications" INTEGER NOT NULL DEFAULT 0,
            "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
          );
        `);

        // Seed default user
        await prisma.user.upsert({
          where: { email: 'smriti@example.com' },
          update: {},
          create: {
            id: 'user_default_smriti',
            name: 'Smriti Priya Singh',
            email: 'smriti@example.com',
          },
        });

        isDbInitialized = true;
      } catch (ddlErr) {
        console.error('Failed to auto-initialize DB DDL:', ddlErr);
      }
    }
  }
}
