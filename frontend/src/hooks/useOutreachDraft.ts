import { useCallback, useState } from 'react';
import { Candidate, Requisition } from '../types';
import { getAIOutreachMessageDraft } from '../services/aiApi';

export const useOutreachDraft = () => {
  const [isOutreachDraftModalOpen, setIsOutreachDraftModalOpen] = useState(false);
  const [candidateForOutreachDraft, setCandidateForOutreachDraft] = useState<Candidate | null>(null);
  const [currentOutreachDraft, setCurrentOutreachDraft] = useState<string | null>(null);
  const [isGeneratingOutreachDraft, setIsGeneratingOutreachDraft] = useState(false);
  const [outreachDraftError, setOutreachDraftError] = useState<string | null>(null);

  const openOutreachDraftModal = useCallback(async (candidate: Candidate, requisition: Requisition) => {
    setCandidateForOutreachDraft(candidate);
    setIsOutreachDraftModalOpen(true);
    setIsGeneratingOutreachDraft(true);
    setOutreachDraftError(null);
    setCurrentOutreachDraft(null);
    try {
      const draft = await getAIOutreachMessageDraft(candidate, requisition);
      setCurrentOutreachDraft(draft);
    } catch (error) {
      setOutreachDraftError((error as Error).message);
    } finally {
      setIsGeneratingOutreachDraft(false);
    }
  }, []);

  const closeOutreachDraftModal = useCallback(() => {
    setIsOutreachDraftModalOpen(false);
  }, []);

  return {
    isOutreachDraftModalOpen,
    candidateForOutreachDraft,
    currentOutreachDraft,
    isGeneratingOutreachDraft,
    outreachDraftError,
    openOutreachDraftModal,
    closeOutreachDraftModal,
  };
};
