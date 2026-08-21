"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  ExternalLink, 
  User, 
  Mail, 
  FileText, 
  Clock, 
  MessageSquare,
  Layers,
  Award
} from 'lucide-react';
import { APPLICATION_TYPES, getAllStagesForType, getStageBadgeForType } from '@/lib/application-types';
import { formatDate } from '@/lib/utils';

export default function ApplicationDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const [app, setApp] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'timeline' | 'notes' | 'recruiter' | 'company' | 'documents'>('timeline');
  const [eventTitle, setEventTitle] = useState('');
  const [eventDesc, setEventDesc] = useState('');

  const fetchDetail = () => {
    fetch(`/api/applications/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.application) {
          setApp(data.application);
        }
        setLoading(false);
      })
      .catch((err) => setLoading(false));
  };

  useEffect(() => {
    if (id) fetchDetail();
  }, [id]);

  if (loading) {
    return <div className="py-20 text-center text-[#BFC3C7]">Loading Opportunity Workspace...</div>;
  }

  if (!app) {
    return (
      <div className="py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-[#EFECEC]">Record Not Found</h2>
        <Link href="/applications" className="text-[#C3195D] text-xs underline">
          Return to Career Workspace
        </Link>
      </div>
    );
  }

  const company = app.jobPosting?.company;
  const jobPosting = app.jobPosting;
  const resume = app.resume;
  const recruiter = app.recruiters?.[0];
  const typeConfig = APPLICATION_TYPES[app.appType || 'JOB'] || APPLICATION_TYPES.JOB;
  const currentBadge = getStageBadgeForType(app.appType, app.status);
  const typeStages = getAllStagesForType(app.appType);

  let extraDataObj: Record<string, string> = {};
  if (app.extraData) {
    try {
      extraDataObj = JSON.parse(app.extraData);
    } catch (e) {}
  }

  const handleUpdateStatus = async (newStatus: string) => {
    try {
      const res = await fetch(`/api/applications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) fetchDetail();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle) return;

    try {
      const res = await fetch(`/api/applications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newEvent: { title: eventTitle, description: eventDesc, eventType: 'NOTE' },
        }),
      });
      if (res.ok) {
        setEventTitle('');
        setEventDesc('');
        fetchDetail();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="flex items-center gap-3">
        <Link
          href="/applications"
          className="p-2 rounded-xl bg-[#0B0B0B] border border-white/5 text-[#BFC3C7] hover:text-[#EFECEC] transition"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-medium text-[#62929A] bg-[#1A1A1A] px-2 py-0.5 rounded border border-white/5 font-mono">
              {typeConfig.label}
            </span>
            <span className="text-xs text-[#737373] font-mono">ID: {app.id.substring(0, 8)}</span>
          </div>
          <h1 className="text-xl font-bold text-[#EFECEC] flex items-center gap-2">
            {company?.name || 'Organization'} — {jobPosting?.role || 'Opportunity'}
          </h1>
        </div>
      </div>

      {/* TOP PIPELINE STAGE STRIP */}
      <div className="bg-[#0B0B0B] border border-white/5 p-5 rounded-2xl space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[#EFECEC] uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#C3195D]" />
            Pipeline Status
          </span>
          <span className={`px-2.5 py-1 rounded text-xs font-semibold ${currentBadge.color}`}>
            {currentBadge.label}
          </span>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {typeStages.map((stage) => {
            const isCurrent = app.status === stage.id;
            return (
              <button
                key={stage.id}
                onClick={() => handleUpdateStatus(stage.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition shrink-0 ${
                  isCurrent
                    ? 'bg-[#C3195D] text-[#EFECEC] border-[#C3195D] shadow-sm font-bold'
                    : 'bg-[#1A1A1A] text-[#BFC3C7] border-white/5 hover:text-[#EFECEC]'
                }`}
              >
                {stage.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* MAIN TAB CONTENT */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#0B0B0B] border border-white/5 rounded-2xl p-5 space-y-4">
            <div className="flex border-b border-white/5 pb-2 gap-4 text-xs font-medium">
              <button
                onClick={() => setActiveTab('timeline')}
                className={`pb-2 transition border-b-2 ${
                  activeTab === 'timeline'
                    ? 'border-[#C3195D] text-[#EFECEC]'
                    : 'border-transparent text-[#BFC3C7] hover:text-[#EFECEC]'
                }`}
              >
                Timeline & Log
              </button>
              <button
                onClick={() => setActiveTab('notes')}
                className={`pb-2 transition border-b-2 ${
                  activeTab === 'notes'
                    ? 'border-[#C3195D] text-[#EFECEC]'
                    : 'border-transparent text-[#BFC3C7] hover:text-[#EFECEC]'
                }`}
              >
                Private Notes
              </button>
            </div>

            {activeTab === 'timeline' && (
              <div className="space-y-4">
                <form onSubmit={handleAddEvent} className="bg-[#1A1A1A] p-4 rounded-xl border border-white/5 space-y-3">
                  <h4 className="text-xs font-bold text-[#EFECEC]">Add Timeline Event / Note</h4>
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="Title (e.g. Registered Exam, Verification Call)..."
                      value={eventTitle}
                      onChange={(e) => setEventTitle(e.target.value)}
                      className="w-full p-2 bg-[#0B0B0B] border border-white/5 rounded-lg text-xs text-[#EFECEC]"
                    />
                    <textarea
                      rows={2}
                      placeholder="Additional details..."
                      value={eventDesc}
                      onChange={(e) => setEventDesc(e.target.value)}
                      className="w-full p-2 bg-[#0B0B0B] border border-white/5 rounded-lg text-xs text-[#EFECEC] resize-none"
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-3 py-1 bg-[#C3195D] text-[#EFECEC] rounded-lg text-xs font-medium hover:bg-[#a5134d]"
                    >
                      Record Event
                    </button>
                  </div>
                </form>

                <div className="space-y-3">
                  {app.events?.map((ev: any) => (
                    <div key={ev.id} className="bg-[#1A1A1A] p-3.5 rounded-xl border border-white/5 flex items-start gap-3">
                      <Clock className="w-4 h-4 text-[#62929A] mt-0.5" />
                      <div>
                        <div className="flex items-center gap-2">
                          <h5 className="text-xs font-bold text-[#EFECEC]">{ev.title}</h5>
                          <span className="text-[10px] font-mono text-[#737373]">{formatDate(ev.date)}</span>
                        </div>
                        {ev.description && <p className="text-xs text-[#BFC3C7] mt-1">{ev.description}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'notes' && (
              <div className="space-y-2">
                <p className="text-xs text-[#EFECEC] whitespace-pre-wrap bg-[#1A1A1A] p-4 rounded-xl border border-white/5">
                  {app.notes || 'No private notes recorded.'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* SIDEBAR DETAILS PANEL */}
        <div className="space-y-6">
          <div className="bg-[#0B0B0B] border border-white/5 rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-bold text-[#EFECEC] uppercase tracking-wider">Opportunity Meta</h3>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-[#BFC3C7]">Organization:</span>
                <span className="font-semibold text-[#EFECEC]">{company?.name}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-[#BFC3C7]">Title:</span>
                <span className="font-semibold text-[#EFECEC]">{jobPosting?.role}</span>
              </div>

              {jobPosting?.package && (
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-[#BFC3C7]">Allowance / Package:</span>
                  <span className="font-semibold text-[#6CBF84]">{jobPosting.package}</span>
                </div>
              )}

              {/* Extra Type-Specific Meta (Registration #, Exam Dates, Scores, Team Members) */}
              {Object.entries(extraDataObj).map(([key, val]) => (
                <div key={key} className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-[#BFC3C7] capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
                  <span className="font-mono text-[#62929A] font-semibold">{val}</span>
                </div>
              ))}
            </div>

            {jobPosting?.jobUrl && (
              <a
                href={jobPosting.jobUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2 bg-[#1A1A1A] hover:bg-[#C3195D] text-[#EFECEC] text-xs font-medium rounded-xl border border-white/5 flex items-center justify-center gap-1.5 transition block text-center"
              >
                <span>Open Portal Link</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>

          {/* RESUME CARD - STRICTLY SHOWN ONLY IF TYPE IS JOB */}
          {typeConfig.requiresResume && (
            <div className="bg-[#0B0B0B] border border-white/5 rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-[#EFECEC] uppercase tracking-wider">
                <FileText className="w-4 h-4 text-[#62929A]" />
                Linked Resume
              </div>
              {resume ? (
                <div className="bg-[#1A1A1A] p-3 rounded-xl border border-white/5">
                  <span className="text-xs font-semibold text-[#EFECEC] block">{resume.title}</span>
                </div>
              ) : (
                <span className="text-xs text-[#737373] italic">No resume linked</span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
