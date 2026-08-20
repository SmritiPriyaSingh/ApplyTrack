import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { differenceInDays } from 'date-fns';

export async function GET() {
  try {
    const user = await prisma.user.findFirst();
    if (!user) return NextResponse.json({ healthScore: null });

    const applications = await prisma.application.findMany({
      where: { userId: user.id },
      include: {
        jobPosting: { include: { company: true } },
        statusHistory: true,
      },
    });

    const total = applications.length;
    if (total === 0) {
      return NextResponse.json({
        score: 50,
        label: 'Getting Started',
        diagnostics: [{ status: 'warning', text: 'No applications submitted yet' }],
      });
    }

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const tenDaysAgo = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);

    const appsThisWeek = applications.filter((a) => new Date(a.applicationDate) >= sevenDaysAgo).length;
    const interviews = applications.filter((a) =>
      ['TECHNICAL_INTERVIEW', 'HR_INTERVIEW', 'FINAL_INTERVIEW', 'OFFER', 'JOINED'].includes(a.status)
    ).length;
    const offers = applications.filter((a) => ['OFFER', 'JOINED'].includes(a.status)).length;
    const overdueFollowUps = applications.filter((a) =>
      ['APPLIED', 'APPLICATION_VIEWED', 'ONLINE_ASSESSMENT'].includes(a.status) &&
      new Date(a.applicationDate) < tenDaysAgo &&
      a.replyStatus === 'NO_REPLY'
    ).length;

    const responseRate = Math.round((interviews / total) * 100);
    const interviewRate = Math.round((interviews / total) * 100);

    // Calculate score (out of 100)
    let score = 70; // Base score

    // Weekly velocity adjustment (+15 if applied 3+ this week)
    if (appsThisWeek >= 3) score += 10;
    else if (appsThisWeek === 0) score -= 10;

    // Response rate adjustment (+15 if response rate > 25%)
    if (responseRate >= 30) score += 15;
    else if (responseRate >= 15) score += 5;
    else score -= 10;

    // Follow-up discipline (-5 per overdue follow-up)
    score -= overdueFollowUps * 5;

    // Offer bonus
    if (offers > 0) score += 10;

    // Clamp score between 0 and 100
    score = Math.max(10, Math.min(100, score));

    // Diagnostics checklist
    const diagnostics = [
      {
        status: appsThisWeek >= 3 ? 'success' : 'warning',
        text: appsThisWeek >= 3 ? `${appsThisWeek} applications submitted this week` : 'Low application velocity this week',
      },
      {
        status: responseRate >= 20 ? 'success' : 'warning',
        text: responseRate >= 20 ? `Good interview response rate (${responseRate}%)` : `Low interview conversion (${responseRate}%)`,
      },
      {
        status: overdueFollowUps === 0 ? 'success' : 'danger',
        text: overdueFollowUps === 0 ? 'All applications actively followed up' : `Follow up needed for ${overdueFollowUps} inactive applications`,
      },
      {
        status: offers > 0 ? 'success' : 'neutral',
        text: offers > 0 ? `${offers} official job offer(s) won!` : 'Active in interview pipeline',
      },
    ];

    return NextResponse.json({
      score,
      appsThisWeek,
      responseRate,
      interviewRate,
      overdueFollowUps,
      diagnostics,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to compute health score' }, { status: 500 });
  }
}
