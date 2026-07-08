import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Candidate, CandidateStage, Requisition, CandidateAIDashboardData, OutreachDraftHandlerProps } from '../types';
import Card from './Card';
import { MessageCircle as ChatBubbleLeftEllipsisIcon, Eye as EyeIcon, ClipboardCheck as ClipboardDocumentCheckIcon, FileText as FileTextIcon } from 'lucide-react';
import PencilSparklesIcon from './icons/PencilSparklesIcon';

const getStageChipClass = (stage: CandidateStage) => {
  switch (stage) {
    case CandidateStage.APPLIED: return 'bg-slate-100 text-slate-600 border-slate-200';
    case CandidateStage.POOLED: return 'bg-sky-50 text-sky-700 border-sky-200';
    case CandidateStage.SCREENING: return 'bg-blue-50 text-blue-700 border-blue-200';
    case CandidateStage.SHORTLISTED: return 'bg-amber-50 text-amber-700 border-amber-200';
    case CandidateStage.AI_SOURCED_POOL: return 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200';
    case CandidateStage.INTERVIEW_ROUND_1:
    case CandidateStage.INTERVIEW_ROUND_2:
    case CandidateStage.INTERVIEW_ROUND_3:
    case CandidateStage.INTERVIEW_ROUND_4:
      return 'bg-violet-50 text-violet-700 border-violet-200';
    case CandidateStage.OFFER_EXTENDED: return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    case CandidateStage.HM_DECISION_PENDING: return 'bg-blue-50 text-blue-700 border-blue-200';
    case CandidateStage.OFFER_ACCEPTED: return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case CandidateStage.OFFER_DECLINED: return 'bg-rose-50 text-rose-700 border-rose-200';
    case CandidateStage.HIRED: return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case CandidateStage.REJECTED: return 'bg-rose-50 text-rose-700 border-rose-200';
    case CandidateStage.ON_HOLD: return 'bg-amber-50 text-amber-700 border-amber-200';
    default: return 'bg-slate-100 text-slate-600 border-slate-200';
  }
};

interface CandidateListItemProps extends OutreachDraftHandlerProps {
  candidate: Candidate;
  requisition?: Requisition | null;
  onEditCandidate: (candidate: Candidate) => void;
  onOpenCandidateAIDashboardModal: (data: CandidateAIDashboardData) => void;
  onOpenLogOutreachModal: (candidate: Candidate) => void;
  onOpenHiringHub: (candidate: Candidate, requisition: Requisition) => void;
  onViewResume: (candidate: Candidate) => void;
}

const CandidateListItem: React.FC<CandidateListItemProps> = ({
    candidate,
    requisition,
    onEditCandidate,
    onOpenCandidateAIDashboardModal,
    onOpenLogOutreachModal,
    onOpenOutreachDraftModal,
    onOpenHiringHub,
    onViewResume,
}) => {
  const hasResume = !!candidate.resumeText?.trim() || !!candidate.resumeUrl?.trim();
  const canAIDraft = requisition && !!requisition.jobDescription?.trim();

  const getResumeAnalysisStatusText = () => {
    if (candidate.resumeAnalysis) return `Resume: ${candidate.resumeAnalysis.matchAssessment}`;
    if (candidate.resumeText && requisition?.jobDescription) return 'Resume: Ready to Analyze';
    return 'Resume: N/A';
  };

  return (
    <Card className="group">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left: candidate info */}
        <div className="flex-grow min-w-0">
          <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
            <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-700 transition-colors font-display tracking-tight truncate">
              {candidate.name}
            </h4>
            <span className={`px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full border ${getStageChipClass(candidate.stage)}`}>
              {candidate.stage}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-3.5 h-3.5 text-slate-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
              {candidate.email}
            </span>
            {candidate.phone && (
              <span className="flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-3.5 h-3.5 text-slate-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                </svg>
                {candidate.phone}
              </span>
            )}
            <span>{new Date(candidate.applicationDate).toLocaleDateString()}</span>
          </div>

          <div className="mt-3">
            <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${candidate.resumeAnalysis ? 'bg-violet-50 text-violet-700 border-violet-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-3 h-3 mr-1">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
              {getResumeAnalysisStatusText()}
            </span>
          </div>
        </div>

        {/* Right: action buttons */}
        <div className="flex items-center gap-1.5 lg:pl-4 lg:border-l border-slate-100 shrink-0 flex-wrap">
          <button
            onClick={() => requisition && onOpenHiringHub(candidate, requisition)}
            disabled={!requisition}
            className="p-2 bg-slate-50 text-slate-500 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors border border-slate-200 disabled:opacity-30"
            title="Hiring Hub"
          >
            <ClipboardDocumentCheckIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => requisition && onOpenCandidateAIDashboardModal({ candidate, requisition })}
            disabled={!requisition}
            className="p-2 bg-slate-50 text-slate-500 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors border border-slate-200 disabled:opacity-30"
            title="AI Dashboard"
          >
            <EyeIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => requisition && onOpenOutreachDraftModal(candidate, requisition)}
            disabled={!canAIDraft}
            className="p-2 bg-slate-50 text-slate-500 rounded-lg hover:bg-violet-50 hover:text-violet-600 transition-colors border border-slate-200 disabled:opacity-30"
            title="AI Draft Outreach"
          >
            <PencilSparklesIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => onOpenLogOutreachModal(candidate)}
            className="p-2 bg-slate-50 text-slate-500 rounded-lg hover:bg-emerald-50 hover:text-emerald-600 transition-colors border border-slate-200"
            title="Log Outreach"
          >
            <ChatBubbleLeftEllipsisIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => onViewResume(candidate)}
            disabled={!hasResume}
            className="p-2 bg-slate-50 text-slate-500 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 transition-colors border border-slate-200 disabled:opacity-30"
            title={hasResume ? 'View Resume' : 'No resume on file'}
          >
            <FileTextIcon className="w-4 h-4" />
          </button>
          <div className="w-px h-5 bg-slate-200 mx-0.5 hidden lg:block" aria-hidden="true" />
          <motion.button
            onClick={() => onEditCandidate(candidate)}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm shadow-blue-200 transition-colors"
            whileTap={{ scale: 0.96 }}
          >
            Edit
          </motion.button>
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
  onViewResume: (candidate: Candidate) => void;
}

export const CandidateList: React.FC<CandidateListProps> = ({
    candidates,
    selectedRequisition,
    onEditCandidate,
    onOpenCandidateAIDashboardModal,
    onOpenLogOutreachModal,
    onOpenOutreachDraftModal,
    onOpenHiringHub,
    onViewResume,
}) => {
  return (
    <AnimatePresence>
      <div className="space-y-2">
        {candidates.map((candidate, i) => (
          <motion.div
            key={candidate.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ delay: i * 0.05, duration: 0.24, ease: 'easeOut' }}
          >
            <CandidateListItem
              candidate={candidate}
              requisition={selectedRequisition}
              onEditCandidate={onEditCandidate}
              onOpenCandidateAIDashboardModal={onOpenCandidateAIDashboardModal}
              onOpenLogOutreachModal={onOpenLogOutreachModal}
              onOpenOutreachDraftModal={onOpenOutreachDraftModal}
              onOpenHiringHub={onOpenHiringHub}
              onViewResume={onViewResume}
            />
          </motion.div>
        ))}
      </div>
    </AnimatePresence>
  );
};
