import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query') || '';
    const status = searchParams.get('status');
    const tag = searchParams.get('tag');
    const workMode = searchParams.get('workMode');
    const resumeId = searchParams.get('resumeId');
    const needAttention = searchParams.get('needAttention') === 'true';

    const user = await prisma.user.findFirst();
    if (!user) {
      return NextResponse.json({ applications: [], total: 0 });
    }

    // Build filter criteria
    const where: any = {
      userId: user.id,
    };

    if (status) {
      where.status = status;
    }

    if (workMode) {
      where.jobPosting = { workMode };
    }

    if (resumeId) {
      where.resumeId = resumeId;
    }

    if (tag) {
      where.tags = {
        some: {
          tag: {
            name: tag,
          },
        },
      };
    }

    if (query) {
      where.OR = [
        { jobPosting: { role: { contains: query } } },
        { jobPosting: { company: { name: { contains: query } } } },
        { jobPosting: { location: { contains: query } } },
        { notes: { contains: query } },
      ];
    }

    let applications = await prisma.application.findMany({
      where,
      include: {
        jobPosting: {
          include: {
            company: true,
          },
        },
        resume: true,
        recruiters: true,
        tags: {
          include: {
            tag: true,
          },
        },
        interviews: true,
        followUps: true,
        events: {
          orderBy: { date: 'desc' },
        },
        statusHistory: {
          orderBy: { changedAt: 'desc' },
        },
      },
      orderBy: { applicationDate: 'desc' },
    });

    // If needAttention is requested, filter applications with status in (APPLIED, ONLINE_ASSESSMENT, APPLICATION_VIEWED) and applicationDate > 10 days ago with no reply
    if (needAttention) {
      const tenDaysAgo = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);
      applications = applications.filter((app) => {
        const isPendingStatus = ['APPLIED', 'APPLICATION_VIEWED', 'ONLINE_ASSESSMENT'].includes(app.status);
        const isOld = new Date(app.applicationDate) < tenDaysAgo;
        const noReply = app.replyStatus === 'NO_REPLY';
        return isPendingStatus && isOld && noReply;
      });
    }

    return NextResponse.json({ applications, total: applications.length });
  } catch (error) {
    console.error('Failed to fetch applications:', error);
    return NextResponse.json({ error: 'Failed to fetch applications' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { companyName, role, department, location, workMode, jobType, package: pkg, salaryMin, salaryMax, jobUrl, source, resumeId, notes, tagNames } = body;

    let user = await prisma.user.findFirst();
    if (!user) {
      user = await prisma.user.create({
        data: { name: 'Smriti Priya Singh', email: 'smriti@example.com' },
      });
    }

    // 1. Find or create company
    let company = await prisma.company.findFirst({
      where: { name: { equals: companyName } },
    });
    if (!company) {
      company = await prisma.company.create({
        data: {
          name: companyName,
          logo: `https://ui-avatars.com/api/?name=${encodeURIComponent(companyName)}&background=0284c7&color=fff`,
        },
      });
    }

    // 2. Create Job Posting
    const jobPosting = await prisma.jobPosting.create({
      data: {
        companyId: company.id,
        role,
        department,
        location: location || 'Remote',
        workMode: workMode || 'REMOTE',
        jobType: jobType || 'FULL_TIME',
        package: pkg,
        salaryMin: salaryMin ? parseFloat(salaryMin) : null,
        salaryMax: salaryMax ? parseFloat(salaryMax) : null,
        jobUrl,
      },
    });

    // 3. Create Application
    const application = await prisma.application.create({
      data: {
        userId: user.id,
        jobPostingId: jobPosting.id,
        resumeId: resumeId || null,
        source: source || 'LinkedIn',
        status: 'APPLIED',
        notes,
        applicationDate: new Date(),
      },
    });

    // 4. Record Initial Timeline Event
    await prisma.applicationEvent.create({
      data: {
        applicationId: application.id,
        title: 'Application Created',
        description: `Applied for ${role} position via ${source || 'LinkedIn'}`,
        eventType: 'APPLIED',
      },
    });

    // 5. Record Status History
    await prisma.statusHistory.create({
      data: {
        applicationId: application.id,
        fromStatus: 'SAVED',
        toStatus: 'APPLIED',
        notes: 'Initial application submission',
      },
    });

    // 6. Record Activity Log
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        applicationId: application.id,
        action: 'APPLICATION_CREATED',
        details: `Created new application for ${role} at ${companyName}`,
      },
    });

    // 7. Increment current month goal count
    const month = new Date().getMonth() + 1;
    const year = new Date().getFullYear();
    await prisma.goal.upsert({
      where: { userId_month_year: { userId: user.id, month, year } },
      update: { currentApplications: { increment: 1 } },
      create: { userId: user.id, month, year, targetApplications: 40, currentApplications: 1 },
    });

    return NextResponse.json({ success: true, application });
  } catch (error) {
    console.error('Failed to create application:', error);
    return NextResponse.json({ error: 'Failed to create application' }, { status: 500 });
  }
}
