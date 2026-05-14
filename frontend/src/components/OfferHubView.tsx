import React, { useState, useMemo } from 'react';
import { Candidate, Requisition, CandidateStage } from '../types';
import OfferCard from './OfferCard';
import Card from './Card';
import BackspaceIcon from './icons/BackspaceIcon'; // For Clear Filters button

interface OfferHubViewProps {
  allCandidates: Candidate[];
  allRequisitions: Requisition[];
  onOfferAccepted: (candidateId: string) => void;
  onOfferDeclined: (candidateId: string) => void;
  onEditOffer: (candidate: Candidate, requisition: Requisition) => void;
}

const OfferHubView: React.FC<OfferHubViewProps> = ({ 
    allCandidates, 
    allRequisitions, 
    onOfferAccepted, 
    onOfferDeclined, 
    onEditOffer 
}) => {
  const [offerSearchTerm, setOfferSearchTerm] = useState('');
  const [offerRequisitionFilter, setOfferRequisitionFilter] = useState('');

  const candidatesWithOffersInitially = useMemo(() => {
    return allCandidates.filter(
      candidate => candidate.stage === CandidateStage.OFFER_EXTENDED && candidate.offerDetails
    );
  }, [allCandidates]);

  const uniqueRequisitionRolesWithOffers = useMemo(() => {
    const roles = new Set<string>();
    candidatesWithOffersInitially.forEach(candidate => {
      const req = allRequisitions.find(r => r.id === candidate.requisitionId);
      if (req) roles.add(req.role);
    });
    return Array.from(roles).sort();
  }, [candidatesWithOffersInitially, allRequisitions]);

  const filteredCandidatesWithOffers = useMemo(() => {
    return candidatesWithOffersInitially.filter(candidate => {
      const term = offerSearchTerm.toLowerCase();
      const matchesSearch = term === '' || candidate.name.toLowerCase().includes(term) || candidate.email.toLowerCase().includes(term);
      
      let matchesRequisition = true;
      if (offerRequisitionFilter !== '') {
        const req = allRequisitions.find(r => r.id === candidate.requisitionId);
        matchesRequisition = req ? req.role === offerRequisitionFilter : false;
      }
      return matchesSearch && matchesRequisition;
    });
  }, [candidatesWithOffersInitially, offerSearchTerm, offerRequisitionFilter, allRequisitions]);

  const handleClearOfferFilters = () => {
    setOfferSearchTerm('');
    setOfferRequisitionFilter('');
  };
  
  const inputClass = "mt-1 block w-full px-3 py-1.5 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-xs text-xs";
  const labelClass = "block text-xs font-medium text-gray-700";

  return (
    <div className="space-y-6">
      <div className="pb-5 border-b border-gray-200">
        <h1 className="text-2xl font-semibold leading-6 text-gray-900 sm:truncate">Manage Candidate Offers</h1>
        <p className="mt-2 text-sm text-gray-500">Review, update, or record decisions for candidates who have received offers.</p>
      </div>

      <Card title="Filters" className="mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          <div>
            <label htmlFor="offerSearchTerm" className={labelClass}>Search Candidate Name/Email</label>
            <input
              type="text"
              id="offerSearchTerm"
              placeholder="Enter name or email..."
              value={offerSearchTerm}
              onChange={(e) => setOfferSearchTerm(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="offerRequisitionFilter" className={labelClass}>Requisition Role</label>
            <select id="offerRequisitionFilter" value={offerRequisitionFilter} onChange={(e) => setOfferRequisitionFilter(e.target.value)} className={inputClass}>
              <option value="">All Roles</option>
              {uniqueRequisitionRolesWithOffers.map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </div>
          <button
            onClick={handleClearOfferFilters}
            className="w-full sm:w-auto flex items-center justify-center px-3 py-1.5 border border-gray-300 rounded-md shadow-sm text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-indigo-500 h-[2.25rem] mt-1 sm:mt-0"
            title="Clear offer filters"
          >
            <BackspaceIcon className="w-3.5 h-3.5 mr-1" /> Clear
          </button>
        </div>
      </Card>

      {filteredCandidatesWithOffers.length === 0 ? (
        <Card className="shadow-xl">
          <div className="p-8 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5.586-1.414a1 1 0 00-1.414-1.414l-1.071 1.071-1.071-1.071a1 1 0 10-1.414 1.414l1.071 1.071-1.071 1.071a1 1 0 101.414 1.414l1.071-1.071 1.071 1.071a1 1 0 101.414-1.414L17.414 15l1.172-1.172a1 1 0 000-1.414l-1.172-1.172zM12 21a9 9 0 100-18 9 9 0 000 18z" />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900">
                {candidatesWithOffersInitially.length === 0 ? "No Active Offers" : "No Offers Match Your Filters"}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
                {candidatesWithOffersInitially.length === 0 
                    ? "There are currently no candidates with offers extended. Prepare offers from the 'HM Hub'."
                    : "Try adjusting your filters or clear them to see all active offers."
                }
            </p>
          </div>
        </Card>
      ) : (
        filteredCandidatesWithOffers.map(candidate => {
          const requisition = allRequisitions.find(r => r.id === candidate.requisitionId);
          if (!requisition) {
            console.warn(`Requisition not found for candidate ${candidate.id} with requisitionId ${candidate.requisitionId}`);
            return (
              <Card key={candidate.id} title={`Error: Requisition for ${candidate.name} not found`} className="border-red-300">
                  <p className="text-red-600 p-4">Cannot display offer details as the associated requisition is missing.</p>
              </Card>
            );
          }
          return (
            <OfferCard
              key={candidate.id}
              candidate={candidate}
              requisition={requisition}
              onOfferAccepted={onOfferAccepted}
              onOfferDeclined={onOfferDeclined}
              onEditOffer={onEditOffer}
            />
          );
        })
      )}
    </div>
  );
};

export default OfferHubView;