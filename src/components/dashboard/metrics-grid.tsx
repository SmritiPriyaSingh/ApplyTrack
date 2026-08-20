"use client";

import { useEffect, useState } from 'react';
import { Briefcase, Clock, Video, Award, XCircle, Ghost } from 'lucide-react';

export function MetricsGrid() {
  const [summary, setSummary] = useState<any>(null);

  useEffect(() => {
    fetch('/api/analytics')
      .then((res) => res.json())
      .then((data) => {
        if (data.summary) setSummary(data.summary);
      })
      .catch((err) => console.error(err));
  }, []);

  if (!summary) return null;

  const cards = [
    {
      label: 'Applications',
      value: summary.totalApplications,
      sub: 'Lifetime total',
      icon: Briefcase,
      color: '#C3195D',
    },
    {
      label: 'Pending',
      value: summary.pendingCount,
      sub: 'Awaiting reply',
      icon: Clock,
      color: '#E2B85C',
    },
    {
      label: 'Interview',
      value: summary.interviewCount,
      sub: `${summary.interviewRate}% response rate`,
      icon: Video,
      color: '#62929A',
    },
    {
      label: 'Offer',
      value: summary.offerCount,
      sub: `${summary.offerRate}% conversion`,
      icon: Award,
      color: '#6CBF84',
    },
    {
      label: 'Rejections',
      value: summary.rejectionCount,
      sub: 'Closed',
      icon: XCircle,
      color: '#D96C6C',
    },
    {
      label: 'Ghost Rate',
      value: `${summary.ghostRate}%`,
      sub: `${summary.ghostedCount} apps no reply`,
      icon: Ghost,
      color: '#737373',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="bg-[#0A0A0A] border border-white/5 hover:border-[#C3195D]/40 rounded-2xl p-4 flex flex-col justify-between transition"
          >
            <div className="flex items-center justify-between mb-2 pb-2 border-b border-white/5">
              <span className="text-[11px] text-[#BFC3C7] font-medium truncate">{card.label}</span>
              <Icon className="w-3.5 h-3.5" style={{ color: card.color }} />
            </div>
            <div>
              <span className="text-xl font-bold text-[#EFECEC] font-mono tracking-tight">{card.value}</span>
              <p className="text-[10px] text-[#737373] mt-0.5 truncate">{card.sub}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
