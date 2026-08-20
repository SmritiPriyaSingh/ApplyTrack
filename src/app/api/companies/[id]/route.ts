import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const company = await prisma.company.findUnique({
      where: { id: params.id },
      include: {
        jobPostings: {
          include: {
            applications: {
              include: {
                resume: true,
                recruiters: true,
                interviews: true,
                documents: true,
                events: true,
              },
            },
          },
        },
        recruiters: true,
      },
    });

    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    return NextResponse.json({ company });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch company details' }, { status: 500 });
  }
}
