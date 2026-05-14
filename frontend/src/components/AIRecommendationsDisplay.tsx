
import React from 'react';
import { Candidate, Requisition, AIRecommendedCandidate, CandidateAIDashboardData, OutreachDraftHandlerProps } from '../types';
import Card from './Card';
import SparklesIcon from './icons/SparklesIcon';
import EyeIcon from './icons/EyeIcon';
import ChatBubbleLeftEllipsisIcon from './icons/ChatBubbleLeftEllipsisIcon';
import UserPlusIcon from './icons/UserPlusIcon';
import PencilSparklesIcon from './icons/PencilSparklesIcon';

interface AIRecommendationsDisplayProps extends OutreachDraftHandlerProps {
  recommendations: AIRecommendedCandidate[] | null;
  allCandidates: Candidate[]; 
  isLoading: boolean;
  requisition: Requisition | null;
  onAssignCandidate: (candidateId: string, requisitionId: string) => void;
  onOpenCandidateAIDashboardModal: (data: CandidateAIDashboardData) => void;
  onOpenLogOutreachModal: (candidate: Candidate) => void;
}

const AIRecommendationsDisplay: React.FC<AIRecommendationsDisplayProps> = ({
  recommendations,
  allCandidates,
  isLoading,
  requisition,
  onAssignCandidate,
  onOpenCandidateAIDashboardModal,
  onOpenLogOutreachModal,
  onOpenOutreachDraftModal,
}) => {
  if (isLoading) {
    return (
      <Card title="AI Candidate Recommendations" className="mt-6">
        <div className="flex items-center justify-center p-10">
          <SparklesIcon className="w-8 h-8 text-indigo-500 animate-pulse mr-3" />
          <p className="text-gray-600">AI is searching for matching candidates in talent pools...</p>
        </div>
      </Card>
    );
  }

  if (!recommendations) {
    return null; 
  }

  if (recommendations.length === 0) {
    return (
      <Card title="AI Candidate Recommendations" className="mt-6">
        <p className="text-gray-500 p-6 text-center">
          No matching candidates found in talent pools for this requisition, or the AI could not provide recommendations.
        </p>
      </Card>
    );
  }
  
  if (!requisition) return null;

  const canAIDraft = !!requisition.jobDescription?.trim();

  return (
    <Card title="AI Recommended Candidates from Talent Pools" className="mt-6 bg-indigo-50 border-indigo-200">
      <ul className="space-y-4">
        {recommendations.map(rec => {
          if (rec.candidateId === "ERROR") { // Handle error case from Gemini service
            return (
              <li key="error-rec" className="p-4 bg-red-50 rounded-lg shadow-md border border-red-200">
                <p className="text-red-700 font-semibold">Error retrieving recommendations:</p>
                <p className="text-sm text-red-600 italic">{rec.justification}</p>
              </li>
            );
          }
          const candidate = allCandidates.find(c => c.id === rec.candidateId);
          if (!candidate) return null;

          const isAlreadyInThisRequisition = candidate.requisitionId === requisition.id;

          return (
            <li key={rec.candidateId} className="p-4 bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="flex flex-col sm:flex-row justify-between items-start">
                <div>
                  <h4 className="text-lg font-semibold text-indigo-700">{candidate.name}</h4>
                  <p className="text-sm text-gray-600">{candidate.email}</p>
                  {rec.matchScore && (
                    <p className="text-xs text-purple-600 mt-0.5">
                      AI Match Score: <span className="font-bold">{rec.matchScore}/5</span>
                    </p>
                  )}
                </div>
                <div className="mt-2 sm:mt-0 flex flex-wrap gap-2 items-center sm:items-start sm:flex-col sm:text-right">
                   <p className="text-xs text-gray-500">Current Stage: {candidate.stage}</p>
                   {candidate.talentPoolIds && candidate.talentPoolIds.length > 0 && 
                     <p className="text-xs text-gray-500">In {candidate.talentPoolIds.length} Talent Pool(s)</p>
                   }
                </div>
              </div>
              <p className="mt-2 text-sm text-gray-700 italic border-l-4 border-indigo-200 pl-3 py-1 bg-indigo-50 rounded">
                <strong>AI Justification:</strong> {rec.justification}
              </p>
              <div className="mt-4 flex flex-wrap gap-2 justify-end">
                <button
                  onClick={() => onOpenCandidateAIDashboardModal({ candidate, requisition })}
                  className="flex items-center text-xs text-blue-600 hover:text-blue-800 font-medium py-1 px-2.5 rounded-md hover:bg-blue-50 transition-colors"
                  title="View full AI Insights for this candidate against this Requisition"
                >
                  <EyeIcon className="w-4 h-4 mr-1" /> View Profile / AI Insights
                </button>
                <button
                    onClick={() => onOpenOutreachDraftModal(candidate, requisition)}
                    disabled={!canAIDraft}
                    className="flex items-center text-xs text-purple-600 hover:text-purple-800 font-medium py-1 px-2.5 rounded-md hover:bg-purple-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title={canAIDraft ? "AI Draft Outreach Message" : "Requisition Job Description missing for AI Draft"}
                >
                    <PencilSparklesIcon className="w-4 h-4 mr-1" /> AI Draft Outreach
                </button>
                <button
                  onClick={() => onOpenLogOutreachModal(candidate)}
                  className="flex items-center text-xs text-green-600 hover:text-green-800 font-medium py-1 px-2.5 rounded-md hover:bg-green-50 transition-colors"
                  title="Log an outreach attempt to this candidate"
                >
                  <ChatBubbleLeftEllipsisIcon className="w-4 h-4 mr-1" /> Log Outreach
                </button>
                <button
                  onClick={() => onAssignCandidate(candidate.id, requisition.id)}
                  disabled={isAlreadyInThisRequisition}
                  className="flex items-center text-xs bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-1 px-2.5 rounded-md shadow-sm transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                  title={isAlreadyInThisRequisition ? "Candidate already in this requisition" : "Assign candidate to this requisition"}
                >
                  <UserPlusIcon className="w-4 h-4 mr-1" /> 
                  {isAlreadyInThisRequisition ? 'Already Assigned' : 'Assign to this Requisition'}
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </Card>
  );
};

export default AIRecommendationsDisplay;
