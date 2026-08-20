"use client";

import { useEffect, useState } from 'react';
import { Video, CheckCircle2, Circle, Calendar as CalendarIcon, Plus, Sparkles } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { NewApplicationModal } from '@/components/applications/new-application-modal';

export default function CalendarPage() {
  const [reminders, setReminders] = useState<any[]>([]);
  const [interviews, setInterviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);

  useEffect(() => {
    fetch('/api/applications')
      .then((res) => res.json())
      .then((data) => {
        if (data.applications) {
          const allInterviews: any[] = [];
          const allReminders: any[] = [];

          data.applications.forEach((app: any) => {
            if (app.interviews) {
              app.interviews.forEach((i: any) => {
                allInterviews.push({ ...i, companyName: app.jobPosting?.company?.name, role: app.jobPosting?.role });
              });
            }
            if (app.reminders) {
              app.reminders.forEach((r: any) => {
                allReminders.push({ ...r, companyName: app.jobPosting?.company?.name });
              });
            }
          });

          setInterviews(allInterviews);
          setReminders(allReminders);
        }
        setLoading(false);
      })
      .catch((err) => setLoading(false));
  }, []);

  const handleLoadDemoData = async () => {
    setDemoLoading(true);
    try {
      const res = await fetch('/api/seed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'load_demo' }),
      });
      if (res.ok) window.location.reload();
    } catch (err) {
      console.error(err);
    } finally {
      setDemoLoading(false);
    }
  };

  const toggleTask = (id: string) => {
    setReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, isCompleted: !r.isCompleted } : r))
    );
  };

  if (loading) {
    return <div className="py-20 text-center text-[#BFC3C7] font-mono text-xs">Loading Calendar & Schedule...</div>;
  }

  const hasEvents = interviews.length > 0 || reminders.length > 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="pb-2 border-b border-white/5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#EFECEC] tracking-tight">
            Calendar & Task Checklist
          </h1>
          <p className="text-xs text-[#BFC3C7]">
            Scheduled technical interviews, assessment deadlines, and recruiter follow-up check-ins.
          </p>
        </div>
      </div>

      {!hasEvents ? (
        <div className="bg-[#0B0B0B] border border-white/5 rounded-2xl p-12 text-center space-y-4 max-w-lg mx-auto my-8">
          <div className="w-12 h-12 rounded-2xl bg-[#1A1A1A] border border-white/5 text-[#62929A] flex items-center justify-center mx-auto shadow-md">
            <CalendarIcon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#EFECEC]">No Scheduled Interviews or Tasks</h3>
            <p className="text-xs text-[#BFC3C7] mt-1 leading-relaxed">
              Scheduled technical rounds and task deadlines attached to your job applications will appear here automatically.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-[#C3195D] hover:bg-[#a5134d] text-[#EFECEC] text-xs font-medium rounded-xl inline-flex items-center gap-1.5 transition shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add Your First Application</span>
            </button>
            <button
              onClick={handleLoadDemoData}
              disabled={demoLoading}
              className="px-4 py-2 bg-[#1A1A1A] hover:bg-[#242424] text-[#62929A] text-xs font-medium rounded-xl border border-[#62929A]/30 inline-flex items-center gap-1.5 transition"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{demoLoading ? 'Loading Demo...' : 'Load Demo Data'}</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-[#0B0B0B] border border-white/5 p-5 rounded-2xl space-y-3">
            <h3 className="text-xs font-bold text-[#EFECEC] uppercase tracking-wider flex items-center gap-2">
              <Video className="w-4 h-4 text-[#C3195D]" />
              Scheduled Interviews ({interviews.length})
            </h3>

            <div className="space-y-2.5">
              {interviews.map((interview) => (
                <div
                  key={interview.id}
                  className="bg-[#1A1A1A] border border-white/5 p-3.5 rounded-xl space-y-1.5 hover:border-[#C3195D] transition"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#EFECEC]">{interview.title}</span>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#0B0B0B] text-[#C3195D] border border-[#C3195D]/30">
                      {formatDate(interview.scheduledAt)}
                    </span>
                  </div>
                  <p className="text-xs text-[#BFC3C7]">
                    <span className="text-[#C3195D] font-semibold">{interview.companyName}</span> • {interview.role}
                  </p>
                </div>
              ))}
              {interviews.length === 0 && (
                <p className="text-xs text-[#737373] italic py-4 text-center">No upcoming interviews scheduled.</p>
              )}
            </div>
          </div>

          <div className="bg-[#0B0B0B] border border-white/5 p-5 rounded-2xl space-y-3">
            <h3 className="text-xs font-bold text-[#EFECEC] uppercase tracking-wider flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#6CBF84]" />
              Task Checklist ({reminders.length})
            </h3>

            <div className="space-y-2">
              {reminders.map((task) => (
                <div
                  key={task.id}
                  onClick={() => toggleTask(task.id)}
                  className={`p-3 rounded-xl border border-white/5 flex items-start gap-3 cursor-pointer transition ${
                    task.isCompleted ? 'bg-[#1A1A1A]/40 opacity-60' : 'bg-[#1A1A1A] hover:border-[#C3195D]'
                  }`}
                >
                  {task.isCompleted ? (
                    <CheckCircle2 className="w-4 h-4 text-[#6CBF84] shrink-0 mt-0.5" />
                  ) : (
                    <Circle className="w-4 h-4 text-[#BFC3C7] shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <h4 className={`text-xs font-medium ${task.isCompleted ? 'line-through text-[#737373]' : 'text-[#EFECEC]'}`}>
                      {task.title}
                    </h4>
                    <span className="text-[10px] font-mono text-[#C3195D] block mt-0.5">Due: {formatDate(task.dueDate)}</span>
                  </div>
                </div>
              ))}
              {reminders.length === 0 && (
                <p className="text-xs text-[#737373] italic py-4 text-center">No task reminders due.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {isModalOpen && <NewApplicationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />}
    </div>
  );
}
