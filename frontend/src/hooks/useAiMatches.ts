import { useCallback, useState } from 'react';
import { AIRecommendedCandidate, Candidate, Requisition } from '../types';
import { getAICandidateMatchesFromPools } from '../services/aiApi';

interface UseAiMatchesOptions {
  candidates: Candidate[];
  onAssignCandidateFromAIPool: (candidateId: string, requisitionId: string) => void;
}

export const useAiMatches = ({ candidates, onAssignCandidateFromAIPool }: UseAiMatchesOptions) => {
  const [aiMatchedCandidates, setAiMatchedCandidates] = useState<AIRecommendedCandidate[] | null>(null);
  const [isLoadingAiMatches, setIsLoadingAiMatches] = useState(false);
  const [currentRequisitionForAIMatches, setCurrentRequisitionForAIMatches] = useState<Requisition | null>(null);

  const findAiCandidateMatches = useCallback(
    async (requisition: Requisition) => {
      setIsLoadingAiMatches(true);
      setCurrentRequisitionForAIMatches(requisition);
      setAiMatchedCandidates(null);

      const candidatesInPools = candidates.filter(
        (candidate) => candidate.talentPoolIds && candidate.talentPoolIds.length > 0 && candidate.requisitionId !== requisition.id
      );

      try {
        const matches = await getAICandidateMatchesFromPools(requisition, candidatesInPools);
        setAiMatchedCandidates(matches);
      } catch (error) {
        console.error('Error finding AI matches', error);
        setAiMatchedCandidates([
          {
            candidateId: 'ERROR',
            justification: (error as Error).message,
          },
        ]);
      } finally {
        setIsLoadingAiMatches(false);
      }
    },
    [candidates]
  );

  const assignCandidateFromAIPool = useCallback(
    (candidateId: string, requisitionId: string) => {
      onAssignCandidateFromAIPool(candidateId, requisitionId);
      alert('Candidate assigned and moved to screening stage.');
    },
    [onAssignCandidateFromAIPool]
  );

  return {
    aiMatchedCandidates,
    isLoadingAiMatches,
    currentRequisitionForAIMatches,
    findAiCandidateMatches,
    assignCandidateFromAIPool,
  };
};
