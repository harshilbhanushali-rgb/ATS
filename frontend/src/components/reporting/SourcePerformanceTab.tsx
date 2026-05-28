import React, { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Candidate, CandidateSource } from '../../types';
import Card from '../Card';
import { downloadCSV, getSourceCategory } from './reportingUtils';

interface SourcePerformanceTabProps {
  allCandidates: Candidate[];
}

const SourcePerformanceTab: React.FC<SourcePerformanceTabProps> = ({ allCandidates }) => {
  const [sourceCategoryType, setSourceCategoryType] = useState<'category' | 'channel'>('category');

  const sourcePerformanceData = useMemo(() => {
    const now = new Date();
    const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const lastMonthRaw = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthStr = `${lastMonthRaw.getFullYear()}-${String(lastMonthRaw.getMonth() + 1).padStart(2, '0')}`;

    const channels = Object.values(CandidateSource).map(src => {
      const matches = allCandidates.filter(c => c.source === src);
      const matchesThisMonth = matches.filter(c => c.applicationDate?.startsWith(currentMonthStr));
      const matchesLastMonth = matches.filter(c => c.applicationDate?.startsWith(lastMonthStr));
      const mockViews = Math.max(matches.length * 15, 20);
      const mockClicks = Math.max(matches.length * 5, 8);
      const conversionRate = mockClicks > 0 ? ((matches.length / mockClicks) * 100).toFixed(1) : '0';
      return {
        id: src, name: src, category: getSourceCategory(src),
        totalApplications: matches.length,
        thisMonth: matchesThisMonth.length, lastMonth: matchesLastMonth.length,
        momChange: matchesThisMonth.length - matchesLastMonth.length,
        views: mockViews, clicks: mockClicks, conversionRate: `${conversionRate}%`
      };
    });

    const categories = ['Portal', 'Social', 'Referral', 'Company Careers Page', 'Others'].map(cat => {
      const matches = allCandidates.filter(c => getSourceCategory(c.source) === cat);
      const matchesThisMonth = matches.filter(c => c.applicationDate?.startsWith(currentMonthStr));
      const matchesLastMonth = matches.filter(c => c.applicationDate?.startsWith(lastMonthStr));
      const mockViews = Math.max(matches.length * 15, 30);
      const mockClicks = Math.max(matches.length * 5, 12);
      const conversionRate = mockClicks > 0 ? ((matches.length / mockClicks) * 100).toFixed(1) : '0';
      return {
        id: cat, name: cat,
        totalApplications: matches.length,
        thisMonth: matchesThisMonth.length, lastMonth: matchesLastMonth.length,
        momChange: matchesThisMonth.length - matchesLastMonth.length,
        views: mockViews, clicks: mockClicks, conversionRate: `${conversionRate}%`
      };
    });

    return { channels, categories };
  }, [allCandidates]);

  const handleDownload = () => {
    const list = sourceCategoryType === 'category' ? sourcePerformanceData.categories : sourcePerformanceData.channels;
    const headers = ['Name', 'Total Applications', 'This Month', 'Last Month', 'MoM Change', 'Views', 'Clicks', 'Conversion Rate'];
    const formatted = list.map(item => ({
      'Name': item.name, 'Total Applications': item.totalApplications,
      'This Month': item.thisMonth, 'Last Month': item.lastMonth,
      'MoM Change': item.momChange >= 0 ? `+${item.momChange}` : item.momChange,
      'Views': item.views, 'Clicks': item.clicks, 'Conversion Rate': item.conversionRate
    }));
    downloadCSV(formatted as Record<string, unknown>[], headers, `source_performance_${sourceCategoryType}_report.csv`);
  };

  const activeList = sourceCategoryType === 'category' ? sourcePerformanceData.categories : sourcePerformanceData.channels;

  return (
    <div className="space-y-6" id="source-performance-section">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-950 font-display">Source Performance Analytics</h2>
          <p className="text-xs text-slate-500">Month-over-month comparisons of posting channels mapped to source categories.</p>
        </div>
        <div className="flex items-center space-x-3 bg-zinc-100 p-1 rounded-xl shrink-0 self-start md:self-center">
          <button onClick={() => setSourceCategoryType('category')} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${sourceCategoryType === 'category' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>Group Categories</button>
          <button onClick={() => setSourceCategoryType('channel')} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${sourceCategoryType === 'channel' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>Individual Channels</button>
          <button onClick={handleDownload} className="flex items-center px-3 py-1.5 hover:bg-white hover:text-indigo-600 transition-all text-slate-500 text-xs font-semibold rounded-md gap-1 ml-2" title="Download CSV">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
            <span>Download CSV</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card title="Traffic Conversions">
            <div className="divide-y divide-slate-100">
              {activeList.map(item => {
                const pos = item.momChange > 0, neg = item.momChange < 0;
                return (
                  <div key={item.id} className="py-3 flex items-center justify-between first:pt-0 last:pb-0">
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-slate-800">{item.name}</p>
                      <span className="inline-flex text-[10px] items-center gap-1.5 text-slate-400 font-medium">{item.totalApplications} total • {item.clicks} clicks • Conv {item.conversionRate}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-base font-bold text-slate-900">{item.thisMonth} applications</p>
                      <span className={`inline-flex items-center text-[10px] font-bold select-none ${pos ? 'text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md' : neg ? 'text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded-md' : 'text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded-md'}`}>
                        {pos ? `+${item.momChange} MoM` : neg ? `${item.momChange} MoM` : 'No Change'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
        <div className="lg:col-span-2">
          <Card title="Acclimated Candidate Flows">
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={activeList} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" fontSize={11} stroke="#94a3b8" />
                  <YAxis fontSize={11} stroke="#94a3b8" />
                  <Tooltip cursor={{ fill: '#f8fafc' }} />
                  <Legend wrapperStyle={{ fontSize: 13, paddingTop: 10 }} />
                  <Bar dataKey="totalApplications" name="Total Applications" fill="#4f46e5" radius={[5, 5, 0, 0]} />
                  <Bar dataKey="thisMonth" name="This Month's Apps" fill="#10b981" radius={[5, 5, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </div>

      <Card title="Detailed Channel Ledger Table" bodyClassName="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Source Channel</th>
                {sourceCategoryType === 'channel' && <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Mapping Category</th>}
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Total Candidates</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">This Month</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Last Month</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Channel Views</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Conversion Ratio</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {activeList.map(item => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-semibold text-slate-900 text-sm">{item.name}</td>
                  {sourceCategoryType === 'channel' && <td className="px-6 py-4 text-sm text-slate-500"><span className="inline-flex text-[11px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">{(item as { category?: string }).category}</span></td>}
                  <td className="px-6 py-4 text-sm text-center font-semibold">{item.totalApplications}</td>
                  <td className="px-6 py-4 text-center text-sm font-semibold">{item.thisMonth}</td>
                  <td className="px-6 py-4 text-center text-sm text-slate-500">{item.lastMonth}</td>
                  <td className="px-6 py-4 text-center text-sm text-slate-500">{item.views}</td>
                  <td className="px-6 py-4 text-center text-sm"><span className="font-bold text-indigo-600">{item.conversionRate}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default SourcePerformanceTab;
