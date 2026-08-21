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
  DollarSign,
  MapPin,
  Building2,
  Calendar,
  UserCheck,
  Award as PrizeIcon,
  Plus
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

  // Job specific state
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
  const [extraData, setExtraData] = useState<Record<string, string>>({});

  const [resumes, setResumes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showInlineResumeForm, setShowInlineResumeForm] = useState(false);
  const [newResumeTitle, setNewResumeTitle] = useState('');
  const [selectedFileName, setSelectedFileName] = useState('');
  const [selectedFileData, setSelectedFileData] = useState('');
  const [resumeCreating, setResumeCreating] = useState(false);
  const docInputRef = useRef<HTMLInputElement>(null);

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
        extraData,
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
                      selectedType === 'EXAM'
                        ? 'e.g. NTA, IIT Bombay, UPSC'
                        : selectedType === 'COLLEGE'
                        ? 'e.g. IIT Madras, NIT Trichy, VIT'
                        : selectedType === 'HACKATHON'
                        ? 'e.g. HackTheBox, Smart India Hackathon'
                        : selectedType === 'FELLOWSHIP'
                        ? 'e.g. Ministry of Education (AICTE Yuva Sangam)'
                        : selectedType === 'CERTIFICATION'
                        ? 'e.g. AWS, CompTIA, OffSec'
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
                      selectedType === 'EXAM'
                        ? 'e.g. GATE Computer Science 2026'
                        : selectedType === 'COLLEGE'
                        ? 'e.g. M.Tech Computer Science / AI'
                        : selectedType === 'HACKATHON'
                        ? 'e.g. National Cyber Defense CTF'
                        : selectedType === 'FELLOWSHIP'
                        ? 'e.g. Yuva Sangam Exposure Visit'
                        : selectedType === 'CERTIFICATION'
                        ? 'e.g. Security+ / CEH / CISSP'
                        : 'e.g. SOC Analyst / Security Engineer'
                    }
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full pl-9 pr-3 py-1.5 bg-[#0B0B0B] border border-white/5 rounded-xl text-xs text-[#EFECEC] focus:outline-none focus:border-[#C3195D]"
                  />
                </div>
              </div>
            </div>

            {/* TYPE 2: COMPETITIVE EXAM FIELDS */}
            {selectedType === 'EXAM' && (
              <div className="space-y-4 bg-[#0B0B0B] p-4 rounded-xl border border-white/5">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-[#BFC3C7] mb-1">Registration Number / Roll No.</label>
                    <input
                      type="text"
                      placeholder="e.g. CS26S8914021"
                      value={extraData.registrationNo || ''}
                      onChange={(e) => setExtraData({ ...extraData, registrationNo: e.target.value })}
                      className="w-full px-3 py-1.5 bg-[#1A1A1A] border border-white/5 rounded-xl text-xs text-[#EFECEC] focus:outline-none focus:border-[#C3195D]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-[#BFC3C7] mb-1">Application Fee (₹ / $)</label>
                    <input
                      type="text"
                      placeholder="e.g. ₹1,800"
                      value={formData.package}
                      onChange={(e) => setFormData({ ...formData, package: e.target.value })}
                      className="w-full px-3 py-1.5 bg-[#1A1A1A] border border-white/5 rounded-xl text-xs text-[#EFECEC] focus:outline-none focus:border-[#C3195D]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] text-[#BFC3C7] mb-1">Admit Card Date</label>
                    <input
                      type="date"
                      value={extraData.admitCardDate || ''}
                      onChange={(e) => setExtraData({ ...extraData, admitCardDate: e.target.value })}
                      className="w-full px-3 py-1.5 bg-[#1A1A1A] border border-white/5 rounded-xl text-xs text-[#EFECEC] focus:outline-none focus:border-[#C3195D]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-[#BFC3C7] mb-1">Exam Date</label>
                    <input
                      type="date"
                      value={extraData.examDate || ''}
                      onChange={(e) => setExtraData({ ...extraData, examDate: e.target.value })}
                      className="w-full px-3 py-1.5 bg-[#1A1A1A] border border-white/5 rounded-xl text-xs text-[#EFECEC] focus:outline-none focus:border-[#C3195D]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-[#BFC3C7] mb-1">Result Date</label>
                    <input
                      type="date"
                      value={extraData.resultDate || ''}
                      onChange={(e) => setExtraData({ ...extraData, resultDate: e.target.value })}
                      className="w-full px-3 py-1.5 bg-[#1A1A1A] border border-white/5 rounded-xl text-xs text-[#EFECEC] focus:outline-none focus:border-[#C3195D]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-[#BFC3C7] mb-1">Score Obtained</label>
                    <input
                      type="text"
                      placeholder="e.g. 745 / 1000"
                      value={extraData.score || ''}
                      onChange={(e) => setExtraData({ ...extraData, score: e.target.value })}
                      className="w-full px-3 py-1.5 bg-[#1A1A1A] border border-white/5 rounded-xl text-xs text-[#EFECEC] focus:outline-none focus:border-[#C3195D]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-[#BFC3C7] mb-1">All India Rank (AIR)</label>
                    <input
                      type="text"
                      placeholder="e.g. AIR 142"
                      value={extraData.rank || ''}
                      onChange={(e) => setExtraData({ ...extraData, rank: e.target.value })}
                      className="w-full px-3 py-1.5 bg-[#1A1A1A] border border-white/5 rounded-xl text-xs text-[#EFECEC] focus:outline-none focus:border-[#C3195D]"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TYPE 3: COLLEGE ADMISSION FIELDS */}
            {selectedType === 'COLLEGE' && (
              <div className="space-y-4 bg-[#0B0B0B] p-4 rounded-xl border border-white/5">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-[#BFC3C7] mb-1">Branch / Specialization</label>
                    <input
                      type="text"
                      placeholder="e.g. Cybersecurity & Digital Forensics"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      className="w-full px-3 py-1.5 bg-[#1A1A1A] border border-white/5 rounded-xl text-xs text-[#EFECEC] focus:outline-none focus:border-[#C3195D]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-[#BFC3C7] mb-1">Tuition & Hostel Fee</label>
                    <input
                      type="text"
                      placeholder="e.g. ₹2,50,000 / year"
                      value={formData.package}
                      onChange={(e) => setFormData({ ...formData, package: e.target.value })}
                      className="w-full px-3 py-1.5 bg-[#1A1A1A] border border-white/5 rounded-xl text-xs text-[#EFECEC] focus:outline-none focus:border-[#C3195D]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] text-[#BFC3C7] mb-1">Entrance Exam Taken</label>
                    <input
                      type="text"
                      placeholder="e.g. GATE 2026 / VITMEE"
                      value={extraData.entranceExam || ''}
                      onChange={(e) => setExtraData({ ...extraData, entranceExam: e.target.value })}
                      className="w-full px-3 py-1.5 bg-[#1A1A1A] border border-white/5 rounded-xl text-xs text-[#EFECEC] focus:outline-none focus:border-[#C3195D]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-[#BFC3C7] mb-1">Scholarship Amount</label>
                    <input
                      type="text"
                      placeholder="e.g. ₹12,400 / month Stipend"
                      value={extraData.scholarship || ''}
                      onChange={(e) => setExtraData({ ...extraData, scholarship: e.target.value })}
                      className="w-full px-3 py-1.5 bg-[#1A1A1A] border border-white/5 rounded-xl text-xs text-[#EFECEC] focus:outline-none focus:border-[#C3195D]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-[#BFC3C7] mb-1">Application Deadline</label>
                    <input
                      type="date"
                      value={extraData.deadline || ''}
                      onChange={(e) => setExtraData({ ...extraData, deadline: e.target.value })}
                      className="w-full px-3 py-1.5 bg-[#1A1A1A] border border-white/5 rounded-xl text-xs text-[#EFECEC] focus:outline-none focus:border-[#C3195D]"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TYPE 4: HACKATHON / CTF FIELDS */}
            {selectedType === 'HACKATHON' && (
              <div className="space-y-4 bg-[#0B0B0B] p-4 rounded-xl border border-white/5">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-[#BFC3C7] mb-1">Team Name</label>
                    <input
                      type="text"
                      placeholder="e.g. CyberKnights"
                      value={extraData.teamName || ''}
                      onChange={(e) => setExtraData({ ...extraData, teamName: e.target.value })}
                      className="w-full px-3 py-1.5 bg-[#1A1A1A] border border-white/5 rounded-xl text-xs text-[#EFECEC] focus:outline-none focus:border-[#C3195D]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-[#BFC3C7] mb-1">Team Members Count / Handles</label>
                    <input
                      type="text"
                      placeholder="e.g. 4 Members (@smriti, @alex)"
                      value={extraData.teamMembers || ''}
                      onChange={(e) => setExtraData({ ...extraData, teamMembers: e.target.value })}
                      className="w-full px-3 py-1.5 bg-[#1A1A1A] border border-white/5 rounded-xl text-xs text-[#EFECEC] focus:outline-none focus:border-[#C3195D]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-[#BFC3C7] mb-1">Prize Pool / Bounty</label>
                    <input
                      type="text"
                      placeholder="e.g. ₹1,00,000 Cash Prize"
                      value={formData.package}
                      onChange={(e) => setFormData({ ...formData, package: e.target.value })}
                      className="w-full px-3 py-1.5 bg-[#1A1A1A] border border-white/5 rounded-xl text-xs text-[#EFECEC] focus:outline-none focus:border-[#C3195D]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-[#BFC3C7] mb-1">Event Date</label>
                    <input
                      type="date"
                      value={extraData.eventDate || ''}
                      onChange={(e) => setExtraData({ ...extraData, eventDate: e.target.value })}
                      className="w-full px-3 py-1.5 bg-[#1A1A1A] border border-white/5 rounded-xl text-xs text-[#EFECEC] focus:outline-none focus:border-[#C3195D]"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TYPE 5: FELLOWSHIP / GOVT PROGRAM FIELDS */}
            {selectedType === 'FELLOWSHIP' && (
              <div className="space-y-4 bg-[#0B0B0B] p-4 rounded-xl border border-white/5">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-[#BFC3C7] mb-1">Stipend / Benefits</label>
                    <input
                      type="text"
                      placeholder="e.g. Fully Funded Visit + ₹10,000"
                      value={formData.package}
                      onChange={(e) => setFormData({ ...formData, package: e.target.value })}
                      className="w-full px-3 py-1.5 bg-[#1A1A1A] border border-white/5 rounded-xl text-xs text-[#EFECEC] focus:outline-none focus:border-[#C3195D]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-[#BFC3C7] mb-1">Program Duration</label>
                    <input
                      type="text"
                      placeholder="e.g. 10 Days Exposure Visit / 3 Months"
                      value={extraData.duration || ''}
                      onChange={(e) => setExtraData({ ...extraData, duration: e.target.value })}
                      className="w-full px-3 py-1.5 bg-[#1A1A1A] border border-white/5 rounded-xl text-xs text-[#EFECEC] focus:outline-none focus:border-[#C3195D]"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* COMMON FIELDS: LOCATION & PORTAL LINK */}
            <div className="grid grid-cols-2 gap-4">
              {config.fields.showLocation && (
                <div>
                  <label className="block text-xs font-medium text-[#EFECEC] mb-1">{config.fields.locationLabel}</label>
                  <div className="relative">
                    <MapPin className="w-3.5 h-3.5 text-[#BFC3C7] absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="e.g. New Delhi / Online"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full pl-9 pr-3 py-1.5 bg-[#0B0B0B] border border-white/5 rounded-xl text-xs text-[#EFECEC] focus:outline-none focus:border-[#C3195D]"
                    />
                  </div>
                </div>
              )}

              {config.fields.showJobUrl && (
                <div>
                  <label className="block text-xs font-medium text-[#EFECEC] mb-1">{config.fields.urlLabel}</label>
                  <input
                    type="text"
                    placeholder="e.g. https://ebsb.aicte-india.org/"
                    value={formData.jobUrl}
                    onChange={(e) => setFormData({ ...formData, jobUrl: e.target.value })}
                    className="w-full px-3 py-1.5 bg-[#0B0B0B] border border-white/5 rounded-xl text-xs text-[#EFECEC] focus:outline-none focus:border-[#C3195D]"
                  />
                </div>
              )}
            </div>

            {/* RESUME HANDLING: STRICTLY ONLY FOR JOB TYPE */}
            {config.requiresResume ? (
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-white/5">
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

            {/* INLINE RESUME FORM FOR JOB TYPE */}
            {config.requiresResume && showInlineResumeForm && (
              <div className="bg-[#0B0B0B] border border-[#C3195D]/40 p-4 rounded-xl space-y-3 animate-fade-in">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-[#EFECEC] flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-[#C3195D]" />
                    <span>Upload Resume Document from Device</span>
                  </h4>
                  <button
                    type="button"
                    onClick={() => setShowInlineResumeForm(false)}
                    className="text-xs text-[#BFC3C7] hover:text-[#EFECEC]"
                  >
                    Cancel
                  </button>
                </div>

                <div
                  className="flex flex-col items-center justify-center border border-dashed border-white/10 hover:border-[#C3195D]/50 bg-[#1A1A1A] p-3.5 rounded-xl text-center cursor-pointer transition"
                  onClick={() => docInputRef.current?.click()}
                >
                  <UploadCloud className="w-5 h-5 text-[#C3195D] mb-1" />
                  <span className="text-xs font-medium text-[#EFECEC]">
                    {selectedFileName ? `Selected: ${selectedFileName}` : 'Choose Resume File (.pdf, .docx)'}
                  </span>
                  <input
                    type="file"
                    ref={docInputRef}
                    accept=".pdf,.doc,.docx"
                    onChange={handleDocumentFileChange}
                    className="hidden"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-[#BFC3C7] mb-1">Resume Name / Label *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SOC Resume, DevOps Resume"
                    value={newResumeTitle}
                    onChange={(e) => setNewResumeTitle(e.target.value)}
                    className="w-full px-3 py-1.5 bg-[#1A1A1A] border border-white/5 rounded-xl text-xs text-[#EFECEC] focus:outline-none focus:border-[#C3195D]"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleInlineResumeCreate}
                    disabled={resumeCreating || !newResumeTitle.trim()}
                    className="px-3.5 py-1.5 bg-[#C3195D] hover:bg-[#a5134d] text-[#EFECEC] text-xs font-medium rounded-xl flex items-center gap-1.5 transition disabled:opacity-50"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{resumeCreating ? 'Uploading...' : 'Upload & Attach Resume'}</span>
                  </button>
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-[#EFECEC] mb-1">Private Notes / Reference Details</label>
              <textarea
                rows={2}
                placeholder="e.g. Registration ID: YS-2026-89412, Submitted on ebsb.aicte-india.org..."
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
