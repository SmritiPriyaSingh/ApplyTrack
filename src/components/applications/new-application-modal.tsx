"use client";

import { useState, useEffect, useRef } from 'react';
import { X, Building2, Briefcase, DollarSign, MapPin, FileText, Plus, Check, UploadCloud, Layers } from 'lucide-react';
import { WORK_MODES, JOB_TYPES, SOURCES, OPPORTUNITY_TYPES } from '@/lib/constants';

interface NewApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function NewApplicationModal({ isOpen, onClose, onSuccess }: NewApplicationModalProps) {
  const [opportunityType, setOpportunityType] = useState('JOB');
  const [formData, setFormData] = useState({
    companyName: '',
    role: '',
    department: '',
    workMode: 'REMOTE',
    jobType: 'FULL_TIME',
    location: '',
    package: '',
    salaryMin: '',
    salaryMax: '',
    jobUrl: '',
    source: 'LinkedIn',
    resumeId: '',
    notes: '',
  });

  const [resumes, setResumes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showInlineResumeForm, setShowInlineResumeForm] = useState(false);

  // Streamlined inline resume form state
  const [newResumeTitle, setNewResumeTitle] = useState('');
  const [selectedFileName, setSelectedFileName] = useState('');
  const [selectedFileData, setSelectedFileData] = useState('');
  const [resumeCreating, setResumeCreating] = useState(false);
  const docInputRef = useRef<HTMLInputElement>(null);

  const activeOpp = OPPORTUNITY_TYPES.find((o) => o.id === opportunityType) || OPPORTUNITY_TYPES[0];

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
    if (isOpen) fetchResumes();
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
    if (!newResumeTitle) {
      setNewResumeTitle(cleanTitle);
    }

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
        ...formData,
        notes: opportunityType !== 'JOB' ? `[Category: ${activeOpp.label}] ${formData.notes}` : formData.notes,
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
        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-[#0B0B0B]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#C3195D]/15 text-[#C3195D] flex items-center justify-center border border-[#C3195D]/30">
              <Briefcase className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-[#EFECEC]">Track Opportunity Entry</h2>
              <p className="text-[11px] text-[#BFC3C7]">Monitor Jobs, Govt Programs, Hackathons/CTFs, & Exams</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-[#BFC3C7] hover:text-[#EFECEC] hover:bg-[#1A1A1A] transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          {/* Opportunity Category Selector */}
          <div>
            <label className="block text-xs font-medium text-[#C3195D] mb-1 flex items-center gap-1.5 font-mono uppercase tracking-wider">
              <Layers className="w-3.5 h-3.5" />
              <span>Category / Opportunity Type</span>
            </label>
            <select
              value={opportunityType}
              onChange={(e) => {
                const newType = e.target.value;
                setOpportunityType(newType);
                if (newType === 'GOVT_PROGRAM') {
                  setFormData((prev) => ({ ...prev, source: 'Government Portal' }));
                } else if (newType === 'HACKATHON_CTF') {
                  setFormData((prev) => ({ ...prev, source: 'Hackathon / CTF Platform' }));
                }
              }}
              className="w-full px-3 py-2 bg-[#0B0B0B] border border-[#C3195D]/40 rounded-xl text-xs font-medium text-[#EFECEC] focus:outline-none focus:border-[#C3195D]"
            >
              {OPPORTUNITY_TYPES.map((type) => (
                <option key={type.id} value={type.id} className="bg-[#0B0B0B] text-[#EFECEC]">
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#EFECEC] mb-1">{activeOpp.companyLabel} *</label>
              <div className="relative">
                <Building2 className="w-3.5 h-3.5 text-[#BFC3C7] absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  placeholder={
                    opportunityType === 'GOVT_PROGRAM'
                      ? 'e.g. Government Department / Ministry Portal'
                      : opportunityType === 'HACKATHON_CTF'
                      ? 'e.g. Event Organizer / Hosting Platform'
                      : opportunityType === 'EXAM_ADMISSION'
                      ? 'e.g. Examination Board / Institution Name'
                      : 'e.g. Company or Organization Name'
                  }
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  className="w-full pl-9 pr-3 py-1.5 bg-[#0B0B0B] border border-white/5 rounded-xl text-xs text-[#EFECEC] focus:outline-none focus:border-[#C3195D]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#EFECEC] mb-1">{activeOpp.roleLabel} *</label>
              <div className="relative">
                <Briefcase className="w-3.5 h-3.5 text-[#BFC3C7] absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  placeholder={
                    opportunityType === 'GOVT_PROGRAM'
                      ? 'e.g. Youth Fellowship / Exposure Visit Program'
                      : opportunityType === 'HACKATHON_CTF'
                      ? 'e.g. Annual Cyber Security CTF'
                      : opportunityType === 'EXAM_ADMISSION'
                      ? 'e.g. Entrance Examination / Degree Course'
                      : 'e.g. Software Engineer, Analyst, Associate'
                  }
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full pl-9 pr-3 py-1.5 bg-[#0B0B0B] border border-white/5 rounded-xl text-xs text-[#EFECEC] focus:outline-none focus:border-[#C3195D]"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#EFECEC] mb-1">
                {opportunityType === 'GOVT_PROGRAM' ? 'Ministry / Scheme' : opportunityType === 'HACKATHON_CTF' ? 'Track / Category' : 'Department'}
              </label>
              <input
                type="text"
                placeholder="e.g. Department or Scheme Division"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-3 py-1.5 bg-[#0B0B0B] border border-white/5 rounded-xl text-xs text-[#EFECEC] focus:outline-none focus:border-[#C3195D]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#EFECEC] mb-1">Mode / Location Type</label>
              <select
                value={formData.workMode}
                onChange={(e) => setFormData({ ...formData, workMode: e.target.value })}
                className="w-full px-3 py-1.5 bg-[#0B0B0B] border border-white/5 rounded-xl text-xs text-[#EFECEC] focus:outline-none focus:border-[#C3195D]"
              >
                {WORK_MODES.map((mode) => (
                  <option key={mode.id} value={mode.id} className="bg-[#0B0B0B] text-[#EFECEC]">{mode.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#EFECEC] mb-1">Engagement Type</label>
              <select
                value={formData.jobType}
                onChange={(e) => setFormData({ ...formData, jobType: e.target.value })}
                className="w-full px-3 py-1.5 bg-[#0B0B0B] border border-white/5 rounded-xl text-xs text-[#EFECEC] focus:outline-none focus:border-[#C3195D]"
              >
                {JOB_TYPES.map((type) => (
                  <option key={type.id} value={type.id} className="bg-[#0B0B0B] text-[#EFECEC]">{type.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#EFECEC] mb-1">Location / State</label>
              <div className="relative">
                <MapPin className="w-3.5 h-3.5 text-[#BFC3C7] absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="e.g. City, Region, or Remote"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full pl-9 pr-3 py-1.5 bg-[#0B0B0B] border border-white/5 rounded-xl text-xs text-[#EFECEC] focus:outline-none focus:border-[#C3195D]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#EFECEC] mb-1">
                {opportunityType === 'HACKATHON_CTF' ? 'Prize / Bounty' : opportunityType === 'GOVT_PROGRAM' ? 'Stipend / Allowance' : 'Salary Package'}
              </label>
              <div className="relative">
                <DollarSign className="w-3.5 h-3.5 text-[#BFC3C7] absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="e.g. Package / Stipend / Reward"
                  value={formData.package}
                  onChange={(e) => setFormData({ ...formData, package: e.target.value })}
                  className="w-full pl-9 pr-3 py-1.5 bg-[#0B0B0B] border border-white/5 rounded-xl text-xs text-[#EFECEC] focus:outline-none focus:border-[#C3195D]"
                />
              </div>
            </div>
          </div>

          {/* Source & Dynamic Resume Selector */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#EFECEC] mb-1">Registration Portal / Source</label>
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
                <label className="block text-xs font-medium text-[#EFECEC]">Resume / Document Submitted</label>
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

              {/* Dynamic Resume Selector or Empty State */}
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
                /* Empty State when no resumes exist */
                <div className="bg-[#0B0B0B] border border-white/5 rounded-xl p-3 text-center space-y-2">
                  <p className="text-[11px] text-[#BFC3C7]">No documents found in your vault.</p>
                  <button
                    type="button"
                    onClick={() => setShowInlineResumeForm(true)}
                    className="px-3.5 py-1.5 bg-[#C3195D] hover:bg-[#a5134d] text-[#EFECEC] text-[11px] font-medium rounded-lg inline-flex items-center gap-1.5 transition shadow-sm"
                  >
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>Upload Document</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Streamlined Inline Resume Upload Form with Native File Picker */}
          {showInlineResumeForm && (
            <div className="bg-[#0B0B0B] border border-[#C3195D]/40 p-4 rounded-xl space-y-3 animate-fade-in">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-[#EFECEC] flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-[#C3195D]" />
                  <span>Upload Document File from Device</span>
                </h4>
                <button
                  type="button"
                  onClick={() => setShowInlineResumeForm(false)}
                  className="text-xs text-[#BFC3C7] hover:text-[#EFECEC]"
                >
                  Cancel
                </button>
              </div>

              {/* Native Document File Selector Button */}
              <div
                className="flex flex-col items-center justify-center border border-dashed border-white/10 hover:border-[#C3195D]/50 bg-[#1A1A1A] p-3.5 rounded-xl text-center cursor-pointer transition"
                onClick={() => docInputRef.current?.click()}
              >
                <UploadCloud className="w-5 h-5 text-[#C3195D] mb-1" />
                <span className="text-xs font-medium text-[#EFECEC]">
                  {selectedFileName ? `Selected: ${selectedFileName}` : 'Choose Document File (.pdf, .docx)'}
                </span>
                <span className="text-[10px] text-[#737373] mt-0.5">Click to browse your documents</span>

                <input
                  type="file"
                  ref={docInputRef}
                  accept=".pdf,.doc,.docx"
                  onChange={handleDocumentFileChange}
                  className="hidden"
                />
              </div>

              {/* Single Clean Title Input Field */}
              <div>
                <label className="block text-[11px] text-[#BFC3C7] mb-1">Document Label / Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Primary Resume, Application Form"
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
                  <span>{resumeCreating ? 'Uploading...' : 'Upload & Attach Document'}</span>
                </button>
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-[#EFECEC] mb-1">Private Notes / Reference ID</label>
            <textarea
              rows={2}
              placeholder="e.g. Application reference number, registration status, follow-up dates..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full p-3 bg-[#0B0B0B] border border-white/5 rounded-xl text-xs text-[#EFECEC] focus:outline-none focus:border-[#C3195D] resize-none"
            />
          </div>

          <div className="pt-3 border-t border-white/5 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl text-xs font-medium text-[#BFC3C7] hover:text-[#EFECEC]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-1.5 rounded-xl bg-[#C3195D] hover:bg-[#a5134d] text-[#EFECEC] text-xs font-medium transition disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Opportunity Entry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
