"use client";

import { useEffect, useState } from 'react';
import { ExternalLink, Edit3, Building2, Plus, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { NewApplicationModal } from '@/components/applications/new-application-modal';

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [notesInput, setNotesInput] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);

  const fetchCompanies = () => {
    fetch('/api/companies')
      .then((res) => res.json())
      .then((data) => {
        if (data.companies) setCompanies(data.companies);
        setLoading(false);
      })
      .catch((err) => setLoading(false));
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleLoadDemoData = async () => {
    setDemoLoading(true);
    try {
      const res = await fetch('/api/seed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'load_demo' }),
      });
      if (res.ok) window.location.reload();
    } catch (err) {
      console.error(err);
    } finally {
      setDemoLoading(false);
    }
  };

  const handleSaveNotes = async (companyId: string) => {
    try {
      const res = await fetch('/api/companies', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: companyId, notes: notesInput }),
      });
      if (res.ok) {
        setEditingId(null);
        fetchCompanies();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <div className="py-20 text-center text-[#BFC3C7] font-mono text-xs">Loading Companies Directory...</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="pb-2 border-b border-white/5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#EFECEC] tracking-tight">
            Companies Repository
          </h1>
          <p className="text-xs text-[#BFC3C7]">
            Normalized company directory with interview difficulty notes and role applications.
          </p>
        </div>
      </div>

      {companies.length === 0 ? (
        <div className="bg-[#0B0B0B] border border-white/5 rounded-2xl p-12 text-center space-y-4 max-w-lg mx-auto my-8">
          <div className="w-12 h-12 rounded-2xl bg-[#1A1A1A] border border-white/5 text-[#C3195D] flex items-center justify-center mx-auto shadow-md">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#EFECEC]">No Companies Registered Yet</h3>
            <p className="text-xs text-[#BFC3C7] mt-1 leading-relaxed">
              Companies will be normalized and added here automatically whenever you record a job application.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-[#C3195D] hover:bg-[#a5134d] text-[#EFECEC] text-xs font-medium rounded-xl inline-flex items-center gap-1.5 transition shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add Your First Application</span>
            </button>
            <button
              onClick={handleLoadDemoData}
              disabled={demoLoading}
              className="px-4 py-2 bg-[#1A1A1A] hover:bg-[#242424] text-[#62929A] text-xs font-medium rounded-xl border border-[#62929A]/30 inline-flex items-center gap-1.5 transition"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{demoLoading ? 'Loading Demo...' : 'Load Demo Data'}</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {companies.map((company) => {
            const isEditing = editingId === company.id;

            return (
              <div key={company.id} className="bg-[#0B0B0B] border border-white/5 hover:border-[#C3195D]/40 rounded-2xl p-5 space-y-4 transition">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#1A1A1A] border border-white/5 flex items-center justify-center font-bold text-sm text-[#C3195D] shrink-0">
                      {company.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#EFECEC] flex items-center gap-2">
                        <Link href={`/companies/${company.id}`} className="hover:text-[#C3195D] transition">
                          {company.name}
                        </Link>
                        {company.website && (
                          <a href={company.website} target="_blank" rel="noreferrer" className="text-[#BFC3C7] hover:text-[#C3195D]">
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </h3>
                      <p className="text-xs text-[#BFC3C7]">
                        {company.industry || 'Tech'} • {company.headquarters || 'USA'}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setEditingId(isEditing ? null : company.id);
                      setNotesInput(company.notes || '');
                    }}
                    className="text-xs text-[#BFC3C7] hover:text-[#EFECEC] p-1.5 rounded-lg hover:bg-[#1A1A1A] transition"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="bg-[#1A1A1A] p-3 rounded-xl border border-white/5">
                  <span className="text-[10px] uppercase font-bold text-[#C3195D] tracking-wider block mb-1">
                    Company Notes & Interview Difficulty
                  </span>
                  {isEditing ? (
                    <div className="space-y-2 mt-2">
                      <textarea
                        rows={3}
                        value={notesInput}
                        onChange={(e) => setNotesInput(e.target.value)}
                        className="w-full p-2 bg-[#0B0B0B] border border-white/5 rounded-lg text-xs text-[#EFECEC]"
                      />
                      <div className="flex justify-end gap-2">
                        <button onClick={() => setEditingId(null)} className="px-3 py-1 text-xs text-[#BFC3C7]">
                          Cancel
                        </button>
                        <button
                          onClick={() => handleSaveNotes(company.id)}
                          className="px-3 py-1 bg-[#C3195D] hover:bg-[#a5134d] text-[#EFECEC] text-xs font-medium rounded-lg"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-[#BFC3C7] italic">
                      {company.notes || 'No notes added yet.'}
                    </p>
                  )}
                </div>

                <div className="flex justify-end pt-1">
                  <Link
                    href={`/companies/${company.id}`}
                    className="text-xs font-medium text-[#C3195D] hover:underline"
                  >
                    Open Company Hub →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {isModalOpen && <NewApplicationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />}
    </div>
  );
}
