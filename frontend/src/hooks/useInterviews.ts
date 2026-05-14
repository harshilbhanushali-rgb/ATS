import { useCallback, useEffect, useState } from 'react';
import { Candidate, Interview, Requisition } from '../types';
import * as crudApi from '../services/crudApi';

export const useInterviews = () => {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [isInterviewModalOpen, setIsInterviewModalOpen] = useState(false);
  const [candidateForInterview, setCandidateForInterview] = useState<Candidate | null>(null);
  const [requisitionForInterview, setRequisitionForInterview] = useState<Requisition | null>(null);

  useEffect(() => {
    crudApi.listInterviews().then(setInterviews).catch(console.error);
  }, []);

  const openInterviewModal = useCallback((candidate: Candidate, requisition: Requisition) => {
    setCandidateForInterview(candidate);
    setRequisitionForInterview(requisition);
    setIsInterviewModalOpen(true);
  }, []);

  const closeInterviewModal = useCallback(() => {
    setIsInterviewModalOpen(false);
  }, []);

  const saveInterview = useCallback(
    (interview: Interview) => {
      setInterviews((prev) => [interview, ...prev]);
      crudApi
        .createInterview(interview)
        .then((created) =>
          setInterviews((prev) => prev.map((i) => i.id === interview.id ? created : i))
        )
        .catch((err) => {
          console.error(err);
          setInterviews((prev) => prev.filter((i) => i.id !== interview.id));
        });
      closeInterviewModal();
    },
    [closeInterviewModal]
  );

  const deleteInterview = useCallback((id: string) => {
    setInterviews((prev) => prev.filter((i) => i.id !== id));
    crudApi.deleteInterview(id).catch((err) => {
      console.error(err);
      crudApi.listInterviews().then(setInterviews).catch(console.error);
    });
  }, []);

  return {
    interviews,
    setInterviews,
    isInterviewModalOpen,
    candidateForInterview,
    requisitionForInterview,
    openInterviewModal,
    closeInterviewModal,
    saveInterview,
    deleteInterview,
  };
};
