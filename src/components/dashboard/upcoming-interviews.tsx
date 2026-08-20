"use client";

import { useEffect, useState } from 'react';
import { Video, User, ExternalLink } from 'lucide-react';
import { formatDate, formatRelativeTime } from '@/lib/utils';

export function UpcomingInterviewsWidget() {
  const [applications, setApplications] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/applications')
      .then((res) => res.json())
      .then((data) => {
        if (data.applications) {
          const withInterviews = data.applications.filter((app: any) =>
            app.interviews && app.interviews.length > 0 && app.interviews.some((i: any) => i.status === 'SCHEDULED')
          );
          setApplications(withInterviews);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  if (applications.length === 0) return null;

  return (
    <div className="bg-[#0A0A0A] border border-white/5 rounded-2xl p-6 mb-6">
      <div className="flex items-center gap-2 mb-4 pb-2 border-b border-white/5">
        <Video className="w-3.5 h-3.5 text-[#62929A]" />
        <h3 className="text-xs font-semibold text-[#EFECEC] tracking-wide">Scheduled Interviews</h3>
      </div>

      <div className="space-y-2.5">
        {applications.map((app) => {
          const scheduledInterview = app.interviews.find((i: any) => i.status === 'SCHEDULED');
          if (!scheduledInterview) return null;

          const companyName = app.jobPosting?.company?.name || 'Company';
          const role = app.jobPosting?.role || 'Role';

          return (
            <div
              key={scheduledInterview.id}
              className="bg-[#1A1A1A] border border-white/5 hover:border-[#C3195D]/40 rounded-xl p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 transition"
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#0A0A0A] border border-white/5 flex items-center justify-center text-xs font-bold text-[#C3195D]">
                  {companyName.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-[#EFECEC]">{scheduledInterview.title}</h4>
                  <p className="text-[11px] text-[#BFC3C7]">
                    <span className="font-medium text-[#EFECEC]">{companyName}</span> • {role}
                  </p>
                  {scheduledInterview.interviewerNames && (
                    <p className="text-[10px] text-[#737373] flex items-center gap-1 mt-0.5">
                      <User className="w-3 h-3 text-[#737373]" />
                      {scheduledInterview.interviewerNames}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 self-end md:self-auto">
                <div className="text-right">
                  <span className="text-xs font-mono font-semibold text-[#C3195D] block">
                    {formatDate(scheduledInterview.scheduledAt)}
                  </span>
                  <span className="text-[10px] text-[#737373] block">
                    {formatRelativeTime(scheduledInterview.scheduledAt)}
                  </span>
                </div>

                {scheduledInterview.meetingUrl && (
                  <a
                    href={scheduledInterview.meetingUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-[#C3195D] hover:bg-[#a5134d] text-[#EFECEC] text-xs font-medium flex items-center gap-1 transition"
                  >
                    <span>Join Call</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
