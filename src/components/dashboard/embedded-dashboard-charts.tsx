"use client";

import { useEffect, useState } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { BarChart3, TrendingUp } from 'lucide-react';

export function EmbeddedDashboardCharts() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch('/api/analytics')
      .then((res) => res.json())
      .then((d) => setData(d))
      .catch((err) => console.error(err));
  }, []);

  if (!data) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      {/* Chart 1: Monthly Application Volume */}
      <div className="bg-[#0A0A0A] border border-white/5 p-6 rounded-2xl">
        <h3 className="text-xs font-semibold text-[#EFECEC] tracking-wide mb-3 flex items-center gap-2">
          <BarChart3 className="w-3.5 h-3.5 text-[#C3195D]" />
          Applications Volume Trend
        </h3>
        <div className="h-44">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.monthlyBreakdown}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="month" stroke="#BFC3C7" fontSize={11} />
              <YAxis stroke="#BFC3C7" fontSize={11} />
              <Tooltip contentStyle={{ backgroundColor: '#1A1A1A', borderColor: 'rgba(255,255,255,0.08)', borderRadius: '8px', color: '#EFECEC' }} />
              <Bar dataKey="applications" fill="#C3195D" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2: Resume Version ROI (Secondary Accent #62929A) */}
      <div className="bg-[#0A0A0A] border border-white/5 p-6 rounded-2xl">
        <h3 className="text-xs font-semibold text-[#EFECEC] tracking-wide mb-3 flex items-center gap-2">
          <TrendingUp className="w-3.5 h-3.5 text-[#62929A]" />
          Resume Version Success Rate (%)
        </h3>
        <div className="h-44">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.resumePerformance}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="versionTag" stroke="#BFC3C7" fontSize={11} />
              <YAxis stroke="#BFC3C7" fontSize={11} unit="%" />
              <Tooltip contentStyle={{ backgroundColor: '#1A1A1A', borderColor: 'rgba(255,255,255,0.08)', borderRadius: '8px', color: '#EFECEC' }} />
              <Bar dataKey="conversionRate" fill="#62929A" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
