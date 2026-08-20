"use client";

import { useEffect, useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid 
} from 'recharts';
import { BarChart3, TrendingUp, Clock, Award, Ghost, Globe, Plus } from 'lucide-react';
import { NewApplicationModal } from '@/components/applications/new-application-modal';

export default function AnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchAnalytics = () => {
    fetch('/api/analytics')
      .then((res) => res.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch((err) => setLoading(false));
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return <div className="py-20 text-center text-[#BFC3C7] font-mono text-xs">Computing Analytics...</div>;
  }

  const { summary, sourceBreakdown, monthlyBreakdown } = data || {};
  const hasData = summary && summary.totalApplications > 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="pb-2 border-b border-white/5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#EFECEC] tracking-tight">
            Analytics & Insights Hub
          </h1>
          <p className="text-xs text-[#BFC3C7]">
            Source conversion rates, average response velocity, and resume effectiveness metrics.
          </p>
        </div>
      </div>

      {!hasData ? (
        /* Empty State when no data exists */
        <div className="bg-[#0B0B0B] border border-white/5 rounded-2xl p-12 text-center space-y-4 max-w-lg mx-auto my-8">
          <div className="w-12 h-12 rounded-2xl bg-[#1A1A1A] border border-white/5 text-[#C3195D] flex items-center justify-center mx-auto shadow-md">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#EFECEC]">No Application Analytics Yet</h3>
            <p className="text-xs text-[#BFC3C7] mt-1 leading-relaxed">
              Response velocities, interview conversion rates, and charts will appear automatically as soon as job applications are added to your workspace.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-[#C3195D] hover:bg-[#a5134d] text-[#EFECEC] text-xs font-medium rounded-xl inline-flex items-center gap-1.5 transition shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add Your First Application</span>
            </button>
          </div>
        </div>
      ) : (
        /* Rendered Analytics Dashboard */
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-[#0B0B0B] border border-white/5 p-5 rounded-2xl">
              <div className="flex items-center gap-2 text-xs text-[#BFC3C7] font-medium mb-1">
                <Clock className="w-4 h-4 text-[#C3195D]" />
                <span>Avg Response Velocity</span>
              </div>
              <span className="text-2xl font-bold text-[#EFECEC] font-mono">{summary.avgResponseTimeDays} Days</span>
              <p className="text-[10px] text-[#737373] mt-1">From Applied → First Reply</p>
            </div>

            <div className="bg-[#0B0B0B] border border-white/5 p-5 rounded-2xl">
              <div className="flex items-center gap-2 text-xs text-[#BFC3C7] font-medium mb-1">
                <TrendingUp className="w-4 h-4 text-[#C3195D]" />
                <span>Overall Response Rate</span>
              </div>
              <span className="text-2xl font-bold text-[#C3195D] font-mono">{summary.responseRate}%</span>
              <p className="text-[10px] text-[#737373] mt-1">Received response or interview</p>
            </div>

            <div className="bg-[#0B0B0B] border border-white/5 p-5 rounded-2xl">
              <div className="flex items-center gap-2 text-xs text-[#BFC3C7] font-medium mb-1">
                <Award className="w-4 h-4 text-[#6CBF84]" />
                <span>Offer Conversion Rate</span>
              </div>
              <span className="text-2xl font-bold text-[#6CBF84] font-mono">{summary.offerRate}%</span>
              <p className="text-[10px] text-[#737373] mt-1">{summary.offerCount} Official Offers Won</p>
            </div>

            <div className="bg-[#0B0B0B] border border-white/5 p-5 rounded-2xl">
              <div className="flex items-center gap-2 text-xs text-[#BFC3C7] font-medium mb-1">
                <Ghost className="w-4 h-4 text-[#737373]" />
                <span>Ghost Rate</span>
              </div>
              <span className="text-2xl font-bold text-[#737373] font-mono">{summary.ghostRate}%</span>
              <p className="text-[10px] text-[#737373] mt-1">No reply after 30+ days</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-[#0B0B0B] border border-white/5 p-5 rounded-2xl space-y-3">
              <h3 className="text-xs font-bold text-[#EFECEC] uppercase tracking-wider flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[#C3195D]" />
                Applications Volume by Month
              </h3>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyBreakdown}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis dataKey="month" stroke="#BFC3C7" fontSize={11} />
                    <YAxis stroke="#BFC3C7" fontSize={11} />
                    <Tooltip contentStyle={{ backgroundColor: '#1A1A1A', borderColor: 'rgba(255,255,255,0.08)', borderRadius: '8px', color: '#EFECEC' }} />
                    <Bar dataKey="applications" fill="#C3195D" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-[#0B0B0B] border border-white/5 p-5 rounded-2xl space-y-3">
              <h3 className="text-xs font-bold text-[#EFECEC] uppercase tracking-wider flex items-center gap-2">
                <Globe className="w-4 h-4 text-[#62929A]" />
                Response Rate by Source (%)
              </h3>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sourceBreakdown} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis type="number" stroke="#BFC3C7" fontSize={11} unit="%" />
                    <YAxis dataKey="source" type="category" stroke="#BFC3C7" fontSize={10} width={100} />
                    <Tooltip contentStyle={{ backgroundColor: '#1A1A1A', borderColor: 'rgba(255,255,255,0.08)', borderRadius: '8px', color: '#EFECEC' }} />
                    <Bar dataKey="successRate" fill="#62929A" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      )}

      {isModalOpen && <NewApplicationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />}
    </div>
  );
}
