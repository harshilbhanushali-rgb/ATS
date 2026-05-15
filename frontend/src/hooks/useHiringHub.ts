import { useCallback, useState, type Dispatch, type SetStateAction } from 'react';
import { Candidate, HiringHubComment, Interview, Requisition, CandidateStage } from '../types';
import { getAIDebriefSummary } from '../services/aiApi';
import { patchCandidate } from '../services/crudApi';

interface HiringHubContext {
  candidate: Candidate;
  requisition: Requisition;
}

interface UseHiringHubOptions {
  setCandidates: Dispatch<SetStateAction<Candidate[]>>;
  getCurrentUserId: () => string;
  getCurrentUserName: () => string;
  updateCandidateStage: (candidateId: string, newStage: CandidateStage) => void;
}

export const useHiringHub = ({
  setCandidates,
  getCurrentUserId,
  getCurrentUserName,
  updateCandidateStage,
}: UseHiringHubOptions) => {
  const [isHiringHubOpen, setIsHiringHubOpen] = useState(false);
  const [contextForHiringHub, setContextForHiringHub] = useState<HiringHubContext | null>(null);

  const openHiringHub = useCallback((candidate: Candidate, requisition: Requisition) => {
    setContextForHiringHub({ candidate, requisition });
    setIsHiringHubOpen(true);
  }, []);

  const closeHiringHub = useCallback(() => {
    setIsHiringHubOpen(false);
  }, []);

  const saveHiringHubComment = useCallback(
    (candidateId: string, commentText: string) => {
      const newComment: HiringHubComment = {
        id: `COMMENT-${Date.now()}`,
        authorId: getCurrentUserId(),
        authorName: getCurrentUserName(),
        timestamp: new Date().toISOString(),
        text: commentText,
      };
      setCandidates((prev) =>
        prev.map((candidate) => {
          if (candidate.id === candidateId) {
            const updatedComments = [...(candidate.hiringHubComments || []), newComment];
            patchCandidate(candidateId, { hiringHubComments: updatedComments }).catch(console.error);
            return { ...candidate, hiringHubComments: updatedComments };
          }
          return candidate;
        })
      );
      setContextForHiringHub((prev) => {
        if (prev && prev.candidate.id === candidateId) {
          const updatedCandidate = {
            ...prev.candidate,
            hiringHubComments: [...(prev.candidate.hiringHubComments || []), newComment],
          };
          return { ...prev, candidate: updatedCandidate };
        }
        return prev;
      });
    },
    [getCurrentUserId, getCurrentUserName, setCandidates]
  );

  const generateAIDebriefSummary = useCallback(
    async (candidate: Candidate, requisition: Requisition, interviews: Interview[]) => {
      try {
        const summary = await getAIDebriefSummary(requisition, interviews);
        if (summary) {
          await patchCandidate(candidate.id, { aiDebriefSummary: summary });
          setCandidates((prev) =>
            prev.map((item) => (item.id === candidate.id ? { ...item, aiDebriefSummary: summary } : item))
          );
          setContextForHiringHub((prev) => {
            if (prev && prev.candidate.id === candidate.id) {
              return { ...prev, candidate: { ...prev.candidate, aiDebriefSummary: summary } };
            }
            return prev;
          });
        }
      } catch (error) {
        console.error('Failed to generate AI Debrief Summary:', error);
      }
    },
    [setCandidates]
  );

  const recordFinalDecision = useCallback(
    (candidateId: string, decision: 'HIRE' | 'REJECT') => {
      if (decision === 'HIRE') {
        updateCandidateStage(candidateId, CandidateStage.HM_DECISION_PENDING);
        alert(
          "Decision recorded: Recommended for Hire. Candidate moved to 'HM Decision Pending' for Recruiter action."
        );
      } else {
        updateCandidateStage(candidateId, CandidateStage.REJECTED);
        alert('Decision recorded: Candidate Rejected.');
      }
      closeHiringHub();
    },
    [closeHiringHub, updateCandidateStage]
  );

  return {
    isHiringHubOpen,
    contextForHiringHub,
    openHiringHub,
    closeHiringHub,
    saveHiringHubComment,
    generateAIDebriefSummary,
    recordFinalDecision,
  };
};
