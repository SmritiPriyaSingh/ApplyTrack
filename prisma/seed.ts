import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting ApplyTrack database seeding...');

  // Clean existing tables
  await prisma.activityLog.deleteMany();
  await prisma.reminder.deleteMany();
  await prisma.document.deleteMany();
  await prisma.interview.deleteMany();
  await prisma.followUp.deleteMany();
  await prisma.recruiter.deleteMany();
  await prisma.statusHistory.deleteMany();
  await prisma.applicationEvent.deleteMany();
  await prisma.applicationTag.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.application.deleteMany();
  await prisma.jobPosting.deleteMany();
  await prisma.company.deleteMany();
  await prisma.resume.deleteMany();
  await prisma.goal.deleteMany();
  await prisma.user.deleteMany();

  // 1. Create Default User
  const user = await prisma.user.create({
    data: {
      name: 'Smriti Priya Singh',
      email: 'smriti@example.com',
      image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    },
  });

  console.log('👤 Created user:', user.name);

  // 2. Create Resumes
  const resumeSOCv1 = await prisma.resume.create({
    data: {
      userId: user.id,
      title: 'Resume_SOC_v1.pdf',
      fileUrl: '/documents/Resume_SOC_v1.pdf',
      fileSize: '1.4 MB',
      versionTag: 'SOC_v1',
      targetRole: 'SOC Analyst / Tier 1 Security Specialist',
      skills: JSON.stringify(['Splunk', 'Wireshark', 'SIEM', 'Incident Response', 'Linux', 'Network Security']),
      isDefault: false,
    },
  });

  const resumeSOCv2 = await prisma.resume.create({
    data: {
      userId: user.id,
      title: 'Resume_SOC_v2.pdf',
      fileUrl: '/documents/Resume_SOC_v2.pdf',
      fileSize: '1.5 MB',
      versionTag: 'SOC_v2',
      targetRole: 'Senior SOC Analyst / Threat Hunter',
      skills: JSON.stringify(['CrowdStrike Falcon', 'Sentinel', 'Python', 'DFIR', 'YARA', 'Threat Intelligence', 'MITRE ATT&CK']),
      isDefault: true,
    },
  });

  const resumeDev = await prisma.resume.create({
    data: {
      userId: user.id,
      title: 'Resume_Developer.pdf',
      fileUrl: '/documents/Resume_Developer.pdf',
      fileSize: '1.2 MB',
      versionTag: 'Developer',
      targetRole: 'Full Stack Engineer / Security Automation',
      skills: JSON.stringify(['TypeScript', 'React', 'Next.js', 'Python', 'Node.js', 'Prisma', 'Tailwind CSS', 'Docker']),
      isDefault: false,
    },
  });

  const resumeGeneral = await prisma.resume.create({
    data: {
      userId: user.id,
      title: 'Resume_General.pdf',
      fileUrl: '/documents/Resume_General.pdf',
      fileSize: '1.1 MB',
      versionTag: 'General',
      targetRole: 'IT Security & Systems Administrator',
      skills: JSON.stringify(['Active Directory', 'Networking', 'TCP/IP', 'Linux', 'Bash', 'Troubleshooting']),
      isDefault: false,
    },
  });

  console.log('📄 Created 4 resume versions');

  // 3. Create Tags
  const tagsData = [
    { name: 'SOC', color: '#06b6d4' },
    { name: 'Blue Team', color: '#3b82f6' },
    { name: 'DFIR', color: '#a855f7' },
    { name: 'Cloud', color: '#0284c7' },
    { name: 'Python', color: '#10b981' },
    { name: 'Linux', color: '#f59e0b' },
    { name: 'Remote', color: '#14b8a6' },
    { name: 'Dream Company', color: '#f43f5e' },
  ];

  const createdTags: Record<string, string> = {};
  for (const t of tagsData) {
    const tag = await prisma.tag.create({ data: t });
    createdTags[t.name] = tag.id;
  }

  // 4. Create Companies & Job Postings & Applications
  const microsoft = await prisma.company.create({
    data: {
      name: 'Microsoft',
      logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/azure/azure-original.svg',
      website: 'https://microsoft.com',
      glassdoor: 'https://glassdoor.com/Overview/Working-at-Microsoft-EI_IE1651.htm',
      industry: 'Cloud & Cyber Security',
      headquarters: 'Redmond, WA',
      careerPage: 'https://careers.microsoft.com',
      notes: 'Very structured hiring process. Technical round covers Windows Internals, Azure Sentinel, and Incident Response triage. High internal mobility.',
    },
  });

  const crowdstrike = await prisma.company.create({
    data: {
      name: 'CrowdStrike',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/4/4b/CrowdStrike_logo.svg',
      website: 'https://crowdstrike.com',
      glassdoor: 'https://glassdoor.com/Overview/Working-at-CrowdStrike-EI_IE698544.htm',
      industry: 'Cybersecurity & Endpoint Protection',
      headquarters: 'Austin, TX',
      careerPage: 'https://crowdstrike.com/careers',
      notes: 'Premier threat detection company. Interview panel asks practical scenario questions on malware analysis, memory dumps, and EDR detection evasion.',
    },
  });

  const google = await prisma.company.create({
    data: {
      name: 'Google',
      logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg',
      website: 'https://google.com',
      glassdoor: 'https://glassdoor.com/Overview/Working-at-Google-EI_IE9079.htm',
      industry: 'Internet & Cloud Infrastructure',
      headquarters: 'Mountain View, CA',
      careerPage: 'https://careers.google.com',
      notes: 'Recruiter reach-out via LinkedIn. 4 rounds of interviews including Googleyness, coding in Python, and system threat modeling.',
    },
  });

  const openai = await prisma.company.create({
    data: {
      name: 'OpenAI',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/4/4d/OpenAI_Logo.svg',
      website: 'https://openai.com',
      glassdoor: 'https://glassdoor.com/Overview/Working-at-OpenAI-EI_IE1723528.htm',
      industry: 'Artificial Intelligence',
      headquarters: 'San Francisco, CA',
      careerPage: 'https://openai.com/careers',
      notes: 'Fast-moving team. Looking for automated incident response engineers who can write Python scripts and harden cloud LLM infra.',
    },
  });

  const vercel = await prisma.company.create({
    data: {
      name: 'Vercel',
      logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg',
      website: 'https://vercel.com',
      glassdoor: 'https://glassdoor.com/Overview/Working-at-Vercel-EI_IE3155700.htm',
      industry: 'Developer Experience Platform',
      headquarters: 'Remote / San Francisco',
      careerPage: 'https://vercel.com/careers',
      notes: 'Great engineering leadership. Requested 1-hour live coding session building a security header validator in Next.js.',
    },
  });

  const stripe = await prisma.company.create({
    data: {
      name: 'Stripe',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg',
      website: 'https://stripe.com',
      glassdoor: 'https://glassdoor.com/Overview/Working-at-Stripe-EI_IE671932.htm',
      industry: 'Financial Technology',
      headquarters: 'San Francisco, CA',
      careerPage: 'https://stripe.com/jobs',
      notes: 'High bar for code quality. Security triage challenge was very realistic and fun.',
    },
  });

  // Application 1: CrowdStrike - Senior SOC Analyst (TECHNICAL_INTERVIEW)
  const jpCrowdStrike = await prisma.jobPosting.create({
    data: {
      companyId: crowdstrike.id,
      role: 'Senior Threat Analyst / SOC Engineer',
      department: 'Global Threat Graph Team',
      location: 'Remote, US',
      workMode: 'REMOTE',
      jobType: 'FULL_TIME',
      package: '$135,000 - $155,000 + Stock Options',
      salaryMin: 135000,
      salaryMax: 155000,
      jobUrl: 'https://crowdstrike.com/careers/soc-engineer-1092',
      deadline: new Date('2026-09-15'),
      description: 'Analyze adversary TTPs, write YARA and Falcon rules, conduct threat hunting across cloud environments.',
    },
  });

  const appCrowdStrike = await prisma.application.create({
    data: {
      userId: user.id,
      jobPostingId: jpCrowdStrike.id,
      resumeId: resumeSOCv2.id,
      source: 'LinkedIn',
      status: 'TECHNICAL_INTERVIEW',
      replyStatus: 'REPLIED',
      replyChannel: 'INTERVIEW_INVITATION',
      replyDate: new Date('2026-08-10'),
      applicationDate: new Date('2026-08-02'),
      notes: 'Passed initial recruiter screening. Technical round scheduled with Lead Security Architect. Prepared Linux kernel malware memory analysis notes.',
      rating: 5,
    },
  });

  await prisma.applicationTag.createMany({
    data: [
      { applicationId: appCrowdStrike.id, tagId: createdTags['SOC'] },
      { applicationId: appCrowdStrike.id, tagId: createdTags['Blue Team'] },
      { applicationId: appCrowdStrike.id, tagId: createdTags['DFIR'] },
      { applicationId: appCrowdStrike.id, tagId: createdTags['Dream Company'] },
    ],
  });

  await prisma.recruiter.create({
    data: {
      applicationId: appCrowdStrike.id,
      companyId: crowdstrike.id,
      name: 'Alex Vance',
      email: 'alex.vance@crowdstrike.com',
      phone: '+1 (512) 890-3412',
      linkedin: 'https://linkedin.com/in/alexvance-recruiter',
      notes: 'Very helpful recruiter. Sent detailed prep guide for the threat hunting technical round.',
    },
  });

  await prisma.interview.create({
    data: {
      applicationId: appCrowdStrike.id,
      title: 'Technical Round 2: Memory & Malware Triage',
      interviewType: 'TECHNICAL',
      scheduledAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
      durationMinutes: 60,
      interviewerNames: 'David Miller (Principal Threat Hunter)',
      meetingUrl: 'https://zoom.us/j/98124719283',
      status: 'SCHEDULED',
      preparationNotes: 'Review Volatility commands, YARA syntax, and CrowdStrike Query Language (CQL).',
    },
  });

  await prisma.applicationEvent.createMany({
    data: [
      { applicationId: appCrowdStrike.id, title: 'Applied via LinkedIn', eventType: 'APPLIED', date: new Date('2026-08-02') },
      { applicationId: appCrowdStrike.id, title: 'Recruiter Email Received', description: 'Alex invited for initial 30-min screen', eventType: 'RECRUITER_EMAIL', date: new Date('2026-08-05') },
      { applicationId: appCrowdStrike.id, title: 'HR Screening Passed', description: 'Feedback: Excellent background in SIEM and Falcon', eventType: 'INTERVIEW', date: new Date('2026-08-09') },
      { applicationId: appCrowdStrike.id, title: 'Technical Interview Scheduled', description: 'Scheduled for 2 days from now', eventType: 'INTERVIEW', date: new Date('2026-08-12') },
    ],
  });

  await prisma.statusHistory.createMany({
    data: [
      { applicationId: appCrowdStrike.id, fromStatus: 'SAVED', toStatus: 'APPLIED', changedAt: new Date('2026-08-02') },
      { applicationId: appCrowdStrike.id, fromStatus: 'APPLIED', toStatus: 'HR_INTERVIEW', changedAt: new Date('2026-08-09') },
      { applicationId: appCrowdStrike.id, fromStatus: 'HR_INTERVIEW', toStatus: 'TECHNICAL_INTERVIEW', changedAt: new Date('2026-08-12') },
    ],
  });

  // Application 2: Microsoft - Cloud Security Engineer (OFFER)
  const jpMicrosoft = await prisma.jobPosting.create({
    data: {
      companyId: microsoft.id,
      role: 'Cloud Security Analyst / SOC Engineer',
      department: 'Azure Sentinel & Security Operations',
      location: 'Hybrid - Redmond, WA',
      workMode: 'HYBRID',
      jobType: 'FULL_TIME',
      package: '$140,000 + $20k Signing Bonus',
      salaryMin: 140000,
      salaryMax: 160000,
      jobUrl: 'https://careers.microsoft.com/us/en/job/1829471',
      deadline: new Date('2026-08-30'),
    },
  });

  const appMicrosoft = await prisma.application.create({
    data: {
      userId: user.id,
      jobPostingId: jpMicrosoft.id,
      resumeId: resumeSOCv2.id,
      source: 'Referral',
      status: 'OFFER',
      replyStatus: 'REPLIED',
      replyChannel: 'EMAIL',
      replyDate: new Date('2026-08-18'),
      applicationDate: new Date('2026-07-15'),
      notes: 'Received official offer letter! Base $140,000 + $20k bonus + 40k equity vest over 4 yrs. Negotiating start date.',
      rating: 5,
    },
  });

  await prisma.applicationTag.createMany({
    data: [
      { applicationId: appMicrosoft.id, tagId: createdTags['Cloud'] },
      { applicationId: appMicrosoft.id, tagId: createdTags['Blue Team'] },
      { applicationId: appMicrosoft.id, tagId: createdTags['Dream Company'] },
    ],
  });

  await prisma.document.create({
    data: {
      applicationId: appMicrosoft.id,
      name: 'Microsoft_Offer_Letter_2026.pdf',
      docType: 'OFFER_LETTER',
      fileUrl: '/documents/Microsoft_Offer_Letter_2026.pdf',
      fileSize: '2.1 MB',
    },
  });

  await prisma.applicationEvent.createMany({
    data: [
      { applicationId: appMicrosoft.id, title: 'Applied with Referral', eventType: 'APPLIED', date: new Date('2026-07-15') },
      { applicationId: appMicrosoft.id, title: 'Technical Screen Passed', eventType: 'INTERVIEW', date: new Date('2026-07-25') },
      { applicationId: appMicrosoft.id, title: 'Final Loop Completed', eventType: 'INTERVIEW', date: new Date('2026-08-10') },
      { applicationId: appMicrosoft.id, title: 'Official Offer Letter Received!', description: 'Base 140k + 20k bonus', eventType: 'OFFER', date: new Date('2026-08-18') },
    ],
  });

  await prisma.statusHistory.createMany({
    data: [
      { applicationId: appMicrosoft.id, fromStatus: 'SAVED', toStatus: 'APPLIED', changedAt: new Date('2026-07-15') },
      { applicationId: appMicrosoft.id, fromStatus: 'APPLIED', toStatus: 'TECHNICAL_INTERVIEW', changedAt: new Date('2026-07-25') },
      { applicationId: appMicrosoft.id, fromStatus: 'TECHNICAL_INTERVIEW', toStatus: 'FINAL_INTERVIEW', changedAt: new Date('2026-08-10') },
      { applicationId: appMicrosoft.id, fromStatus: 'FINAL_INTERVIEW', toStatus: 'OFFER', changedAt: new Date('2026-08-18') },
    ],
  });

  // Application 3: Google - Security Operations Intern (ONLINE_ASSESSMENT) - Needs Attention / Pending reply
  const jpGoogle = await prisma.jobPosting.create({
    data: {
      companyId: google.id,
      role: 'Security Operations & Automation Engineer',
      department: 'Google Cloud Security',
      location: 'Sunnyvale, CA',
      workMode: 'ON_SITE',
      jobType: 'FULL_TIME',
      package: '$145,000 / yr',
      salaryMin: 145000,
      salaryMax: 155000,
      jobUrl: 'https://careers.google.com/jobs/results/9018471',
    },
  });

  const appGoogle = await prisma.application.create({
    data: {
      userId: user.id,
      jobPostingId: jpGoogle.id,
      resumeId: resumeSOCv1.id,
      source: 'Company Website',
      status: 'ONLINE_ASSESSMENT',
      replyStatus: 'NO_REPLY',
      applicationDate: new Date('2026-08-01'), // 19 days ago, no reply -> Need Attention!
      notes: 'Completed Online Assessment on Aug 3. No recruiter update for 17 days. Need to send follow-up email to recruiter.',
      rating: 4,
    },
  });

  await prisma.applicationTag.createMany({
    data: [
      { applicationId: appGoogle.id, tagId: createdTags['Python'] },
      { applicationId: appGoogle.id, tagId: createdTags['Linux'] },
      { applicationId: appGoogle.id, tagId: createdTags['Dream Company'] },
    ],
  });

  await prisma.recruiter.create({
    data: {
      applicationId: appGoogle.id,
      companyId: google.id,
      name: 'Sarah Lin',
      email: 'sarahlin@google.com',
      linkedin: 'https://linkedin.com/in/sarahlin-google',
      notes: 'Recruiter assigned for Google Cloud Security roles.',
    },
  });

  await prisma.followUp.create({
    data: {
      applicationId: appGoogle.id,
      scheduledDate: new Date('2026-08-14'), // overdue follow-up!
      type: 'EMAIL',
      notes: 'Send politely worded check-in regarding Online Assessment results.',
      status: 'PENDING',
    },
  });

  // Application 4: OpenAI - Cyber Defense Engineer (APPLIED - Inactive 12 days -> Needs Attention!)
  const jpOpenAI = await prisma.jobPosting.create({
    data: {
      companyId: openai.id,
      role: 'Cyber Defense & Security Operations Specialist',
      department: 'Security Operations & Detection',
      location: 'San Francisco, CA',
      workMode: 'HYBRID',
      jobType: 'FULL_TIME',
      package: '$160,000 - $185,000',
      salaryMin: 160000,
      salaryMax: 185000,
      jobUrl: 'https://openai.com/careers/cyber-defense',
    },
  });

  const appOpenAI = await prisma.application.create({
    data: {
      userId: user.id,
      jobPostingId: jpOpenAI.id,
      resumeId: resumeSOCv2.id,
      source: 'LinkedIn',
      status: 'APPLIED',
      replyStatus: 'NO_REPLY',
      applicationDate: new Date('2026-08-08'), // 12 days ago, no reply -> Need Attention!
      notes: 'Applied with SOC v2 resume. High interest in AI infrastructure security.',
      rating: 5,
    },
  });

  await prisma.applicationTag.createMany({
    data: [
      { applicationId: appOpenAI.id, tagId: createdTags['Python'] },
      { applicationId: appOpenAI.id, tagId: createdTags['Cloud'] },
      { applicationId: appOpenAI.id, tagId: createdTags['Dream Company'] },
    ],
  });

  // Application 5: Vercel - Full Stack Security Engineer (HR_INTERVIEW)
  const jpVercel = await prisma.jobPosting.create({
    data: {
      companyId: vercel.id,
      role: 'Full Stack & Security Operations Engineer',
      department: 'Platform Security',
      location: 'Remote',
      workMode: 'REMOTE',
      jobType: 'FULL_TIME',
      package: '$130,000 - $150,000',
      salaryMin: 130000,
      salaryMax: 150000,
      jobUrl: 'https://vercel.com/careers/sec-eng',
    },
  });

  const appVercel = await prisma.application.create({
    data: {
      userId: user.id,
      jobPostingId: jpVercel.id,
      resumeId: resumeDev.id,
      source: 'Company Website',
      status: 'HR_INTERVIEW',
      replyStatus: 'REPLIED',
      replyChannel: 'EMAIL',
      replyDate: new Date('2026-08-16'),
      applicationDate: new Date('2026-08-11'),
      notes: 'HR conversation went great. Discussed open-source contributions and Next.js familiarity.',
      rating: 4,
    },
  });

  await prisma.applicationTag.createMany({
    data: [
      { applicationId: appVercel.id, tagId: createdTags['Remote'] },
      { applicationId: appVercel.id, tagId: createdTags['Python'] },
    ],
  });

  await prisma.interview.create({
    data: {
      applicationId: appVercel.id,
      title: 'HR Culture & Values Chat',
      interviewType: 'HR',
      scheduledAt: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // 4 days from now
      durationMinutes: 30,
      interviewerNames: 'Elena Rostova (Head of Talent)',
      meetingUrl: 'https://meet.google.com/xyz-abc-def',
      status: 'SCHEDULED',
    },
  });

  // Application 6: Stripe - Infrastructure Security (GHOSTED)
  const jpStripe = await prisma.jobPosting.create({
    data: {
      companyId: stripe.id,
      role: 'Infrastructure & Threat Analyst',
      department: 'Security Engineering',
      location: 'San Francisco, CA',
      workMode: 'HYBRID',
      jobType: 'FULL_TIME',
      package: '$140,000',
      salaryMin: 140000,
      salaryMax: 140000,
    },
  });

  const appStripe = await prisma.application.create({
    data: {
      userId: user.id,
      jobPostingId: jpStripe.id,
      resumeId: resumeGeneral.id,
      source: 'LinkedIn',
      status: 'GHOSTED',
      replyStatus: 'GHOSTED',
      isGhosted: true,
      applicationDate: new Date('2026-06-10'),
      notes: 'No response after 45 days. Marked as ghosted.',
      rating: 2,
    },
  });

  // Add 5 more applications across various statuses for rich analytics
  const extraApps = [
    { company: microsoft, role: 'SOC Analyst Tier 1', resume: resumeSOCv1, status: 'REJECTED', source: 'Campus Placement', date: new Date('2026-06-01') },
    { company: crowdstrike, role: 'Incident Response Intern', resume: resumeSOCv1, status: 'APPLICATION_VIEWED', source: 'LinkedIn', date: new Date('2026-08-15') },
    { company: google, role: 'Detection Engineer', resume: resumeSOCv2, status: 'TECHNICAL_INTERVIEW', source: 'Referral', date: new Date('2026-08-05') },
    { company: stripe, role: 'Security Analyst - Fraud', resume: resumeSOCv1, status: 'SAVED', source: 'LinkedIn', date: new Date('2026-08-19') },
    { company: vercel, role: 'Security Compliance Associate', resume: resumeGeneral, status: 'APPLIED', source: 'Indeed', date: new Date('2026-08-17') },
  ];

  for (const extra of extraApps) {
    const jp = await prisma.jobPosting.create({
      data: {
        companyId: extra.company.id,
        role: extra.role,
        location: 'Remote',
        workMode: 'REMOTE',
        jobType: 'FULL_TIME',
        package: '$110,000 - $130,000',
      },
    });

    await prisma.application.create({
      data: {
        userId: user.id,
        jobPostingId: jp.id,
        resumeId: extra.resume.id,
        source: extra.source,
        status: extra.status,
        applicationDate: extra.date,
      },
    });
  }

  // 5. Create Monthly Goal
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  await prisma.goal.create({
    data: {
      userId: user.id,
      month: currentMonth,
      year: currentYear,
      targetApplications: 40,
      currentApplications: 27,
    },
  });

  // 6. Create Reminders
  await prisma.reminder.createMany({
    data: [
      {
        userId: user.id,
        applicationId: appCrowdStrike.id,
        title: 'Prep CrowdStrike Technical Interview: Volatility & YARA',
        description: 'Review memory analysis commands and threat hunting queries in CQL.',
        dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
        priority: 'HIGH',
      },
      {
        userId: user.id,
        applicationId: appGoogle.id,
        title: 'Follow up with Sarah Lin (Google Recruiter)',
        description: 'Overdue check-in for Online Assessment results submitted 17 days ago.',
        dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        priority: 'HIGH',
      },
      {
        userId: user.id,
        applicationId: appVercel.id,
        title: 'Review Next.js Security Best Practices for Vercel HR Chat',
        description: 'Prepare examples of CSP, CORS, and auth middleware security headers.',
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        priority: 'MEDIUM',
      },
    ],
  });

  // 7. Create Activity Logs
  await prisma.activityLog.createMany({
    data: [
      { userId: user.id, applicationId: appMicrosoft.id, action: 'STATUS_UPDATED', details: 'Status moved from FINAL_INTERVIEW to OFFER for Microsoft' },
      { userId: user.id, applicationId: appCrowdStrike.id, action: 'INTERVIEW_ADDED', details: 'Scheduled Technical Round 2 with CrowdStrike' },
      { userId: user.id, applicationId: appGoogle.id, action: 'NOTE_ADDED', details: 'Added note: No recruiter update for 17 days' },
      { userId: user.id, applicationId: appOpenAI.id, action: 'RESUME_CHANGED', details: 'Attached Resume_SOC_v2.pdf to OpenAI Cyber Defense role' },
    ],
  });

  console.log('✅ ApplyTrack database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
