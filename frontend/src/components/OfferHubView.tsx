import React, { useState, useMemo } from 'react';
import { CandidateStage } from '../types';
import OfferCard from './OfferCard';
import Card from './Card';
import { Delete as BackspaceIcon } from 'lucide-react';
import { useAppData } from '../contexts/AppDataContext';
import { useModalState } from '../contexts/ModalStateContext';

const OfferHubView: React.FC = () => {
  const {
    candidates: allCandidates,
    requisitions: allRequisitions,
    offerAccepted: onOfferAccepted,
    offerDeclined: onOfferDeclined,
    confirmJoined: onConfirmJoined,
  } = useAppData();
  const { openOfferModal: onEditOffer } = useModalState();
  const [offerSearchTerm, setOfferSearchTerm] = useState('');
  const [offerRequisitionFilter, setOfferRequisitionFilter] = useState('');
  const [activeTab, setActiveTab] = useState<'extended' | 'accepted'>('extended');

  const extendedCandidates = useMemo(
    () => allCandidates.filter(c => c.stage === CandidateStage.OFFER_EXTENDED && c.offerDetails),
    [allCandidates]
  );

  const acceptedCandidates = useMemo(
    () => allCandidates.filter(c => c.stage === CandidateStage.OFFER_ACCEPTED && c.offerDetails),
    [allCandidates]
  );

  const activeCandidates = activeTab === 'extended' ? extendedCandidates : acceptedCandidates;

  const uniqueRequisitionRolesWithOffers = useMemo(() => {
    const roles = new Set<string>();
    activeCandidates.forEach(candidate => {
      const req = allRequisitions.find(r => r.id === candidate.requisitionId);
      if (req) roles.add(req.role);
    });
    return Array.from(roles).sort();
  }, [activeCandidates, allRequisitions]);

  const filteredCandidates = useMemo(() => {
    return activeCandidates.filter(candidate => {
      const term = offerSearchTerm.toLowerCase();
      const matchesSearch = term === '' || candidate.name.toLowerCase().includes(term) || candidate.email.toLowerCase().includes(term);
      let matchesRequisition = true;
      if (offerRequisitionFilter !== '') {
        const req = allRequisitions.find(r => r.id === candidate.requisitionId);
        matchesRequisition = req ? req.role === offerRequisitionFilter : false;
      }
      return matchesSearch && matchesRequisition;
    });
  }, [activeCandidates, offerSearchTerm, offerRequisitionFilter, allRequisitions]);

  const handleClearOfferFilters = () => {
    setOfferSearchTerm('');
    setOfferRequisitionFilter('');
  };

  const inputClass = "mt-1 block w-full px-3 py-1.5 bg-white border border-slate-200 text-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 sm:text-xs text-xs placeholder:text-slate-400";
  const labelClass = "block text-[10px] font-bold text-slate-400 uppercase tracking-widest";

  return (
    <div className="space-y-6">
      <div className="pb-5 border-b border-slate-200">
        <h1 className="text-2xl font-bold leading-6 text-slate-900 font-display tracking-tight sm:truncate">Manage Candidate Offers</h1>
        <p className="mt-2 text-sm text-slate-500">Review, update, or record decisions for candidates who have received offers.</p>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => { setActiveTab('extended'); setOfferRequisitionFilter(''); setOfferSearchTerm(''); }}
          className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border transition-all ${
            activeTab === 'extended'
              ? 'bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-200'
              : 'bg-white text-slate-500 border-slate-200 hover:border-blue-300 hover:text-blue-600'
          }`}
        >
          Offers Extended
          {extendedCandidates.length > 0 && (
            <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-white text-blue-700 text-[10px] font-bold">
              {extendedCandidates.length}
            </span>
          )}
        </button>
        <button
          onClick={() => { setActiveTab('accepted'); setOfferRequisitionFilter(''); setOfferSearchTerm(''); }}
          className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border transition-all ${
            activeTab === 'accepted'
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm shadow-emerald-200'
              : 'bg-white text-slate-500 border-slate-200 hover:border-emerald-300 hover:text-emerald-600'
          }`}
        >
          Awaiting Joining
          {acceptedCandidates.length > 0 && (
            <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-white text-emerald-700 text-[10px] font-bold">
              {acceptedCandidates.length}
            </span>
          )}
        </button>
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
            className="w-full sm:w-auto flex items-center justify-center px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-medium text-slate-600 bg-white hover:bg-slate-50 transition-colors h-[2.25rem] mt-1 sm:mt-0"
            title="Clear offer filters"
          >
            <BackspaceIcon className="w-3.5 h-3.5 mr-1" /> Clear
          </button>
        </div>
      </Card>

      {filteredCandidates.length === 0 ? (
        <Card className="shadow-xl">
          <div className="p-8 text-center">
            <svg className="mx-auto h-12 w-12 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5.586-1.414a1 1 0 00-1.414-1.414l-1.071 1.071-1.071-1.071a1 1 0 10-1.414 1.414l1.071 1.071-1.071 1.071a1 1 0 101.414 1.414l1.071-1.071 1.071 1.071a1 1 0 101.414-1.414L17.414 15l1.172-1.172a1 1 0 000-1.414l-1.172-1.172zM12 21a9 9 0 100-18 9 9 0 000 18z" />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-slate-800">
              {activeCandidates.length === 0
                ? activeTab === 'extended' ? 'No Active Offers' : 'No Accepted Offers'
                : 'No Offers Match Your Filters'}
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              {activeCandidates.length === 0
                ? activeTab === 'extended'
                  ? "There are currently no candidates with offers extended. Prepare offers from the 'HM Hub'."
                  : "No candidates have accepted their offer yet."
                : 'Try adjusting your filters or clear them to see all offers.'}
            </p>
          </div>
        </Card>
      ) : (
        filteredCandidates.map(candidate => {
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
              onConfirmJoined={activeTab === 'accepted' ? onConfirmJoined : undefined}
            />
          );
        })
      )}
    </div>
  );
};

export default OfferHubView;
