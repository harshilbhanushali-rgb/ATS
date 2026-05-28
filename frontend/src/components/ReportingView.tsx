import React, { useState } from 'react';
import { Candidate, CandidateOutreachLog, Interview, Requisition, User } from '../types';
import SourcePerformanceTab from './reporting/SourcePerformanceTab';
import PipelineStatusTab from './reporting/PipelineStatusTab';
import VelocityTab from './reporting/VelocityTab';
import ApplicationsTab from './reporting/ApplicationsTab';
import ProductivityTab from './reporting/ProductivityTab';

export interface ReportingViewProps {
  requisitions: Requisition[];
  allCandidates: Candidate[];
  allInterviews: Interview[];
  users: User[];
  candidateOutreachLogs: CandidateOutreachLog[];
}

type TabType = 'source' | 'pipeline' | 'velocity' | 'applications' | 'productivity';

const TABS: { id: TabType; label: string }[] = [
  { id: 'source', label: 'Sourcing' },
  { id: 'pipeline', label: 'Pipeline' },
  { id: 'velocity', label: 'Velocity' },
  { id: 'applications', label: 'Applications' },
  { id: 'productivity', label: 'Team Tasks' },
];

export const ReportingView: React.FC<ReportingViewProps> = ({
  requisitions, allCandidates, allInterviews, users, candidateOutreachLogs
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('source');

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 text-[10px] font-bold tracking-widest uppercase text-indigo-600 bg-indigo-50 rounded-full">Reporting Engine</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs text-slate-400 font-medium">Synced In-Memory DB</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight font-display">Hiring Analytics Suite</h1>
          <p className="text-sm text-slate-500">Exportable tracking logs, funnel metrics, hiring speeds, and user productivity logs.</p>
        </div>

        {/* Tab switcher */}
        <div className="flex flex-wrap p-1 bg-slate-100/80 rounded-2xl gap-1 shrink-0">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold tracking-tight transition-all duration-200 ${activeTab === tab.id ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-900 hover:bg-white/40'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      {activeTab === 'source'       && <SourcePerformanceTab allCandidates={allCandidates} />}
      {activeTab === 'pipeline'     && <PipelineStatusTab allCandidates={allCandidates} requisitions={requisitions} />}
      {activeTab === 'velocity'     && <VelocityTab allCandidates={allCandidates} requisitions={requisitions} />}
      {activeTab === 'applications' && <ApplicationsTab allCandidates={allCandidates} requisitions={requisitions} />}
      {activeTab === 'productivity' && <ProductivityTab allCandidates={allCandidates} allInterviews={allInterviews} users={users} candidateOutreachLogs={candidateOutreachLogs} />}
    </div>
  );
};

export default ReportingView;
