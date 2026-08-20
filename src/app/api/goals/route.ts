import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const user = await prisma.user.findFirst();
    if (!user) return NextResponse.json({ goal: null });

    const month = new Date().getMonth() + 1;
    const year = new Date().getFullYear();

    let goal = await prisma.goal.findUnique({
      where: {
        userId_month_year: {
          userId: user.id,
          month,
          year,
        },
      },
    });

    if (!goal) {
      // Calculate current applications for this month
      const startOfMonth = new Date(year, month - 1, 1);
      const endOfMonth = new Date(year, month, 0);

      const count = await prisma.application.count({
        where: {
          userId: user.id,
          applicationDate: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
        },
      });

      goal = await prisma.goal.create({
        data: {
          userId: user.id,
          month,
          year,
          targetApplications: 40,
          currentApplications: count,
        },
      });
    }

    return NextResponse.json({ goal });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch goal' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { targetApplications } = body;

    const user = await prisma.user.findFirst();
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const month = new Date().getMonth() + 1;
    const year = new Date().getFullYear();

    const goal = await prisma.goal.upsert({
      where: {
        userId_month_year: {
          userId: user.id,
          month,
          year,
        },
      },
      update: {
        targetApplications: parseInt(targetApplications),
      },
      create: {
        userId: user.id,
        month,
        year,
        targetApplications: parseInt(targetApplications),
        currentApplications: 0,
      },
    });

    return NextResponse.json({ success: true, goal });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update goal' }, { status: 500 });
  }
}
