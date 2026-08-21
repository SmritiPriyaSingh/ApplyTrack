"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  ExternalLink, 
  FileText, 
  Clock, 
  Layers,
  Calendar,
  CheckSquare,
  Square,
  CreditCard,
  MapPin,
  Download,
  UploadCloud,
  CheckCircle2,
  FileCheck
} from 'lucide-react';
import { APPLICATION_TYPES, getAllStagesForType, getStageBadgeForType } from '@/lib/application-types';
import { formatDate } from '@/lib/utils';

export default function ApplicationDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const [app, setApp] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'journey' | 'timeline' | 'notes' | 'docs'>('journey');
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
  const typeConfig = APPLICATION_TYPES[app.appType || 'JOB'] || APPLICATION_TYPES.JOB;
  const currentBadge = getStageBadgeForType(app.appType, app.status);
  const typeStages = getAllStagesForType(app.appType);

  let extraDataObj: Record<string, any> = {};
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

  const toggleDocChecklist = async (key: string) => {
    const updatedDocs = {
      ...(extraDataObj.docsChecklist || {}),
      [key]: !extraDataObj.docsChecklist?.[key],
    };

    const newExtraData = {
      ...extraDataObj,
      docsChecklist: updatedDocs,
    };

    try {
      const res = await fetch(`/api/applications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ extraData: newExtraData }),
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

  const currentStageIndex = typeStages.findIndex((s) => s.id === app.status);

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
            {extraDataObj.priority && (
              <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-[#C3195D]/15 text-[#C3195D] border border-[#C3195D]/30">
                🔴 {extraDataObj.priority} Priority
              </span>
            )}
          </div>
          <h1 className="text-xl font-bold text-[#EFECEC] flex items-center gap-2 mt-0.5">
            {company?.name || 'Organization'} — {jobPosting?.role || 'Opportunity'}
          </h1>
        </div>
      </div>

      {/* FEATURE 10: INTERACTIVE VISUAL JOURNEY PROGRESS TIMELINE BAR */}
      <div className="bg-[#0B0B0B] border border-white/5 p-5 rounded-2xl space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[#EFECEC] uppercase tracking-wider flex items-center gap-2 font-mono">
            <Layers className="w-4 h-4 text-[#C3195D]" />
            Visual Progress Journey
          </span>
          <span className={`px-2.5 py-1 rounded text-xs font-semibold ${currentBadge.color}`}>
            Current Stage: {currentBadge.label}
          </span>
        </div>

        {/* Visual Journey Progression Flow */}
        <div className="flex items-center justify-between overflow-x-auto py-3 px-2 bg-[#1A1A1A] rounded-xl border border-white/5">
          {typeStages.map((stage, idx) => {
            const isCompleted = idx <= currentStageIndex;
            const isCurrent = idx === currentStageIndex;

            return (
              <div key={stage.id} className="flex items-center flex-1 shrink-0 min-w-[110px]">
                <div
                  onClick={() => handleUpdateStatus(stage.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition cursor-pointer ${
                    isCurrent
                      ? 'bg-[#C3195D] text-[#EFECEC] border-[#C3195D] shadow-md font-bold'
                      : isCompleted
                      ? 'bg-[#C3195D]/20 text-[#EFECEC] border-[#C3195D]/40'
                      : 'bg-[#0B0B0B] text-[#737373] border-white/5 hover:text-[#EFECEC]'
                  }`}
                >
                  <div
                    className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] font-bold ${
                      isCompleted ? 'bg-[#C3195D] text-[#EFECEC]' : 'bg-white/10 text-[#737373]'
                    }`}
                  >
                    {isCompleted ? '✓' : idx + 1}
                  </div>
                  <span className="text-[11px] truncate">{stage.label}</span>
                </div>

                {idx < typeStages.length - 1 && (
                  <div
                    className={`h-0.5 flex-1 mx-1.5 ${
                      idx < currentStageIndex ? 'bg-[#C3195D]' : 'bg-white/10'
                    }`}
                  />
                )}
              </div>
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
                onClick={() => setActiveTab('journey')}
                className={`pb-2 transition border-b-2 ${
                  activeTab === 'journey'
                    ? 'border-[#C3195D] text-[#EFECEC]'
                    : 'border-transparent text-[#BFC3C7] hover:text-[#EFECEC]'
                }`}
              >
                Full Lifecycle Overview
              </button>
              <button
                onClick={() => setActiveTab('timeline')}
                className={`pb-2 transition border-b-2 ${
                  activeTab === 'timeline'
                    ? 'border-[#C3195D] text-[#EFECEC]'
                    : 'border-transparent text-[#BFC3C7] hover:text-[#EFECEC]'
                }`}
              >
                Timeline Log
              </button>
              <button
                onClick={() => setActiveTab('notes')}
                className={`pb-2 transition border-b-2 ${
                  activeTab === 'notes'
                    ? 'border-[#C3195D] text-[#EFECEC]'
                    : 'border-transparent text-[#BFC3C7] hover:text-[#EFECEC]'
                }`}
              >
                Preparation Notes
              </button>
            </div>

            {/* TAB 1: LIFECYCLE OVERVIEW CARDS */}
            {activeTab === 'journey' && (
              <div className="space-y-4">
                {/* 1. DEADLINES & DATES */}
                {(extraDataObj.regCloseDate || extraDataObj.examDate) && (
                  <div className="bg-[#1A1A1A] p-4 rounded-xl border border-white/5 space-y-2">
                    <span className="text-xs font-bold text-[#C3195D] uppercase tracking-wider block flex items-center gap-1.5 font-mono">
                      <Calendar className="w-3.5 h-3.5" />
                      Critical Dates & Registration Windows
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      {extraDataObj.regOpenDate && (
                        <div>
                          <span className="text-[10px] text-[#BFC3C7] block">Reg Opens</span>
                          <span className="font-mono text-[#EFECEC]">{formatDate(extraDataObj.regOpenDate)}</span>
                        </div>
                      )}
                      {extraDataObj.regCloseDate && (
                        <div>
                          <span className="text-[10px] text-[#C3195D] font-bold block">Reg Closes *</span>
                          <span className="font-mono text-[#C3195D] font-bold">{formatDate(extraDataObj.regCloseDate)}</span>
                        </div>
                      )}
                      {extraDataObj.admitCardDate && (
                        <div>
                          <span className="text-[10px] text-[#BFC3C7] block">Admit Card Date</span>
                          <span className="font-mono text-[#62929A]">{formatDate(extraDataObj.admitCardDate)}</span>
                        </div>
                      )}
                      {extraDataObj.examDate && (
                        <div>
                          <span className="text-[10px] text-[#BFC3C7] block">Exam Date</span>
                          <span className="font-mono text-[#E2B85C] font-bold">{formatDate(extraDataObj.examDate)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 2. ADMIT CARD DOWNLOAD */}
                {(extraDataObj.admitCardLink || extraDataObj.admitCardFileData) && (
                  <div className="bg-[#1A1A1A] p-4 rounded-xl border border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileCheck className="w-5 h-5 text-[#62929A]" />
                      <div>
                        <h4 className="text-xs font-bold text-[#EFECEC]">Admit Card Ready</h4>
                        <p className="text-[11px] text-[#BFC3C7]">Admit card has been issued for this exam.</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {extraDataObj.admitCardLink && (
                        <a
                          href={extraDataObj.admitCardLink}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 bg-[#0B0B0B] hover:bg-[#62929A] text-[#EFECEC] text-xs font-medium rounded-xl border border-white/5 flex items-center gap-1 transition"
                        >
                          <span>Portal Link</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                      {extraDataObj.admitCardFileData && (
                        <a
                          href={extraDataObj.admitCardFileData}
                          download="AdmitCard.pdf"
                          className="px-3.5 py-1.5 bg-[#62929A] hover:bg-[#4d7981] text-[#EFECEC] text-xs font-medium rounded-xl flex items-center gap-1.5 transition shadow-sm"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download PDF</span>
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* 3. FEE PAYMENT & TRANSACTION DETAILS */}
                {(jobPosting?.package || extraDataObj.feeStatus) && (
                  <div className="bg-[#1A1A1A] p-4 rounded-xl border border-white/5 space-y-2">
                    <span className="text-xs font-bold text-[#6CBF84] uppercase tracking-wider block flex items-center gap-1.5 font-mono">
                      <CreditCard className="w-3.5 h-3.5" />
                      Fee Payment & Receipt Details
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      <div>
                        <span className="text-[10px] text-[#BFC3C7] block">Fee Amount</span>
                        <span className="font-mono text-[#EFECEC] font-bold">{jobPosting?.package || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#BFC3C7] block">Status</span>
                        <span
                          className={`font-mono text-xs font-bold ${
                            extraDataObj.feeStatus === 'Paid' ? 'text-[#6CBF84]' : 'text-[#E2B85C]'
                          }`}
                        >
                          {extraDataObj.feeStatus === 'Paid' ? '✓ Paid' : '○ Pending'}
                        </span>
                      </div>
                      {extraDataObj.feePaymentDate && (
                        <div>
                          <span className="text-[10px] text-[#BFC3C7] block">Paid Date</span>
                          <span className="font-mono text-[#EFECEC]">{formatDate(extraDataObj.feePaymentDate)}</span>
                        </div>
                      )}
                      {extraDataObj.transactionId && (
                        <div>
                          <span className="text-[10px] text-[#BFC3C7] block">Transaction ID</span>
                          <span className="font-mono text-[#62929A]">{extraDataObj.transactionId}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 4. EXAM CENTER BREAKDOWN */}
                {(extraDataObj.allocatedCenter || extraDataObj.centerAddress) && (
                  <div className="bg-[#1A1A1A] p-4 rounded-xl border border-white/5 space-y-2">
                    <span className="text-xs font-bold text-[#E2B85C] uppercase tracking-wider block flex items-center gap-1.5 font-mono">
                      <MapPin className="w-3.5 h-3.5" />
                      Allocated Exam Center & Location
                    </span>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-[#BFC3C7]">Center Name:</span>
                        <span className="font-bold text-[#EFECEC]">{extraDataObj.allocatedCenter}</span>
                      </div>
                      {extraDataObj.centerAddress && (
                        <div className="flex justify-between">
                          <span className="text-[#BFC3C7]">Address:</span>
                          <span className="text-[#BFC3C7] italic">{extraDataObj.centerAddress}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 5. DOCUMENTS CHECKLIST */}
                {extraDataObj.docsChecklist && (
                  <div className="bg-[#1A1A1A] p-4 rounded-xl border border-white/5 space-y-3">
                    <span className="text-xs font-bold text-[#EFECEC] uppercase tracking-wider block flex items-center gap-1.5 font-mono">
                      <CheckSquare className="w-3.5 h-3.5 text-[#C3195D]" />
                      Interactive Documents Checklist
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                      {[
                        { key: 'aadhaar', label: 'Aadhaar / Govt ID' },
                        { key: 'photo', label: 'Passport Photo' },
                        { key: 'signature', label: 'Signature Image' },
                        { key: 'categoryCert', label: 'Category Cert' },
                        { key: 'degreeCert', label: 'Degree / Marksheet' },
                        { key: 'paymentReceipt', label: 'Payment Receipt' },
                      ].map((item) => {
                        const checked = extraDataObj.docsChecklist?.[item.key] || false;
                        return (
                          <div
                            key={item.key}
                            onClick={() => toggleDocChecklist(item.key)}
                            className={`p-2 rounded-lg border flex items-center gap-2 cursor-pointer transition ${
                              checked ? 'bg-[#C3195D]/15 border-[#C3195D] text-[#EFECEC]' : 'bg-[#0B0B0B] border-white/5 text-[#737373]'
                            }`}
                          >
                            {checked ? <CheckSquare className="w-4 h-4 text-[#C3195D]" /> : <Square className="w-4 h-4 text-[#737373]" />}
                            <span className="text-[11px] font-medium">{item.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: TIMELINE LOG */}
            {activeTab === 'timeline' && (
              <div className="space-y-4">
                <form onSubmit={handleAddEvent} className="bg-[#1A1A1A] p-4 rounded-xl border border-white/5 space-y-3">
                  <h4 className="text-xs font-bold text-[#EFECEC]">Add Timeline Event / Note</h4>
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="Title (e.g. Registered Exam, Admit card printed)..."
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

            {/* TAB 3: PREPARATION NOTES */}
            {activeTab === 'notes' && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-[#EFECEC] uppercase tracking-wider font-mono">Preparation Notes</h4>
                <p className="text-xs text-[#EFECEC] whitespace-pre-wrap bg-[#1A1A1A] p-4 rounded-xl border border-white/5 leading-relaxed">
                  {app.notes || 'No preparation notes recorded.'}
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

              {extraDataObj.registrationNo && (
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-[#BFC3C7]">Reg / Roll No:</span>
                  <span className="font-mono text-[#62929A] font-semibold">{extraDataObj.registrationNo}</span>
                </div>
              )}

              {extraDataObj.score && (
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-[#BFC3C7]">Score Obtained:</span>
                  <span className="font-mono text-[#6CBF84] font-bold">{extraDataObj.score}</span>
                </div>
              )}

              {extraDataObj.rank && (
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-[#BFC3C7]">All India Rank:</span>
                  <span className="font-mono text-[#C3195D] font-bold">{extraDataObj.rank}</span>
                </div>
              )}
            </div>

            {jobPosting?.jobUrl && (
              <a
                href={jobPosting.jobUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2 bg-[#1A1A1A] hover:bg-[#C3195D] text-[#EFECEC] text-xs font-medium rounded-xl border border-white/5 flex items-center justify-center gap-1.5 transition block text-center"
              >
                <span>Official Website</span>
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
