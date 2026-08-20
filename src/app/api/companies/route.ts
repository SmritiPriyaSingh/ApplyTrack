import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const companies = await prisma.company.findMany({
      include: {
        jobPostings: {
          include: {
            applications: {
              include: {
                resume: true,
              },
            },
          },
        },
        recruiters: true,
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({ companies });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch companies' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, notes } = body;

    const company = await prisma.company.update({
      where: { id },
      data: { notes },
    });

    return NextResponse.json({ success: true, company });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update company notes' }, { status: 500 });
  }
}
