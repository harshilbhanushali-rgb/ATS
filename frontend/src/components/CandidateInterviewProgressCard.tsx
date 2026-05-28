import React from 'react';
import { motion } from 'framer-motion';
import { Candidate, Interview, CandidateStage, InterviewDecision, Requisition, CandidateAIDashboardData, OutreachDraftHandlerProps } from '../types';
import Card from './Card';
import { MessageSquare as ChatBubbleBottomCenterTextIcon, Gift as GiftIcon, Eye as EyeIcon, ClipboardCheck as ClipboardDocumentCheckIcon } from 'lucide-react';
import PencilSparklesIcon from './icons/PencilSparklesIcon';

interface CandidateInterviewProgressCardProps extends OutreachDraftHandlerProps {
  candidate: Candidate;
  requisition: Requisition;
  interviews: Interview[];
  onLogInterview: (candidate: Candidate, requisition: Requisition) => void;
  onOpenOfferModal: (candidate: Candidate, requisition: Requisition) => void;
  onOpenCandidateAIDashboardModal: (data: CandidateAIDashboardData) => void;
  onOpenHiringHub: (candidate: Candidate, requisition: Requisition) => void;
}

const getStageChipClass = (stage: CandidateStage) => {
  switch (stage) {
    case CandidateStage.APPLIED: return 'bg-slate-100 text-slate-600 border-slate-200';
    case CandidateStage.POOLED: return 'bg-sky-50 text-sky-700 border-sky-200';
    case CandidateStage.SCREENING: return 'bg-blue-50 text-blue-700 border-blue-200';
    case CandidateStage.SHORTLISTED: return 'bg-amber-50 text-amber-700 border-amber-200';
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

const CandidateInterviewProgressCard: React.FC<CandidateInterviewProgressCardProps> = ({
  candidate,
  requisition,
  interviews,
  onLogInterview,
  onOpenOfferModal,
  onOpenCandidateAIDashboardModal,
  onOpenOutreachDraftModal,
  onOpenHiringHub,
}) => {
  const candidateInterviews = interviews
    .filter(i => i.candidateId === candidate.id && i.requisitionId === requisition.id)
    .sort((a, b) => new Date(b.interviewDate).getTime() - new Date(a.interviewDate).getTime());

  const getResumeAnalysisStatusText = () => {
    if (candidate.resumeAnalysis) return `Resume: ${candidate.resumeAnalysis.matchAssessment}`;
    return 'Resume: N/A';
  };

  const canLogInterview = ![
    CandidateStage.OFFER_EXTENDED, CandidateStage.OFFER_ACCEPTED,
    CandidateStage.OFFER_DECLINED, CandidateStage.HIRED, CandidateStage.REJECTED,
  ].includes(candidate.stage);

  const canMakeOffer =
    candidate.stage === CandidateStage.HM_DECISION_PENDING ||
    (candidateInterviews.length > 0 && candidateInterviews[0].decision === InterviewDecision.RECOMMEND_HIRE);

  const canAIDraft = !!requisition.jobDescription?.trim();

  return (
    <Card className="group">
      <div className="p-1">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex-grow min-w-0">
            <div className="flex items-center gap-2.5 mb-1 flex-wrap">
              <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-700 transition-colors font-display tracking-tight">
                {candidate.name}
              </h4>
              <span className={`px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full border ${getStageChipClass(candidate.stage)}`}>
                {candidate.stage}
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-3">{candidate.email}</p>

            <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${candidate.resumeAnalysis ? 'bg-violet-50 text-violet-700 border-violet-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-3 h-3 mr-1">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
              {getResumeAnalysisStatusText()}
            </span>
          </div>

          <div className="flex items-center gap-1.5 lg:pl-4 lg:border-l border-slate-100 shrink-0 flex-wrap">
            <button onClick={() => onOpenHiringHub(candidate, requisition)} className="p-2 bg-slate-50 text-slate-500 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors border border-slate-200" title="Hiring Hub">
              <ClipboardDocumentCheckIcon className="w-4 h-4" />
            </button>
            <button onClick={() => onOpenCandidateAIDashboardModal({ candidate, requisition })} className="p-2 bg-slate-50 text-slate-500 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors border border-slate-200" title="AI Insights">
              <EyeIcon className="w-4 h-4" />
            </button>
            <button onClick={() => onOpenOutreachDraftModal(candidate, requisition)} disabled={!canAIDraft} className="p-2 bg-slate-50 text-slate-500 rounded-lg hover:bg-violet-50 hover:text-violet-600 transition-colors border border-slate-200 disabled:opacity-30" title="AI Draft Outreach">
              <PencilSparklesIcon className="w-4 h-4" />
            </button>
            {canLogInterview && (
              <button onClick={() => onLogInterview(candidate, requisition)} className="p-2 bg-slate-50 text-slate-500 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 transition-colors border border-slate-200" title="Log Interview">
                <ChatBubbleBottomCenterTextIcon className="w-4 h-4" />
              </button>
            )}
            {canMakeOffer && (
              <button onClick={() => onOpenOfferModal(candidate, requisition)} className="p-2 bg-slate-50 text-slate-500 rounded-lg hover:bg-emerald-50 hover:text-emerald-600 transition-colors border border-slate-200" title={candidate.offerDetails ? 'View/Edit Offer' : 'Prepare Offer'}>
                <GiftIcon className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {candidateInterviews.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500" aria-hidden="true" />
              <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Interview History ({candidateInterviews.length})
              </h5>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {candidateInterviews.map(interview => (
                <div key={interview.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-700">{interview.round}</span>
                    <span className="text-[10px] text-slate-400">{new Date(interview.interviewDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-500">By {interview.interviewerName}</span>
                    <span className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-md border ${
                      interview.decision === InterviewDecision.RECOMMEND_HIRE ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                      interview.decision === InterviewDecision.REJECT ? 'bg-rose-50 text-rose-700 border-rose-200' :
                      'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                      {interview.decision}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default CandidateInterviewProgressCard;
