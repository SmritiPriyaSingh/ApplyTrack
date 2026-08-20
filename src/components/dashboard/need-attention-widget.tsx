"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, Clock, ArrowRight, Mail, CheckCircle2 } from 'lucide-react';
import { formatDate, getDaysAgo } from '@/lib/utils';

export function NeedAttentionWidget() {
  const [attentionApps, setAttentionApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<any | null>(null);

  useEffect(() => {
    fetch('/api/applications?needAttention=true')
      .then((res) => res.json())
      .then((data) => {
        if (data.applications) setAttentionApps(data.applications);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return null;
  if (attentionApps.length === 0) return null;

  return (
    <>
      <div className="bg-[#0A0A0A] border border-white/5 rounded-2xl p-6 mb-6">
        <div className="flex items-start justify-between pb-3 border-b border-white/5">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#1A1A1A] text-[#C3195D] border border-white/5 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-semibold text-[#EFECEC] tracking-wide">Needs Recruiter Follow-up</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#1A1A1A] text-[#C3195D] border border-[#C3195D]/30 font-semibold">
                  {attentionApps.length} Apps
                </span>
              </div>
              <p className="text-xs text-[#BFC3C7] mt-0.5 font-normal">
                No recruiter reply or activity recorded for <span className="text-[#EFECEC] font-medium">10+ days</span>.
              </p>
            </div>
          </div>
          <Link
            href="/applications?needAttention=true"
            className="text-xs font-medium text-[#C3195D] hover:text-[#EFECEC] flex items-center gap-1 shrink-0 bg-[#1A1A1A] px-3 py-1.5 rounded-xl border border-white/5 transition"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
          {attentionApps.slice(0, 3).map((app) => {
            const daysAgo = getDaysAgo(app.applicationDate);
            const companyName = app.jobPosting?.company?.name || 'Company';
            const role = app.jobPosting?.role || 'Role';

            return (
              <div
                key={app.id}
                className="bg-[#1A1A1A] border border-white/5 hover:border-[#C3195D]/40 rounded-xl p-3.5 flex flex-col justify-between transition"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-[#EFECEC] truncate max-w-[140px]">{companyName}</span>
                    <span className="text-[10px] text-[#BFC3C7] font-mono flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#62929A]" />
                      {daysAgo}d inactive
                    </span>
                  </div>
                  <p className="text-[11px] text-[#BFC3C7] truncate mb-2">{role}</p>
                </div>

                <div className="flex items-center justify-between pt-2.5 border-t border-white/5">
                  <span className="text-[10px] text-[#737373]">Applied: {formatDate(app.applicationDate)}</span>
                  <button
                    onClick={() => setSelectedApp(app)}
                    className="text-[10px] font-medium text-[#C3195D] hover:text-[#EFECEC] bg-[#0A0A0A] px-2.5 py-1 rounded-lg border border-white/5 flex items-center gap-1 transition"
                  >
                    <Mail className="w-3 h-3" />
                    Follow Up
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0A0A0A]/85 backdrop-blur-sm">
          <div className="bg-[#1A1A1A] border border-white/5 w-full max-w-lg rounded-2xl p-6 shadow-2xl">
            <h3 className="text-sm font-semibold text-[#EFECEC] mb-1">
              Recruiter Follow-up Draft ({selectedApp.jobPosting?.company?.name})
            </h3>
            <p className="text-xs text-[#BFC3C7] mb-4">
              Copy this template or log your follow-up check-in to update the timeline.
            </p>

            <div className="bg-[#0A0A0A] p-4 rounded-xl border border-white/5 text-xs text-[#EFECEC] space-y-2 mb-4 font-mono select-all">
              <p>Subject: Following up on Application for {selectedApp.jobPosting?.role}</p>
              <p>Hi Team,</p>
              <p>
                I hope you are doing well! I submitted my application for the {selectedApp.jobPosting?.role} position on {formatDate(selectedApp.applicationDate)}. I am very interested in this role and wanted to check if there are any updates regarding my application status.
              </p>
              <p>Best regards,<br />Smriti Priya Singh</p>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setSelectedApp(null)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-[#BFC3C7] hover:text-[#EFECEC]"
              >
                Close
              </button>
              <button
                onClick={async () => {
                  await fetch(`/api/applications/${selectedApp.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      newEvent: {
                        title: 'Follow-up Email Sent',
                        description: 'Sent follow-up check-in to recruiter',
                        eventType: 'FOLLOW_UP',
                      },
                    }),
                  });
                  setSelectedApp(null);
                  window.location.reload();
                }}
                className="px-4 py-2 rounded-xl bg-[#C3195D] hover:bg-[#a5134d] text-[#EFECEC] text-xs font-medium flex items-center gap-1.5 transition"
              >
                <CheckCircle2 className="w-4 h-4" />
                Log Sent Follow-up
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
