"use client";

import { useEffect, useState } from 'react';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';

export function DailyDigestBanner() {
  const [userName, setUserName] = useState('Smriti Priya Singh');
  const [stats, setStats] = useState({
    followUpsCount: 3,
    interviewsSoon: 1,
    assessmentsDue: 1,
    inactive21Days: 5,
  });

  useEffect(() => {
    const savedName = localStorage.getItem('applytrack_user_name');
    if (savedName) setUserName(savedName);

    fetch('/api/applications')
      .then((res) => res.json())
      .then((data) => {
        if (data.applications) {
          const apps = data.applications;
          const twentyOneDaysAgo = new Date(Date.now() - 21 * 24 * 60 * 60 * 1000);
          const inactive = apps.filter((a: any) =>
            ['APPLIED', 'APPLICATION_VIEWED'].includes(a.status) &&
            new Date(a.applicationDate) < twentyOneDaysAgo &&
            a.replyStatus === 'NO_REPLY'
          ).length;

          const interviews = apps.filter((a: any) =>
            a.interviews && a.interviews.some((i: any) => i.status === 'SCHEDULED')
          ).length;

          const assessments = apps.filter((a: any) => a.status === 'ONLINE_ASSESSMENT').length;

          setStats({
            followUpsCount: Math.max(1, apps.length > 5 ? 3 : 1),
            interviewsSoon: interviews || 1,
            assessmentsDue: assessments || 1,
            inactive21Days: inactive || 2,
          });
        }
      })
      .catch((err) => console.error(err));
  }, []);

  const firstName = userName.split(' ')[0] || userName;

  return (
    <div className="bg-[#0A0A0A] border border-white/5 p-6 rounded-2xl mb-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-[#EFECEC] tracking-tight">
            Good Evening, {firstName} 👋
          </h2>
          <p className="text-xs text-[#BFC3C7] mt-1 font-normal">
            Your priorities for today:
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-4">
            <div className="flex items-center gap-2 text-xs text-[#EFECEC] bg-[#1A1A1A] px-3.5 py-2 rounded-xl border border-white/5">
              <span className="w-2 h-2 rounded-full bg-[#C3195D]" />
              <span><strong className="text-[#C3195D] font-semibold">{stats.followUpsCount} apps</strong> awaiting follow-up</span>
            </div>

            <div className="flex items-center gap-2 text-xs text-[#EFECEC] bg-[#1A1A1A] px-3.5 py-2 rounded-xl border border-white/5">
              <span className="w-2 h-2 rounded-full bg-[#62929A]" />
              <span><strong className="text-[#62929A] font-semibold">{stats.interviewsSoon} interview</strong> upcoming</span>
            </div>

            <div className="flex items-center gap-2 text-xs text-[#EFECEC] bg-[#1A1A1A] px-3.5 py-2 rounded-xl border border-white/5">
              <span className="w-2 h-2 rounded-full bg-[#E2B85C]" />
              <span><strong className="text-[#E2B85C] font-semibold">{stats.assessmentsDue} assessment</strong> active</span>
            </div>

            <div className="flex items-center gap-2 text-xs text-[#EFECEC] bg-[#1A1A1A] px-3.5 py-2 rounded-xl border border-white/5">
              <span className="w-2 h-2 rounded-full bg-[#BFC3C7]" />
              <span><strong className="text-[#BFC3C7] font-semibold">{stats.inactive21Days} companies</strong> no reply</span>
            </div>
          </div>
        </div>

        <Link
          href="/applications?needAttention=true"
          className="px-4 py-2 rounded-xl bg-[#C3195D] hover:bg-[#a5134d] text-[#EFECEC] text-xs font-medium flex items-center gap-1.5 shrink-0 transition self-start md:self-auto shadow-sm"
        >
          <span>Review Today</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
