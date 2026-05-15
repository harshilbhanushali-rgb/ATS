import React from 'react';
import { Candidate, CandidateStage, Requisition, CandidateAIDashboardData, OutreachDraftHandlerProps } from '../types';
import Card from './Card';
import { MessageCircle as ChatBubbleLeftEllipsisIcon, Eye as EyeIcon, ClipboardCheck as ClipboardDocumentCheckIcon } from 'lucide-react';
import PencilSparklesIcon from './icons/PencilSparklesIcon';


const getStageChipClass = (stage: CandidateStage) => {
  switch (stage) {
    case CandidateStage.APPLIED: return 'bg-slate-50 text-slate-600 border-slate-100';
    case CandidateStage.POOLED: return 'bg-sky-50 text-sky-600 border-sky-100';
    case CandidateStage.SCREENING: return 'bg-blue-50 text-blue-600 border-blue-100';
    case CandidateStage.SHORTLISTED: return 'bg-amber-50 text-amber-600 border-amber-100';
    case CandidateStage.AI_SOURCED_POOL: return 'bg-fuchsia-50 text-fuchsia-600 border-fuchsia-100';
    case CandidateStage.INTERVIEW_ROUND_1:
    case CandidateStage.INTERVIEW_ROUND_2:
    case CandidateStage.INTERVIEW_ROUND_3:
    case CandidateStage.INTERVIEW_ROUND_4:
      return 'bg-purple-50 text-purple-600 border-purple-100';
    case CandidateStage.OFFER_EXTENDED: return 'bg-indigo-50 text-indigo-600 border-indigo-100';
    case CandidateStage.HM_DECISION_PENDING: return 'bg-blue-50 text-blue-600 border-blue-100';
    case CandidateStage.OFFER_ACCEPTED: return 'bg-emerald-50 text-emerald-600 border-emerald-100';
    case CandidateStage.OFFER_DECLINED: return 'bg-rose-50 text-rose-600 border-rose-100';
    case CandidateStage.HIRED: return 'bg-emerald-50 text-emerald-600 border-emerald-100';
    case CandidateStage.REJECTED: return 'bg-rose-50 text-rose-600 border-rose-100';
    case CandidateStage.ON_HOLD: return 'bg-amber-50 text-amber-600 border-amber-100';
    default: return 'bg-slate-50 text-slate-600 border-slate-100';
  }
};

interface CandidateListItemProps extends OutreachDraftHandlerProps {
  candidate: Candidate;
  requisition?: Requisition | null;
  onEditCandidate: (candidate: Candidate) => void;
  onOpenCandidateAIDashboardModal: (data: CandidateAIDashboardData) => void;
  onOpenLogOutreachModal: (candidate: Candidate) => void;
  onOpenHiringHub: (candidate: Candidate, requisition: Requisition) => void;
}

const CandidateListItem: React.FC<CandidateListItemProps> = ({
    candidate,
    requisition,
    onEditCandidate,
    onOpenCandidateAIDashboardModal,
    onOpenLogOutreachModal,
    onOpenOutreachDraftModal,
    onOpenHiringHub,
}) => {
  const canAIDraft = requisition && !!requisition.jobDescription?.trim();

  const getResumeAnalysisStatusText = () => {
    if (candidate.resumeAnalysis) {
        return `(Resume: ${candidate.resumeAnalysis.matchAssessment})`;
    }
    if (candidate.resumeText && requisition?.jobDescription) return "(Resume: Ready to Analyze)";
    return "(Resume: N/A)";
  };

  return (
    <Card className="group">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex-grow">
            <div className="flex items-center gap-3 mb-2">
                <h4 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors font-display tracking-tight">{candidate.name}</h4>
                <span className={`px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full border shadow-sm ${getStageChipClass(candidate.stage)}`}>
                    {candidate.stage}
                </span>
            </div>
            <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs font-medium text-slate-400">
                <span className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-3.5 h-3.5 mr-1 text-slate-300">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                    </svg>
                    {candidate.email}
                </span>
                {candidate.phone && (
                    <span className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-3.5 h-3.5 mr-1 text-slate-300">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                        </svg>
                        {candidate.phone}
                    </span>
                )}
                <span className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-3.5 h-3.5 mr-1 text-slate-300">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z" />
                    </svg>
                    {new Date(candidate.applicationDate).toLocaleDateString()}
                </span>
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
                <div className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center ${candidate.resumeAnalysis ? 'bg-purple-50 text-purple-600 border border-purple-100' : 'bg-slate-50 text-slate-400 border border-slate-100'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-3 h-3 mr-1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                    </svg>
                    {getResumeAnalysisStatusText()}
                </div>
            </div>
        </div>
        
        <div className="flex flex-wrap lg:flex-row items-center justify-end gap-2 lg:pl-6 lg:border-l border-slate-100 shrink-0">
            <button
                onClick={() => requisition && onOpenHiringHub(candidate, requisition)}
                disabled={!requisition}
                className="p-2 bg-slate-50 text-slate-600 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 transition-all duration-200 shadow-sm border border-slate-100 disabled:opacity-30"
                title="Hiring Hub"
            >
                <ClipboardDocumentCheckIcon className="w-5 h-5" />
            </button>
            <button
                onClick={() => requisition && onOpenCandidateAIDashboardModal({candidate, requisition})}
                disabled={!requisition}
                className="p-2 bg-slate-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-all duration-200 shadow-sm border border-slate-100 disabled:opacity-30"
                title="AI Dashboard"
            >
                <EyeIcon className="w-5 h-5" />
            </button>
            <button
                onClick={() => requisition && onOpenOutreachDraftModal(candidate, requisition)}
                disabled={!canAIDraft}
                className="p-2 bg-slate-50 text-purple-600 rounded-xl hover:bg-purple-100 transition-all duration-200 shadow-sm border border-slate-100 disabled:opacity-30"
                title="AI Draft Outreach"
            >
                <PencilSparklesIcon className="w-5 h-5" />
            </button>
            <button
                onClick={() => onOpenLogOutreachModal(candidate)}
                className="p-2 bg-slate-50 text-emerald-600 rounded-xl hover:bg-emerald-100 transition-all duration-200 shadow-sm border border-slate-100"
                title="Log Outreach"
            >
                <ChatBubbleLeftEllipsisIcon className="w-5 h-5" />
            </button>
            <div className="w-px h-6 bg-slate-100 mx-1 hidden lg:block"></div>
            <button
                onClick={() => onEditCandidate(candidate)}
                className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-indigo-600 transition-all duration-300 shadow-lg shadow-slate-900/10 hover:shadow-indigo-600/20"
            >
                Edit
            </button>
        </div>
      </div>
    </Card>
  );
};

interface CandidateListProps extends OutreachDraftHandlerProps {
  candidates: Candidate[];
  selectedRequisition: Requisition | null;
  onEditCandidate: (candidate: Candidate) => void;
  onOpenCandidateAIDashboardModal: (data: CandidateAIDashboardData) => void;
  onOpenLogOutreachModal: (candidate: Candidate) => void;
  onOpenHiringHub: (candidate: Candidate, requisition: Requisition) => void;
}

export const CandidateList: React.FC<CandidateListProps> = ({ 
    candidates, 
    selectedRequisition, 
    onEditCandidate,
    onOpenCandidateAIDashboardModal,
    onOpenLogOutreachModal,
    onOpenOutreachDraftModal,
    onOpenHiringHub,
}) => {
  return (
    <div className="space-y-2">
      {candidates.map(candidate => (
        <CandidateListItem
          key={candidate.id}
          candidate={candidate}
          requisition={selectedRequisition}
          onEditCandidate={onEditCandidate}
          onOpenCandidateAIDashboardModal={onOpenCandidateAIDashboardModal}
          onOpenLogOutreachModal={onOpenLogOutreachModal}
          onOpenOutreachDraftModal={onOpenOutreachDraftModal}
          onOpenHiringHub={onOpenHiringHub}
        />
      ))}
    </div>
  );
};
