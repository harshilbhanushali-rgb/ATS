import React from 'react';
import { Candidate, Requisition } from '../types';
import Card from './Card';
import { Gift as GiftIcon, CheckCircle as CheckCircleIcon, XCircle as XCircleIcon, Pencil as PencilIcon, UserCheck as UserCheckIcon } from 'lucide-react';

interface OfferCardProps {
  candidate: Candidate;
  requisition: Requisition;
  onOfferAccepted: (candidateId: string) => void;
  onOfferDeclined: (candidateId: string) => void;
  onEditOffer: (candidate: Candidate, requisition: Requisition) => void;
  onConfirmJoined?: (candidateId: string) => void;
}

const OfferCard: React.FC<OfferCardProps> = ({ candidate, requisition, onOfferAccepted, onOfferDeclined, onEditOffer, onConfirmJoined }) => {
  if (!candidate.offerDetails) {
    return (
        <Card title={`Error: Offer details missing for ${candidate.name}`} className="border-red-300">
            <p className="text-red-600 p-4">Cannot display offer card as offer details are not available for this candidate.</p>
        </Card>
    );
  }

  const { salary, startDate, offerLetterUrl, offerNotes } = candidate.offerDetails;

  return (
    <Card className="mb-6 border-blue-200 hover:border-blue-300 transition-all duration-300">
      <div className="p-5">
        <div className="flex flex-col sm:flex-row justify-between items-start mb-3">
          <div>
            <h3 className="text-xl font-semibold text-slate-900 font-display">{candidate.name}</h3>
            <p className="text-sm text-slate-500">
              Applying for: <span className="font-medium text-slate-700">{requisition.role}</span> (ID: {requisition.id})
            </p>
            <p className="text-xs text-slate-400">Email: {candidate.email}</p>
          </div>
          <span className="mt-2 sm:mt-0 px-3 py-1 text-xs font-bold rounded-full bg-blue-50 text-blue-700 border border-blue-200 flex items-center">
            <GiftIcon className="w-4 h-4 mr-1.5" />
            {candidate.stage}
          </span>
        </div>

        <div className="mt-4 border-t border-slate-100 pt-4">
          <h4 className="text-md font-semibold text-slate-500 mb-2">Offer Details:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 text-sm text-slate-700">
            <p><strong className="text-slate-400">Salary:</strong> {salary.amount.toLocaleString()} {salary.currency}</p>
            <p><strong className="text-slate-400">Start Date:</strong> {new Date(startDate).toLocaleDateString()}</p>
            {offerLetterUrl && (
              <p className="md:col-span-2"><strong className="text-slate-400">Offer Letter:</strong> <a href={offerLetterUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 hover:underline">View Document</a></p>
            )}
            {offerNotes && (
              <p className="md:col-span-2 mt-1 p-2 bg-slate-50 rounded-xl text-slate-700 border border-slate-200">
                <strong className="text-slate-400">Internal Notes:</strong> {offerNotes}
              </p>
            )}
          </div>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
          {onConfirmJoined ? (
            <button
              onClick={() => onConfirmJoined(candidate.id)}
              className="flex items-center justify-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow-sm shadow-emerald-200 transition-all text-sm"
              aria-label={`Confirm ${candidate.name} has joined`}
            >
              <UserCheckIcon className="w-5 h-5 mr-2" />
              Confirm Joined
            </button>
          ) : (
            <>
              <button
                onClick={() => onOfferAccepted(candidate.id)}
                className="flex items-center justify-center px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold rounded-xl border border-emerald-200 transition-all text-sm"
                aria-label={`Mark offer for ${candidate.name} as accepted`}
              >
                <CheckCircleIcon className="w-5 h-5 mr-2" />
                Mark Accepted
              </button>
              <button
                onClick={() => onOfferDeclined(candidate.id)}
                className="flex items-center justify-center px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold rounded-xl border border-rose-200 transition-all text-sm"
                aria-label={`Mark offer for ${candidate.name} as declined`}
              >
                <XCircleIcon className="w-5 h-5 mr-2" />
                Mark Declined
              </button>
              <button
                onClick={() => onEditOffer(candidate, requisition)}
                className="flex items-center justify-center px-4 py-2 bg-white hover:bg-slate-50 text-slate-600 font-semibold rounded-xl border border-slate-200 transition-all text-sm"
                aria-label={`Edit offer for ${candidate.name}`}
              >
                <PencilIcon className="w-4 h-4 mr-2" />
                Edit Offer
              </button>
            </>
          )}
        </div>
      </div>
    </Card>
  );
};

export default OfferCard;