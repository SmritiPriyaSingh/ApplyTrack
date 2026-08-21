"use client";

import { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Briefcase, 
  GraduationCap, 
  FileText, 
  Trophy, 
  Globe, 
  Award, 
  Folder,
  ArrowRight,
  ArrowLeft,
  Check,
  UploadCloud,
  MapPin,
  Building2,
  Calendar,
  DollarSign,
  CheckSquare,
  Square,
  CreditCard,
  FileCheck,
  Plus,
  Home,
  TrendingUp,
  School
} from 'lucide-react';
import { APPLICATION_TYPES, ApplicationTypeConfig } from '@/lib/application-types';
import { WORK_MODES, JOB_TYPES, SOURCES } from '@/lib/constants';

interface NewApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const TYPE_ICONS: Record<string, any> = {
  Briefcase,
  GraduationCap,
  FileText,
  Trophy,
  Globe,
  Award,
  Folder,
};

export function NewApplicationModal({ isOpen, onClose, onSuccess }: NewApplicationModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedType, setSelectedType] = useState<string>('JOB');

  // Common form state
  const [formData, setFormData] = useState({
    companyName: '',
    role: '',
    department: '',
    workMode: 'REMOTE',
    jobType: 'FULL_TIME',
    location: '',
    package: '',
    jobUrl: '',
    source: 'LinkedIn',
    resumeId: '',
    notes: '',
  });

  // Type-specific extra fields state
  const [priority, setPriority] = useState<'HIGH' | 'MEDIUM' | 'LOW'>('HIGH');
  const [appStatus, setAppStatus] = useState<string>('');
  const [extraData, setExtraData] = useState<Record<string, any>>({
    feeStatus: 'Pending',
    scholarshipStatus: 'Pending',
    hostelRequired: 'Yes',
    hostelAllocated: 'Pending',
    admissionBasis: 'GATE',
    docsChecklist: {
      mark10: false,
      mark12: false,
      gradDegree: false,
      scorecard: false,
      aadhaar: false,
      photo: false,
      categoryCert: false,
      incomeCert: false,
    },
  });

  const [resumes, setResumes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showInlineResumeForm, setShowInlineResumeForm] = useState(false);
  const [newResumeTitle, setNewResumeTitle] = useState('');
  const [selectedFileName, setSelectedFileName] = useState('');
  const [selectedFileData, setSelectedFileData] = useState('');
  const [admitCardFileName, setAdmitCardFileName] = useState('');
  const [resumeCreating, setResumeCreating] = useState(false);
  const docInputRef = useRef<HTMLInputElement>(null);
  const admitCardInputRef = useRef<HTMLInputElement>(null);

  const config: ApplicationTypeConfig = APPLICATION_TYPES[selectedType] || APPLICATION_TYPES.JOB;

  const fetchResumes = () => {
    fetch('/api/resumes')
      .then((res) => res.json())
      .then((data) => {
        if (data.resumes) {
          setResumes(data.resumes);
          if (data.resumes.length > 0 && !formData.resumeId) {
            setFormData((prev) => ({ ...prev, resumeId: data.resumes[0].id }));
          }
        }
      })
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      fetchResumes();
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedType === 'EXAM') {
      setAppStatus('EXAM_REGISTERED');
    } else if (selectedType === 'COLLEGE') {
      setAppStatus('APP_SUBMITTED');
    } else {
      setAppStatus(config.stages[0]?.id || 'APPLIED');
    }
  }, [selectedType]);

  if (!isOpen) return null;

  const handleDocumentFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert("File size should be less than 10MB");
      return;
    }

    const cleanTitle = file.name.replace(/\.[^/.]+$/, "").replace(/_/g, " ");
    setSelectedFileName(file.name);
    if (!newResumeTitle) setNewResumeTitle(cleanTitle);

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setSelectedFileData(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAdmitCardFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAdmitCardFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setExtraData((prev) => ({ ...prev, admitCardFileData: reader.result, admitCardFileName: file.name }));
      }
    };
    reader.readAsDataURL(file);
  };

  const toggleDocChecklist = (key: string) => {
    setExtraData((prev) => ({
      ...prev,
      docsChecklist: {
        ...(prev.docsChecklist || {}),
        [key]: !prev.docsChecklist?.[key],
      },
    }));
  };

  const handleInlineResumeCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newResumeTitle.trim()) return;

    setResumeCreating(true);
    try {
      const res = await fetch('/api/resumes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newResumeTitle.trim(),
          versionTag: 'v1',
          fileUrl: selectedFileData || selectedFileName || 'Uploaded Document',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const created = data.resume;
        setNewResumeTitle('');
        setSelectedFileName('');
        setSelectedFileData('');
        setShowInlineResumeForm(false);
        await fetchResumes();
        if (created?.id) {
          setFormData((prev) => ({ ...prev, resumeId: created.id }));
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setResumeCreating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.companyName || !formData.role) return;

    setLoading(true);
    try {
      const payload = {
        appType: selectedType,
        ...formData,
        status: appStatus,
        extraData: {
          ...extraData,
          priority,
        },
      };

      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        if (onSuccess) onSuccess();
        onClose();
        window.location.reload();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B0B0B]/85 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#1A1A1A] border border-white/5 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* MODAL HEADER */}
        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-[#0B0B0B]">
          <div className="flex items-center gap-3">
            {step === 2 && (
              <button
                type="button"
                onClick={() => setStep(1)}
                className="p-1.5 rounded-lg bg-[#1A1A1A] text-[#BFC3C7] hover:text-[#EFECEC] border border-white/5 transition"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <div>
              <h2 className="text-sm font-semibold text-[#EFECEC]">
                {step === 1 ? 'What are you applying for?' : config.modalTitle}
              </h2>
              <p className="text-[11px] text-[#BFC3C7]">
                {step === 1 ? 'Step 1 of 2: Select opportunity type' : `Step 2 of 2: Fill details for ${config.label}`}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-[#BFC3C7] hover:text-[#EFECEC] hover:bg-[#1A1A1A] transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* STEP 1: APPLICATION TYPE SELECTOR */}
        {step === 1 && (
          <div className="p-6 overflow-y-auto space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Object.values(APPLICATION_TYPES).map((type) => {
                const IconComponent = TYPE_ICONS[type.iconName] || Briefcase;
                const isSelected = selectedType === type.id;

                return (
                  <div
                    key={type.id}
                    onClick={() => setSelectedType(type.id)}
                    className={`p-4 rounded-2xl border transition cursor-pointer flex items-start gap-3.5 ${
                      isSelected
                        ? 'bg-[#0B0B0B] border-[#C3195D] shadow-lg'
                        : 'bg-[#0B0B0B]/60 border-white/5 hover:border-white/20'
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                        isSelected
                          ? 'bg-[#C3195D] text-[#EFECEC] border-[#C3195D]'
                          : 'bg-[#1A1A1A] text-[#62929A] border-white/5'
                      }`}
                    >
                      <IconComponent className="w-5 h-5" />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-bold text-[#EFECEC]">{type.label}</h3>
                        {isSelected && <Check className="w-4 h-4 text-[#C3195D]" />}
                      </div>
                      <p className="text-[11px] text-[#BFC3C7] mt-0.5 leading-relaxed">{type.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-4 border-t border-white/5 flex justify-end">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-5 py-2 rounded-xl bg-[#C3195D] hover:bg-[#a5134d] text-[#EFECEC] text-xs font-medium flex items-center gap-2 transition shadow-sm"
              >
                <span>Continue to Details</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: DYNAMIC TYPE-SPECIFIC FORM */}
        {step === 2 && (
          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
            {/* STATUS & PRIORITY STRIP */}
            <div className="grid grid-cols-3 gap-3 bg-[#0B0B0B] p-3 rounded-xl border border-white/5">
              <div className="col-span-2">
                <label className="block text-[11px] font-bold text-[#C3195D] mb-1 font-mono uppercase tracking-wider">
                  {selectedType === 'COLLEGE' ? 'Admission Status' : 'Application Status'}
                </label>
                <select
                  value={appStatus}
                  onChange={(e) => setAppStatus(e.target.value)}
                  className="w-full px-3 py-1.5 bg-[#1A1A1A] border border-white/5 rounded-xl text-xs font-semibold text-[#EFECEC] focus:outline-none focus:border-[#C3195D]"
                >
                  {config.stages.map((stage) => (
                    <option key={stage.id} value={stage.id} className="bg-[#0B0B0B] text-[#EFECEC]">
                      ○ {stage.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#62929A] mb-1 font-mono uppercase tracking-wider">
                  Priority
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="w-full px-3 py-1.5 bg-[#1A1A1A] border border-white/5 rounded-xl text-xs font-bold text-[#EFECEC] focus:outline-none focus:border-[#62929A]"
                >
                  <option value="HIGH" className="bg-[#0B0B0B] text-[#C3195D]">🔴 High Priority</option>
                  <option value="MEDIUM" className="bg-[#0B0B0B] text-[#E2B85C]">🟡 Medium Priority</option>
                  <option value="LOW" className="bg-[#0B0B0B] text-[#6CBF84]">🟢 Low Priority</option>
                </select>
              </div>
            </div>

            {/* PRIMARY & SECONDARY FIELDS */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#EFECEC] mb-1">{config.fields.primaryLabel}</label>
                <div className="relative">
                  <Building2 className="w-3.5 h-3.5 text-[#BFC3C7] absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    placeholder={
                      selectedType === 'COLLEGE'
                        ? 'e.g. IIT Bombay, NIT Trichy, VIT'
                        : selectedType === 'EXAM'
                        ? 'e.g. NTA, IIT Bombay, UPSC'
                        : 'e.g. CrowdStrike, Microsoft'
                    }
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    className="w-full pl-9 pr-3 py-1.5 bg-[#0B0B0B] border border-white/5 rounded-xl text-xs text-[#EFECEC] focus:outline-none focus:border-[#C3195D]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#EFECEC] mb-1">{config.fields.secondaryLabel}</label>
                <div className="relative">
                  <Briefcase className="w-3.5 h-3.5 text-[#BFC3C7] absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    placeholder={
                      selectedType === 'COLLEGE'
                        ? 'e.g. M.Tech, B.Tech, MS, MBA'
                        : selectedType === 'EXAM'
                        ? 'e.g. GATE Computer Science 2026'
                        : 'e.g. SOC Analyst / Security Engineer'
                    }
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full pl-9 pr-3 py-1.5 bg-[#0B0B0B] border border-white/5 rounded-xl text-xs text-[#EFECEC] focus:outline-none focus:border-[#C3195D]"
                  />
                </div>
              </div>
            </div>

            {/* TYPE 3: COLLEGE ADMISSION DETAILED FIELDS */}
            {selectedType === 'COLLEGE' && (
              <div className="space-y-4">
                {/* 1. COURSE & SPECIALIZATION GRANULARITY */}
                <div className="bg-[#0B0B0B] p-4 rounded-xl border border-white/5 space-y-3">
                  <span className="text-[10px] uppercase font-bold text-[#62929A] tracking-wider block flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5" />
                    <span>Branch & Specialization</span>
                  </span>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] text-[#BFC3C7] mb-1">Branch</label>
                      <input
                        type="text"
                        placeholder="e.g. Computer Science & Engineering"
                        value={formData.department}
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                        className="w-full px-3 py-1.5 bg-[#1A1A1A] border border-white/5 rounded-xl text-xs text-[#EFECEC]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-[#BFC3C7] mb-1">Specialization</label>
                      <input
                        type="text"
                        placeholder="e.g. Cyber Security / AI & ML"
                        value={extraData.specialization || ''}
                        onChange={(e) => setExtraData({ ...extraData, specialization: e.target.value })}
                        className="w-full px-3 py-1.5 bg-[#1A1A1A] border border-white/5 rounded-xl text-xs text-[#EFECEC]"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. FEES BREAKDOWN */}
                <div className="bg-[#0B0B0B] p-4 rounded-xl border border-white/5 space-y-3">
                  <span className="text-[10px] uppercase font-bold text-[#6CBF84] tracking-wider block flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Detailed Fee Breakdown</span>
                  </span>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[10px] text-[#BFC3C7] mb-1">Tuition Fee</label>
                      <input
                        type="text"
                        placeholder="e.g. ₹1,80,000 / year"
                        value={extraData.tuitionFee || ''}
                        onChange={(e) => setExtraData({ ...extraData, tuitionFee: e.target.value })}
                        className="w-full px-3 py-1.5 bg-[#1A1A1A] border border-white/5 rounded-xl text-xs text-[#EFECEC]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-[#BFC3C7] mb-1">Hostel Fee</label>
                      <input
                        type="text"
                        placeholder="e.g. ₹90,000 / year"
                        value={extraData.hostelFee || ''}
                        onChange={(e) => setExtraData({ ...extraData, hostelFee: e.target.value })}
                        className="w-full px-3 py-1.5 bg-[#1A1A1A] border border-white/5 rounded-xl text-xs text-[#EFECEC]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-[#6CBF84] font-bold mb-1">Net Payable Fee</label>
                      <input
                        type="text"
                        placeholder="e.g. ₹2,20,000 / year"
                        value={formData.package}
                        onChange={(e) => setFormData({ ...formData, package: e.target.value })}
                        className="w-full px-3 py-1.5 bg-[#1A1A1A] border border-[#6CBF84]/40 rounded-xl text-xs text-[#EFECEC]"
                      />
                    </div>
                  </div>
                </div>

                {/* 3. SCHOLARSHIP TRACKING */}
                <div className="bg-[#0B0B0B] p-4 rounded-xl border border-white/5 space-y-3">
                  <span className="text-[10px] uppercase font-bold text-[#E2B85C] tracking-wider block flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5" />
                    <span>Scholarship & Stipend Details</span>
                  </span>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[10px] text-[#BFC3C7] mb-1">Scholarship Type</label>
                      <input
                        type="text"
                        placeholder="e.g. Merit / GATE Stipend"
                        value={extraData.scholarshipType || ''}
                        onChange={(e) => setExtraData({ ...extraData, scholarshipType: e.target.value })}
                        className="w-full px-3 py-1.5 bg-[#1A1A1A] border border-white/5 rounded-xl text-xs text-[#EFECEC]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-[#BFC3C7] mb-1">Value / Amount</label>
                      <input
                        type="text"
                        placeholder="e.g. ₹12,400 / month"
                        value={extraData.scholarshipAmount || ''}
                        onChange={(e) => setExtraData({ ...extraData, scholarshipAmount: e.target.value })}
                        className="w-full px-3 py-1.5 bg-[#1A1A1A] border border-white/5 rounded-xl text-xs text-[#EFECEC]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-[#BFC3C7] mb-1">Status</label>
                      <select
                        value={extraData.scholarshipStatus || 'Pending'}
                        onChange={(e) => setExtraData({ ...extraData, scholarshipStatus: e.target.value })}
                        className="w-full px-3 py-1.5 bg-[#1A1A1A] border border-white/5 rounded-xl text-xs text-[#EFECEC]"
                      >
                        <option value="Approved" className="bg-[#0B0B0B]">✓ Approved</option>
                        <option value="Pending" className="bg-[#0B0B0B]">○ Pending</option>
                        <option value="Not Applied" className="bg-[#0B0B0B]">✕ Not Applied</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* 4. ADMISSION CRITICAL DATES */}
                <div className="bg-[#0B0B0B] p-4 rounded-xl border border-white/5 space-y-3">
                  <span className="text-[10px] uppercase font-bold text-[#C3195D] tracking-wider block flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Admission Deadlines & Key Dates</span>
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    <div>
                      <label className="block text-[9px] text-[#BFC3C7] mb-1">Applied On</label>
                      <input
                        type="date"
                        value={extraData.appliedOnDate || ''}
                        onChange={(e) => setExtraData({ ...extraData, appliedOnDate: e.target.value })}
                        className="w-full px-2 py-1 bg-[#1A1A1A] border border-white/5 rounded-lg text-xs text-[#EFECEC]"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] text-[#C3195D] font-bold mb-1">Deadline *</label>
                      <input
                        type="date"
                        value={extraData.deadline || ''}
                        onChange={(e) => setExtraData({ ...extraData, deadline: e.target.value })}
                        className="w-full px-2 py-1 bg-[#1A1A1A] border border-[#C3195D]/40 rounded-lg text-xs text-[#EFECEC]"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] text-[#BFC3C7] mb-1">Counselling</label>
                      <input
                        type="date"
                        value={extraData.counsellingDate || ''}
                        onChange={(e) => setExtraData({ ...extraData, counsellingDate: e.target.value })}
                        className="w-full px-2 py-1 bg-[#1A1A1A] border border-white/5 rounded-lg text-xs text-[#EFECEC]"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] text-[#BFC3C7] mb-1">Offer Date</label>
                      <input
                        type="date"
                        value={extraData.offerDate || ''}
                        onChange={(e) => setExtraData({ ...extraData, offerDate: e.target.value })}
                        className="w-full px-2 py-1 bg-[#1A1A1A] border border-white/5 rounded-lg text-xs text-[#EFECEC]"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] text-[#BFC3C7] mb-1">Reporting</label>
                      <input
                        type="date"
                        value={extraData.reportingDate || ''}
                        onChange={(e) => setExtraData({ ...extraData, reportingDate: e.target.value })}
                        className="w-full px-2 py-1 bg-[#1A1A1A] border border-white/5 rounded-lg text-xs text-[#EFECEC]"
                      />
                    </div>
                  </div>
                </div>

                {/* 5. LOCATION & MULTI-CAMPUS BREAKDOWN */}
                <div className="bg-[#0B0B0B] p-4 rounded-xl border border-white/5 space-y-3">
                  <span className="text-[10px] uppercase font-bold text-[#EFECEC] tracking-wider block flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#C3195D]" />
                    <span>State, City & Specific Campus</span>
                  </span>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[10px] text-[#BFC3C7] mb-1">State</label>
                      <input
                        type="text"
                        placeholder="e.g. Tamil Nadu / Maharashtra"
                        value={extraData.state || ''}
                        onChange={(e) => setExtraData({ ...extraData, state: e.target.value })}
                        className="w-full px-3 py-1.5 bg-[#1A1A1A] border border-white/5 rounded-xl text-xs text-[#EFECEC]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-[#BFC3C7] mb-1">City</label>
                      <input
                        type="text"
                        placeholder="e.g. Vellore / Mumbai"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        className="w-full px-3 py-1.5 bg-[#1A1A1A] border border-white/5 rounded-xl text-xs text-[#EFECEC]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-[#BFC3C7] mb-1">Campus</label>
                      <input
                        type="text"
                        placeholder="e.g. Vellore Main Campus"
                        value={extraData.campus || ''}
                        onChange={(e) => setExtraData({ ...extraData, campus: e.target.value })}
                        className="w-full px-3 py-1.5 bg-[#1A1A1A] border border-white/5 rounded-xl text-xs text-[#EFECEC]"
                      />
                    </div>
                  </div>
                </div>

                {/* 6. ADMISSION BASIS & ENTRANCE EXAM */}
                <div className="bg-[#0B0B0B] p-4 rounded-xl border border-white/5 space-y-3">
                  <span className="text-[10px] uppercase font-bold text-[#62929A] tracking-wider block flex items-center gap-1.5">
                    <School className="w-3.5 h-3.5" />
                    <span>Admission Basis & Score</span>
                  </span>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] text-[#BFC3C7] mb-1">Admission Basis</label>
                      <select
                        value={extraData.admissionBasis || 'GATE'}
                        onChange={(e) => setExtraData({ ...extraData, admissionBasis: e.target.value })}
                        className="w-full px-3 py-1.5 bg-[#1A1A1A] border border-white/5 rounded-xl text-xs text-[#EFECEC]"
                      >
                        <option value="GATE" className="bg-[#0B0B0B]">GATE Score</option>
                        <option value="College Test" className="bg-[#0B0B0B]">College Entrance Test (VITMEE/SRMJEEE)</option>
                        <option value="Direct Admission" className="bg-[#0B0B0B]">Direct Admission</option>
                        <option value="Management Quota" className="bg-[#0B0B0B]">Management Quota</option>
                        <option value="Interview" className="bg-[#0B0B0B]">Interview / Merit List</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] text-[#BFC3C7] mb-1">Score / Rank</label>
                      <input
                        type="text"
                        placeholder="e.g. GATE Score: 720 / AIR 142"
                        value={extraData.entranceScore || ''}
                        onChange={(e) => setExtraData({ ...extraData, entranceScore: e.target.value })}
                        className="w-full px-3 py-1.5 bg-[#1A1A1A] border border-white/5 rounded-xl text-xs text-[#EFECEC]"
                      />
                    </div>
                  </div>
                </div>

                {/* 7. HOSTEL ALLOCATION & PLACEMENT STATS */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[#0B0B0B] p-4 rounded-xl border border-white/5 space-y-2">
                    <span className="text-[10px] uppercase font-bold text-[#EFECEC] tracking-wider block flex items-center gap-1.5">
                      <Home className="w-3.5 h-3.5 text-[#C3195D]" />
                      <span>Hostel Accommodation</span>
                    </span>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <label className="block text-[9px] text-[#BFC3C7] mb-0.5">Required?</label>
                        <select
                          value={extraData.hostelRequired || 'Yes'}
                          onChange={(e) => setExtraData({ ...extraData, hostelRequired: e.target.value })}
                          className="w-full p-1 bg-[#1A1A1A] border border-white/5 rounded-lg text-xs text-[#EFECEC]"
                        >
                          <option value="Yes" className="bg-[#0B0B0B]">Yes</option>
                          <option value="No" className="bg-[#0B0B0B]">No</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[9px] text-[#BFC3C7] mb-0.5">Allocated?</label>
                        <select
                          value={extraData.hostelAllocated || 'Pending'}
                          onChange={(e) => setExtraData({ ...extraData, hostelAllocated: e.target.value })}
                          className="w-full p-1 bg-[#1A1A1A] border border-white/5 rounded-lg text-xs text-[#EFECEC]"
                        >
                          <option value="Yes" className="bg-[#0B0B0B]">✓ Yes</option>
                          <option value="No" className="bg-[#0B0B0B]">✕ No</option>
                          <option value="Pending" className="bg-[#0B0B0B]">○ Pending</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#0B0B0B] p-4 rounded-xl border border-white/5 space-y-2">
                    <span className="text-[10px] uppercase font-bold text-[#6CBF84] tracking-wider block flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span>Placement Stats</span>
                    </span>
                    <div className="grid grid-cols-3 gap-1.5">
                      <div>
                        <label className="block text-[8px] text-[#BFC3C7] mb-0.5">Highest</label>
                        <input
                          type="text"
                          placeholder="e.g. ₹54 LPA"
                          value={extraData.highestPackage || ''}
                          onChange={(e) => setExtraData({ ...extraData, highestPackage: e.target.value })}
                          className="w-full p-1 bg-[#1A1A1A] border border-white/5 rounded-lg text-[10px] text-[#EFECEC]"
                        />
                      </div>
                      <div>
                        <label className="block text-[8px] text-[#BFC3C7] mb-0.5">Average</label>
                        <input
                          type="text"
                          placeholder="e.g. ₹14 LPA"
                          value={extraData.avgPackage || ''}
                          onChange={(e) => setExtraData({ ...extraData, avgPackage: e.target.value })}
                          className="w-full p-1 bg-[#1A1A1A] border border-white/5 rounded-lg text-[10px] text-[#EFECEC]"
                        />
                      </div>
                      <div>
                        <label className="block text-[8px] text-[#BFC3C7] mb-0.5">Placement %</label>
                        <input
                          type="text"
                          placeholder="e.g. 94%"
                          value={extraData.placementRate || ''}
                          onChange={(e) => setExtraData({ ...extraData, placementRate: e.target.value })}
                          className="w-full p-1 bg-[#1A1A1A] border border-white/5 rounded-lg text-[10px] text-[#EFECEC]"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 8. COLLEGE DOCUMENTS CHECKLIST */}
                <div className="bg-[#0B0B0B] p-4 rounded-xl border border-white/5 space-y-3">
                  <span className="text-[10px] uppercase font-bold text-[#EFECEC] tracking-wider block flex items-center gap-1.5">
                    <CheckSquare className="w-3.5 h-3.5 text-[#C3195D]" />
                    <span>Admission Documents Checklist</span>
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    {[
                      { key: 'mark10', label: '10th Marksheet' },
                      { key: 'mark12', label: '12th Marksheet' },
                      { key: 'gradDegree', label: 'Graduation Degree' },
                      { key: 'scorecard', label: 'GATE / Scorecard' },
                      { key: 'aadhaar', label: 'Aadhaar Card' },
                      { key: 'photo', label: 'Passport Photo' },
                      { key: 'categoryCert', label: 'Category Cert' },
                      { key: 'incomeCert', label: 'Income Cert' },
                    ].map((item) => {
                      const checked = extraData.docsChecklist?.[item.key] || false;
                      return (
                        <div
                          key={item.key}
                          onClick={() => toggleDocChecklist(item.key)}
                          className={`p-2 rounded-lg border flex items-center gap-2 cursor-pointer transition ${
                            checked ? 'bg-[#C3195D]/15 border-[#C3195D] text-[#EFECEC]' : 'bg-[#1A1A1A] border-white/5 text-[#BFC3C7]'
                          }`}
                        >
                          {checked ? <CheckSquare className="w-4 h-4 text-[#C3195D]" /> : <Square className="w-4 h-4 text-[#737373]" />}
                          <span className="text-[11px] font-medium">{item.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* COMMON URL FIELD */}
            {config.fields.showJobUrl && selectedType !== 'COLLEGE' && (
              <div>
                <label className="block text-xs font-medium text-[#EFECEC] mb-1">{config.fields.urlLabel}</label>
                <input
                  type="text"
                  placeholder="e.g. https://vit.ac.in/"
                  value={formData.jobUrl}
                  onChange={(e) => setFormData({ ...formData, jobUrl: e.target.value })}
                  className="w-full px-3 py-1.5 bg-[#0B0B0B] border border-white/5 rounded-xl text-xs text-[#EFECEC] focus:outline-none focus:border-[#C3195D]"
                />
              </div>
            )}

            {/* PREPARATION / ADMISSION NOTES */}
            <div>
              <label className="block text-xs font-medium text-[#EFECEC] mb-1">{config.fields.notesLabel || 'Notes'}</label>
              <textarea
                rows={3}
                placeholder={config.fields.notesPlaceholder}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full p-3 bg-[#0B0B0B] border border-white/5 rounded-xl text-xs text-[#EFECEC] focus:outline-none focus:border-[#C3195D] resize-none"
              />
            </div>

            <div className="pt-3 border-t border-white/5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-1.5 rounded-xl text-xs font-medium text-[#BFC3C7] hover:text-[#EFECEC]"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-1.5 rounded-xl bg-[#C3195D] hover:bg-[#a5134d] text-[#EFECEC] text-xs font-medium transition disabled:opacity-50 shadow-sm"
              >
                {loading ? 'Saving Entry...' : `Save ${config.label}`}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
