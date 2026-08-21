"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Kanban, 
  List, 
  Search, 
  Plus, 
  ChevronRight,
  Briefcase,
  GraduationCap,
  FileText,
  Trophy,
  Globe,
  Award,
  Folder,
  Layers,
  Trash2,
  ArrowUpRight
} from 'lucide-react';
import { APPLICATION_TYPES, getAllStagesForType, getStageBadgeForType } from '@/lib/application-types';
import { WORK_MODES, DEFAULT_TAGS } from '@/lib/constants';
import { formatDate } from '@/lib/utils';
import { NewApplicationModal } from '@/components/applications/new-application-modal';

const TYPE_ICONS: Record<string, any> = {
  Briefcase,
  GraduationCap,
  FileText,
  Trophy,
  Globe,
  Award,
  Folder,
};

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [selectedWorkMode, setSelectedWorkMode] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchApplications = () => {
    let url = '/api/applications?';
    if (searchQuery) url += `query=${encodeURIComponent(searchQuery)}&`;
    if (selectedType) url += `appType=${selectedType}&`;
    if (selectedStatus) url += `status=${selectedStatus}&`;
    if (selectedWorkMode) url += `workMode=${selectedWorkMode}&`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (data.applications) setApplications(data.applications);
        setLoading(false);
      })
      .catch((err) => setLoading(false));
  };

  useEffect(() => {
    fetchApplications();
  }, [searchQuery, selectedType, selectedStatus, selectedWorkMode]);

  const handleDeleteApplication = async (appId: string, companyName: string) => {
    if (!confirm(`Are you sure you want to delete this application entry (${companyName})?`)) return;

    try {
      const res = await fetch(`/api/applications/${appId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setApplications((prev) => prev.filter((a) => a.id !== appId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <div className="py-20 text-center text-[#BFC3C7] font-mono text-xs">Loading Applications Board...</div>;
  }

  const currentStages = getAllStagesForType(selectedType);

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* TOP HEADER BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div>
          <h1 className="text-xl font-bold text-[#EFECEC] tracking-tight">Applications Board</h1>
          <p className="text-xs text-[#BFC3C7]">
            Track Jobs, Competitive Exams, College Admissions, Hackathons & Fellowships across custom pipelines.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-[#0B0B0B] border border-white/5 p-1 rounded-xl flex items-center gap-1">
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition ${
                viewMode === 'kanban'
                  ? 'bg-[#C3195D] text-[#EFECEC]'
                  : 'text-[#BFC3C7] hover:text-[#EFECEC]'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
              <span>Pipeline View</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition ${
                viewMode === 'list'
                  ? 'bg-[#C3195D] text-[#EFECEC]'
                  : 'text-[#BFC3C7] hover:text-[#EFECEC]'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Table List</span>
            </button>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-[#C3195D] hover:bg-[#a5134d] text-[#EFECEC] text-xs font-medium flex items-center gap-1.5 transition active:scale-95 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Track New Application</span>
          </button>
        </div>
      </div>

      {/* QUICK TYPE FILTER STRIP */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setSelectedType('')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition shrink-0 flex items-center gap-1.5 ${
            selectedType === ''
              ? 'bg-[#C3195D] text-[#EFECEC] border-[#C3195D] shadow-sm'
              : 'bg-[#0B0B0B] text-[#BFC3C7] border-white/5 hover:text-[#EFECEC]'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>All Opportunities</span>
        </button>

        {Object.values(APPLICATION_TYPES).map((type) => {
          const IconComp = TYPE_ICONS[type.iconName] || Briefcase;
          const isSelected = selectedType === type.id;

          return (
            <button
              key={type.id}
              onClick={() => setSelectedType(type.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition shrink-0 flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-[#C3195D] text-[#EFECEC] border-[#C3195D] shadow-sm font-semibold'
                  : 'bg-[#0B0B0B] text-[#BFC3C7] border-white/5 hover:text-[#EFECEC]'
              }`}
            >
              <IconComp className="w-3.5 h-3.5 text-[#62929A]" />
              <span>{type.label}</span>
            </button>
          );
        })}
      </div>

      {/* SEARCH AND ADVANCED FILTERS */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#0B0B0B] p-3 rounded-2xl border border-white/5">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-[#BFC3C7] absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by company, title, exam..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-[#1A1A1A] border border-white/5 rounded-xl text-xs text-[#EFECEC] focus:outline-none focus:border-[#C3195D]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-1.5 bg-[#1A1A1A] border border-white/5 rounded-xl text-xs text-[#EFECEC] focus:outline-none"
          >
            <option value="">All Pipeline Stages</option>
            {currentStages.map((s) => (
              <option key={s.id} value={s.id} className="bg-[#1A1A1A] text-[#EFECEC]">
                {s.label}
              </option>
            ))}
          </select>

          <select
            value={selectedWorkMode}
            onChange={(e) => setSelectedWorkMode(e.target.value)}
            className="px-3 py-1.5 bg-[#1A1A1A] border border-white/5 rounded-xl text-xs text-[#EFECEC] focus:outline-none"
          >
            <option value="">All Modes</option>
            {WORK_MODES.map((m) => (
              <option key={m.id} value={m.id} className="bg-[#1A1A1A] text-[#EFECEC]">
                {m.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* KANBAN VIEW */}
      {viewMode === 'kanban' && (
        <div className="flex gap-4 overflow-x-auto pb-6 min-h-[600px]">
          {currentStages.map((stage) => {
            const columnApps = applications.filter((app) => app.status === stage.id);

            return (
              <div
                key={stage.id}
                className="w-72 shrink-0 bg-[#0B0B0B] border border-white/5 rounded-2xl flex flex-col max-h-[750px] overflow-hidden"
              >
                <div className="p-3 border-b border-white/5 flex items-center justify-between bg-[#1A1A1A]">
                  <span className="text-xs font-bold text-[#EFECEC]">{stage.label}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#0B0B0B] text-[#C3195D] border border-[#C3195D]/30 font-bold">
                    {columnApps.length}
                  </span>
                </div>

                <div className="p-3 space-y-2.5 overflow-y-auto flex-1">
                  {columnApps.map((app) => {
                    const companyName = app.jobPosting?.company?.name || 'Organization';
                    const role = app.jobPosting?.role || 'Opportunity';
                    const typeConfig = APPLICATION_TYPES[app.appType || 'JOB'] || APPLICATION_TYPES.JOB;

                    return (
                      <div
                        key={app.id}
                        className="bg-[#1A1A1A] border border-white/5 hover:border-[#C3195D]/40 rounded-xl p-3.5 transition group relative"
                      >
                        <div className="flex items-start justify-between mb-1">
                          <Link href={`/applications/${app.id}`}>
                            <h4 className="text-xs font-semibold text-[#EFECEC] hover:text-[#C3195D] transition">
                              {companyName}
                            </h4>
                          </Link>
                          <div className="flex items-center gap-1">
                            <span className="text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded bg-[#0B0B0B] text-[#62929A] border border-white/5">
                              {typeConfig.label.split(' ')[0]}
                            </span>
                            <button
                              onClick={() => handleDeleteApplication(app.id, companyName)}
                              title="Delete Application"
                              className="p-1 text-[#D96C6C]/60 hover:text-[#D96C6C] transition"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        <p className="text-[11px] text-[#BFC3C7] mb-2 line-clamp-1">{role}</p>

                        <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-[#737373]">
                          <span>{formatDate(app.applicationDate)}</span>
                          <Link href={`/applications/${app.id}`} className="text-[#C3195D] font-medium flex items-center gap-0.5">
                            <span>Open</span>
                            <ChevronRight className="w-3 h-3" />
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                  {columnApps.length === 0 && (
                    <div className="py-8 text-center text-[11px] text-[#737373] italic">No items</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* LIST TABLE VIEW */}
      {viewMode === 'list' && (
        <div className="bg-[#0B0B0B] border border-white/5 rounded-2xl p-5 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/5 text-[#BFC3C7] uppercase text-[10px] font-mono tracking-wider">
                <th className="pb-2.5 px-3">Type</th>
                <th className="pb-2.5 px-3">Organization</th>
                <th className="pb-2.5 px-3">Opportunity Title</th>
                <th className="pb-2.5 px-3">Status</th>
                <th className="pb-2.5 px-3">Date</th>
                <th className="pb-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {applications.map((app) => {
                const companyName = app.jobPosting?.company?.name || 'Organization';
                const role = app.jobPosting?.role || 'Opportunity';
                const typeConfig = APPLICATION_TYPES[app.appType || 'JOB'] || APPLICATION_TYPES.JOB;
                const badge = getStageBadgeForType(app.appType, app.status);

                return (
                  <tr key={app.id} className="hover:bg-[#1A1A1A]/60 transition">
                    <td className="py-3 px-3">
                      <span className="text-[10px] font-medium text-[#62929A] bg-[#1A1A1A] px-2 py-0.5 rounded border border-white/5 font-mono">
                        {typeConfig.label}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-semibold text-[#EFECEC]">{companyName}</td>
                    <td className="py-3 px-3 text-[#BFC3C7]">{role}</td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${badge.color}`}>
                        {badge.label}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-[#737373] font-mono">{formatDate(app.applicationDate)}</td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/applications/${app.id}`}
                          className="px-2.5 py-1 rounded-lg bg-[#1A1A1A] hover:bg-[#C3195D] text-[#EFECEC] text-[10px] font-medium transition flex items-center gap-1"
                        >
                          <span>Open</span>
                          <ArrowUpRight className="w-3 h-3" />
                        </Link>
                        <button
                          onClick={() => handleDeleteApplication(app.id, companyName)}
                          title="Delete Application Entry"
                          className="p-1 rounded-lg text-[#D96C6C]/80 hover:text-[#D96C6C] hover:bg-[#D96C6C]/10 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && <NewApplicationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />}
    </div>
  );
}
