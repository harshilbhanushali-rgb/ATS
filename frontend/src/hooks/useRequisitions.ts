import { useCallback, useEffect, useState } from 'react';
import { Requisition, RequisitionStatus } from '../types';
import * as crudApi from '../services/crudApi';
import { RequisitionFilterParams } from '../services/crudApi';
import { updateMetadata } from '../utils/metadata';

interface UseRequisitionsOptions {
  getCurrentUserId: () => string;
  loggedInUserId?: string;
}

export const useRequisitions = ({ getCurrentUserId, loggedInUserId }: UseRequisitionsOptions) => {
  const [requisitions, setRequisitions] = useState<Requisition[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRequisitionModalOpen, setIsRequisitionModalOpen] = useState(false);
  const [editingRequisition, setEditingRequisition] = useState<Requisition | null>(null);

  useEffect(() => {
    if (!loggedInUserId) return;
    crudApi
      .listRequisitions()
      .then(setRequisitions)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [loggedInUserId]);

  const openRequisitionModal = useCallback((requisition?: Requisition) => {
    setEditingRequisition(requisition || null);
    setIsRequisitionModalOpen(true);
  }, []);

  const closeRequisitionModal = useCallback(() => {
    setIsRequisitionModalOpen(false);
    setEditingRequisition(null);
  }, []);

  const saveRequisition = useCallback(
    (requisition: Requisition) => {
      const userId = getCurrentUserId();

      setRequisitions((prev) => {
        const existing = prev.find((r) => r.id === requisition.id);
        const toSave = { ...requisition, metadata: updateMetadata(existing?.metadata, userId) };

        if (existing) {
          crudApi
            .updateRequisition(toSave)
            .then((updated) =>
              setRequisitions((curr) => curr.map((r) => r.id === updated.id ? updated : r))
            )
            .catch(console.error);
          return prev.map((r) => r.id === toSave.id ? toSave : r);
        }

        crudApi
          .createRequisition(toSave)
          .then((created) =>
            setRequisitions((curr) => curr.map((r) => r.id === toSave.id ? created : r))
          )
          .catch((err) => {
            console.error(err);
            crudApi.listRequisitions().then(setRequisitions).catch(console.error);
          });
        return [toSave, ...prev].sort(
          (a, b) => new Date(b.reqApprovalDate).getTime() - new Date(a.reqApprovalDate).getTime()
        );
      });

      closeRequisitionModal();
    },
    [closeRequisitionModal, getCurrentUserId]
  );

  const deleteRequisition = useCallback((id: string) => {
    setRequisitions((prev) => prev.filter((r) => r.id !== id));
    crudApi.deleteRequisition(id).catch((err) => {
      console.error(err);
      // Revert on failure — refetch from server
      crudApi.listRequisitions().then(setRequisitions).catch(console.error);
    });
  }, []);

  const refetchWithFilters = useCallback((params: RequisitionFilterParams) => {
    setIsLoading(true);
    crudApi
      .listRequisitions(params)
      .then(setRequisitions)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const archiveRequisition = useCallback(async (id: string) => {
    await crudApi.patchRequisition(id, { reqStatus: RequisitionStatus.ARCHIVED });
    setRequisitions((prev) =>
      prev.map((r) => r.id === id ? { ...r, reqStatus: RequisitionStatus.ARCHIVED } : r)
    );
  }, []);

  const reactivateRequisition = useCallback(async (id: string) => {
    await crudApi.patchRequisition(id, { reqStatus: RequisitionStatus.OPEN });
    setRequisitions((prev) =>
      prev.map((r) => r.id === id ? { ...r, reqStatus: RequisitionStatus.OPEN } : r)
    );
  }, []);

  return {
    requisitions,
    setRequisitions,
    isLoading,
    isRequisitionModalOpen,
    editingRequisition,
    openRequisitionModal,
    closeRequisitionModal,
    saveRequisition,
    deleteRequisition,
    refetchWithFilters,
    archiveRequisition,
    reactivateRequisition,
  };
};
