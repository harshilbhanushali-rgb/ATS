import { useCallback, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Candidate, Interview, Requisition } from '../types';
import * as crudApi from '../services/crudApi';

export const useInterviews = ({ loggedInUserId }: { loggedInUserId?: string } = {}) => {
  const queryClient = useQueryClient();
  const interviewsQueryKey = ['interviews', loggedInUserId] as const;

  const { data: interviews = [] } = useQuery({
    queryKey: interviewsQueryKey,
    queryFn: () => crudApi.listInterviews(),
    enabled: !!loggedInUserId,
  });

  const setInterviews = useCallback(
    (updater: Interview[] | ((prev: Interview[]) => Interview[])) => {
      queryClient.setQueryData<Interview[]>(interviewsQueryKey, (prev = []) =>
        typeof updater === 'function' ? updater(prev) : updater
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [queryClient, loggedInUserId]
  );

  const [isInterviewModalOpen, setIsInterviewModalOpen] = useState(false);
  const [candidateForInterview, setCandidateForInterview] = useState<Candidate | null>(null);
  const [requisitionForInterview, setRequisitionForInterview] = useState<Requisition | null>(null);

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
          crudApi.listInterviews().then(setInterviews).catch(console.error);
        });
      closeInterviewModal();
    },
    [closeInterviewModal, setInterviews]
  );

  const deleteInterview = useCallback((id: string) => {
    setInterviews((prev) => prev.filter((i) => i.id !== id));
    crudApi.deleteInterview(id).catch((err) => {
      console.error(err);
      crudApi.listInterviews().then(setInterviews).catch(console.error);
    });
  }, [setInterviews]);

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
