"use client";

import { useEffect, useState } from 'react';
import { Activity, CheckCircle2, AlertCircle } from 'lucide-react';

export function HealthScoreCard() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch('/api/health-score')
      .then((res) => res.json())
      .then((d) => setData(d))
      .catch((err) => console.error(err));
  }, []);

  if (!data || data.score === undefined) return null;

  const score = data.score;

  return (
    <div className="bg-[#0A0A0A] border border-white/5 p-6 rounded-2xl mb-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl border border-white/5 bg-[#1A1A1A] flex flex-col items-center justify-center font-mono text-[#C3195D] shrink-0">
            <span className="text-lg font-bold">{score}</span>
            <span className="text-[9px] uppercase text-[#BFC3C7]">/ 100</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#62929A]" />
              <h3 className="text-sm font-semibold text-[#EFECEC] tracking-wide">Job Search Health Score</h3>
            </div>
            <p className="text-xs text-[#BFC3C7] mt-0.5 max-w-sm font-normal">
              Diagnostic evaluating weekly application momentum & follow-ups.
            </p>
          </div>
        </div>

        <div className="flex-1 max-w-md bg-[#1A1A1A] p-3.5 rounded-xl border border-white/5 space-y-1.5">
          <span className="text-[10px] uppercase font-mono text-[#BFC3C7] tracking-wider block mb-1">
            Diagnostic Health Checklist
          </span>
          {data.diagnostics?.map((item: any, idx: number) => (
            <div key={idx} className="flex items-center gap-2 text-xs">
              {item.status === 'success' ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-[#6CBF84] shrink-0" />
              ) : (
                <AlertCircle className="w-3.5 h-3.5 text-[#BFC3C7] shrink-0" />
              )}
              <span className="font-normal text-[#BFC3C7]">{item.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
