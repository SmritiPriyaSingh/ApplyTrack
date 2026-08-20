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
  MessageSquare
} from 'lucide-react';
import { HIRING_STAGES } from '@/lib/constants';
import { formatDate, getStatusBadge } from '@/lib/utils';

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
    return <div className="py-20 text-center text-[#BFC3C7]">Loading Application Workspace...</div>;
  }

  if (!app) {
    return (
      <div className="py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-[#EFECEC]">Application Not Found</h2>
        <Link href="/applications" className="text-[#C3195D] text-xs underline">
          Return to Applications Board
        </Link>
      </div>
    );
  }

  const company = app.jobPosting?.company;
  const jobPosting = app.jobPosting;
  const resume = app.resume;
  const recruiter = app.recruiters?.[0];
  const badge = getStatusBadge(app.status);

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
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <Link
          href="/applications"
          className="text-xs text-[#BFC3C7] hover:text-[#EFECEC] flex items-center gap-1.5 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Applications</span>
        </Link>

        <span className={`px-3 py-1 rounded-xl text-xs font-medium border ${badge.bg}`}>
          {badge.label}
        </span>
      </div>

      <div className="bg-[#0B0B0B] p-6 rounded-2xl border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#1A1A1A] border border-white/5 flex items-center justify-center font-bold text-lg text-[#C3195D] shrink-0">
            {company?.name ? company.name.substring(0, 2).toUpperCase() : 'CO'}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-[#EFECEC] tracking-tight">{jobPosting?.role}</h1>
              {company?.website && (
                <a href={company.website} target="_blank" rel="noreferrer" className="text-[#BFC3C7] hover:text-[#C3195D]">
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
            <p className="text-xs text-[#BFC3C7] mt-0.5">
              <span className="font-medium text-[#EFECEC]">{company?.name}</span> • {jobPosting?.location} ({jobPosting?.workMode})
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs text-[#737373] mt-2 font-mono">
              <span>Submitted: {formatDate(app.applicationDate)}</span>
              <span>Source: {app.source}</span>
              {jobPosting?.package && <span className="text-[#6CBF84] font-semibold">{jobPosting.package}</span>}
            </div>
          </div>
        </div>

        {resume && (
          <div className="bg-[#1A1A1A] border border-white/5 p-3.5 rounded-xl flex items-center gap-3 shrink-0">
            <FileText className="w-4 h-4 text-[#62929A]" />
            <div>
              <span className="text-[10px] text-[#737373] uppercase tracking-wider block">Resume Submitted</span>
              <span className="text-xs font-bold text-[#62929A]">{resume.title} ({resume.versionTag})</span>
            </div>
          </div>
        )}
      </div>

      {/* HIRING STAGE PIPELINE */}
      <div className="bg-[#0B0B0B] p-5 rounded-2xl border border-white/5 overflow-x-auto">
        <h3 className="text-xs font-bold text-[#BFC3C7] uppercase tracking-wider mb-3">Hiring Stage Pipeline</h3>
        <div className="flex items-center gap-2 min-w-[700px]">
          {HIRING_STAGES.slice(1, 9).map((stage, index) => {
            const isActive = app.status === stage.id;

            return (
              <button
                key={stage.id}
                onClick={() => handleUpdateStatus(stage.id)}
                className={`flex-1 p-2 rounded-xl border text-center transition flex flex-col items-center justify-center ${
                  isActive
                    ? 'bg-[#C3195D] text-[#EFECEC] font-semibold border-[#C3195D]'
                    : 'bg-[#1A1A1A] border-white/5 text-[#BFC3C7] hover:border-[#C3195D]'
                }`}
              >
                <span className="text-[10px] font-mono block mb-0.5">Step {index + 1}</span>
                <span className="text-xs font-medium">{stage.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TABS */}
      <div className="flex items-center gap-2 border-b border-white/5 pb-2">
        {[
          { id: 'timeline', label: 'Journey Timeline' },
          { id: 'notes', label: 'Private Notes' },
          { id: 'recruiter', label: 'Recruiter Info' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-1.5 rounded-xl text-xs font-medium transition ${
              activeTab === tab.id
                ? 'bg-[#C3195D] text-[#EFECEC]'
                : 'text-[#BFC3C7] hover:text-[#EFECEC] hover:bg-[#1A1A1A]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TIMELINE TAB */}
      {activeTab === 'timeline' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-[#0B0B0B] p-6 rounded-2xl border border-white/5 space-y-6">
            <h3 className="text-xs font-semibold text-[#EFECEC] tracking-wide flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#C3195D]" />
              Event Timeline Stream
            </h3>

            <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-white/10">
              {app.events?.map((ev: any) => (
                <div key={ev.id} className="relative">
                  <div className="absolute -left-[27px] top-1 w-3 h-3 rounded-full bg-[#C3195D] border-2 border-[#0B0B0B]" />
                  <div className="bg-[#1A1A1A] border border-white/5 rounded-xl p-3.5">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-xs font-semibold text-[#EFECEC]">{ev.title}</h4>
                      <span className="text-[10px] text-[#737373] font-mono">{formatDate(ev.date)}</span>
                    </div>
                    {ev.description && <p className="text-xs text-[#BFC3C7]">{ev.description}</p>}
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleAddEvent} className="pt-4 border-t border-white/5 space-y-3">
              <h4 className="text-xs font-semibold text-[#EFECEC]">Log Timeline Event</h4>
              <input
                type="text"
                placeholder="Event Title..."
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
                className="w-full px-3 py-1.5 bg-[#1A1A1A] border border-white/5 rounded-xl text-xs text-[#EFECEC] focus:outline-none focus:border-[#C3195D]"
              />
              <textarea
                rows={2}
                placeholder="Description..."
                value={eventDesc}
                onChange={(e) => setEventDesc(e.target.value)}
                className="w-full p-3 bg-[#1A1A1A] border border-white/5 rounded-xl text-xs text-[#EFECEC] focus:outline-none focus:border-[#C3195D] resize-none"
              />
              <button
                type="submit"
                className="px-4 py-1.5 bg-[#C3195D] hover:bg-[#a5134d] text-[#EFECEC] text-xs font-medium rounded-xl"
              >
                Add Event
              </button>
            </form>
          </div>

          <div className="bg-[#0B0B0B] p-6 rounded-2xl border border-white/5 space-y-3">
            <h3 className="text-xs font-semibold text-[#EFECEC] tracking-wide">Status History Log</h3>
            <div className="space-y-2">
              {app.statusHistory?.map((h: any) => (
                <div key={h.id} className="bg-[#1A1A1A] p-3 rounded-xl border border-white/5 text-xs">
                  <span className="text-[10px] text-[#737373] block font-mono">{formatDate(h.changedAt)}</span>
                  <div className="font-medium text-[#EFECEC] mt-0.5">
                    {h.fromStatus ? `${h.fromStatus} → ` : ''}
                    <span className="text-[#C3195D] font-bold">{h.toStatus}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* PRIVATE NOTES TAB */}
      {activeTab === 'notes' && (
        <div className="bg-[#0B0B0B] p-6 rounded-2xl border border-white/5 space-y-4 max-w-3xl">
          <h3 className="text-xs font-semibold text-[#EFECEC] tracking-wide flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-[#C3195D]" />
            Private Application Notes
          </h3>
          <textarea
            rows={6}
            value={app.notes || ''}
            onChange={(e) => setApp({ ...app, notes: e.target.value })}
            placeholder="Type notes here..."
            className="w-full p-4 bg-[#1A1A1A] border border-white/5 rounded-xl text-xs text-[#EFECEC] focus:outline-none focus:border-[#C3195D]"
          />
          <button
            onClick={async () => {
              await fetch(`/api/applications/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ notes: app.notes }),
              });
              alert('Notes saved!');
            }}
            className="px-4 py-1.5 bg-[#C3195D] hover:bg-[#a5134d] text-[#EFECEC] text-xs font-medium rounded-xl"
          >
            Save Notes
          </button>
        </div>
      )}

      {/* RECRUITER TAB */}
      {activeTab === 'recruiter' && (
        <div className="bg-[#0B0B0B] p-6 rounded-2xl border border-white/5 space-y-4 max-w-2xl">
          <h3 className="text-xs font-semibold text-[#EFECEC] tracking-wide flex items-center gap-2">
            <User className="w-4 h-4 text-[#C3195D]" />
            Recruiter Details
          </h3>
          {recruiter ? (
            <div className="bg-[#1A1A1A] border border-white/5 p-4 rounded-xl space-y-3 text-xs">
              <h4 className="text-sm font-semibold text-[#EFECEC]">{recruiter.name}</h4>
              {recruiter.email && (
                <div className="flex items-center gap-2 text-[#BFC3C7]">
                  <Mail className="w-3.5 h-3.5 text-[#C3195D]" />
                  <a href={`mailto:${recruiter.email}`} className="hover:text-[#EFECEC] underline">
                    {recruiter.email}
                  </a>
                </div>
              )}
            </div>
          ) : (
            <p className="text-xs text-[#737373] italic">No recruiter attached.</p>
          )}
        </div>
      )}
    </div>
  );
}
