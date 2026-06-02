import { useCallback, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { TalentPool } from '../types';
import * as crudApi from '../services/crudApi';

export const useTalentPools = ({ loggedInUserId }: { loggedInUserId?: string } = {}) => {
  const queryClient = useQueryClient();
  const talentPoolsQueryKey = ['talentPools', loggedInUserId] as const;

  const { data: talentPools = [] } = useQuery({
    queryKey: talentPoolsQueryKey,
    queryFn: () => crudApi.listTalentPools(),
    enabled: !!loggedInUserId,
  });

  const setTalentPools = useCallback(
    (updater: TalentPool[] | ((prev: TalentPool[]) => TalentPool[])) => {
      queryClient.setQueryData<TalentPool[]>(talentPoolsQueryKey, (prev = []) =>
        typeof updater === 'function' ? updater(prev) : updater
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [queryClient, loggedInUserId]
  );

  const [isTalentPoolFormModalOpen, setIsTalentPoolFormModalOpen] = useState(false);
  const [editingTalentPool, setEditingTalentPool] = useState<TalentPool | null>(null);
  const [isAddCandidateToPoolModalOpen, setIsAddCandidateToPoolModalOpen] = useState(false);
  const [poolToAddTo, setPoolToAddTo] = useState<TalentPool | null>(null);

  const openTalentPoolFormModal = useCallback((pool?: TalentPool) => {
    setEditingTalentPool(pool || null);
    setIsTalentPoolFormModalOpen(true);
  }, []);

  const closeTalentPoolFormModal = useCallback(() => {
    setEditingTalentPool(null);
    setIsTalentPoolFormModalOpen(false);
  }, []);

  const saveTalentPool = useCallback(
    (pool: TalentPool) => {
      setTalentPools((prev) => {
        const existing = prev.find((p) => p.id === pool.id);

        if (existing) {
          crudApi
            .updateTalentPool(pool)
            .then((updated) =>
              setTalentPools((curr) => curr.map((p) => p.id === updated.id ? updated : p))
            )
            .catch(console.error);
          return prev.map((p) => p.id === pool.id ? pool : p);
        }

        crudApi
          .createTalentPool(pool)
          .then((created) =>
            setTalentPools((curr) => curr.map((p) => p.id === pool.id ? created : p))
          )
          .catch((err) => {
            console.error(err);
            crudApi.listTalentPools().then(setTalentPools).catch(console.error);
          });
        return [pool, ...prev];
      });

      closeTalentPoolFormModal();
    },
    [closeTalentPoolFormModal, setTalentPools]
  );

  const deleteTalentPool = useCallback((id: string) => {
    setTalentPools((prev) => prev.filter((p) => p.id !== id));
    crudApi.deleteTalentPool(id).catch((err) => {
      console.error(err);
      crudApi.listTalentPools().then(setTalentPools).catch(console.error);
    });
  }, [setTalentPools]);

  const openAddCandidateToPoolModal = useCallback((pool: TalentPool) => {
    setPoolToAddTo(pool);
    setIsAddCandidateToPoolModalOpen(true);
  }, []);

  const closeAddCandidateToPoolModal = useCallback(() => {
    setIsAddCandidateToPoolModalOpen(false);
  }, []);

  return {
    talentPools,
    setTalentPools,
    isTalentPoolFormModalOpen,
    editingTalentPool,
    isAddCandidateToPoolModalOpen,
    poolToAddTo,
    openTalentPoolFormModal,
    closeTalentPoolFormModal,
    saveTalentPool,
    deleteTalentPool,
    openAddCandidateToPoolModal,
    closeAddCandidateToPoolModal,
    setIsAddCandidateToPoolModalOpen,
  };
};
