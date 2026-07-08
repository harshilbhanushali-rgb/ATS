import { useCallback, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Candidate,
  CandidateStage,
  ResumeMatchAnalysis,
  StageHistoryEntry,
  User,
  UserRole,
} from '../types';
import * as crudApi from '../services/crudApi';
import { ApiError } from '../services/crudApi';
import { updateMetadata } from '../utils/metadata';

interface UseCandidatesOptions {
  loggedInUser: User | null;
  getCurrentUserId: () => string;
}

const addStageHistoryEntry = (
  existingHistory: StageHistoryEntry[] | undefined,
  newStage: CandidateStage,
  userId: string
): StageHistoryEntry[] => {
  const newEntry: StageHistoryEntry = {
    stage: newStage,
    date: new Date().toISOString(),
    changedByUserId: userId,
  };
  const history = existingHistory || [];
  if (history.length === 0 || history[history.length - 1].stage !== newStage) {
    return [...history, newEntry];
  }
  return history;
};

export const useCandidates = ({ loggedInUser, getCurrentUserId }: UseCandidatesOptions) => {
  const queryClient = useQueryClient();
  const candidatesQueryKey = ['candidates', loggedInUser?.id] as const;

  const { data: candidates = [], isLoading } = useQuery({
    queryKey: candidatesQueryKey,
    queryFn: () => crudApi.listCandidates(),
    enabled: !!loggedInUser?.id,
  });

  const setCandidates = useCallback(
    (updater: Candidate[] | ((prev: Candidate[]) => Candidate[])) => {
      queryClient.setQueryData<Candidate[]>(candidatesQueryKey, (prev = []) =>
        typeof updater === 'function' ? updater(prev) : updater
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [queryClient, loggedInUser?.id]
  );

  const [isCandidateModalOpen, setIsCandidateModalOpen] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState<Candidate | null>(null);
  const [defaultRequisitionIdForCandidate, setDefaultRequisitionIdForCandidate] = useState<string | null>(null);
  const [defaultTalentPoolIdForCandidate, setDefaultTalentPoolIdForCandidate] = useState<string | null>(null);

  const openCandidateModal = useCallback(
    (candidate?: Candidate, requisitionId?: string, talentPoolId?: string) => {
      setEditingCandidate(candidate || null);
      setDefaultRequisitionIdForCandidate(requisitionId || candidate?.requisitionId || null);
      setDefaultTalentPoolIdForCandidate(talentPoolId || null);
      setIsCandidateModalOpen(true);
    },
    []
  );

  const closeCandidateModal = useCallback(() => {
    setIsCandidateModalOpen(false);
    setEditingCandidate(null);
    setDefaultRequisitionIdForCandidate(null);
    setDefaultTalentPoolIdForCandidate(null);
  }, []);

  const saveCandidate = useCallback(
    (candidate: Candidate, defaultTalentPoolIdParam?: string) => {
      const userId = getCurrentUserId();

      setCandidates((prev) => {
        const existingCandidate = prev.find((c) => c.id === candidate.id);
        let toSave: Candidate = {
          ...candidate,
          metadata: updateMetadata(existingCandidate?.metadata, userId),
        };

        const sourcingRoles: UserRole[] = [
          UserRole.SOURCER,
          UserRole.ADMIN,
          UserRole.LEAD_RECRUITER,
          UserRole.RECRUITER,
        ];
        if (loggedInUser && sourcingRoles.includes(loggedInUser.role) && !existingCandidate) {
          toSave.sourcedByUserId = loggedInUser.id;
          toSave.sourcedDate = new Date().toISOString().split('T')[0];
        }

        if (defaultTalentPoolIdParam) {
          const newTalentPoolIds = new Set([
            ...(toSave.talentPoolIds || []),
            defaultTalentPoolIdParam,
          ]);
          toSave.talentPoolIds = Array.from(newTalentPoolIds);
        }

        const previousStage = existingCandidate?.stage;
        if (!existingCandidate || previousStage !== toSave.stage) {
          toSave.stageHistory = addStageHistoryEntry(
            existingCandidate?.stageHistory,
            toSave.stage,
            userId
          );
        } else {
          toSave.stageHistory = existingCandidate?.stageHistory;
        }

        if (existingCandidate) {
          const merged = { ...toSave, resumeAnalysis: prev.find((c) => c.id === toSave.id)?.resumeAnalysis };
          crudApi
            .updateCandidate(merged)
            .then((updated) =>
              setCandidates((curr) => curr.map((c) => c.id === updated.id ? updated : c))
            )
            .catch(console.error);
          return prev.map((c) => c.id === toSave.id ? merged : c);
        }

        if (!toSave.stageHistory) {
          toSave.stageHistory = [
            { stage: toSave.stage, date: new Date().toISOString(), changedByUserId: userId },
          ];
        }

        crudApi
          .createCandidate(toSave)
          .then((created) => {
            if (created.id !== toSave.id) {
              alert(`${created.name} already exists as a candidate (${created.email}) and has been added to this talent pool instead of creating a duplicate.`);
            }
            setCandidates((curr) => [
              created,
              ...curr.filter((c) => c.id !== toSave.id && c.id !== created.id),
            ]);
          })
          .catch((err) => {
            console.error(err);
            const message =
              err instanceof ApiError && err.status === 409
                ? err.message
                : `Failed to add candidate: ${(err as Error).message || 'Unknown error.'}`;
            alert(message);
            setCandidates((curr) => curr.filter((c) => c.id !== toSave.id));
            crudApi.listCandidates().then(setCandidates).catch(console.error);
          });

        return [toSave, ...prev].sort((a, b) => {
          const dateA = new Date(a.sourcedDate || a.applicationDate).getTime();
          const dateB = new Date(b.sourcedDate || b.applicationDate).getTime();
          return dateB - dateA;
        });
      });

      closeCandidateModal();
    },
    [closeCandidateModal, getCurrentUserId, loggedInUser, setCandidates]
  );

  const updateCandidateStage = useCallback(
    (candidateId: string, newStage: CandidateStage) => {
      const userId = getCurrentUserId();
      setCandidates((prev) =>
        prev.map((candidate) => {
          if (candidate.id === candidateId) {
            const updated = {
              ...candidate,
              stage: newStage,
              stageHistory: addStageHistoryEntry(candidate.stageHistory, newStage, userId),
              metadata: updateMetadata(candidate.metadata, userId),
            };
            crudApi
              .patchCandidate(candidateId, {
                stage: updated.stage,
                stageHistory: updated.stageHistory,
                metadata: updated.metadata,
              })
              .catch(console.error);
            return updated;
          }
          return candidate;
        })
      );
    },
    [getCurrentUserId, setCandidates]
  );

  const saveCandidateAnalysis = useCallback(
    (candidateId: string, analysis: ResumeMatchAnalysis | null) => {
      setCandidates((prev) =>
        prev.map((candidate) => {
          if (candidate.id === candidateId) {
            crudApi
              .patchCandidate(candidateId, { resumeAnalysis: analysis ?? undefined })
              .catch(console.error);
            return { ...candidate, resumeAnalysis: analysis };
          }
          return candidate;
        })
      );
    },
    [setCandidates]
  );

  const removeCandidateFromPool = useCallback((candidateId: string, poolId: string) => {
    setCandidates((prev) =>
      prev.map((candidate) => {
        if (candidate.id === candidateId) {
          const talentPoolIds = (candidate.talentPoolIds || []).filter((id) => id !== poolId);
          crudApi.patchCandidate(candidateId, { talentPoolIds }).catch(console.error);
          return { ...candidate, talentPoolIds };
        }
        return candidate;
      })
    );
  }, [setCandidates]);

  const addCandidateToPool = useCallback((candidateId: string, poolId: string) => {
    setCandidates((prev) =>
      prev.map((candidate) => {
        if (candidate.id === candidateId) {
          const talentPoolIds = Array.from(new Set([...(candidate.talentPoolIds || []), poolId]));
          crudApi.patchCandidate(candidateId, { talentPoolIds }).catch(console.error);
          return { ...candidate, talentPoolIds };
        }
        return candidate;
      })
    );
  }, [setCandidates]);

  const moveCandidateToRequisition = useCallback(
    (candidateId: string, newRequisitionId: string, talentPoolIdToRemoveFrom?: string) => {
      const userId = getCurrentUserId();
      setCandidates((prev) =>
        prev.map((candidate) => {
          if (candidate.id === candidateId) {
            const talentPoolIds = talentPoolIdToRemoveFrom
              ? (candidate.talentPoolIds || []).filter((id) => id !== talentPoolIdToRemoveFrom)
              : candidate.talentPoolIds;
            const stageHistory = addStageHistoryEntry(
              candidate.stageHistory,
              CandidateStage.SCREENING,
              userId
            );
            const updated = {
              ...candidate,
              requisitionId: newRequisitionId,
              stage: CandidateStage.SCREENING,
              stageHistory,
              talentPoolIds,
              metadata: updateMetadata(candidate.metadata, userId),
            };
            crudApi
              .patchCandidate(candidateId, {
                requisitionId: newRequisitionId,
                stage: CandidateStage.SCREENING,
                stageHistory,
                talentPoolIds,
                metadata: updated.metadata,
              })
              .catch(console.error);
            return updated;
          }
          return candidate;
        })
      );
    },
    [getCurrentUserId, setCandidates]
  );

  const deleteCandidate = useCallback((id: string) => {
    setCandidates((prev) => prev.filter((c) => c.id !== id));
    crudApi.deleteCandidate(id).catch((err) => {
      console.error(err);
      crudApi.listCandidates().then(setCandidates).catch(console.error);
    });
  }, [setCandidates]);

  return {
    candidates,
    setCandidates,
    isLoading,
    isCandidateModalOpen,
    editingCandidate,
    defaultRequisitionIdForCandidate,
    defaultTalentPoolIdForCandidate,
    openCandidateModal,
    closeCandidateModal,
    saveCandidate,
    updateCandidateStage,
    saveCandidateAnalysis,
    removeCandidateFromPool,
    addCandidateToPool,
    moveCandidateToRequisition,
    deleteCandidate,
    setIsCandidateModalOpen,
  };
};
