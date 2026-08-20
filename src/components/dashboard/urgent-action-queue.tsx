"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AlertCircle, ArrowUpRight } from 'lucide-react';

export function UrgentActionQueue() {
  const [urgentItems, setUrgentItems] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/applications')
      .then((res) => res.json())
      .then((data) => {
        if (data.applications) {
          const apps = data.applications;
          const items: any[] = [];

          apps.forEach((app: any) => {
            const tenDaysAgo = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);
            if (['APPLIED', 'APPLICATION_VIEWED'].includes(app.status) && new Date(app.applicationDate) < tenDaysAgo) {
              items.push({
                id: `fu-${app.id}`,
                appId: app.id,
                company: app.jobPosting?.company?.name || 'Company',
                role: app.jobPosting?.role || 'Role',
                priority: 'CRITICAL',
                title: 'No recruiter reply for 10+ days',
                actionLabel: 'Follow Up',
              });
            }

            if (app.interviews && app.interviews.length > 0) {
              const scheduled = app.interviews.find((i: any) => i.status === 'SCHEDULED');
              if (scheduled) {
                items.push({
                  id: `int-${scheduled.id}`,
                  appId: app.id,
                  company: app.jobPosting?.company?.name || 'Company',
                  role: app.jobPosting?.role || 'Role',
                  priority: 'HIGH',
                  title: `${scheduled.title} scheduled`,
                  actionLabel: 'Prepare Notes',
                });
              }
            }

            if (app.status === 'ONLINE_ASSESSMENT') {
              items.push({
                id: `oa-${app.id}`,
                appId: app.id,
                company: app.jobPosting?.company?.name || 'Company',
                role: app.jobPosting?.role || 'Role',
                priority: 'HIGH',
                title: 'Online Assessment Pending',
                actionLabel: 'Take Assessment',
              });
            }
          });

          setUrgentItems(items.slice(0, 4));
        }
      })
      .catch((err) => console.error(err));
  }, []);

  if (urgentItems.length === 0) return null;

  return (
    <div className="bg-[#0A0A0A] border border-white/5 p-6 rounded-2xl mb-6">
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/5">
        <h3 className="text-xs font-semibold text-[#EFECEC] tracking-wide flex items-center gap-2">
          <AlertCircle className="w-3.5 h-3.5 text-[#C3195D]" />
          Priority Action Queue
        </h3>
        <span className="text-[10px] font-mono text-[#C3195D] font-bold">Action Required</span>
      </div>

      <div className="space-y-2">
        {urgentItems.map((item) => (
          <div
            key={item.id}
            className="bg-[#1A1A1A] border border-white/5 hover:border-[#C3195D]/40 p-3.5 rounded-xl flex items-center justify-between gap-4 transition"
          >
            <div className="flex items-center gap-3">
              <span className={`w-2 h-2 rounded-full shrink-0 ${item.priority === 'CRITICAL' ? 'bg-[#C3195D]' : 'bg-[#E2B85C]'}`} />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-[#EFECEC]">{item.company}</span>
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[#0A0A0A] text-[#C3195D] border border-[#C3195D]/30 font-semibold">
                    {item.priority}
                  </span>
                </div>
                <p className="text-[11px] text-[#BFC3C7] mt-0.5">{item.role} • {item.title}</p>
              </div>
            </div>

            <Link
              href={`/applications/${item.appId}`}
              className="px-3 py-1 bg-[#0A0A0A] hover:bg-[#242424] text-[#EFECEC] text-xs font-medium rounded-lg border border-white/5 flex items-center gap-1 transition shrink-0"
            >
              <span>{item.actionLabel}</span>
              <ArrowUpRight className="w-3 h-3 text-[#C3195D]" />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
