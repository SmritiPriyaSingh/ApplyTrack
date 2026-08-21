"use client";

import { useEffect, useState, useRef } from 'react';
import { FileText, Plus, ExternalLink, UploadCloud, Check } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function ResumesPage() {
  const [resumes, setResumes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [selectedFileName, setSelectedFileName] = useState('');
  const [selectedFileData, setSelectedFileData] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const docInputRef = useRef<HTMLInputElement>(null);

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

  const handleDocumentFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert("File size should be less than 10MB");
      return;
    }

    const cleanTitle = file.name.replace(/\.[^/.]+$/, "").replace(/_/g, " ");
    setSelectedFileName(file.name);
    if (!title) {
      setTitle(cleanTitle);
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setSelectedFileData(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      const res = await fetch('/api/resumes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          versionTag: 'v1',
          fileUrl: selectedFileData || selectedFileName || 'Uploaded Document',
        }),
      });

      if (res.ok) {
        setTitle('');
        setSelectedFileName('');
        setSelectedFileData('');
        setShowAddForm(false);
        fetchResumes();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <div className="py-20 text-center text-[#BFC3C7] font-mono text-xs">Loading Resume Vault...</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-white/5">
        <div>
          <h1 className="text-xl font-bold text-[#EFECEC] tracking-tight">
            Resume Vault
          </h1>
          <p className="text-xs text-[#BFC3C7]">
            Upload and manage your resume documents to track application response rates.
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-3.5 py-1.5 rounded-xl bg-[#C3195D] hover:bg-[#a5134d] text-[#EFECEC] text-xs font-medium flex items-center gap-1.5 transition self-start md:self-auto shadow-sm"
        >
          <UploadCloud className="w-3.5 h-3.5" />
          <span>Upload Resume Document</span>
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleCreate} className="bg-[#0B0B0B] border border-[#C3195D]/40 p-5 rounded-2xl space-y-4 max-w-lg animate-fade-in">
          <div className="flex items-center gap-2 pb-2 border-b border-white/5">
            <FileText className="w-4 h-4 text-[#C3195D]" />
            <h3 className="text-xs font-bold text-[#EFECEC] uppercase tracking-wider">Upload Resume Document</h3>
          </div>

          {/* Native Document File Selector Button */}
          <div
            className="flex flex-col items-center justify-center border border-dashed border-white/10 hover:border-[#C3195D]/50 bg-[#1A1A1A] p-4 rounded-xl text-center cursor-pointer transition"
            onClick={() => docInputRef.current?.click()}
          >
            <UploadCloud className="w-6 h-6 text-[#C3195D] mb-1.5" />
            <span className="text-xs font-medium text-[#EFECEC]">
              {selectedFileName ? `Selected: ${selectedFileName}` : 'Choose Resume File from Computer (.pdf, .docx)'}
            </span>
            <span className="text-[10px] text-[#737373] mt-0.5">Click to select document</span>

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
            <label className="block text-[11px] text-[#BFC3C7] mb-1">Resume Name / Display Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. SOC Analyst Resume, DevOps Resume"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2 bg-[#1A1A1A] border border-white/5 rounded-xl text-xs text-[#EFECEC] focus:outline-none focus:border-[#C3195D]"
            />
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
              disabled={!title.trim()}
              className="px-4 py-1.5 bg-[#C3195D] hover:bg-[#a5134d] text-[#EFECEC] text-xs font-medium rounded-xl transition flex items-center gap-1.5 disabled:opacity-50"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Save Resume</span>
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
                        <span className="text-[10px] font-mono text-[#62929A]">Document Uploaded</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#1A1A1A] p-3 rounded-xl border border-white/5 space-y-1.5 mt-3">
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
                  <span>Uploaded: {formatDate(resume.createdAt)}</span>
                  {resume.fileUrl && resume.fileUrl.startsWith('data:') && (
                    <a
                      href={resume.fileUrl}
                      download={`${resume.title}.pdf`}
                      className="text-[#62929A] hover:underline flex items-center gap-1"
                    >
                      <span>Download File</span>
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
              Upload your resume documents directly from your computer (.pdf, .docx) to track application response rates.
            </p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="px-4 py-2 bg-[#C3195D] hover:bg-[#a5134d] text-[#EFECEC] text-xs font-medium rounded-xl inline-flex items-center gap-1.5 transition shadow-sm"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload Your First Resume</span>
          </button>
        </div>
      )}
    </div>
  );
}
