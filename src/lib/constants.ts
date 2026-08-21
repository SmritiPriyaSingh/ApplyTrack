export const HIRING_STAGES = [
  { id: 'SAVED', label: 'Saved', color: 'bg-[#1A1A1A] text-[#BFC3C7] border-white/10' },
  { id: 'APPLIED', label: 'Applied', color: 'bg-[#C3195D]/15 text-[#C3195D] border-[#C3195D]/30' },
  { id: 'APPLICATION_VIEWED', label: 'Viewed', color: 'bg-[#1A1A1A] text-[#EFECEC] border-white/10' },
  { id: 'ONLINE_ASSESSMENT', label: 'Assessment / Exam', color: 'bg-[#E2B85C]/15 text-[#E2B85C] border-[#E2B85C]/30' },
  { id: 'TECHNICAL_INTERVIEW', label: 'Tech Interview / Round 1', color: 'bg-[#62929A]/20 text-[#62929A] border-[#62929A]/40' },
  { id: 'HR_INTERVIEW', label: 'HR Interview / Round 2', color: 'bg-[#1A1A1A] text-[#EFECEC] border-white/10' },
  { id: 'FINAL_INTERVIEW', label: 'Final Interview / Selection', color: 'bg-[#C3195D]/25 text-[#EFECEC] border-[#C3195D]' },
  { id: 'OFFER', label: 'Offer / Selected / Rank', color: 'bg-[#6CBF84]/20 text-[#6CBF84] border-[#6CBF84]/40' },
  { id: 'JOINED', label: 'Joined / Enrolled', color: 'bg-[#6CBF84]/30 text-[#6CBF84] border-[#6CBF84]' },
  { id: 'REJECTED', label: 'Not Selected', color: 'bg-[#D96C6C]/15 text-[#D96C6C] border-[#D96C6C]/30' },
  { id: 'GHOSTED', label: 'No Response', color: 'bg-[#0A0A0A] text-[#737373] border-white/5' },
] as const;

export const OPPORTUNITY_TYPES = [
  { id: 'JOB', label: '💼 Job Application', companyLabel: 'Company / Organization', roleLabel: 'Role Title' },
  { id: 'GOVT_PROGRAM', label: '🏛️ Govt Program & Fellowship', companyLabel: 'Government Portal / Ministry', roleLabel: 'Program / Fellowship Title' },
  { id: 'HACKATHON_CTF', label: '🏆 Hackathon & CTF Challenge', companyLabel: 'Organizer / Platform', roleLabel: 'Hackathon / CTF Title' },
  { id: 'EXAM_ADMISSION', label: '📝 Entrance Exam & College Admission', companyLabel: 'Conducting Body / Institution', roleLabel: 'Exam / Course Name' },
  { id: 'SCHOLARSHIP', label: '🏅 Scholarship & Competition', companyLabel: 'Sponsoring Organization', roleLabel: 'Scholarship / Award Title' },
] as const;

export const WORK_MODES = [
  { id: 'REMOTE', label: 'Remote / Online' },
  { id: 'HYBRID', label: 'Hybrid' },
  { id: 'ON_SITE', label: 'On Site / Physical Visit' },
] as const;

export const JOB_TYPES = [
  { id: 'FULL_TIME', label: 'Full Time' },
  { id: 'INTERNSHIP', label: 'Internship / Trainee' },
  { id: 'CONTRACT', label: 'Contract / Project' },
  { id: 'PART_TIME', label: 'Part Time' },
] as const;

export const SOURCES = [
  'LinkedIn',
  'Company Website',
  'Government Portal',
  'YouTube',
  'Hackathon / CTF Platform',
  'College / Institution Portal',
  'Referral',
  'Campus Placement',
  'Indeed',
  'Glassdoor',
  'Wellfound / AngelList',
  'Recruiter Reachout',
] as const;

export const DEFAULT_TAGS = [
  { name: 'Full Stack', color: 'bg-[#1A1A1A] text-[#C3195D] border-white/10' },
  { name: 'Govt Fellowship', color: 'bg-[#1A1A1A] text-[#E2B85C] border-white/10' },
  { name: 'CTF', color: 'bg-[#1A1A1A] text-[#62929A] border-white/10' },
  { name: 'Hackathon', color: 'bg-[#1A1A1A] text-[#C3195D] border-white/10' },
  { name: 'Entrance Exam', color: 'bg-[#1A1A1A] text-[#EFECEC] border-white/10' },
  { name: 'Remote', color: 'bg-[#1A1A1A] text-[#C3195D] border-white/10' },
] as const;
