"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Briefcase, 
  GraduationCap, 
  FileText, 
  Trophy, 
  Globe, 
  Award, 
  Folder,
  Clock, 
  Video, 
  ArrowUpRight, 
  ChevronRight, 
  Plus, 
  Search, 
  User, 
  Activity,
  Layers
} from 'lucide-react';
import { formatDate, getDaysAgo } from '@/lib/utils';
import { APPLICATION_TYPES, getStageBadgeForType, getAllStagesForType } from '@/lib/application-types';
import { NewApplicationModal } from '@/components/applications/new-application-modal';

export default function CareerCRMHomePage() {
  const [data, setData] = useState<any>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState('');
  const [selectedStage, setSelectedStage] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('Smriti Priya Singh');

  const fetchCRMData = () => {
    const savedName = localStorage.getItem('applytrack_user_name');
    if (savedName) setUserName(savedName);

    Promise.all([
      fetch('/api/analytics').then((res) => res.json()),
      fetch('/api/applications').then((res) => res.json()),
    ])
      .then(([analyticsRes, appsRes]) => {
        if (analyticsRes.summary) setData(analyticsRes.summary);
        if (appsRes.applications) setApplications(appsRes.applications);
        setLoading(false);
      })
      .catch((err) => setLoading(false));
  };

  useEffect(() => {
    fetchCRMData();
  }, []);

  const handleQuickStatusUpdate = async (appId: string, currentStatus: string, appType: string) => {
    const stages = getAllStagesForType(appType);
    const currentIndex = stages.findIndex((s) => s.id === currentStatus);
    if (currentIndex < 0 || currentIndex >= stages.length - 1) return;

    const nextStage = stages[currentIndex + 1];
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

  if (loading) {
    return <div className="py-20 text-center text-[#BFC3C7] font-mono text-xs">Loading Career Workspace...</div>;
  }

  const firstName = userName.split(' ')[0] || userName;

  // Filtered applications for Master Record list
  const filteredApps = applications.filter((app) => {
    const matchesSearch = searchQuery
      ? app.jobPosting?.company?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.jobPosting?.role?.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    const matchesType = selectedTypeFilter ? app.appType === selectedTypeFilter : true;
    const matchesStage = selectedStage ? app.status === selectedStage : true;
    return matchesSearch && matchesType && matchesStage;
  });

  // Calculate dynamic metrics per Application Type
  const jobApps = applications.filter((a) => (a.appType || 'JOB') === 'JOB');
  const examApps = applications.filter((a) => a.appType === 'EXAM');
  const collegeApps = applications.filter((a) => a.appType === 'COLLEGE');
  const hackApps = applications.filter((a) => a.appType === 'HACKATHON');
  const fellowApps = applications.filter((a) => a.appType === 'FELLOWSHIP');

  // Collect action queue items (What should I do next?)
  const actionQueueItems: any[] = [];
  applications.forEach((app) => {
    const daysAgo = getDaysAgo(app.applicationDate);
    const typeConfig = APPLICATION_TYPES[app.appType || 'JOB'] || APPLICATION_TYPES.JOB;

    if (['APPLIED', 'APPLICATION_VIEWED', 'EXAM_REGISTERED', 'APP_SUBMITTED', 'HACK_REGISTERED', 'FELLOW_APPLIED'].includes(app.status) && daysAgo >= 7) {
      actionQueueItems.push({
        id: `fu-${app.id}`,
        appId: app.id,
        company: app.jobPosting?.company?.name || 'Organization',
        role: app.jobPosting?.role || 'Opportunity',
        typeLabel: typeConfig.label,
        title: `Registered ${daysAgo} days ago - check status`,
        actionLabel: 'Check Status',
      });
    }

    if (app.interviews && app.interviews.length > 0) {
      const scheduled = app.interviews.find((i: any) => i.status === 'SCHEDULED');
      if (scheduled) {
        actionQueueItems.push({
          id: `int-${scheduled.id}`,
          appId: app.id,
          company: app.jobPosting?.company?.name || 'Organization',
          role: app.jobPosting?.role || 'Opportunity',
          typeLabel: typeConfig.label,
          title: `${scheduled.title} on ${formatDate(scheduled.scheduledAt)}`,
          actionLabel: 'Prep Session',
        });
      }
    }
  });

  // Recent timeline events
  const allEvents: any[] = [];
  applications.forEach((app) => {
    if (app.events) {
      app.events.forEach((ev: any) => {
        allEvents.push({
          ...ev,
          companyName: app.jobPosting?.company?.name,
          role: app.jobPosting?.role,
          appId: app.id,
          appType: app.appType,
        });
      });
    }
  });
  allEvents.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* TOP BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div>
          <h1 className="text-xl font-bold text-[#EFECEC] tracking-tight">Universal Career Workspace ({firstName})</h1>
          <p className="text-xs text-[#BFC3C7]">
            Jobs, Competitive Exams (GATE, CAT), College Admissions, Hackathons/CTFs, Fellowships & Certifications.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-[#C3195D] hover:bg-[#a5134d] text-[#EFECEC] text-xs font-medium flex items-center gap-1.5 transition active:scale-95 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Track New Application</span>
          </button>
        </div>
      </div>

      {/* ZERO DATA EMPTY STATE */}
      {applications.length === 0 ? (
        <div className="bg-[#0B0B0B] border border-white/5 rounded-2xl p-12 text-center space-y-4 max-w-xl mx-auto my-8">
          <div className="w-14 h-14 rounded-2xl bg-[#1A1A1A] border border-white/5 text-[#C3195D] flex items-center justify-center mx-auto shadow-md">
            <Briefcase className="w-7 h-7" />
          </div>

          <div className="space-y-1.5">
            <h2 className="text-base font-bold text-[#EFECEC] tracking-tight">Your Career Workspace is Ready</h2>
            <p className="text-xs text-[#BFC3C7] max-w-md mx-auto leading-relaxed">
              Track your Jobs, GATE/UPSC Exams, University Admissions (IIT/NIT), Hackathons/CTFs, and Fellowships (Yuva Sangam).
            </p>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-[#C3195D] hover:bg-[#a5134d] text-[#EFECEC] text-xs font-medium flex items-center justify-center gap-2 transition shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Track Your First Application</span>
            </button>
          </div>
        </div>
      ) : (
        /* POPULATED WORKSPACE VIEW WITH DYNAMIC TYPE METRICS */
        <>
          {/* DYNAMIC METRICS CARDS ADAPTED PER APPLICATION TYPE */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
            <div className="bg-[#0B0B0B] border border-white/5 p-3.5 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[10px] text-[#BFC3C7] uppercase font-mono block">Total Opportunities</span>
                <span className="text-lg font-bold font-mono text-[#EFECEC]">{applications.length}</span>
              </div>
              <Briefcase className="w-4 h-4 text-[#C3195D]" />
            </div>

            <div className="bg-[#0B0B0B] border border-white/5 p-3.5 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[10px] text-[#BFC3C7] uppercase font-mono block">Job Opportunities</span>
                <span className="text-lg font-bold font-mono text-[#E2B85C]">{jobApps.length}</span>
              </div>
              <Briefcase className="w-4 h-4 text-[#E2B85C]" />
            </div>

            <div className="bg-[#0B0B0B] border border-white/5 p-3.5 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[10px] text-[#BFC3C7] uppercase font-mono block">Exams Registered</span>
                <span className="text-lg font-bold font-mono text-[#62929A]">{examApps.length}</span>
              </div>
              <FileText className="w-4 h-4 text-[#62929A]" />
            </div>

            <div className="bg-[#0B0B0B] border border-white/5 p-3.5 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[10px] text-[#BFC3C7] uppercase font-mono block">College Admissions</span>
                <span className="text-lg font-bold font-mono text-[#6CBF84]">{collegeApps.length}</span>
              </div>
              <GraduationCap className="w-4 h-4 text-[#6CBF84]" />
            </div>

            <div className="bg-[#0B0B0B] border border-white/5 p-3.5 rounded-2xl flex items-center justify-between col-span-2 sm:col-span-1">
              <div>
                <span className="text-[10px] text-[#BFC3C7] uppercase font-mono block">Hackathons & Fellowships</span>
                <span className="text-lg font-bold font-mono text-[#C3195D]">{hackApps.length + fellowApps.length}</span>
              </div>
              <Trophy className="w-4 h-4 text-[#C3195D]" />
            </div>
          </div>

          {/* SECTION 1: WHAT SHOULD I DO NEXT? (ACTION QUEUE) */}
          <div className="bg-[#0B0B0B] border border-white/5 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#C3195D] animate-pulse" />
                <h2 className="text-xs font-semibold text-[#EFECEC] tracking-wide uppercase font-mono">
                  1. What Should I Do Next? (Action Queue)
                </h2>
              </div>
              <span className="text-[10px] font-mono text-[#C3195D] bg-[#1A1A1A] px-2 py-0.5 rounded border border-[#C3195D]/30">
                {actionQueueItems.length} Immediate Tasks Pending
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {actionQueueItems.slice(0, 6).map((item) => (
                <div
                  key={item.id}
                  className="bg-[#1A1A1A] border border-white/5 hover:border-[#C3195D]/40 p-3.5 rounded-xl flex flex-col justify-between transition"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-[#EFECEC]">{item.company}</span>
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[#0B0B0B] text-[#C3195D] border border-[#C3195D]/30">
                        {item.typeLabel}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#BFC3C7] mb-2">{item.role} • {item.title}</p>
                  </div>

                  <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                    <span className="text-[10px] text-[#737373]">Action Item</span>
                    <Link
                      href={`/applications/${item.appId}`}
                      className="text-[10px] font-medium text-[#C3195D] hover:text-[#EFECEC] bg-[#0B0B0B] px-2.5 py-1 rounded-lg border border-white/5 flex items-center gap-1 transition"
                    >
                      <span>{item.actionLabel}</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))}
              {actionQueueItems.length === 0 && (
                <div className="col-span-full py-4 text-center text-xs text-[#737373] italic">
                  All upcoming exam dates, interview preps, and deadlines are up to date!
                </div>
              )}
            </div>
          </div>

          {/* SECTION 2: WHERE HAVE I APPLIED? (UNIVERSAL MASTER RECORD DIRECTORY) */}
          <div className="bg-[#0B0B0B] border border-white/5 rounded-2xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/5">
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-[#C3195D]" />
                <h2 className="text-xs font-semibold text-[#EFECEC] tracking-wide uppercase font-mono">
                  2. Master Application Directory
                </h2>
              </div>

              {/* Inline Filter Controls */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative w-48">
                  <Search className="w-3.5 h-3.5 text-[#BFC3C7] absolute left-3 top-2" />
                  <input
                    type="text"
                    placeholder="Search entry..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1 bg-[#1A1A1A] border border-white/5 rounded-xl text-xs text-[#EFECEC] focus:outline-none focus:border-[#C3195D]"
                  />
                </div>

                <select
                  value={selectedTypeFilter}
                  onChange={(e) => setSelectedTypeFilter(e.target.value)}
                  className="px-2.5 py-1 bg-[#1A1A1A] border border-white/5 rounded-xl text-xs text-[#EFECEC] focus:outline-none"
                >
                  <option value="">All Categories</option>
                  {Object.values(APPLICATION_TYPES).map((t) => (
                    <option key={t.id} value={t.id} className="bg-[#0B0B0B]">
                      {t.label}
                    </option>
                  ))}
                </select>

                <Link
                  href="/applications"
                  className="text-xs font-medium text-[#C3195D] hover:underline flex items-center gap-1 ml-1"
                >
                  <span>Full Board</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* High-density Universal Directory Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/5 text-[#BFC3C7] uppercase text-[10px] font-mono tracking-wider">
                    <th className="pb-2.5 px-3">Type</th>
                    <th className="pb-2.5 px-3">Organization & Title</th>
                    <th className="pb-2.5 px-3">Location / Mode</th>
                    <th className="pb-2.5 px-3">Resume Linked</th>
                    <th className="pb-2.5 px-3">Pipeline Stage</th>
                    <th className="pb-2.5 px-3">Registered Date</th>
                    <th className="pb-2.5 px-3 text-right">Progress Step</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredApps.slice(0, 10).map((app) => {
                    const companyName = app.jobPosting?.company?.name || 'Organization';
                    const role = app.jobPosting?.role || 'Opportunity';
                    const location = app.jobPosting?.location || 'Remote';
                    const typeConfig = APPLICATION_TYPES[app.appType || 'JOB'] || APPLICATION_TYPES.JOB;
                    const badge = getStageBadgeForType(app.appType, app.status);

                    return (
                      <tr key={app.id} className="hover:bg-[#1A1A1A]/60 transition">
                        <td className="py-2.5 px-3">
                          <span className="text-[10px] font-medium text-[#62929A] bg-[#1A1A1A] px-2 py-0.5 rounded border border-white/5">
                            {typeConfig.label.split(' ')[0]}
                          </span>
                        </td>

                        <td className="py-2.5 px-3">
                          <Link href={`/applications/${app.id}`} className="flex items-center gap-2.5">
                            <div className="w-6 h-6 rounded-md bg-[#1A1A1A] border border-white/5 flex items-center justify-center font-bold text-[#C3195D] text-[10px] shrink-0">
                              {companyName.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <span className="font-semibold text-[#EFECEC] hover:text-[#C3195D] transition block">
                                {companyName}
                              </span>
                              <span className="text-[11px] text-[#BFC3C7] truncate max-w-[170px] block">{role}</span>
                            </div>
                          </Link>
                        </td>

                        <td className="py-2.5 px-3 text-[#BFC3C7]">
                          <span className="block text-[#EFECEC] font-medium">{location}</span>
                        </td>

                        <td className="py-2.5 px-3">
                          {typeConfig.requiresResume ? (
                            <span className="font-mono text-[#62929A] bg-[#1A1A1A] px-2 py-0.5 rounded border border-white/5 text-[11px]">
                              {app.resume?.title || 'Linked'}
                            </span>
                          ) : (
                            <span className="text-[#737373] text-[10px] italic">N/A (Not Required)</span>
                          )}
                        </td>

                        <td className="py-2.5 px-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium ${badge.color}`}>
                            {badge.label}
                          </span>
                        </td>

                        <td className="py-2.5 px-3 text-[#737373] font-mono text-[11px]">
                          {formatDate(app.applicationDate)}
                        </td>

                        <td className="py-2.5 px-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleQuickStatusUpdate(app.id, app.status, app.appType || 'JOB')}
                              className="px-2.5 py-1 rounded-lg bg-[#1A1A1A] hover:bg-[#C3195D] hover:text-[#EFECEC] border border-white/5 text-[#EFECEC] text-[10px] font-medium flex items-center gap-1 transition"
                            >
                              <span>Step Next</span>
                              <ChevronRight className="w-3 h-3" />
                            </button>
                            <Link
                              href={`/applications/${app.id}`}
                              className="p-1 rounded-lg text-[#BFC3C7] hover:text-[#EFECEC] hover:bg-[#1A1A1A] transition"
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

          {/* SECTION 3: WHAT HAPPENED? (LIVE ACTIVITY LOG) */}
          <div className="bg-[#0B0B0B] border border-white/5 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#62929A]" />
                <h2 className="text-xs font-semibold text-[#EFECEC] tracking-wide uppercase font-mono">
                  3. What Happened? (Chronological Career Stream)
                </h2>
              </div>
              <span className="text-[10px] font-mono text-[#737373]">Live Events</span>
            </div>

            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {allEvents.slice(0, 8).map((ev) => (
                <div
                  key={ev.id}
                  className="bg-[#1A1A1A] border border-white/5 p-3 rounded-xl flex items-start justify-between gap-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-[#62929A] mt-1.5 shrink-0" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-[#EFECEC]">{ev.companyName}</span>
                        <span className="text-[11px] text-[#BFC3C7]">• {ev.role}</span>
                      </div>
                      <h4 className="text-xs text-[#EFECEC] font-medium mt-0.5">{ev.title}</h4>
                      {ev.description && <p className="text-[11px] text-[#BFC3C7] mt-0.5">{ev.description}</p>}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[10px] font-mono text-[#737373] block">{formatDate(ev.date)}</span>
                    <Link
                      href={`/applications/${ev.appId}`}
                      className="text-[10px] font-medium text-[#C3195D] hover:underline block mt-0.5"
                    >
                      Record →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {isModalOpen && <NewApplicationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />}
    </div>
  );
}
