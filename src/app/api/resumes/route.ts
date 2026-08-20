import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const user = await prisma.user.findFirst();
    if (!user) return NextResponse.json({ resumes: [] });

    const resumes = await prisma.resume.findMany({
      where: { userId: user.id },
      include: {
        applications: {
          include: {
            jobPosting: { include: { company: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Compute metrics for each resume version
    const resumesWithStats = resumes.map((resume) => {
      const totalApps = resume.applications.length;
      const interviews = resume.applications.filter((a) =>
        ['TECHNICAL_INTERVIEW', 'HR_INTERVIEW', 'FINAL_INTERVIEW', 'OFFER', 'JOINED'].includes(a.status)
      ).length;
      const offers = resume.applications.filter((a) => ['OFFER', 'JOINED'].includes(a.status)).length;
      const responseRate = totalApps > 0 ? Math.round((interviews / totalApps) * 100) : 0;
      const offerRate = totalApps > 0 ? Math.round((offers / totalApps) * 100) : 0;

      return {
        ...resume,
        skillsList: resume.skills ? JSON.parse(resume.skills) : [],
        stats: {
          totalApps,
          interviews,
          offers,
          responseRate,
          offerRate,
        },
      };
    });

    return NextResponse.json({ resumes: resumesWithStats });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch resumes' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, versionTag, targetRole, skills, fileUrl } = body;

    let user = await prisma.user.findFirst();
    if (!user) {
      user = await prisma.user.create({
        data: { name: 'Smriti Priya Singh', email: 'smriti@example.com' },
      });
    }

    const resume = await prisma.resume.create({
      data: {
        userId: user.id,
        title: title || `${versionTag}.pdf`,
        fileUrl: fileUrl || `/documents/${title || 'resume'}.pdf`,
        versionTag: versionTag || 'v1',
        targetRole,
        skills: typeof skills === 'string' ? skills : JSON.stringify(skills || []),
      },
    });

    return NextResponse.json({ success: true, resume });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create resume' }, { status: 500 });
  }
}
