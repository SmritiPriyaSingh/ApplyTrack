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
    notesLabel?: string;
    notesPlaceholder?: string;
  };
  stages: { id: string; label: string; color: string }[];
}

export const EXAM_APPLICATION_STATUSES = [
  { id: 'EXAM_REGISTERED', label: 'Registered', color: 'bg-[#C3195D]/15 text-[#C3195D] border-[#C3195D]/30' },
  { id: 'FEE_PAID', label: 'Fee Paid', color: 'bg-[#6CBF84]/20 text-[#6CBF84] border-[#6CBF84]/40' },
  { id: 'ADMIT_CARD_RELEASED', label: 'Admit Card', color: 'bg-[#E2B85C]/15 text-[#E2B85C] border-[#E2B85C]/30' },
  { id: 'EXAM_COMPLETED', label: 'Exam Day', color: 'bg-[#62929A]/30 text-[#62929A] border-[#62929A]' },
  { id: 'RESULT_DECLARED', label: 'Result', color: 'bg-[#E2B85C]/20 text-[#E2B85C] border-[#E2B85C]/40' },
  { id: 'EXAM_ADMISSION', label: 'Admission Confirmed', color: 'bg-[#6CBF84]/40 text-[#EFECEC] border-[#6CBF84]' },
] as const;

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
      urlLabel: 'Official Website',
      notesLabel: 'Private Notes',
      notesPlaceholder: 'e.g. Follow up next week with recruiter...',
    },
    stages: [
      { id: 'APPLIED', label: 'Applied', color: 'bg-[#C3195D]/15 text-[#C3195D] border-[#C3195D]/30' },
      { id: 'IN_PROGRESS', label: 'In Progress', color: 'bg-[#E2B85C]/15 text-[#E2B85C] border-[#E2B85C]/30' },
      { id: 'OFFER', label: 'Offer Received', color: 'bg-[#6CBF84]/20 text-[#6CBF84] border-[#6CBF84]/40' },
      { id: 'JOINED', label: 'Joined / Accepted', color: 'bg-[#6CBF84]/30 text-[#6CBF84] border-[#6CBF84]' },
      { id: 'REJECTED', label: 'Closed', color: 'bg-[#D96C6C]/15 text-[#D96C6C] border-[#D96C6C]/30' },
    ],
  },

  EXAM: {
    id: 'EXAM',
    label: 'Competitive Exam',
    description: 'GATE, CAT, UPSC, GRE, Government & Placement Examinations',
    iconName: 'FileText',
    requiresResume: false,
    fields: {
      primaryLabel: 'Conducting Organization *',
      secondaryLabel: 'Exam Name *',
      showSalary: false,
      showLocation: false,
      showJobUrl: true,
      urlLabel: 'Official Website',
      notesLabel: 'Preparation Notes',
      notesPlaceholder: 'e.g. Revise DBMS & Networks, Print admit card, Reach center 1 hour early, Carry calculator, Solve Mock Test 8...',
    },
    stages: [...EXAM_APPLICATION_STATUSES],
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
      urlLabel: 'Official Website',
      notesLabel: 'Preparation & Admission Notes',
      notesPlaceholder: 'e.g. Keep GATE scorecard ready, Submit transcript copy...',
    },
    stages: [
      { id: 'APP_SUBMITTED', label: 'Applied', color: 'bg-[#C3195D]/15 text-[#C3195D] border-[#C3195D]/30' },
      { id: 'ENTRANCE_EXAM', label: 'Entrance / Interview', color: 'bg-[#E2B85C]/15 text-[#E2B85C] border-[#E2B85C]/30' },
      { id: 'OFFER_LETTER', label: 'Offer Letter', color: 'bg-[#6CBF84]/20 text-[#6CBF84] border-[#6CBF84]/40' },
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
      urlLabel: 'Official Website',
      notesLabel: 'Preparation Notes',
      notesPlaceholder: 'e.g. Set up Burp Suite & Wireshark, prepare presentation slides...',
    },
    stages: [
      { id: 'HACK_REGISTERED', label: 'Registered', color: 'bg-[#C3195D]/15 text-[#C3195D] border-[#C3195D]/30' },
      { id: 'ROUND_1', label: 'Submissions', color: 'bg-[#E2B85C]/15 text-[#E2B85C] border-[#E2B85C]/30' },
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
      urlLabel: 'Official Website',
      notesLabel: 'Preparation Notes',
      notesPlaceholder: 'e.g. Bring hard copy of application form & ID card...',
    },
    stages: [
      { id: 'FELLOW_APPLIED', label: 'Applied', color: 'bg-[#C3195D]/15 text-[#C3195D] border-[#C3195D]/30' },
      { id: 'SHORTLISTED', label: 'Shortlisted', color: 'bg-[#E2B85C]/15 text-[#E2B85C] border-[#E2B85C]/30' },
      { id: 'SELECTED', label: 'Selected', color: 'bg-[#6CBF84]/20 text-[#6CBF84] border-[#6CBF84]/40' },
      { id: 'FELLOW_JOINED', label: 'Joined Program', color: 'bg-[#6CBF84]/30 text-[#6CBF84] border-[#6CBF84]' },
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
      urlLabel: 'Official Website',
      notesLabel: 'Preparation Notes',
      notesPlaceholder: 'e.g. Complete Udemy practice exams, review flashcards...',
    },
    stages: [
      { id: 'CERT_REGISTERED', label: 'Registered', color: 'bg-[#C3195D]/15 text-[#C3195D] border-[#C3195D]/30' },
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
      urlLabel: 'Official Website',
      notesLabel: 'Notes',
      notesPlaceholder: 'e.g. Key milestone dates and instructions...',
    },
    stages: [
      { id: 'CUSTOM_SAVED', label: 'Saved', color: 'bg-[#1A1A1A] text-[#BFC3C7] border-white/10' },
      { id: 'CUSTOM_SUBMITTED', label: 'Submitted', color: 'bg-[#C3195D]/15 text-[#C3195D] border-[#C3195D]/30' },
      { id: 'CUSTOM_ACCEPTED', label: 'Accepted', color: 'bg-[#6CBF84]/20 text-[#6CBF84] border-[#6CBF84]/40' },
    ],
  },
};

export function getApplicationTypeConfig(typeId?: string): ApplicationTypeConfig {
  return APPLICATION_TYPES[typeId || 'JOB'] || APPLICATION_TYPES.JOB;
}

export function getAllStagesForType(typeId?: string, customStages?: { id: string; label: string; color: string }[]) {
  const config = getApplicationTypeConfig(typeId);
  const base = config.stages;
  if (customStages && customStages.length > 0) {
    // Combine base and user custom stages cleanly
    const baseIds = new Set(base.map((s) => s.id));
    const uniqueCustom = customStages.filter((cs) => !baseIds.has(cs.id));
    return [...base, ...uniqueCustom];
  }
  return base;
}

export function getStageBadgeForType(typeId: string | undefined, statusId: string, customStages?: { id: string; label: string; color: string }[]) {
  const stages = getAllStagesForType(typeId, customStages);
  const found = stages.find((s) => s.id === statusId || s.label === statusId);
  if (found) return found;

  if (customStages) {
    const customFound = customStages.find((cs) => cs.id === statusId || cs.label === statusId);
    if (customFound) return customFound;
  }

  // Clean fallback label (do not show raw timestamp IDs)
  const cleanLabel = statusId.startsWith('CUSTOM_STAGE_') ? 'User Custom Step' : statusId.replace(/_/g, ' ');
  return { id: statusId, label: cleanLabel, color: 'bg-[#C3195D]/20 text-[#C3195D] border-[#C3195D]/40 font-semibold' };
}
