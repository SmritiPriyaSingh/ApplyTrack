import { NextResponse } from 'next/server';
import { prisma, ensureDbInitialized } from '@/lib/prisma';
import { differenceInDays } from 'date-fns';

export async function GET() {
  try {
    await ensureDbInitialized();

    const user = await prisma.user.findFirst();
    if (!user) return NextResponse.json({ analytics: null, summary: null });

    const applications = await prisma.application.findMany({
      where: { userId: user.id },
      include: {
        jobPosting: { include: { company: true } },
        resume: true,
        statusHistory: true,
      },
    });

    const totalApplications = applications.length;
    const pendingCount = applications.filter((a) => ['APPLIED', 'APPLICATION_VIEWED', 'ONLINE_ASSESSMENT'].includes(a.status)).length;
    const interviewCount = applications.filter((a) => ['TECHNICAL_INTERVIEW', 'HR_INTERVIEW', 'FINAL_INTERVIEW'].includes(a.status)).length;
    const offerCount = applications.filter((a) => ['OFFER', 'JOINED'].includes(a.status)).length;
    const rejectionCount = applications.filter((a) => a.status === 'REJECTED').length;
    const ghostedCount = applications.filter((a) => a.status === 'GHOSTED' || a.isGhosted).length;

    const responseRate = totalApplications > 0 ? Math.round(((interviewCount + offerCount + rejectionCount) / totalApplications) * 100) : 0;
    const interviewRate = totalApplications > 0 ? Math.round(((interviewCount + offerCount) / totalApplications) * 100) : 0;
    const offerRate = totalApplications > 0 ? Math.round((offerCount / totalApplications) * 100) : 0;
    const ghostRate = totalApplications > 0 ? Math.round((ghostedCount / totalApplications) * 100) : 0;

    // Calculate Average Response Time in days (from APPLIED to first response in statusHistory)
    let totalResponseDays = 0;
    let respondedAppsCount = 0;

    for (const app of applications) {
      if (app.statusHistory.length > 1) {
        const sortedHistory = [...app.statusHistory].sort((a, b) => new Date(a.changedAt).getTime() - new Date(b.changedAt).getTime());
        const appliedStep = sortedHistory[0];
        const firstResponseStep = sortedHistory.find((s) => s.toStatus !== 'APPLIED' && s.toStatus !== 'SAVED');
        if (appliedStep && firstResponseStep) {
          const days = differenceInDays(new Date(firstResponseStep.changedAt), new Date(appliedStep.changedAt));
          if (days >= 0) {
            totalResponseDays += days;
            respondedAppsCount++;
          }
        }
      }
    }

    const avgResponseTimeDays = respondedAppsCount > 0 ? (totalResponseDays / respondedAppsCount).toFixed(1) : '7.5';

    // 1. Response Rate by Source
    const sourceStats: Record<string, { total: number; interviews: number }> = {};
    applications.forEach((app) => {
      const src = app.source || 'LinkedIn';
      if (!sourceStats[src]) sourceStats[src] = { total: 0, interviews: 0 };
      sourceStats[src].total++;
      if (['TECHNICAL_INTERVIEW', 'HR_INTERVIEW', 'FINAL_INTERVIEW', 'OFFER', 'JOINED'].includes(app.status)) {
        sourceStats[src].interviews++;
      }
    });

    const sourceBreakdown = Object.entries(sourceStats).map(([source, data]) => ({
      source,
      applications: data.total,
      interviews: data.interviews,
      successRate: data.total > 0 ? Math.round((data.interviews / data.total) * 100) : 0,
    }));

    // 2. Applications by Month
    const monthlyMap: Record<string, number> = {};
    applications.forEach((app) => {
      const date = new Date(app.applicationDate);
      const monthLabel = date.toLocaleString('default', { month: 'short' });
      monthlyMap[monthLabel] = (monthlyMap[monthLabel] || 0) + 1;
    });

    const monthlyBreakdown = Object.entries(monthlyMap).map(([month, count]) => ({
      month,
      applications: count,
    }));

    // 3. Applications by Location
    const locationMap: Record<string, number> = {};
    applications.forEach((app) => {
      const loc = app.jobPosting?.location || 'Remote';
      locationMap[loc] = (locationMap[loc] || 0) + 1;
    });

    const locationBreakdown = Object.entries(locationMap).map(([location, count]) => ({
      location,
      applications: count,
    }));

    // 4. Resume Performance Comparison
    const resumes = await prisma.resume.findMany({
      where: { userId: user.id },
      include: { applications: true },
    });

    const resumePerformance = resumes.map((res) => {
      const total = res.applications.length;
      const interviews = res.applications.filter((a) =>
        ['TECHNICAL_INTERVIEW', 'HR_INTERVIEW', 'FINAL_INTERVIEW', 'OFFER', 'JOINED'].includes(a.status)
      ).length;
      const offers = res.applications.filter((a) => ['OFFER', 'JOINED'].includes(a.status)).length;
      return {
        versionTag: res.versionTag,
        title: res.title,
        applications: total,
        interviews,
        offers,
        conversionRate: total > 0 ? Math.round((interviews / total) * 100) : 0,
      };
    });

    return NextResponse.json({
      summary: {
        totalApplications,
        pendingCount,
        interviewCount,
        offerCount,
        rejectionCount,
        ghostedCount,
        responseRate,
        interviewRate,
        offerRate,
        ghostRate,
        avgResponseTimeDays,
      },
      sourceBreakdown,
      monthlyBreakdown,
      locationBreakdown,
      resumePerformance,
    });
  } catch (error: any) {
    console.error('Failed to compute analytics:', error);
    console.error(error instanceof Error ? error.stack : error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : String(error),
        code: error?.code || null,
        stack: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : null) : undefined,
      },
      { status: 500 }
    );
  }
}
