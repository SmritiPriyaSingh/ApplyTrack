export interface ApplicationTypeConfig {
  id: string;
  label: string;
  description: string;
  iconName: string;
  requiresResume: boolean;
  fields: {
    primaryLabel: string;
    secondaryLabel: string;
    showSalary?: boolean;
    salaryLabel?: string;
    showLocation?: boolean;
    locationLabel?: string;
    showJobUrl?: boolean;
    urlLabel?: string;
  };
  stages: { id: string; label: string; color: string }[];
}

export const APPLICATION_TYPES: Record<string, ApplicationTypeConfig> = {
  JOB: {
    id: 'JOB',
    label: 'Job Application',
    description: 'Corporate, Full-Time, Internship & Contract Job Opportunities',
    iconName: 'Briefcase',
    requiresResume: true,
    fields: {
      primaryLabel: 'Company Name *',
      secondaryLabel: 'Role Title *',
      showSalary: true,
      salaryLabel: 'Salary Package',
      showLocation: true,
      locationLabel: 'Location',
      showJobUrl: true,
      urlLabel: 'Job Posting Link',
    },
    stages: [
      { id: 'APPLIED', label: 'Applied', color: 'bg-[#C3195D]/15 text-[#C3195D] border-[#C3195D]/30' },
      { id: 'APPLICATION_VIEWED', label: 'Viewed', color: 'bg-[#1A1A1A] text-[#EFECEC] border-white/10' },
      { id: 'ONLINE_ASSESSMENT', label: 'Assessment', color: 'bg-[#E2B85C]/15 text-[#E2B85C] border-[#E2B85C]/30' },
      { id: 'TECHNICAL_INTERVIEW', label: 'Interview 1 (Tech)', color: 'bg-[#62929A]/20 text-[#62929A] border-[#62929A]/40' },
      { id: 'HR_INTERVIEW', label: 'Interview 2 (HR)', color: 'bg-[#1A1A1A] text-[#EFECEC] border-white/10' },
      { id: 'FINAL_INTERVIEW', label: 'Final Interview', color: 'bg-[#C3195D]/25 text-[#EFECEC] border-[#C3195D]' },
      { id: 'OFFER', label: 'Offer Received', color: 'bg-[#6CBF84]/20 text-[#6CBF84] border-[#6CBF84]/40' },
      { id: 'JOINED', label: 'Joined / Accepted', color: 'bg-[#6CBF84]/30 text-[#6CBF84] border-[#6CBF84]' },
      { id: 'REJECTED', label: 'Rejected', color: 'bg-[#D96C6C]/15 text-[#D96C6C] border-[#D96C6C]/30' },
      { id: 'GHOSTED', label: 'Ghosted', color: 'bg-[#0A0A0A] text-[#737373] border-white/5' },
    ],
  },

  EXAM: {
    id: 'EXAM',
    label: 'Competitive Exam',
    description: 'GATE, CAT, UPSC, GRE, Government & Entrance Examinations',
    iconName: 'FileText',
    requiresResume: false,
    fields: {
      primaryLabel: 'Conducting Organization *',
      secondaryLabel: 'Exam Name *',
      showSalary: false,
      showLocation: true,
      locationLabel: 'Exam Center City',
      showJobUrl: true,
      urlLabel: 'Official Exam Portal Link',
    },
    stages: [
      { id: 'EXAM_REGISTERED', label: 'Registered', color: 'bg-[#C3195D]/15 text-[#C3195D] border-[#C3195D]/30' },
      { id: 'FEE_PAID', label: 'Fee Paid', color: 'bg-[#1A1A1A] text-[#EFECEC] border-white/10' },
      { id: 'ADMIT_CARD_RELEASED', label: 'Admit Card Released', color: 'bg-[#E2B85C]/15 text-[#E2B85C] border-[#E2B85C]/30' },
      { id: 'EXAM_COMPLETED', label: 'Exam Completed', color: 'bg-[#62929A]/20 text-[#62929A] border-[#62929A]/40' },
      { id: 'RESULT_DECLARED', label: 'Result Declared', color: 'bg-[#1A1A1A] text-[#EFECEC] border-white/10' },
      { id: 'QUALIFIED', label: 'Qualified', color: 'bg-[#6CBF84]/20 text-[#6CBF84] border-[#6CBF84]/40' },
      { id: 'COUNSELLING', label: 'Counselling Round', color: 'bg-[#C3195D]/25 text-[#EFECEC] border-[#C3195D]' },
      { id: 'EXAM_ADMISSION', label: 'Admission Secured', color: 'bg-[#6CBF84]/30 text-[#6CBF84] border-[#6CBF84]' },
    ],
  },

  COLLEGE: {
    id: 'COLLEGE',
    label: 'College / University Admission',
    description: 'IIT, NIT, VIT, IIIT, M.Tech, MS & University Applications',
    iconName: 'GraduationCap',
    requiresResume: false,
    fields: {
      primaryLabel: 'College / Institute Name *',
      secondaryLabel: 'Course / Degree Name *',
      showSalary: false,
      showLocation: true,
      locationLabel: 'Campus City / Location',
      showJobUrl: true,
      urlLabel: 'University Portal Link',
    },
    stages: [
      { id: 'APP_SUBMITTED', label: 'Application Submitted', color: 'bg-[#C3195D]/15 text-[#C3195D] border-[#C3195D]/30' },
      { id: 'DOCS_VERIFIED', label: 'Documents Verified', color: 'bg-[#1A1A1A] text-[#EFECEC] border-white/10' },
      { id: 'ENTRANCE_EXAM', label: 'Entrance Exam / Cutoff', color: 'bg-[#E2B85C]/15 text-[#E2B85C] border-[#E2B85C]/30' },
      { id: 'COLLEGE_INTERVIEW', label: 'Interview Round', color: 'bg-[#62929A]/20 text-[#62929A] border-[#62929A]/40' },
      { id: 'OFFER_LETTER', label: 'Offer Letter Received', color: 'bg-[#6CBF84]/20 text-[#6CBF84] border-[#6CBF84]/40' },
      { id: 'COLLEGE_FEE_PAID', label: 'Seat Fee Paid', color: 'bg-[#C3195D]/25 text-[#EFECEC] border-[#C3195D]' },
      { id: 'ENROLLED', label: 'Enrolled', color: 'bg-[#6CBF84]/30 text-[#6CBF84] border-[#6CBF84]' },
    ],
  },

  HACKATHON: {
    id: 'HACKATHON',
    label: 'Hackathon / CTF / Competition',
    description: 'Cybersecurity CTFs, Smart India Hackathon & Hackathons',
    iconName: 'Trophy',
    requiresResume: false,
    fields: {
      primaryLabel: 'Organizer / Platform *',
      secondaryLabel: 'Event / CTF Name *',
      showSalary: false,
      showLocation: true,
      locationLabel: 'Venue / Online Platform',
      showJobUrl: true,
      urlLabel: 'Event / CTF Link',
    },
    stages: [
      { id: 'HACK_REGISTERED', label: 'Registered', color: 'bg-[#C3195D]/15 text-[#C3195D] border-[#C3195D]/30' },
      { id: 'TEAM_FORMED', label: 'Team Formed', color: 'bg-[#1A1A1A] text-[#EFECEC] border-white/10' },
      { id: 'ROUND_1', label: 'Round 1 / Qualifiers', color: 'bg-[#E2B85C]/15 text-[#E2B85C] border-[#E2B85C]/30' },
      { id: 'ROUND_2', label: 'Round 2 / Submissions', color: 'bg-[#62929A]/20 text-[#62929A] border-[#62929A]/40' },
      { id: 'FINALS', label: 'Grand Finals', color: 'bg-[#C3195D]/25 text-[#EFECEC] border-[#C3195D]' },
      { id: 'WINNER', label: 'Winner / Winner Rank', color: 'bg-[#6CBF84]/30 text-[#6CBF84] border-[#6CBF84]' },
      { id: 'HACK_COMPLETED', label: 'Completed', color: 'bg-[#1A1A1A] text-[#BFC3C7] border-white/10' },
    ],
  },

  FELLOWSHIP: {
    id: 'FELLOWSHIP',
    label: 'Fellowship / Govt Program',
    description: 'Yuva Sangam, GSoC, PM Internship & Government Schemes',
    iconName: 'Globe',
    requiresResume: false,
    fields: {
      primaryLabel: 'Ministry / Organization *',
      secondaryLabel: 'Program / Fellowship Name *',
      showSalary: false,
      showLocation: true,
      locationLabel: 'State / Location',
      showJobUrl: true,
      urlLabel: 'Portal URL (e.g. ebsb.aicte-india.org)',
    },
    stages: [
      { id: 'FELLOW_APPLIED', label: 'Applied', color: 'bg-[#C3195D]/15 text-[#C3195D] border-[#C3195D]/30' },
      { id: 'FELLOW_DOCS_VERIFIED', label: 'Documents Verified', color: 'bg-[#1A1A1A] text-[#EFECEC] border-white/10' },
      { id: 'SHORTLISTED', label: 'Shortlisted', color: 'bg-[#E2B85C]/15 text-[#E2B85C] border-[#E2B85C]/30' },
      { id: 'FELLOW_INTERVIEW', label: 'Interview Round', color: 'bg-[#62929A]/20 text-[#62929A] border-[#62929A]/40' },
      { id: 'SELECTED', label: 'Selected', color: 'bg-[#6CBF84]/20 text-[#6CBF84] border-[#6CBF84]/40' },
      { id: 'FELLOW_JOINED', label: 'Joined Program', color: 'bg-[#6CBF84]/30 text-[#6CBF84] border-[#6CBF84]' },
      { id: 'FELLOW_COMPLETED', label: 'Completed', color: 'bg-[#1A1A1A] text-[#BFC3C7] border-white/10' },
    ],
  },

  CERTIFICATION: {
    id: 'CERTIFICATION',
    label: 'Certification Exam',
    description: 'AWS, CompTIA Security+, CEH, CISSP & Professional Badges',
    iconName: 'Award',
    requiresResume: false,
    fields: {
      primaryLabel: 'Provider / Vendor Name *',
      secondaryLabel: 'Certification Title *',
      showSalary: false,
      showLocation: false,
      showJobUrl: true,
      urlLabel: 'Exam Portal / Voucher Link',
    },
    stages: [
      { id: 'CERT_REGISTERED', label: 'Registered', color: 'bg-[#C3195D]/15 text-[#C3195D] border-[#C3195D]/30' },
      { id: 'STUDY_STARTED', label: 'Study Started', color: 'bg-[#1A1A1A] text-[#EFECEC] border-white/10' },
      { id: 'CERT_EXAM_SCHEDULED', label: 'Exam Scheduled', color: 'bg-[#E2B85C]/15 text-[#E2B85C] border-[#E2B85C]/30' },
      { id: 'CERT_EXAM_PASSED', label: 'Exam Passed', color: 'bg-[#6CBF84]/20 text-[#6CBF84] border-[#6CBF84]/40' },
      { id: 'CERT_ISSUED', label: 'Certificate Issued', color: 'bg-[#6CBF84]/30 text-[#6CBF84] border-[#6CBF84]' },
    ],
  },

  CUSTOM: {
    id: 'CUSTOM',
    label: 'Custom Application',
    description: 'General Projects, Grants & Custom Tracking Opportunities',
    iconName: 'Folder',
    requiresResume: false,
    fields: {
      primaryLabel: 'Organization / Institution *',
      secondaryLabel: 'Opportunity Title *',
      showSalary: false,
      showLocation: true,
      locationLabel: 'Location',
      showJobUrl: true,
      urlLabel: 'Portal / Info Link',
    },
    stages: [
      { id: 'CUSTOM_SAVED', label: 'Saved', color: 'bg-[#1A1A1A] text-[#BFC3C7] border-white/10' },
      { id: 'CUSTOM_SUBMITTED', label: 'Submitted', color: 'bg-[#C3195D]/15 text-[#C3195D] border-[#C3195D]/30' },
      { id: 'CUSTOM_IN_REVIEW', label: 'In Review', color: 'bg-[#E2B85C]/15 text-[#E2B85C] border-[#E2B85C]/30' },
      { id: 'CUSTOM_ACCEPTED', label: 'Accepted', color: 'bg-[#6CBF84]/20 text-[#6CBF84] border-[#6CBF84]/40' },
      { id: 'CUSTOM_COMPLETED', label: 'Completed', color: 'bg-[#1A1A1A] text-[#BFC3C7] border-white/10' },
    ],
  },
};

export function getApplicationTypeConfig(typeId?: string): ApplicationTypeConfig {
  return APPLICATION_TYPES[typeId || 'JOB'] || APPLICATION_TYPES.JOB;
}

export function getAllStagesForType(typeId?: string) {
  const config = getApplicationTypeConfig(typeId);
  return config.stages;
}

export function getStageBadgeForType(typeId: string | undefined, statusId: string) {
  const config = getApplicationTypeConfig(typeId);
  const found = config.stages.find((s) => s.id === statusId);
  if (found) return found;
  return { id: statusId, label: statusId.replace(/_/g, ' '), color: 'bg-[#1A1A1A] text-[#EFECEC] border-white/10' };
}
