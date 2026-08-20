"use client";

import { useEffect, useState } from 'react';
import { FileText, Plus, ExternalLink, UploadCloud } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function ResumesPage() {
  const [resumes, setResumes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [versionTag, setVersionTag] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const fetchResumes = () => {
    fetch('/api/resumes')
      .then((res) => res.json())
      .then((data) => {
        if (data.resumes) setResumes(data.resumes);
        setLoading(false);
      })
      .catch((err) => setLoading(false));
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    try {
      const tag = versionTag.trim() || 'v1';
      const res = await fetch('/api/resumes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, versionTag: tag, fileUrl, targetRole }),
      });

      if (res.ok) {
        setTitle('');
        setVersionTag('');
        setFileUrl('');
        setTargetRole('');
        setShowAddForm(false);
        fetchResumes();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-white/5">
        <div>
          <h1 className="text-xl font-bold text-[#EFECEC] tracking-tight">
            Resume Version Vault
          </h1>
          <p className="text-xs text-[#BFC3C7]">
            Track resume performance and application response conversion per friendly version.
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-3.5 py-1.5 rounded-xl bg-[#C3195D] hover:bg-[#a5134d] text-[#EFECEC] text-xs font-medium flex items-center gap-1.5 transition self-start md:self-auto shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Upload New Resume</span>
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleCreate} className="bg-[#0B0B0B] border border-[#C3195D]/40 p-5 rounded-2xl space-y-4 max-w-xl animate-fade-in">
          <div className="flex items-center gap-2 pb-2 border-b border-white/5">
            <FileText className="w-4 h-4 text-[#C3195D]" />
            <h3 className="text-xs font-bold text-[#EFECEC] uppercase tracking-wider">Register Resume Version</h3>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] text-[#BFC3C7] mb-1">Friendly Display Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. SOC Resume, Developer Resume"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-1.5 bg-[#1A1A1A] border border-white/5 rounded-xl text-xs text-[#EFECEC] focus:outline-none focus:border-[#C3195D]"
              />
            </div>
            <div>
              <label className="block text-[11px] text-[#BFC3C7] mb-1">Version Tag (Optional)</label>
              <input
                type="text"
                placeholder="e.g. v1, v2, SOC-v1"
                value={versionTag}
                onChange={(e) => setVersionTag(e.target.value)}
                className="w-full px-3 py-1.5 bg-[#1A1A1A] border border-white/5 rounded-xl text-xs text-[#EFECEC] focus:outline-none focus:border-[#C3195D]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] text-[#BFC3C7] mb-1">Target Role (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Blue Team / Full Stack"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="w-full px-3 py-1.5 bg-[#1A1A1A] border border-white/5 rounded-xl text-xs text-[#EFECEC] focus:outline-none focus:border-[#C3195D]"
              />
            </div>
            <div>
              <label className="block text-[11px] text-[#BFC3C7] mb-1">File Link / URL (Optional)</label>
              <input
                type="text"
                placeholder="e.g. https://drive.google.com/..."
                value={fileUrl}
                onChange={(e) => setFileUrl(e.target.value)}
                className="w-full px-3 py-1.5 bg-[#1A1A1A] border border-white/5 rounded-xl text-xs text-[#EFECEC] focus:outline-none focus:border-[#C3195D]"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3 py-1 text-xs text-[#BFC3C7] hover:text-[#EFECEC]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-[#C3195D] hover:bg-[#a5134d] text-[#EFECEC] text-xs font-medium rounded-xl transition"
            >
              Save Version
            </button>
          </div>
        </form>
      )}

      {/* Resumes Grid or Empty State */}
      {resumes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resumes.map((resume) => {
            const totalApps = resume._count?.applications || 0;
            const interviewsCount = resume.applications?.filter((a: any) =>
              ['TECHNICAL_INTERVIEW', 'HR_INTERVIEW', 'FINAL_INTERVIEW', 'OFFER', 'JOINED'].includes(a.status)
            ).length || 0;
            const successRate = totalApps > 0 ? Math.round((interviewsCount / totalApps) * 100) : 0;

            return (
              <div
                key={resume.id}
                className="bg-[#0B0B0B] border border-white/5 hover:border-[#C3195D]/40 rounded-2xl p-5 space-y-4 transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-[#1A1A1A] border border-white/5 flex items-center justify-center text-[#62929A]">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-[#EFECEC]">{resume.title}</h3>
                        <span className="text-[10px] font-mono text-[#C3195D] font-bold">{resume.versionTag}</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-[#BFC3C7] mb-3">
                    Target Role: <span className="text-[#EFECEC] font-medium">{resume.targetRole || 'General'}</span>
                  </p>

                  <div className="bg-[#1A1A1A] p-3 rounded-xl border border-white/5 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#BFC3C7]">Applications Linked:</span>
                      <span className="font-mono font-bold text-[#EFECEC]">{totalApps}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#BFC3C7]">Interview Conversion:</span>
                      <span className="font-mono font-bold text-[#62929A]">{successRate}%</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-[#737373]">
                  <span>Created: {formatDate(resume.createdAt)}</span>
                  {resume.fileUrl && (
                    <a
                      href={resume.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#62929A] hover:underline flex items-center gap-1"
                    >
                      <span>View File</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Dedicated Empty State when no resumes exist */
        <div className="bg-[#0B0B0B] border border-white/5 rounded-2xl p-12 text-center space-y-4 max-w-lg mx-auto my-8">
          <div className="w-12 h-12 rounded-2xl bg-[#1A1A1A] border border-white/5 text-[#C3195D] flex items-center justify-center mx-auto">
            <UploadCloud className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#EFECEC]">No Resumes in Your Vault</h3>
            <p className="text-xs text-[#BFC3C7] mt-1">
              Upload your resume versions with friendly display names (e.g. &quot;SOC Resume&quot;, &quot;Developer Resume&quot;) to track application ROI per version.
            </p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="px-4 py-2 bg-[#C3195D] hover:bg-[#a5134d] text-[#EFECEC] text-xs font-medium rounded-xl inline-flex items-center gap-1.5 transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Upload Your First Resume</span>
          </button>
        </div>
      )}
    </div>
  );
}
