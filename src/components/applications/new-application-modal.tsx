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
  ShieldAlert,
  CreditCard,
  FileCheck,
  ExternalLink,
  Plus
} from 'lucide-react';
import { APPLICATION_TYPES, ApplicationTypeConfig, EXAM_APPLICATION_STATUSES } from '@/lib/application-types';
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
    applicationDate: new Date().toISOString().split('T')[0],
  });

  // Type-specific extra fields state
  const [priority, setPriority] = useState<'HIGH' | 'MEDIUM' | 'LOW'>('HIGH');
  const [appStatus, setAppStatus] = useState<string>('');
  const [extraData, setExtraData] = useState<Record<string, any>>({
    bond: 'None',
    feeStatus: 'Paid',
    hasExam: 'No',
    examDate: '',
    hasScholarship: 'No',
    scholarshipAmount: '',
    scholarshipName: '',
    docsChecklist: {
      aadhaar: false,
      photo: false,
      signature: false,
      categoryCert: false,
      degreeCert: false,
      paymentReceipt: false,
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
    // Set default status when type changes
    if (selectedType === 'EXAM') {
      setAppStatus('EXAM_REGISTERED');
      setExtraData((prev) => ({ ...prev, hasExam: 'Yes' }));
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
                {step === 1 ? 'What are you applying for?' : `Add ${config.label}`}
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
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#0B0B0B] p-3 rounded-xl border border-white/5">
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-[#C3195D] mb-1 font-mono uppercase tracking-wider">
                  Application Status
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

            {/* COMMON APPLICATION DATE & LOCATION */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#EFECEC] mb-1">Date of Applying</label>
                <input
                  type="date"
                  value={formData.applicationDate}
                  onChange={(e) => setFormData({ ...formData, applicationDate: e.target.value })}
                  className="w-full px-3 py-1.5 bg-[#0B0B0B] border border-white/5 rounded-xl text-xs text-[#EFECEC] [color-scheme:dark] focus:outline-none focus:border-[#C3195D]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#EFECEC] mb-1">
                  {selectedType === 'COLLEGE' ? 'Campus Location / City' : 'Location'}
                </label>
                <div className="relative">
                  <MapPin className="w-3.5 h-3.5 text-[#BFC3C7] absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="e.g. Chennai, TN / San Francisco, CA"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full pl-9 pr-3 py-1.5 bg-[#0B0B0B] border border-white/5 rounded-xl text-xs text-[#EFECEC] focus:outline-none focus:border-[#C3195D]"
                  />
                </div>
              </div>
            </div>

            {/* PRIMARY & SECONDARY FIELDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#EFECEC] mb-1">{config.fields.primaryLabel}</label>
                <div className="relative">
                  <Building2 className="w-3.5 h-3.5 text-[#BFC3C7] absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    placeholder={
                      selectedType === 'EXAM'
                        ? 'e.g. NTA, IIT Bombay, UPSC'
                        : selectedType === 'COLLEGE'
                        ? 'e.g. IIT Madras, NIT Trichy, VIT'
                        : selectedType === 'HACKATHON'
                        ? 'e.g. HackTheBox, Smart India Hackathon'
                        : selectedType === 'CERTIFICATION'
                        ? 'e.g. AWS, CompTIA, OffSec, Microsoft'
                        : selectedType === 'FELLOWSHIP'
                        ? 'e.g. Ministry of Education (AICTE Yuva Sangam)'
                        : 'e.g. Organization Name'
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
                      selectedType === 'EXAM'
                        ? 'e.g. GATE Computer Science 2026'
                        : selectedType === 'COLLEGE'
                        ? 'e.g. M.Tech Computer Science / AI'
                        : selectedType === 'HACKATHON'
                        ? 'e.g. National Cyber Defense CTF'
                        : selectedType === 'CERTIFICATION'
                        ? 'e.g. AWS Certified Solutions Architect / OSCP'
                        : selectedType === 'FELLOWSHIP'
                        ? 'e.g. Yuva Sangam Exposure Visit'
                        : 'e.g. Opportunity Title'
                    }
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full pl-9 pr-3 py-1.5 bg-[#0B0B0B] border border-white/5 rounded-xl text-xs text-[#EFECEC] focus:outline-none focus:border-[#C3195D]"
                  />
                </div>
              </div>
            </div>

            {/* UNIVERSAL FEE PAYMENT & EXAM DATE SECTION FOR ALL NON-JOB TYPES */}
            {selectedType !== 'JOB' && selectedType !== 'COLLEGE' && (
              <div className="space-y-4 bg-[#0B0B0B] p-4 rounded-xl border border-white/5">
                <span className="text-[10px] uppercase font-bold text-[#6CBF84] tracking-wider block flex items-center gap-1.5 font-mono">
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Fee Payment & Exam / Event Date Details</span>
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[10px] text-[#BFC3C7] mb-1">Fee / Amount Paid</label>
                    <div className="relative">
                      <DollarSign className="w-3.5 h-3.5 text-[#BFC3C7] absolute left-3 top-2.5" />
                      <input
                        type="text"
                        placeholder="e.g. ₹1,800 / $300 / Free"
                        value={formData.package}
                        onChange={(e) => setFormData({ ...formData, package: e.target.value })}
                        className="w-full pl-9 pr-3 py-1.5 bg-[#1A1A1A] border border-white/5 rounded-xl text-xs text-[#EFECEC] focus:outline-none focus:border-[#6CBF84]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] text-[#BFC3C7] mb-1">Payment Status</label>
                    <select
                      value={extraData.feeStatus || 'Paid'}
                      onChange={(e) => setExtraData({ ...extraData, feeStatus: e.target.value })}
                      className="w-full px-3 py-1.5 bg-[#1A1A1A] border border-white/5 rounded-xl text-xs font-semibold text-[#EFECEC] focus:outline-none focus:border-[#6CBF84]"
                    >
                      <option value="Paid" className="bg-[#0B0B0B]">✓ Paid</option>
                      <option value="Pending" className="bg-[#0B0B0B]">○ Pending</option>
                      <option value="Free" className="bg-[#0B0B0B]">🟢 Free / Waived</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] text-[#BFC3C7] mb-1">Payment Date</label>
                    <input
                      type="date"
                      value={extraData.feePaymentDate || ''}
                      onChange={(e) => setExtraData({ ...extraData, feePaymentDate: e.target.value })}
                      className="w-full px-2 py-1.5 bg-[#1A1A1A] border border-white/5 rounded-xl text-xs text-[#EFECEC] [color-scheme:dark]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-[#BFC3C7] mb-1">Transaction ID</label>
                    <input
                      type="text"
                      placeholder="e.g. TXN9841203"
                      value={extraData.transactionId || ''}
                      onChange={(e) => setExtraData({ ...extraData, transactionId: e.target.value })}
                      className="w-full px-3 py-1.5 bg-[#1A1A1A] border border-white/5 rounded-xl text-xs text-[#EFECEC]"
                    />
                  </div>
                </div>

                {/* OPTIONAL EXAM / EVENT DATE PICKER FOR CERTIFICATIONS, HACKATHONS & CUSTOM */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-white/5">
                  <div>
                    <label className="block text-[10px] text-[#E2B85C] font-bold mb-1">Is there an Exam / Event Date?</label>
                    <select
                      value={extraData.hasExam || 'No'}
                      onChange={(e) => setExtraData({ ...extraData, hasExam: e.target.value })}
                      className="w-full px-3 py-1.5 bg-[#1A1A1A] border border-white/5 rounded-xl text-xs text-[#EFECEC]"
                    >
                      <option value="No" className="bg-[#0B0B0B]">○ No Exam / Date</option>
                      <option value="Yes" className="bg-[#0B0B0B] text-[#E2B85C]">✓ Yes - Scheduled Exam / Test Date</option>
                    </select>
                  </div>

                  {(extraData.hasExam === 'Yes' || selectedType === 'EXAM') && (
                    <div>
                      <label className="block text-[10px] text-[#E2B85C] font-bold mb-1">Exam / Test Date</label>
                      <input
                        type="date"
                        value={extraData.examDate || ''}
                        onChange={(e) => setExtraData({ ...extraData, examDate: e.target.value })}
                        className="w-full px-2 py-1.5 bg-[#1A1A1A] border border-[#E2B85C]/40 rounded-xl text-xs text-[#EFECEC] [color-scheme:dark]"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TYPE-SPECIFIC SECTION: COLLEGE / UNIVERSITY ADMISSION (FEES & SCHOLARSHIP) */}
            {selectedType === 'COLLEGE' && (
              <div className="space-y-4 bg-[#0B0B0B] p-4 rounded-xl border border-white/5">
                <span className="text-[10px] uppercase font-bold text-[#6CBF84] tracking-wider block flex items-center gap-1.5 font-mono">
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>College Admission Fees & Scholarship Details</span>
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-[#BFC3C7] mb-1">Annual Tuition / Admission Fee</label>
                    <div className="relative">
                      <DollarSign className="w-3.5 h-3.5 text-[#BFC3C7] absolute left-3 top-2.5" />
                      <input
                        type="text"
                        placeholder="e.g. ₹2,50,000 / yr or $45,000 / yr"
                        value={formData.package}
                        onChange={(e) => setFormData({ ...formData, package: e.target.value })}
                        className="w-full pl-9 pr-3 py-1.5 bg-[#1A1A1A] border border-white/5 rounded-xl text-xs text-[#EFECEC] focus:outline-none focus:border-[#6CBF84]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] text-[#BFC3C7] mb-1">Receiving Scholarship / Fellowship?</label>
                    <select
                      value={extraData.hasScholarship || 'No'}
                      onChange={(e) => setExtraData({ ...extraData, hasScholarship: e.target.value })}
                      className="w-full px-3 py-1.5 bg-[#1A1A1A] border border-white/5 rounded-xl text-xs font-semibold text-[#EFECEC] focus:outline-none focus:border-[#6CBF84]"
                    >
                      <option value="No" className="bg-[#0B0B0B]">○ No Scholarship</option>
                      <option value="Yes" className="bg-[#0B0B0B] text-[#6CBF84]">✓ Yes - Scholarship Granted</option>
                      <option value="Applied" className="bg-[#0B0B0B] text-[#E2B85C]">🟡 Applied & Awaiting Result</option>
                    </select>
                  </div>
                </div>

                {(extraData.hasScholarship === 'Yes' || extraData.hasScholarship === 'Applied') && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-white/5">
                    <div>
                      <label className="block text-[11px] text-[#BFC3C7] mb-1">Scholarship Amount / Stipend</label>
                      <input
                        type="text"
                        placeholder="e.g. ₹12,400 / mo (GATE Stipend) / 50% Fee Waiver"
                        value={extraData.scholarshipAmount || ''}
                        onChange={(e) => setExtraData({ ...extraData, scholarshipAmount: e.target.value })}
                        className="w-full px-3 py-1.5 bg-[#1A1A1A] border border-white/5 rounded-xl text-xs text-[#EFECEC] focus:outline-none focus:border-[#6CBF84]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-[#BFC3C7] mb-1">Scholarship / Fellowship Name</label>
                      <input
                        type="text"
                        placeholder="e.g. MHRD GATE Stipend / Merit Scholarship"
                        value={extraData.scholarshipName || ''}
                        onChange={(e) => setExtraData({ ...extraData, scholarshipName: e.target.value })}
                        className="w-full px-3 py-1.5 bg-[#1A1A1A] border border-white/5 rounded-xl text-xs text-[#EFECEC] focus:outline-none focus:border-[#6CBF84]"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TYPE 1: JOB APPLICATION SPECIFIC CORPORATE FIELDS */}
            {selectedType === 'JOB' && (
              <div className="space-y-4 bg-[#0B0B0B] p-4 rounded-xl border border-white/5">
                <span className="text-[10px] uppercase font-bold text-[#C3195D] tracking-wider block flex items-center gap-1.5 font-mono">
                  <DollarSign className="w-3.5 h-3.5" />
                  <span>Salary Package, Work Mode & Service Bond</span>
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-[#BFC3C7] mb-1">Salary Package (CTC)</label>
                    <div className="relative">
                      <DollarSign className="w-3.5 h-3.5 text-[#BFC3C7] absolute left-3 top-2.5" />
                      <input
                        type="text"
                        placeholder="e.g. ₹12 LPA / $135,000 /yr"
                        value={formData.package}
                        onChange={(e) => setFormData({ ...formData, package: e.target.value })}
                        className="w-full pl-9 pr-3 py-1.5 bg-[#1A1A1A] border border-white/5 rounded-xl text-xs text-[#EFECEC] focus:outline-none focus:border-[#C3195D]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] text-[#BFC3C7] mb-1">Service / Contract Bond</label>
                    <input
                      type="text"
                      placeholder="e.g. None / 1 Year Bond / 2 Year Service Agreement"
                      value={extraData.bond || ''}
                      onChange={(e) => setExtraData({ ...extraData, bond: e.target.value })}
                      className="w-full px-3 py-1.5 bg-[#1A1A1A] border border-white/5 rounded-xl text-xs text-[#EFECEC] focus:outline-none focus:border-[#C3195D]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-[#BFC3C7] mb-1">Work Mode (Hybrid / Onsite)</label>
                    <select
                      value={formData.workMode}
                      onChange={(e) => setFormData({ ...formData, workMode: e.target.value })}
                      className="w-full px-3 py-1.5 bg-[#1A1A1A] border border-white/5 rounded-xl text-xs text-[#EFECEC] focus:outline-none focus:border-[#C3195D]"
                    >
                      {WORK_MODES.map((mode) => (
                        <option key={mode.id} value={mode.id} className="bg-[#0B0B0B] text-[#EFECEC]">{mode.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] text-[#BFC3C7] mb-1">Job Type</label>
                    <select
                      value={formData.jobType}
                      onChange={(e) => setFormData({ ...formData, jobType: e.target.value })}
                      className="w-full px-3 py-1.5 bg-[#1A1A1A] border border-white/5 rounded-xl text-xs text-[#EFECEC] focus:outline-none focus:border-[#C3195D]"
                    >
                      {JOB_TYPES.map((type) => (
                        <option key={type.id} value={type.id} className="bg-[#0B0B0B] text-[#EFECEC]">{type.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* TYPE 2: COMPETITIVE EXAM FULL LIFECYCLE FIELDS */}
            {selectedType === 'EXAM' && (
              <div className="space-y-4">
                {/* 1. REGISTRATION WINDOWS & DEADLINES */}
                <div className="bg-[#0B0B0B] p-4 rounded-xl border border-white/5 space-y-3">
                  <span className="text-[10px] uppercase font-bold text-[#C3195D] tracking-wider block flex items-center gap-1.5 font-mono">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Registration Deadlines & Critical Windows</span>
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-[10px] text-[#BFC3C7] mb-1">Registration Opens</label>
                      <input
                        type="date"
                        value={extraData.regOpenDate || ''}
                        onChange={(e) => setExtraData({ ...extraData, regOpenDate: e.target.value })}
                        className="w-full px-2 py-1.5 bg-[#1A1A1A] border border-white/5 rounded-xl text-xs text-[#EFECEC] [color-scheme:dark]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-[#C3195D] font-bold mb-1">Registration Closes *</label>
                      <input
                        type="date"
                        value={extraData.regCloseDate || ''}
                        onChange={(e) => setExtraData({ ...extraData, regCloseDate: e.target.value })}
                        className="w-full px-2 py-1.5 bg-[#1A1A1A] border border-[#C3195D]/40 rounded-xl text-xs text-[#EFECEC] [color-scheme:dark]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-[#BFC3C7] mb-1">Late Reg. Date</label>
                      <input
                        type="date"
                        value={extraData.lateRegDate || ''}
                        onChange={(e) => setExtraData({ ...extraData, lateRegDate: e.target.value })}
                        className="w-full px-2 py-1.5 bg-[#1A1A1A] border border-white/5 rounded-xl text-xs text-[#EFECEC] [color-scheme:dark]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-[#BFC3C7] mb-1">Correction Window</label>
                      <input
                        type="date"
                        value={extraData.correctionDate || ''}
                        onChange={(e) => setExtraData({ ...extraData, correctionDate: e.target.value })}
                        className="w-full px-2 py-1.5 bg-[#1A1A1A] border border-white/5 rounded-xl text-xs text-[#EFECEC] [color-scheme:dark]"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. ADMIT CARD ATTACHMENT & LINK */}
                <div className="bg-[#0B0B0B] p-4 rounded-xl border border-white/5 space-y-3">
                  <span className="text-[10px] uppercase font-bold text-[#62929A] tracking-wider block flex items-center gap-1.5 font-mono">
                    <FileCheck className="w-3.5 h-3.5" />
                    <span>Admit Card & Download Link</span>
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[10px] text-[#BFC3C7] mb-1">Admit Card Date</label>
                      <input
                        type="date"
                        value={extraData.admitCardDate || ''}
                        onChange={(e) => setExtraData({ ...extraData, admitCardDate: e.target.value })}
                        className="w-full px-2 py-1.5 bg-[#1A1A1A] border border-white/5 rounded-xl text-xs text-[#EFECEC] [color-scheme:dark]"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] text-[#BFC3C7] mb-1">Admit Card Link / URL</label>
                      <input
                        type="text"
                        placeholder="e.g. https://gate2026.iitb.ac.in/admitcard"
                        value={extraData.admitCardLink || ''}
                        onChange={(e) => setExtraData({ ...extraData, admitCardLink: e.target.value })}
                        className="w-full px-3 py-1.5 bg-[#1A1A1A] border border-white/5 rounded-xl text-xs text-[#EFECEC]"
                      />
                    </div>
                  </div>

                  {/* Device PDF Uploader for Admit Card */}
                  <div
                    onClick={() => admitCardInputRef.current?.click()}
                    className="flex items-center justify-between border border-dashed border-white/10 hover:border-[#62929A]/50 bg-[#1A1A1A] p-3 rounded-xl cursor-pointer transition"
                  >
                    <div className="flex items-center gap-2">
                      <UploadCloud className="w-4 h-4 text-[#62929A]" />
                      <span className="text-xs text-[#EFECEC]">
                        {admitCardFileName ? `Admit Card Attached: ${admitCardFileName}` : 'Upload Admit Card (PDF Document)'}
                      </span>
                    </div>
                    <span className="text-[10px] text-[#737373]">Click to upload PDF</span>
                    <input
                      type="file"
                      ref={admitCardInputRef}
                      accept=".pdf"
                      onChange={handleAdmitCardFileChange}
                      className="hidden"
                    />
                  </div>
                </div>

                {/* 3. EXAM CENTER BREAKDOWN */}
                <div className="bg-[#0B0B0B] p-4 rounded-xl border border-white/5 space-y-3">
                  <span className="text-[10px] uppercase font-bold text-[#E2B85C] tracking-wider block flex items-center gap-1.5 font-mono">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Exam Center Breakdown</span>
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[10px] text-[#BFC3C7] mb-1">Allocated Center</label>
                      <input
                        type="text"
                        placeholder="e.g. ION Digital Zone iDZ 1"
                        value={extraData.allocatedCenter || ''}
                        onChange={(e) => setExtraData({ ...extraData, allocatedCenter: e.target.value })}
                        className="w-full px-3 py-1.5 bg-[#1A1A1A] border border-white/5 rounded-xl text-xs text-[#EFECEC]"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] text-[#BFC3C7] mb-1">Center Address</label>
                      <input
                        type="text"
                        placeholder="e.g. Plot 42, Super Corridor, Indore"
                        value={extraData.centerAddress || ''}
                        onChange={(e) => setExtraData({ ...extraData, centerAddress: e.target.value })}
                        className="w-full px-3 py-1.5 bg-[#1A1A1A] border border-white/5 rounded-xl text-xs text-[#EFECEC]"
                      />
                    </div>
                  </div>
                </div>

                {/* 4. DOCUMENTS CHECKLIST */}
                <div className="bg-[#0B0B0B] p-4 rounded-xl border border-white/5 space-y-3">
                  <span className="text-[10px] uppercase font-bold text-[#EFECEC] tracking-wider block flex items-center gap-1.5 font-mono">
                    <CheckSquare className="w-3.5 h-3.5 text-[#C3195D]" />
                    <span>Documents Checklist</span>
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                    {[
                      { key: 'aadhaar', label: 'Aadhaar / Govt ID' },
                      { key: 'photo', label: 'Passport Photo' },
                      { key: 'signature', label: 'Signature Image' },
                      { key: 'categoryCert', label: 'Category Cert (OBC/EWS)' },
                      { key: 'degreeCert', label: 'Degree / Marksheet' },
                      { key: 'paymentReceipt', label: 'Payment Receipt' },
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
            {config.fields.showJobUrl && (
              <div>
                <label className="block text-xs font-medium text-[#EFECEC] mb-1">{config.fields.urlLabel}</label>
                <input
                  type="text"
                  placeholder="e.g. https://gate2026.iitb.ac.in/"
                  value={formData.jobUrl}
                  onChange={(e) => setFormData({ ...formData, jobUrl: e.target.value })}
                  className="w-full px-3 py-1.5 bg-[#0B0B0B] border border-white/5 rounded-xl text-xs text-[#EFECEC] focus:outline-none focus:border-[#C3195D]"
                />
              </div>
            )}

            {/* RESUME HANDLING: STRICTLY ONLY FOR JOB TYPE */}
            {config.requiresResume ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-white/5">
                <div>
                  <label className="block text-xs font-medium text-[#EFECEC] mb-1">Source</label>
                  <select
                    value={formData.source}
                    onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                    className="w-full px-3 py-1.5 bg-[#0B0B0B] border border-white/5 rounded-xl text-xs text-[#EFECEC] focus:outline-none focus:border-[#C3195D]"
                  >
                    {SOURCES.map((src) => (
                      <option key={src} value={src} className="bg-[#0B0B0B] text-[#EFECEC]">{src}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-medium text-[#EFECEC]">Resume Submitted</label>
                    {resumes.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setShowInlineResumeForm(!showInlineResumeForm)}
                        className="text-[10px] text-[#C3195D] hover:underline flex items-center gap-0.5"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Upload New</span>
                      </button>
                    )}
                  </div>

                  {resumes.length > 0 ? (
                    <div className="relative">
                      <FileText className="w-3.5 h-3.5 text-[#62929A] absolute left-3 top-2.5" />
                      <select
                        value={formData.resumeId}
                        onChange={(e) => setFormData({ ...formData, resumeId: e.target.value })}
                        className="w-full pl-9 pr-3 py-1.5 bg-[#0B0B0B] border border-white/5 rounded-xl text-xs text-[#EFECEC] focus:outline-none focus:border-[#C3195D]"
                      >
                        <option value="">Unassigned (Select Resume)</option>
                        {resumes.map((r) => (
                          <option key={r.id} value={r.id} className="bg-[#0B0B0B] text-[#EFECEC]">
                            {r.title}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div className="bg-[#0B0B0B] border border-white/5 rounded-xl p-3 text-center space-y-2">
                      <p className="text-[11px] text-[#BFC3C7]">No resumes found in your vault.</p>
                      <button
                        type="button"
                        onClick={() => setShowInlineResumeForm(true)}
                        className="px-3.5 py-1.5 bg-[#C3195D] hover:bg-[#a5134d] text-[#EFECEC] text-[11px] font-medium rounded-lg inline-flex items-center gap-1.5 transition shadow-sm"
                      >
                        <UploadCloud className="w-3.5 h-3.5" />
                        <span>Upload Resume Document</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : null}

            {/* PREPARATION / PRIVATE NOTES */}
            <div>
              <label className="block text-xs font-medium text-[#EFECEC] mb-1">{config.fields.notesLabel || 'Private Notes'}</label>
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
