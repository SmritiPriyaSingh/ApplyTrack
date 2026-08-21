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
  Clock, 
  ArrowUpRight, 
  ChevronRight, 
  Plus, 
  Search, 
  AlertTriangle,
  Calendar,
  Trash2
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

  // Collect Exam records
  const examApps = applications.filter((a) => a.appType === 'EXAM');
  const jobApps = applications.filter((a) => (a.appType || 'JOB') === 'JOB');
  const collegeApps = applications.filter((a) => a.appType === 'COLLEGE');
  const hackApps = applications.filter((a) => a.appType === 'HACKATHON');
  const fellowApps = applications.filter((a) => a.appType === 'FELLOWSHIP');

  // Compute Upcoming Exam Countdowns & Deadlines
  const upcomingExamCards: any[] = [];
  const criticalDeadlines: any[] = [];

  applications.forEach((app) => {
    let extraObj: any = {};
    if (app.extraData) {
      try {
        extraObj = JSON.parse(app.extraData);
      } catch (e) {}
    }

    // Exam countdown
    if (app.appType === 'EXAM' && extraObj.examDate) {
      const examDateObj = new Date(extraObj.examDate);
      const today = new Date();
      const diffTime = examDateObj.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays >= 0) {
        upcomingExamCards.push({
          id: app.id,
          name: app.jobPosting?.role || 'Exam',
          org: app.jobPosting?.company?.name || 'NTA / Org',
          daysLeft: diffDays,
          examDate: extraObj.examDate,
          priority: extraObj.priority || 'HIGH',
        });
      }
    }

    // Registration close deadline alert
    if (extraObj.regCloseDate) {
      const closeDateObj = new Date(extraObj.regCloseDate);
      const today = new Date();
      const diffTime = closeDateObj.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays >= 0 && diffDays <= 14) {
        criticalDeadlines.push({
          id: `dl-${app.id}`,
          appId: app.id,
          title: `${app.jobPosting?.role} — Registration closes in ${diffDays} days`,
          date: extraObj.regCloseDate,
          type: 'REG_CLOSE',
        });
      }
    }
  });

  upcomingExamCards.sort((a, b) => a.daysLeft - b.daysLeft);

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
        /* POPULATED WORKSPACE VIEW */
        <>
          {/* DYNAMIC SUMMARY METRICS STRIP */}
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
                <span className="text-[10px] text-[#BFC3C7] uppercase font-mono block">Exams Tracked</span>
                <span className="text-lg font-bold font-mono text-[#62929A]">{examApps.length}</span>
              </div>
              <FileText className="w-4 h-4 text-[#62929A]" />
            </div>

            <div className="bg-[#0B0B0B] border border-white/5 p-3.5 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[10px] text-[#BFC3C7] uppercase font-mono block">Jobs Active</span>
                <span className="text-lg font-bold font-mono text-[#E2B85C]">{jobApps.length}</span>
              </div>
              <Briefcase className="w-4 h-4 text-[#E2B85C]" />
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
                <span className="text-[10px] text-[#BFC3C7] uppercase font-mono block">Hackathons & Programs</span>
                <span className="text-lg font-bold font-mono text-[#C3195D]">{hackApps.length + fellowApps.length}</span>
              </div>
              <Trophy className="w-4 h-4 text-[#C3195D]" />
            </div>
          </div>

          {/* DASHBOARD INTEGRATION WIDGET 1: UPCOMING EXAMS COUNTDOWN CARDS */}
          {upcomingExamCards.length > 0 && (
            <div className="bg-[#0B0B0B] border border-[#C3195D]/30 p-5 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold text-[#EFECEC] tracking-wide uppercase font-mono flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#C3195D]" />
                  <span>Upcoming Exams & Countdown Timers</span>
                </h2>
                <span className="text-[10px] font-mono text-[#C3195D] bg-[#1A1A1A] px-2 py-0.5 rounded border border-[#C3195D]/30">
                  {upcomingExamCards.length} Scheduled
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {upcomingExamCards.map((exam) => (
                  <Link
                    key={exam.id}
                    href={`/applications/${exam.id}`}
                    className="bg-[#1A1A1A] border border-white/5 hover:border-[#C3195D] p-4 rounded-xl flex items-center justify-between transition group"
                  >
                    <div>
                      <span className="text-[10px] text-[#62929A] font-mono font-semibold block mb-0.5">{exam.org}</span>
                      <h4 className="text-xs font-bold text-[#EFECEC] group-hover:text-[#C3195D] transition">{exam.name}</h4>
                      <span className="text-[10px] text-[#737373] mt-1 block font-mono">Date: {formatDate(exam.examDate)}</span>
                    </div>

                    <div className="text-right shrink-0 bg-[#0B0B0B] p-2.5 rounded-xl border border-white/5">
                      <span className="text-base font-bold font-mono text-[#C3195D] block">{exam.daysLeft}d</span>
                      <span className="text-[9px] text-[#BFC3C7] font-mono">remaining</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* DASHBOARD INTEGRATION WIDGET 2: CRITICAL REGISTRATION DEADLINES */}
          {criticalDeadlines.length > 0 && (
            <div className="bg-[#0B0B0B] border border-[#E2B85C]/30 p-4 rounded-2xl flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-[#E2B85C] shrink-0" />
                <div>
                  <h3 className="text-xs font-bold text-[#EFECEC]">Critical Registration Deadline Alert</h3>
                  <p className="text-xs text-[#BFC3C7] mt-0.5">{criticalDeadlines[0].title}</p>
                </div>
              </div>
              <Link
                href={`/applications/${criticalDeadlines[0].appId}`}
                className="px-3 py-1.5 rounded-xl bg-[#E2B85C] hover:bg-[#c99f45] text-[#0B0B0B] text-xs font-bold transition shrink-0"
              >
                Complete Registration
              </Link>
            </div>
          )}

          {/* MASTER DIRECTORY TABLE WITH VISUAL JOURNEY PROGRESS */}
          <div className="bg-[#0B0B0B] border border-white/5 rounded-2xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/5">
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-[#C3195D]" />
                <h2 className="text-xs font-semibold text-[#EFECEC] tracking-wide uppercase font-mono">
                  Master Application Directory
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
                    <th className="pb-2.5 px-3">Category</th>
                    <th className="pb-2.5 px-3">Organization & Title</th>
                    <th className="pb-2.5 px-3">Current Status</th>
                    <th className="pb-2.5 px-3">Visual Journey Progress</th>
                    <th className="pb-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredApps.slice(0, 15).map((app) => {
                    const companyName = app.jobPosting?.company?.name || 'Organization';
                    const role = app.jobPosting?.role || 'Opportunity';
                    const typeConfig = APPLICATION_TYPES[app.appType || 'JOB'] || APPLICATION_TYPES.JOB;
                    const badge = getStageBadgeForType(app.appType, app.status);

                    // Compute current visual journey index
                    const currentStageIndex = typeConfig.stages.findIndex((s) => s.id === app.status);

                    return (
                      <tr key={app.id} className="hover:bg-[#1A1A1A]/60 transition">
                        <td className="py-3 px-3">
                          <span className="text-[10px] font-medium text-[#62929A] bg-[#1A1A1A] px-2 py-0.5 rounded border border-white/5 font-mono">
                            {typeConfig.label.split(' ')[0]}
                          </span>
                        </td>

                        <td className="py-3 px-3">
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

                        <td className="py-3 px-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium ${badge.color}`}>
                            {badge.label}
                          </span>
                        </td>

                        {/* SIGNATURE VISUAL JOURNEY TIMELINE BAR */}
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-1">
                            {typeConfig.stages.slice(0, 6).map((stage, idx) => {
                              const isCompleted = idx <= currentStageIndex;
                              const isCurrent = idx === currentStageIndex;

                              return (
                                <div key={stage.id} className="flex items-center">
                                  <div
                                    title={stage.label}
                                    className={`w-2.5 h-2.5 rounded-full transition ${
                                      isCurrent
                                        ? 'bg-[#C3195D] ring-2 ring-[#C3195D]/40 scale-110'
                                        : isCompleted
                                        ? 'bg-[#C3195D]/70'
                                        : 'bg-white/10'
                                    }`}
                                  />
                                  {idx < Math.min(typeConfig.stages.length, 6) - 1 && (
                                    <div
                                      className={`w-3 h-0.5 ${
                                        idx < currentStageIndex ? 'bg-[#C3195D]/70' : 'bg-white/10'
                                      }`}
                                    />
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </td>

                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleQuickStatusUpdate(app.id, app.status, app.appType || 'JOB')}
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
                            <button
                              onClick={() => handleDeleteApplication(app.id, companyName)}
                              title="Delete Application Entry"
                              className="p-1.5 rounded-lg text-[#D96C6C]/80 hover:text-[#D96C6C] hover:bg-[#D96C6C]/10 transition"
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
          </div>
        </>
      )}

      {isModalOpen && <NewApplicationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />}
    </div>
  );
}
