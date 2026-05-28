import React, { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Candidate, CandidateStage, Requisition } from '../../types';
import Card from '../Card';
import { downloadCSV } from './reportingUtils';

interface PipelineStatusTabProps {
  allCandidates: Candidate[];
  requisitions: Requisition[];
}

const PipelineStatusTab: React.FC<PipelineStatusTabProps> = ({ allCandidates, requisitions }) => {
  const [selectedReqId, setSelectedReqId] = useState<string>('all');

  const pipelineStatusData = useMemo(() => {
    const filtered = selectedReqId === 'all' ? allCandidates : allCandidates.filter(c => c.requisitionId === selectedReqId);
    const active = filtered.filter(c => ![CandidateStage.REJECTED, CandidateStage.HIRED, CandidateStage.OFFER_ACCEPTED, CandidateStage.OFFER_DECLINED].includes(c.stage));

    const macroStages = [
      { name: 'Sourced / Applied', color: '#4f46e5', count: filtered.filter(c => [CandidateStage.APPLIED, CandidateStage.POOLED, CandidateStage.AI_SOURCED_POOL].includes(c.stage)).length },
      { name: 'Screened', color: '#0ea5e9', count: filtered.filter(c => [CandidateStage.SCREENING, CandidateStage.SHORTLISTED].includes(c.stage)).length },
      { name: 'Interviewed', color: '#10b981', count: filtered.filter(c => [CandidateStage.INTERVIEW_ROUND_1, CandidateStage.INTERVIEW_ROUND_2, CandidateStage.INTERVIEW_ROUND_3, CandidateStage.INTERVIEW_ROUND_4, CandidateStage.HM_DECISION_PENDING].includes(c.stage)).length },
      { name: 'Offered / Hired', color: '#f59e0b', count: filtered.filter(c => [CandidateStage.OFFER_EXTENDED, CandidateStage.OFFER_ACCEPTED, CandidateStage.OFFER_DECLINED, CandidateStage.HIRED].includes(c.stage)).length },
    ];

    const stagesCounts = Object.values(CandidateStage).reduce((acc, stage) => {
      acc[stage] = filtered.filter(c => c.stage === stage).length;
      return acc;
    }, {} as Record<string, number>);

    const tableData = Object.entries(stagesCounts).map(([stageName, count]) => {
      let category = 'Others';
      if ([CandidateStage.APPLIED, CandidateStage.POOLED, CandidateStage.AI_SOURCED_POOL].includes(stageName as CandidateStage)) category = 'Sourced / Applied';
      else if ([CandidateStage.SCREENING, CandidateStage.SHORTLISTED].includes(stageName as CandidateStage)) category = 'Screened';
      else if ([CandidateStage.INTERVIEW_ROUND_1, CandidateStage.INTERVIEW_ROUND_2, CandidateStage.INTERVIEW_ROUND_3, CandidateStage.INTERVIEW_ROUND_4, CandidateStage.HM_DECISION_PENDING].includes(stageName as CandidateStage)) category = 'Interviewed';
      else if ([CandidateStage.OFFER_EXTENDED, CandidateStage.OFFER_ACCEPTED, CandidateStage.OFFER_DECLINED, CandidateStage.HIRED].includes(stageName as CandidateStage)) category = 'Offered / Hired';
      return { stage: stageName, category, count, percent: filtered.length > 0 ? ((count / filtered.length) * 100).toFixed(1) + '%' : '0%' };
    }).filter(r => r.count > 0);

    return { totalCandidates: filtered.length, activeCount: active.length, macroStages, tableData };
  }, [allCandidates, selectedReqId]);

  const handleDownload = () => {
    const headers = ['Stage', 'Category', 'Candidate Count', 'Percentage of Total'];
    downloadCSV(pipelineStatusData.tableData.map(r => ({ 'Stage': r.stage, 'Category': r.category, 'Candidate Count': r.count, 'Percentage of Total': r.percent })) as Record<string, unknown>[], headers, `pipeline_status_${selectedReqId === 'all' ? 'global' : 'job_' + selectedReqId}_report.csv`);
  };

  return (
    <div className="space-y-6" id="pipeline-status-section">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-950 font-display">Candidate Pipeline Metrics</h2>
          <p className="text-xs text-slate-500">Real-time candidate volumes across pipeline levels.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <div className="flex items-center space-x-2 bg-white rounded-xl border border-slate-200 px-3 py-1.5 shadow-sm">
            <label htmlFor="req-select" className="text-xs font-bold text-slate-500">Filter Job:</label>
            <select id="req-select" className="text-xs font-semibold bg-transparent text-slate-800 outline-none cursor-pointer" value={selectedReqId} onChange={e => setSelectedReqId(e.target.value)}>
              <option value="all">Global System View</option>
              {requisitions.map(req => <option key={req.id} value={req.id}>{req.role} ({req.hiringManagerName})</option>)}
            </select>
          </div>
          <button onClick={handleDownload} className="flex items-center px-4 py-2 bg-indigo-600 hover:bg-slate-900 transition-all text-white text-xs font-semibold rounded-xl gap-2 shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
            <span>Download Pipeline</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[
          { label: 'Total Candidacy Pool', value: pipelineStatusData.totalCandidates, color: 'text-slate-900', bg: 'bg-indigo-50' },
          { label: 'Active Candidates', value: pipelineStatusData.activeCount, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Yield Ratio', value: pipelineStatusData.totalCandidates > 0 ? ((pipelineStatusData.activeCount / pipelineStatusData.totalCandidates) * 100).toFixed(0) + '%' : '45%', color: 'text-indigo-700', bg: 'bg-indigo-50' },
        ].map(kpi => (
          <Card key={kpi.label} bodyClassName="flex items-center justify-between p-6">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">{kpi.label}</span>
              <p className={`text-3xl font-black tracking-tight ${kpi.color}`}>{kpi.value}</p>
            </div>
            <div className={`p-3.5 rounded-2xl ${kpi.bg} shrink-0`} />
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card title="Funnel Proportions">
            <div className="space-y-5 py-2">
              {pipelineStatusData.macroStages.map(stage => {
                const pct = pipelineStatusData.totalCandidates > 0 ? (stage.count / pipelineStatusData.totalCandidates) * 100 : 25;
                return (
                  <div key={stage.name} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-700 flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: stage.color }} />{stage.name}</span>
                      <span className="font-semibold text-slate-500">{stage.count} ({pct.toFixed(0)}%)</span>
                    </div>
                    <div className="h-2.5 w-full bg-slate-100 rounded-lg overflow-hidden">
                      <div className="h-full rounded-lg transition-all duration-500 ease-out" style={{ width: `${pct}%`, backgroundColor: stage.color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
        <div className="lg:col-span-2">
          <Card title="Recruitment Progress Distribution">
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={pipelineStatusData.macroStages} layout="vertical" margin={{ top: 20, right: 30, left: 30, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" fontSize={11} stroke="#94a3b8" />
                  <YAxis dataKey="name" type="category" fontSize={11} stroke="#94a3b8" />
                  <Tooltip cursor={{ fill: '#f8fafc' }} />
                  <Bar dataKey="count" name="Candidate Distribution" radius={[0, 5, 5, 0]}>
                    {pipelineStatusData.macroStages.map((entry, i) => <Cell key={`cell-${i}`} fill={entry.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </div>

      <Card title="Comprehensive Stage Inventory Table" bodyClassName="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Candidate Stage</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Aggregated Category</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Count</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">% of Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pipelineStatusData.tableData.map(row => (
                <tr key={row.stage} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-semibold text-slate-900 text-sm">{row.stage}</td>
                  <td className="px-6 py-4 text-slate-500 text-sm">
                    <span className={`inline-flex text-[10px] font-bold px-2 py-0.5 rounded-full ${row.category === 'Sourced / Applied' ? 'bg-indigo-50 text-indigo-700' : row.category === 'Screened' ? 'bg-sky-50 text-sky-700' : row.category === 'Interviewed' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>{row.category}</span>
                  </td>
                  <td className="px-6 py-4 text-center text-sm font-semibold text-slate-900">{row.count}</td>
                  <td className="px-6 py-4 text-center text-sm font-semibold text-slate-500">{row.percent}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default PipelineStatusTab;
