import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const action = body.action || 'load_demo';

    // Ensure default user exists
    let user = await prisma.user.findFirst();
    if (!user) {
      user = await prisma.user.create({
        data: {
          name: 'Smriti Priya Singh',
          email: 'smriti@example.com',
          image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        },
      });
    }

    if (action === 'clear') {
      // Clear all demo data
      await prisma.applicationEvent.deleteMany({});
      await prisma.interview.deleteMany({});
      await prisma.reminder.deleteMany({});
      await prisma.statusHistory.deleteMany({});
      await prisma.followUp.deleteMany({});
      await prisma.document.deleteMany({});
      await prisma.applicationTag.deleteMany({});
      await prisma.application.deleteMany({});
      await prisma.recruiter.deleteMany({});
      await prisma.jobPosting.deleteMany({});
      await prisma.resume.deleteMany({});
      await prisma.company.deleteMany({});

      return NextResponse.json({ success: true, message: 'Workspace reset to 100% empty.' });
    }

    if (action === 'load_demo') {
      // Clear existing records first
      await prisma.applicationEvent.deleteMany({});
      await prisma.interview.deleteMany({});
      await prisma.reminder.deleteMany({});
      await prisma.statusHistory.deleteMany({});
      await prisma.followUp.deleteMany({});
      await prisma.document.deleteMany({});
      await prisma.applicationTag.deleteMany({});
      await prisma.application.deleteMany({});
      await prisma.recruiter.deleteMany({});
      await prisma.jobPosting.deleteMany({});
      await prisma.resume.deleteMany({});
      await prisma.company.deleteMany({});

      // Create Demo Resumes
      const r1 = await prisma.resume.create({
        data: {
          userId: user.id,
          title: 'SOC Analyst Resume',
          versionTag: 'SOC-v1',
          targetRole: 'SOC Analyst / Threat Intel',
          fileUrl: 'https://example.com/resumes/soc-v1.pdf',
        },
      });

      const r2 = await prisma.resume.create({
        data: {
          userId: user.id,
          title: 'Security Engineer Resume',
          versionTag: 'SecEng-v2',
          targetRole: 'Cybersecurity Engineer',
          fileUrl: 'https://example.com/resumes/seceng-v2.pdf',
        },
      });

      // Create Demo Companies
      const c1 = await prisma.company.create({
        data: {
          name: 'CrowdStrike',
          website: 'https://crowdstrike.com',
          industry: 'Cybersecurity',
          headquarters: 'Austin, TX',
          notes: 'High technical bar. Focus on OS internals, detection engineering, & Falcon agent architecture.',
        },
      });

      const c2 = await prisma.company.create({
        data: {
          name: 'Microsoft',
          website: 'https://microsoft.com',
          industry: 'Cloud & Technology',
          headquarters: 'Redmond, WA',
          notes: 'Defender for Endpoint team. 4 rounds including system design and threat modeling.',
        },
      });

      const c3 = await prisma.company.create({
        data: {
          name: 'Palo Alto Networks',
          website: 'https://paloaltonetworks.com',
          industry: 'Network Security',
          headquarters: 'Santa Clara, CA',
          notes: 'Cortex XDR team. Focus on incident response & SIEM log analytics.',
        },
      });

      // Create Demo Job Postings
      const jp1 = await prisma.jobPosting.create({
        data: {
          companyId: c1.id,
          role: 'SOC Security Analyst L2',
          department: 'Managed Detection & Response',
          location: 'Remote, USA',
          workMode: 'REMOTE',
          jobType: 'FULL_TIME',
          package: '$135,000 /yr',
          salaryMin: 125000,
          salaryMax: 145000,
        },
      });

      const jp2 = await prisma.jobPosting.create({
        data: {
          companyId: c2.id,
          role: 'Cybersecurity Incident Response Engineer',
          department: 'Microsoft Threat Intelligence Center (MSTIC)',
          location: 'Redmond, WA / Hybrid',
          workMode: 'HYBRID',
          jobType: 'FULL_TIME',
          package: '$165,000 /yr + Equity',
          salaryMin: 150000,
          salaryMax: 180000,
        },
      });

      const jp3 = await prisma.jobPosting.create({
        data: {
          companyId: c3.id,
          role: 'Detection Engineer - Threat Hunting',
          department: 'Cortex XDR Engineering',
          location: 'Santa Clara, CA',
          workMode: 'ON_SITE',
          jobType: 'FULL_TIME',
          package: '$150,000 /yr',
          salaryMin: 140000,
          salaryMax: 160000,
        },
      });

      // Create Recruiters
      await prisma.recruiter.create({
        data: {
          companyId: c1.id,
          name: 'Alex Vance',
          email: 'alex.vance@crowdstrike.com',
          notes: 'Technical recruiter for Security Operations. Very responsive via email.',
        },
      });

      // Create Demo Applications
      const app1 = await prisma.application.create({
        data: {
          userId: user.id,
          jobPostingId: jp1.id,
          resumeId: r1.id,
          status: 'TECHNICAL_INTERVIEW',
          replyStatus: 'REPLIED',
          source: 'LinkedIn',
          applicationDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
          notes: 'Passed screening call with Alex. Technical interview scheduled on Falcon agent architecture.',
        },
      });

      const app2 = await prisma.application.create({
        data: {
          userId: user.id,
          jobPostingId: jp2.id,
          resumeId: r2.id,
          status: 'APPLIED',
          replyStatus: 'NO_REPLY',
          source: 'Company Website',
          applicationDate: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
          notes: 'Submitted customized SecEng resume emphasizing Sentinel KQL queries.',
        },
      });

      const app3 = await prisma.application.create({
        data: {
          userId: user.id,
          jobPostingId: jp3.id,
          resumeId: r1.id,
          status: 'OFFER',
          replyStatus: 'REPLIED',
          source: 'Referral',
          applicationDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          notes: 'Received official offer letter! Reviewing compensation package.',
        },
      });

      // Create Demo Events
      await prisma.applicationEvent.createMany({
        data: [
          {
            applicationId: app1.id,
            title: 'Recruiter Screening Call Completed',
            description: 'Discussed SOC analyst background, SIEM experience, and salary expectations with Alex Vance.',
            date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            eventType: 'RECRUITER_CALL',
          },
          {
            applicationId: app3.id,
            title: 'Official Offer Letter Received',
            description: 'Received written offer: $150k base + $20k signing bonus.',
            date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            eventType: 'OFFER_RECEIVED',
          },
        ],
      });

      // Create Scheduled Interview
      await prisma.interview.create({
        data: {
          applicationId: app1.id,
          title: 'Round 2: Technical Detection Architecture',
          scheduledAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
          interviewerNames: 'Marcus Brody (Lead Detection Engineer)',
          status: 'SCHEDULED',
          preparationNotes: 'Review Windows event logs, EDR telemetry, & MITRE ATT&CK mapping.',
        },
      });

      return NextResponse.json({ success: true, message: 'Demo data loaded successfully!' });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('Seed API error:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
