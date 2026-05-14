import { useCallback, useState, type Dispatch, type SetStateAction } from 'react';
import { Candidate, OfferDetails, Requisition, CandidateStage } from '../types';

interface UseOffersOptions {
  updateCandidateStage: (candidateId: string, newStage: CandidateStage) => void;
  setCandidates: Dispatch<SetStateAction<Candidate[]>>;
}

export const useOffers = ({ updateCandidateStage, setCandidates }: UseOffersOptions) => {
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [candidateForOffer, setCandidateForOffer] = useState<Candidate | null>(null);
  const [requisitionForOffer, setRequisitionForOffer] = useState<Requisition | null>(null);

  const openOfferModal = useCallback((candidate: Candidate, requisition: Requisition) => {
    setCandidateForOffer(candidate);
    setRequisitionForOffer(requisition);
    setIsOfferModalOpen(true);
  }, []);

  const closeOfferModal = useCallback(() => {
    setIsOfferModalOpen(false);
  }, []);

  const saveOffer = useCallback(
    (candidateId: string, offerDetails: OfferDetails) => {
      updateCandidateStage(candidateId, CandidateStage.OFFER_EXTENDED);
      setCandidates((prev) =>
        prev.map((candidate) =>
          candidate.id === candidateId ? { ...candidate, offerDetails } : candidate
        )
      );
      closeOfferModal();
    },
    [closeOfferModal, setCandidates, updateCandidateStage]
  );

  const offerAccepted = useCallback(
    (candidateId: string) => {
      updateCandidateStage(candidateId, CandidateStage.OFFER_ACCEPTED);
    },
    [updateCandidateStage]
  );

  const offerDeclined = useCallback(
    (candidateId: string) => {
      updateCandidateStage(candidateId, CandidateStage.OFFER_DECLINED);
    },
    [updateCandidateStage]
  );

  return {
    isOfferModalOpen,
    candidateForOffer,
    requisitionForOffer,
    openOfferModal,
    closeOfferModal,
    saveOffer,
    offerAccepted,
    offerDeclined,
  };
};
