import React from 'react';
import { Candidate, Interview, CandidateStage, InterviewDecision, Requisition, CandidateAIDashboardData, OutreachDraftHandlerProps } from '../types'; 
import Card from './Card';
import ChatBubbleBottomCenterTextIcon from './icons/ChatBubbleBottomCenterTextIcon';
import GiftIcon from './icons/GiftIcon';
import EyeIcon from './icons/EyeIcon'; 
import PencilSparklesIcon from './icons/PencilSparklesIcon'; // Added
import ClipboardDocumentCheckIcon from './icons/ClipboardDocumentCheckIcon';

interface CandidateInterviewProgressCardProps extends OutreachDraftHandlerProps { // Added OutreachDraftHandlerProps
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
    case CandidateStage.APPLIED: return 'bg-slate-50 text-slate-600 border-slate-100';
    case CandidateStage.POOLED: return 'bg-sky-50 text-sky-600 border-sky-100';
    case CandidateStage.SCREENING: return 'bg-blue-50 text-blue-600 border-blue-100';
    case CandidateStage.SHORTLISTED: return 'bg-amber-50 text-amber-600 border-amber-100';
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
  const candidateInterviews = interviews.filter(i => i.candidateId === candidate.id && i.requisitionId === requisition.id)
    .sort((a, b) => new Date(b.interviewDate).getTime() - new Date(a.interviewDate).getTime());

  const getResumeAnalysisStatusText = () => {
    if (candidate.resumeAnalysis) {
        return `Resume: ${candidate.resumeAnalysis.matchAssessment}`;
    }
    return "Resume: N/A";
  };

  const canLogInterview = candidate.stage !== CandidateStage.OFFER_EXTENDED &&
                          candidate.stage !== CandidateStage.OFFER_ACCEPTED &&
                          candidate.stage !== CandidateStage.OFFER_DECLINED &&
                          candidate.stage !== CandidateStage.HIRED &&
                          candidate.stage !== CandidateStage.REJECTED;

  const canMakeOffer = candidate.stage === CandidateStage.HM_DECISION_PENDING || 
                       (candidateInterviews.length > 0 && 
                        candidateInterviews[0].decision === InterviewDecision.RECOMMEND_HIRE);

  const canAIDraft = !!requisition.jobDescription?.trim();

  return (
    <Card className="group">
      <div className="p-2">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex-grow">
            <div className="flex items-center gap-3 mb-2">
                <h4 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors font-display tracking-tight">{candidate.name}</h4>
                <span className={`px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full border shadow-sm ${getStageChipClass(candidate.stage)}`}>
                    {candidate.stage}
                </span>
            </div>
            <p className="text-xs font-medium text-slate-400 mb-4">{candidate.email}</p>
            
            <div className="flex flex-wrap gap-3">
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
                onClick={() => onOpenHiringHub(candidate, requisition)}
                className="p-2 bg-slate-50 text-slate-600 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 transition-all duration-200 shadow-sm border border-slate-100"
                title="Hiring Hub"
            >
                <ClipboardDocumentCheckIcon className="w-5 h-5" />
            </button>
            <button
                onClick={() => onOpenCandidateAIDashboardModal({candidate, requisition})}
                className="p-2 bg-slate-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-all duration-200 shadow-sm border border-slate-100"
                title="AI Insights"
            >
                <EyeIcon className="w-5 h-5" />
            </button>
            <button
                onClick={() => onOpenOutreachDraftModal(candidate, requisition)}
                disabled={!canAIDraft}
                className="p-2 bg-slate-50 text-purple-600 rounded-xl hover:bg-purple-100 transition-all duration-200 shadow-sm border border-slate-100 disabled:opacity-30"
                title="AI Draft Outreach"
            >
                <PencilSparklesIcon className="w-5 h-5" />
            </button>
            {canLogInterview && (
                <button
                    onClick={() => onLogInterview(candidate, requisition)}
                    className="p-2 bg-slate-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-all duration-200 shadow-sm border border-slate-100"
                    title="Log Interview"
                >
                    <ChatBubbleBottomCenterTextIcon className="w-5 h-5" />
                </button>
            )}
            {canMakeOffer && (
                <button
                    onClick={() => onOpenOfferModal(candidate, requisition)}
                    className="p-2 bg-slate-50 text-emerald-600 rounded-xl hover:bg-emerald-100 transition-all duration-200 shadow-sm border border-slate-100"
                    title={candidate.offerDetails ? 'View/Edit Offer' : 'Prepare Offer'}
                >
                    <GiftIcon className="w-5 h-5" />
                </button>
            )}
          </div>
        </div>

        {candidateInterviews.length > 0 && (
          <div className="mt-6 pt-6 border-t border-slate-100">
            <div className="flex items-center gap-2 mb-4">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Interview History ({candidateInterviews.length})</h5>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {candidateInterviews.map(interview => (
                <div key={interview.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-slate-200 transition-colors group/item">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-900 group-hover/item:text-indigo-600 transition-colors">{interview.round}</span>
                    <span className="text-[10px] font-medium text-slate-400">{new Date(interview.interviewDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-medium text-slate-500">By {interview.interviewerName}</span>
                    <span className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-md border ${
                        interview.decision === InterviewDecision.RECOMMEND_HIRE ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                        interview.decision === InterviewDecision.DO_NOT_HIRE ? 'bg-rose-50 text-rose-600 border-rose-100' :
                        'bg-amber-50 text-amber-600 border-amber-100'
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
