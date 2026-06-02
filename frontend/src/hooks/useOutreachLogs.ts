import { useCallback, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Candidate, CandidateOutreachLog } from '../types';
import * as crudApi from '../services/crudApi';

interface UseOutreachLogsOptions {
  getCurrentUserId: () => string;
  loggedInUserId?: string;
}

export const useOutreachLogs = ({ getCurrentUserId, loggedInUserId }: UseOutreachLogsOptions) => {
  const queryClient = useQueryClient();
  const outreachLogsQueryKey = ['outreachLogs', loggedInUserId] as const;

  const { data: candidateOutreachLogs = [] } = useQuery({
    queryKey: outreachLogsQueryKey,
    queryFn: () => crudApi.listOutreachLogs(),
    enabled: !!loggedInUserId,
  });

  const setCandidateOutreachLogs = useCallback(
    (updater: CandidateOutreachLog[] | ((prev: CandidateOutreachLog[]) => CandidateOutreachLog[])) => {
      queryClient.setQueryData<CandidateOutreachLog[]>(outreachLogsQueryKey, (prev = []) =>
        typeof updater === 'function' ? updater(prev) : updater
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [queryClient, loggedInUserId]
  );

  const [isLogOutreachModalOpen, setIsLogOutreachModalOpen] = useState(false);
  const [candidateForOutreachLog, setCandidateForOutreachLog] = useState<Candidate | null>(null);

  const openLogOutreachModal = useCallback((candidate: Candidate) => {
    setCandidateForOutreachLog(candidate);
    setIsLogOutreachModalOpen(true);
  }, []);

  const closeLogOutreachModal = useCallback(() => {
    setIsLogOutreachModalOpen(false);
  }, []);

  const saveOutreachLog = useCallback(
    (
      candidateId: string,
      channel: string,
      outreachDate: string,
      notes?: string,
      responded?: boolean,
      responseDate?: string,
      clickedLink?: boolean
    ) => {
      const newLog: CandidateOutreachLog = {
        id: `LOG-${Date.now()}`,
        candidateId,
        sourcerUserId: getCurrentUserId(),
        channel: channel as CandidateOutreachLog['channel'],
        outreachDate,
        notes,
        responded: !!responded,
        responseDate: responded ? responseDate : undefined,
        clickedLink: !!clickedLink,
      };

      setCandidateOutreachLogs((prev) => [newLog, ...prev]);
      crudApi
        .createOutreachLog(newLog)
        .then((created) =>
          setCandidateOutreachLogs((prev) => prev.map((l) => l.id === newLog.id ? created : l))
        )
        .catch((err) => {
          console.error(err);
          crudApi.listOutreachLogs().then(setCandidateOutreachLogs).catch(console.error);
        });

      closeLogOutreachModal();
    },
    [closeLogOutreachModal, getCurrentUserId, setCandidateOutreachLogs]
  );

  return {
    candidateOutreachLogs,
    setCandidateOutreachLogs,
    isLogOutreachModalOpen,
    candidateForOutreachLog,
    openLogOutreachModal,
    closeLogOutreachModal,
    saveOutreachLog,
  };
};
