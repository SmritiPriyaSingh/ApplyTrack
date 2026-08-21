export const HIRING_STAGES = [
  { id: 'SAVED', label: 'Saved', color: 'bg-[#1A1A1A] text-[#BFC3C7] border-white/10' },
  { id: 'APPLIED', label: 'Applied', color: 'bg-[#C3195D]/15 text-[#C3195D] border-[#C3195D]/30' },
  { id: 'APPLICATION_VIEWED', label: 'Viewed', color: 'bg-[#1A1A1A] text-[#EFECEC] border-white/10' },
  { id: 'ONLINE_ASSESSMENT', label: 'Assessment', color: 'bg-[#E2B85C]/15 text-[#E2B85C] border-[#E2B85C]/30' },
  { id: 'TECHNICAL_INTERVIEW', label: 'Tech Interview', color: 'bg-[#62929A]/20 text-[#62929A] border-[#62929A]/40' },
  { id: 'HR_INTERVIEW', label: 'HR Interview', color: 'bg-[#1A1A1A] text-[#EFECEC] border-white/10' },
  { id: 'FINAL_INTERVIEW', label: 'Final Interview', color: 'bg-[#C3195D]/25 text-[#EFECEC] border-[#C3195D]' },
  { id: 'OFFER', label: 'Offer Received', color: 'bg-[#6CBF84]/20 text-[#6CBF84] border-[#6CBF84]/40' },
  { id: 'JOINED', label: 'Joined', color: 'bg-[#6CBF84]/30 text-[#6CBF84] border-[#6CBF84]' },
  { id: 'REJECTED', label: 'Rejected', color: 'bg-[#D96C6C]/15 text-[#D96C6C] border-[#D96C6C]/30' },
  { id: 'GHOSTED', label: 'Ghosted', color: 'bg-[#0A0A0A] text-[#737373] border-white/5' },
] as const;

export const WORK_MODES = [
  { id: 'REMOTE', label: 'Remote' },
  { id: 'HYBRID', label: 'Hybrid' },
  { id: 'ON_SITE', label: 'On Site' },
] as const;

export const JOB_TYPES = [
  { id: 'FULL_TIME', label: 'Full Time' },
  { id: 'INTERNSHIP', label: 'Internship' },
  { id: 'CONTRACT', label: 'Contract' },
  { id: 'PART_TIME', label: 'Part Time' },
] as const;

export const SOURCES = [
  'LinkedIn',
  'Company Website',
  'YouTube',
  'Referral',
  'Campus Placement',
  'Indeed',
  'Glassdoor',
  'Wellfound / AngelList',
  'Recruiter Reachout',
] as const;

export const DEFAULT_TAGS = [
  { name: 'SOC', color: 'bg-[#1A1A1A] text-[#C3195D] border-white/10' },
  { name: 'Blue Team', color: 'bg-[#1A1A1A] text-[#EFECEC] border-white/10' },
  { name: 'DFIR', color: 'bg-[#1A1A1A] text-[#EFECEC] border-white/10' },
  { name: 'Cloud', color: 'bg-[#1A1A1A] text-[#62929A] border-white/10' },
  { name: 'Python', color: 'bg-[#1A1A1A] text-[#EFECEC] border-white/10' },
  { name: 'Linux', color: 'bg-[#1A1A1A] text-[#EFECEC] border-white/10' },
  { name: 'Remote', color: 'bg-[#1A1A1A] text-[#C3195D] border-white/10' },
  { name: 'Dream Company', color: 'bg-[#1A1A1A] text-[#EFECEC] border-white/10' },
] as const;
