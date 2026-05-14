import { useCallback, useEffect, useState } from 'react';
import { Candidate, CandidateOutreachLog } from '../types';
import * as crudApi from '../services/crudApi';

interface UseOutreachLogsOptions {
  getCurrentUserId: () => string;
}

export const useOutreachLogs = ({ getCurrentUserId }: UseOutreachLogsOptions) => {
  const [candidateOutreachLogs, setCandidateOutreachLogs] = useState<CandidateOutreachLog[]>([]);
  const [isLogOutreachModalOpen, setIsLogOutreachModalOpen] = useState(false);
  const [candidateForOutreachLog, setCandidateForOutreachLog] = useState<Candidate | null>(null);

  useEffect(() => {
    crudApi.listOutreachLogs().then(setCandidateOutreachLogs).catch(console.error);
  }, []);

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
          setCandidateOutreachLogs((prev) => prev.filter((l) => l.id !== newLog.id));
        });

      closeLogOutreachModal();
    },
    [closeLogOutreachModal, getCurrentUserId]
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
