"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Briefcase, ArrowUpRight, ChevronRight, FileText } from 'lucide-react';
import { formatDate, getStatusBadge } from '@/lib/utils';
import { HIRING_STAGES } from '@/lib/constants';

export function RecentApplicationsTable() {
  const [applications, setApplications] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/applications')
      .then((res) => res.json())
      .then((data) => {
        if (data.applications) setApplications(data.applications.slice(0, 6));
      })
      .catch((err) => console.error(err));
  }, []);

  const handleQuickStatusUpdate = async (appId: string, currentStatus: string) => {
    const currentIndex = HIRING_STAGES.findIndex((s) => s.id === currentStatus);
    if (currentIndex < 0 || currentIndex >= HIRING_STAGES.length - 3) return;

    const nextStage = HIRING_STAGES[currentIndex + 1];
    if (!nextStage) return;

    try {
      const res = await fetch(`/api/applications/${appId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStage.id }),
      });

      if (res.ok) {
        setApplications((prev) =>
          prev.map((app) => (app.id === appId ? { ...app, status: nextStage.id } : app))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="bg-[#0A0A0A] border border-white/5 rounded-2xl p-6 mb-6">
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/5">
        <div>
          <h3 className="text-xs font-semibold text-[#EFECEC] tracking-wide flex items-center gap-2">
            <Briefcase className="w-3.5 h-3.5 text-[#C3195D]" />
            Recent Applications Workspace
          </h3>
        </div>
        <Link
          href="/applications"
          className="text-xs font-medium text-[#C3195D] hover:text-[#EFECEC] flex items-center gap-1 bg-[#1A1A1A] px-3 py-1.5 rounded-xl border border-white/5 transition"
        >
          <span>View All</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-white/5 text-[#BFC3C7] uppercase text-[10px] font-mono tracking-wider">
              <th className="pb-2.5 px-3">Company & Role</th>
              <th className="pb-2.5 px-3">Work Mode</th>
              <th className="pb-2.5 px-3">Resume Version</th>
              <th className="pb-2.5 px-3">Status</th>
              <th className="pb-2.5 px-3">Applied</th>
              <th className="pb-2.5 px-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {applications.map((app) => {
              const companyName = app.jobPosting?.company?.name || 'Company';
              const role = app.jobPosting?.role || 'Role';
              const location = app.jobPosting?.location || 'Remote';
              const workMode = app.jobPosting?.workMode || 'REMOTE';
              const resumeTitle = app.resume?.versionTag || 'Standard';
              const badge = getStatusBadge(app.status);

              return (
                <tr key={app.id} className="hover:bg-[#1A1A1A]/50 transition">
                  <td className="py-3 px-3">
                    <Link href={`/applications/${app.id}`} className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-[#1A1A1A] border border-white/5 flex items-center justify-center font-semibold text-[#C3195D] text-[11px] shrink-0">
                        {companyName.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <span className="font-semibold text-[#EFECEC] hover:text-[#C3195D] transition block">
                          {companyName}
                        </span>
                        <span className="text-[11px] text-[#BFC3C7] truncate max-w-[180px] block">{role}</span>
                      </div>
                    </Link>
                  </td>

                  <td className="py-3 px-3">
                    <span className="text-[#EFECEC] font-medium block">{location}</span>
                    <span className="text-[10px] text-[#737373] uppercase tracking-wider">{workMode}</span>
                  </td>

                  <td className="py-3 px-3">
                    <div className="flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-[#62929A]" />
                      <span className="font-mono text-[#62929A] bg-[#1A1A1A] px-2 py-0.5 rounded border border-white/5 text-[11px]">
                        {resumeTitle}
                      </span>
                    </div>
                  </td>

                  <td className="py-3 px-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium ${badge.bg}`}>
                      {badge.label}
                    </span>
                  </td>

                  <td className="py-3 px-3 text-[#737373] font-mono text-[11px]">
                    {formatDate(app.applicationDate)}
                  </td>

                  <td className="py-3 px-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleQuickStatusUpdate(app.id, app.status)}
                        className="px-2.5 py-1 rounded-lg bg-[#1A1A1A] hover:bg-[#C3195D] hover:text-[#EFECEC] border border-white/5 text-[#EFECEC] text-[10px] font-medium flex items-center gap-1 transition"
                      >
                        <span>Step Next</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                      <Link
                        href={`/applications/${app.id}`}
                        className="p-1.5 rounded-lg text-[#BFC3C7] hover:text-[#EFECEC] hover:bg-[#1A1A1A] transition"
                      >
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
