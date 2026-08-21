"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Kanban, 
  List, 
  Search, 
  Plus, 
  ChevronRight,
  Briefcase
} from 'lucide-react';
import { HIRING_STAGES, WORK_MODES, DEFAULT_TAGS } from '@/lib/constants';
import { formatDate, getStatusBadge } from '@/lib/utils';
import { NewApplicationModal } from '@/components/applications/new-application-modal';

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [selectedWorkMode, setSelectedWorkMode] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchApplications = () => {
    let url = '/api/applications?';
    if (searchQuery) url += `query=${encodeURIComponent(searchQuery)}&`;
    if (selectedStatus) url += `status=${selectedStatus}&`;
    if (selectedTag) url += `tag=${encodeURIComponent(selectedTag)}&`;
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
  }, [searchQuery, selectedStatus, selectedTag, selectedWorkMode]);

  if (loading) {
    return <div className="py-20 text-center text-[#BFC3C7] font-mono text-xs">Loading Job Applications Board...</div>;
  }

  const isFiltered = searchQuery || selectedStatus || selectedTag || selectedWorkMode;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-white/5">
        <div>
          <h1 className="text-xl font-bold text-[#EFECEC] tracking-tight">
            Job Applications Board
          </h1>
          <p className="text-xs text-[#BFC3C7]">
            Kanban workflow & career applications workspace.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-[#1A1A1A] border border-white/5 p-1 rounded-xl flex items-center gap-1">
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-3 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition ${
                viewMode === 'kanban'
                  ? 'bg-[#C3195D] text-[#EFECEC]'
                  : 'text-[#BFC3C7] hover:text-[#EFECEC]'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
              <span>Kanban</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition ${
                viewMode === 'list'
                  ? 'bg-[#C3195D] text-[#EFECEC]'
                  : 'text-[#BFC3C7] hover:text-[#EFECEC]'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Table</span>
            </button>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-[#C3195D] hover:bg-[#a5134d] text-[#EFECEC] text-xs font-medium flex items-center gap-1.5 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Application</span>
          </button>
        </div>
      </div>

      {/* Empty State when no applications exist and no filters set */}
      {applications.length === 0 && !isFiltered ? (
        <div className="bg-[#0B0B0B] border border-white/5 rounded-2xl p-12 text-center space-y-4 max-w-lg mx-auto my-8">
          <div className="w-12 h-12 rounded-2xl bg-[#1A1A1A] border border-white/5 text-[#C3195D] flex items-center justify-center mx-auto shadow-md">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#EFECEC]">No Job Applications Tracked Yet</h3>
            <p className="text-xs text-[#BFC3C7] mt-1 leading-relaxed">
              Record job opportunities to view them across your Kanban workflow stages or switch to table view.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-[#C3195D] hover:bg-[#a5134d] text-[#EFECEC] text-xs font-medium rounded-xl inline-flex items-center gap-1.5 transition shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add Your First Application</span>
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Filter Bar */}
          <div className="bg-[#0B0B0B] p-4 rounded-2xl border border-white/5 flex flex-wrap items-center justify-between gap-4">
            <div className="relative w-72">
              <Search className="w-3.5 h-3.5 text-[#BFC3C7] absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search company, role, notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-[#1A1A1A] border border-white/5 rounded-xl text-xs text-[#EFECEC] focus:outline-none focus:border-[#C3195D]"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-1.5 bg-[#1A1A1A] border border-white/5 rounded-xl text-xs text-[#EFECEC] focus:outline-none"
              >
                <option value="">All Hiring Stages</option>
                {HIRING_STAGES.map((s) => (
                  <option key={s.id} value={s.id} className="bg-[#1A1A1A] text-[#EFECEC]">
                    {s.label}
                  </option>
                ))}
              </select>

              <select
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                className="px-3 py-1.5 bg-[#1A1A1A] border border-white/5 rounded-xl text-xs text-[#EFECEC] focus:outline-none"
              >
                <option value="">All Tags</option>
                {DEFAULT_TAGS.map((t) => (
                  <option key={t.name} value={t.name} className="bg-[#1A1A1A] text-[#EFECEC]">
                    🏷️ {t.name}
                  </option>
                ))}
              </select>

              <select
                value={selectedWorkMode}
                onChange={(e) => setSelectedWorkMode(e.target.value)}
                className="px-3 py-1.5 bg-[#1A1A1A] border border-white/5 rounded-xl text-xs text-[#EFECEC] focus:outline-none"
              >
                <option value="">All Work Modes</option>
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
              {HIRING_STAGES.map((stage) => {
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
                        const companyName = app.jobPosting?.company?.name || 'Company';
                        const role = app.jobPosting?.role || 'Role';
                        const resumeTag = app.resume?.versionTag;

                        return (
                          <div
                            key={app.id}
                            className="bg-[#1A1A1A] border border-white/5 hover:border-[#C3195D]/40 rounded-xl p-3.5 transition"
                          >
                            <div className="flex items-start justify-between mb-1">
                              <Link href={`/applications/${app.id}`}>
                                <h4 className="text-xs font-semibold text-[#EFECEC] hover:text-[#C3195D] transition">
                                  {companyName}
                                </h4>
                              </Link>
                              {resumeTag && (
                                <span className="text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded bg-[#0B0B0B] text-[#62929A] border border-white/5">
                                  {resumeTag}
                                </span>
                              )}
                            </div>

                            <p className="text-[11px] text-[#BFC3C7] mb-2 line-clamp-1">{role}</p>

                            <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-[#737373]">
                              <span>Applied: {formatDate(app.applicationDate)}</span>
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
                    <th className="pb-3 px-3">Company & Role</th>
                    <th className="pb-3 px-3">Source</th>
                    <th className="pb-3 px-3">Resume Version</th>
                    <th className="pb-3 px-3">Status</th>
                    <th className="pb-3 px-3">Applied Date</th>
                    <th className="pb-3 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {applications.map((app) => {
                    const companyName = app.jobPosting?.company?.name || 'Company';
                    const role = app.jobPosting?.role || 'Role';
                    const badge = getStatusBadge(app.status);

                    return (
                      <tr key={app.id} className="hover:bg-[#1A1A1A]/50 transition">
                        <td className="py-3 px-3">
                          <Link href={`/applications/${app.id}`} className="font-semibold text-[#EFECEC] hover:text-[#C3195D] transition">
                            {companyName}
                          </Link>
                          <span className="text-[11px] text-[#BFC3C7] block">{role}</span>
                        </td>
                        <td className="py-3 px-3 text-[#BFC3C7]">{app.source}</td>
                        <td className="py-3 px-3 font-mono text-[#62929A]">{app.resume?.versionTag || 'Standard'}</td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded border text-[10px] font-medium ${badge.bg}`}>
                            {badge.label}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-[#737373] font-mono text-[11px]">{formatDate(app.applicationDate)}</td>
                        <td className="py-3 px-3 text-right">
                          <Link
                            href={`/applications/${app.id}`}
                            className="px-3 py-1 bg-[#1A1A1A] hover:bg-[#C3195D] rounded-lg text-[11px] font-medium text-[#EFECEC] border border-white/5 transition"
                          >
                            Open Workspace
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {isModalOpen && <NewApplicationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />}
    </div>
  );
}
