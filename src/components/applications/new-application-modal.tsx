"use client";

import { useState, useEffect } from 'react';
import { X, Building2, Briefcase, DollarSign, MapPin, FileText, Plus, Check } from 'lucide-react';
import { WORK_MODES, JOB_TYPES, SOURCES } from '@/lib/constants';

interface NewApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function NewApplicationModal({ isOpen, onClose, onSuccess }: NewApplicationModalProps) {
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

  // Inline resume form state
  const [newResumeTitle, setNewResumeTitle] = useState('');
  const [newResumeVersionTag, setNewResumeVersionTag] = useState('');
  const [newResumeTargetRole, setNewResumeTargetRole] = useState('');
  const [newResumeFileUrl, setNewResumeFileUrl] = useState('');
  const [resumeCreating, setResumeCreating] = useState(false);

  const fetchResumes = () => {
    fetch('/api/resumes')
      .then((res) => res.json())
      .then((data) => {
        if (data.resumes) {
          setResumes(data.resumes);
          // If no resume selected yet and resumes exist, pick the first one
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

  const handleInlineResumeCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newResumeTitle.trim()) return;

    setResumeCreating(true);
    try {
      const tag = newResumeVersionTag.trim() || 'v1';
      const res = await fetch('/api/resumes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newResumeTitle.trim(),
          versionTag: tag,
          targetRole: newResumeTargetRole.trim(),
          fileUrl: newResumeFileUrl.trim(),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const created = data.resume;
        setNewResumeTitle('');
        setNewResumeVersionTag('');
        setNewResumeTargetRole('');
        setNewResumeFileUrl('');
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
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
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
              <h2 className="text-sm font-semibold text-[#EFECEC]">New Application Entry</h2>
              <p className="text-[11px] text-[#BFC3C7]">Record role, company, salary, & resume version</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-[#BFC3C7] hover:text-[#EFECEC] hover:bg-[#1A1A1A] transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#EFECEC] mb-1">Company Name *</label>
              <div className="relative">
                <Building2 className="w-3.5 h-3.5 text-[#BFC3C7] absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  placeholder="e.g. CrowdStrike, Microsoft"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  className="w-full pl-9 pr-3 py-1.5 bg-[#0B0B0B] border border-white/5 rounded-xl text-xs text-[#EFECEC] focus:outline-none focus:border-[#C3195D]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#EFECEC] mb-1">Role Title *</label>
              <div className="relative">
                <Briefcase className="w-3.5 h-3.5 text-[#BFC3C7] absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  placeholder="e.g. SOC Analyst / Security Engineer"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full pl-9 pr-3 py-1.5 bg-[#0B0B0B] border border-white/5 rounded-xl text-xs text-[#EFECEC] focus:outline-none focus:border-[#C3195D]"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#EFECEC] mb-1">Department</label>
              <input
                type="text"
                placeholder="e.g. Threat Intelligence"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-3 py-1.5 bg-[#0B0B0B] border border-white/5 rounded-xl text-xs text-[#EFECEC] focus:outline-none focus:border-[#C3195D]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#EFECEC] mb-1">Work Mode</label>
              <select
                value={formData.workMode}
                onChange={(e) => setFormData({ ...formData, workMode: e.target.value })}
                className="w-full px-3 py-1.5 bg-[#0B0B0B] border border-white/5 rounded-xl text-xs text-[#EFECEC] focus:outline-none focus:border-[#C3195D]"
              >
                {WORK_MODES.map((mode) => (
                  <option key={mode} value={mode} className="bg-[#0B0B0B] text-[#EFECEC]">{mode}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#EFECEC] mb-1">Job Type</label>
              <select
                value={formData.jobType}
                onChange={(e) => setFormData({ ...formData, jobType: e.target.value })}
                className="w-full px-3 py-1.5 bg-[#0B0B0B] border border-white/5 rounded-xl text-xs text-[#EFECEC] focus:outline-none focus:border-[#C3195D]"
              >
                {JOB_TYPES.map((type) => (
                  <option key={type} value={type} className="bg-[#0B0B0B] text-[#EFECEC]">{type}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#EFECEC] mb-1">Location</label>
              <div className="relative">
                <MapPin className="w-3.5 h-3.5 text-[#BFC3C7] absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="e.g. San Francisco, CA / Remote"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full pl-9 pr-3 py-1.5 bg-[#0B0B0B] border border-white/5 rounded-xl text-xs text-[#EFECEC] focus:outline-none focus:border-[#C3195D]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#EFECEC] mb-1">Salary Package</label>
              <div className="relative">
                <DollarSign className="w-3.5 h-3.5 text-[#BFC3C7] absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="e.g. $135,000 /yr"
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
                <label className="block text-xs font-medium text-[#EFECEC]">Resume Version Submitted</label>
                {resumes.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowInlineResumeForm(!showInlineResumeForm)}
                    className="text-[10px] text-[#C3195D] hover:underline flex items-center gap-0.5"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add New</span>
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
                        {r.title} {r.versionTag ? `(${r.versionTag})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                /* Empty State when no resumes exist */
                <div className="bg-[#0B0B0B] border border-white/5 rounded-xl p-3 text-center space-y-2">
                  <p className="text-[11px] text-[#BFC3C7]">No resumes found in your vault.</p>
                  <button
                    type="button"
                    onClick={() => setShowInlineResumeForm(true)}
                    className="px-3 py-1 bg-[#C3195D] hover:bg-[#a5134d] text-[#EFECEC] text-[11px] font-medium rounded-lg inline-flex items-center gap-1 transition"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Upload Your First Resume</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Inline Resume Upload / Register Form */}
          {showInlineResumeForm && (
            <div className="bg-[#0B0B0B] border border-[#C3195D]/40 p-4 rounded-xl space-y-3 animate-fade-in">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-[#EFECEC] flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-[#C3195D]" />
                  <span>Register Resume Version</span>
                </h4>
                <button
                  type="button"
                  onClick={() => setShowInlineResumeForm(false)}
                  className="text-xs text-[#BFC3C7] hover:text-[#EFECEC]"
                >
                  Cancel
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-[#BFC3C7] mb-1">Friendly Display Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SOC Resume, Developer Resume"
                    value={newResumeTitle}
                    onChange={(e) => setNewResumeTitle(e.target.value)}
                    className="w-full px-3 py-1 bg-[#1A1A1A] border border-white/5 rounded-lg text-xs text-[#EFECEC] focus:outline-none focus:border-[#C3195D]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-[#BFC3C7] mb-1">Version Tag (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. v1, v2, SOC-v1"
                    value={newResumeVersionTag}
                    onChange={(e) => setNewResumeVersionTag(e.target.value)}
                    className="w-full px-3 py-1 bg-[#1A1A1A] border border-white/5 rounded-lg text-xs text-[#EFECEC] focus:outline-none focus:border-[#C3195D]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-[#BFC3C7] mb-1">Target Role (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Blue Team / Full Stack"
                    value={newResumeTargetRole}
                    onChange={(e) => setNewResumeTargetRole(e.target.value)}
                    className="w-full px-3 py-1 bg-[#1A1A1A] border border-white/5 rounded-lg text-xs text-[#EFECEC] focus:outline-none focus:border-[#C3195D]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-[#BFC3C7] mb-1">File Link / URL (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. https://drive.google.com/..."
                    value={newResumeFileUrl}
                    onChange={(e) => setNewResumeFileUrl(e.target.value)}
                    className="w-full px-3 py-1 bg-[#1A1A1A] border border-white/5 rounded-lg text-xs text-[#EFECEC] focus:outline-none focus:border-[#C3195D]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleInlineResumeCreate}
                  disabled={resumeCreating || !newResumeTitle.trim()}
                  className="px-3 py-1 bg-[#C3195D] hover:bg-[#a5134d] text-[#EFECEC] text-xs font-medium rounded-lg flex items-center gap-1 disabled:opacity-50"
                >
                  <Check className="w-3 h-3" />
                  <span>{resumeCreating ? 'Saving...' : 'Save & Select Resume'}</span>
                </button>
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-[#EFECEC] mb-1">Private Notes</label>
            <textarea
              rows={2}
              placeholder="e.g. Follow up next week..."
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
              {loading ? 'Creating...' : 'Save Entry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
