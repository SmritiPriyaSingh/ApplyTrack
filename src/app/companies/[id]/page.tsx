"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ExternalLink, User, Briefcase } from 'lucide-react';
import { formatDate, getStatusBadge } from '@/lib/utils';

export default function CompanyDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const [company, setCompany] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/companies/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.company) setCompany(data.company);
        setLoading(false);
      })
      .catch((err) => setLoading(false));
  }, [id]);

  if (loading) return <div className="py-20 text-center text-[#BFC3C7] text-xs font-mono">Loading Company Hub...</div>;
  if (!company) return <div className="py-20 text-center text-[#EFECEC]">Company not found.</div>;

  const allApplications: any[] = [];
  const allInterviews: any[] = [];

  company.jobPostings?.forEach((jp: any) => {
    if (jp.applications) {
      jp.applications.forEach((app: any) => {
        allApplications.push({ ...app, role: jp.role, workMode: jp.workMode, location: jp.location, pkg: jp.package });
        if (app.interviews) {
          app.interviews.forEach((i: any) => allInterviews.push({ ...i, role: jp.role }));
        }
      });
    }
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <Link href="/companies" className="text-xs text-[#BFC3C7] hover:text-[#EFECEC] flex items-center gap-1.5 transition">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Companies Directory</span>
      </Link>

      <div className="bg-[#0A0A0A] p-6 rounded-2xl border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[#1A1A1A] border border-white/5 flex items-center justify-center font-bold text-2xl text-[#C3195D] shrink-0">
            {company.name.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-extrabold text-[#EFECEC] tracking-tight">{company.name}</h1>
              {company.website && (
                <a href={company.website} target="_blank" rel="noreferrer" className="text-[#BFC3C7] hover:text-[#C3195D]">
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
            <p className="text-xs text-[#BFC3C7] font-medium mt-1">
              {company.industry || 'Technology'} • {company.headquarters || 'USA'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 font-mono text-xs text-[#BFC3C7]">
          <div className="bg-[#1A1A1A] p-3 rounded-xl border border-white/5 text-center">
            <span className="text-[10px] text-[#737373] block uppercase">Total Applications</span>
            <span className="text-base font-bold text-[#EFECEC]">{allApplications.length}</span>
          </div>
        </div>
      </div>

      {/* Company Level Notes & Interview Difficulty */}
      <div className="bg-[#0A0A0A] p-6 rounded-2xl space-y-2 border border-white/5">
        <h3 className="text-xs font-bold text-[#C3195D] uppercase tracking-wider">Company Notes & Interview Insights</h3>
        <p className="text-xs text-[#BFC3C7] leading-relaxed">
          {company.notes || 'No custom notes added for this company yet.'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* All Applications History */}
        <div className="bg-[#0A0A0A] p-6 rounded-2xl space-y-4 border border-white/5">
          <h3 className="text-sm font-bold text-[#EFECEC] flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-[#C3195D]" />
            Applications History ({company.name})
          </h3>

          <div className="space-y-3">
            {allApplications.map((app) => {
              const badge = getStatusBadge(app.status);
              return (
                <div key={app.id} className="bg-[#1A1A1A] border border-white/5 p-4 rounded-xl flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-[#EFECEC]">{app.role}</h4>
                    <span className="text-[10px] text-[#BFC3C7] block">{app.workMode} • {app.location}</span>
                    <span className="text-[10px] font-mono text-[#737373]">Applied: {formatDate(app.applicationDate)}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-1 rounded-lg border text-[10px] font-bold ${badge.bg}`}>
                      {badge.label}
                    </span>
                    <Link
                      href={`/applications/${app.id}`}
                      className="px-3 py-1 bg-[#0A0A0A] hover:bg-[#242424] text-[#EFECEC] text-xs font-semibold rounded-lg border border-white/5 transition"
                    >
                      View
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recruiters & Interview Questions */}
        <div className="bg-[#0A0A0A] p-6 rounded-2xl space-y-4 border border-white/5">
          <h3 className="text-sm font-bold text-[#EFECEC] flex items-center gap-2">
            <User className="w-4 h-4 text-[#62929A]" />
            Recruiters & Interview Questions
          </h3>

          <div className="space-y-3">
            {company.recruiters?.map((rec: any) => (
              <div key={rec.id} className="bg-[#1A1A1A] border border-white/5 p-3.5 rounded-xl space-y-1 text-xs">
                <h4 className="font-bold text-[#EFECEC]">{rec.name}</h4>
                {rec.email && <p className="text-[#BFC3C7]">Email: {rec.email}</p>}
                {rec.notes && <p className="text-[#737373] italic">Notes: {rec.notes}</p>}
              </div>
            ))}

            {allInterviews.map((int: any) => (
              <div key={int.id} className="bg-[#1A1A1A] border border-white/5 p-3.5 rounded-xl space-y-1 text-xs">
                <span className="text-[10px] font-mono text-[#62929A] font-bold block">{int.title} ({int.role})</span>
                {int.preparationNotes && <p className="text-[#BFC3C7]">Prep / Asked: {int.preparationNotes}</p>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
