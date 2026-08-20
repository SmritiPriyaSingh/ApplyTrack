"use client";

import { useState, useEffect } from 'react';
import { Target, Edit3 } from 'lucide-react';

export function MonthlyGoalCard() {
  const [goal, setGoal] = useState<any | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [targetInput, setTargetInput] = useState('');

  useEffect(() => {
    fetch('/api/goals')
      .then((res) => res.json())
      .then((data) => {
        if (data.goal) {
          setGoal(data.goal);
          setTargetInput(data.goal.targetApplications.toString());
        }
      })
      .catch((err) => console.error(err));
  }, []);

  if (!goal) return null;

  const percentage = Math.min(Math.round((goal.currentApplications / goal.targetApplications) * 100), 100);

  const handleSaveTarget = async () => {
    const val = parseInt(targetInput);
    if (isNaN(val) || val <= 0) return;

    try {
      const res = await fetch('/api/goals', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetApplications: val }),
      });
      if (res.ok) {
        const data = await res.json();
        setGoal(data.goal);
        setIsEditing(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="bg-[#0A0A0A] border border-white/5 rounded-2xl p-6 mb-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-xl bg-[#1A1A1A] text-[#C3195D] border border-white/5 flex items-center justify-center">
            <Target className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-[#EFECEC] flex items-center gap-2">
              Monthly Goal: Apply to {goal.targetApplications} jobs
            </h3>
            <p className="text-[11px] text-[#BFC3C7]">Target for current month</p>
          </div>
        </div>

        <button
          onClick={() => setIsEditing(!isEditing)}
          className="text-xs text-[#BFC3C7] hover:text-[#EFECEC] p-1.5 rounded-lg hover:bg-[#1A1A1A] transition"
        >
          <Edit3 className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-medium">
          <span className="text-[#C3195D] font-mono font-bold">{percentage}% Achieved</span>
          <span className="text-[#EFECEC] font-mono">
            <span className="text-[#C3195D] font-bold">{goal.currentApplications}</span> / {goal.targetApplications}
          </span>
        </div>

        <div className="w-full h-2.5 bg-[#1A1A1A] rounded-full overflow-hidden p-0.5 border border-white/5">
          <div
            className="h-full bg-[#C3195D] rounded-full transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {isEditing && (
        <div className="mt-3 pt-3 border-t border-white/5 flex items-center gap-3">
          <input
            type="number"
            value={targetInput}
            onChange={(e) => setTargetInput(e.target.value)}
            className="w-24 px-3 py-1 bg-[#1A1A1A] border border-white/5 rounded-lg text-xs text-[#EFECEC]"
          />
          <button
            onClick={handleSaveTarget}
            className="px-3 py-1 bg-[#C3195D] hover:bg-[#a5134d] text-[#EFECEC] text-xs font-medium rounded-lg"
          >
            Save Target
          </button>
        </div>
      )}
    </div>
  );
}
