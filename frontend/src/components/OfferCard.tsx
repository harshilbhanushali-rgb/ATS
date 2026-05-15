import React from 'react';
import { Candidate, Requisition } from '../types';
import Card from './Card';
import { Gift as GiftIcon, CheckCircle as CheckCircleIcon, XCircle as XCircleIcon, Pencil as PencilIcon } from 'lucide-react';

interface OfferCardProps {
  candidate: Candidate;
  requisition: Requisition;
  onOfferAccepted: (candidateId: string) => void;
  onOfferDeclined: (candidateId: string) => void;
  onEditOffer: (candidate: Candidate, requisition: Requisition) => void;
}

const OfferCard: React.FC<OfferCardProps> = ({ candidate, requisition, onOfferAccepted, onOfferDeclined, onEditOffer }) => {
  if (!candidate.offerDetails) {
    return (
        <Card title={`Error: Offer details missing for ${candidate.name}`} className="border-red-300">
            <p className="text-red-600 p-4">Cannot display offer card as offer details are not available for this candidate.</p>
        </Card>
    );
  }

  const { salary, startDate, offerLetterUrl, offerNotes } = candidate.offerDetails;

  return (
    <Card className="mb-6 shadow-lg border border-indigo-200 hover:shadow-xl transition-shadow duration-300 bg-white">
      <div className="p-5">
        <div className="flex flex-col sm:flex-row justify-between items-start mb-3">
          <div>
            <h3 className="text-xl font-semibold text-indigo-700">{candidate.name}</h3>
            <p className="text-sm text-gray-600">
              Applying for: <span className="font-medium">{requisition.role}</span> (ID: {requisition.id})
            </p>
            <p className="text-xs text-gray-500">Email: {candidate.email}</p>
          </div>
          <span className="mt-2 sm:mt-0 px-3 py-1 text-xs font-bold rounded-full bg-indigo-100 text-indigo-700 flex items-center">
            <GiftIcon className="w-4 h-4 mr-1.5" />
            {candidate.stage}
          </span>
        </div>

        <div className="mt-4 border-t pt-4">
          <h4 className="text-md font-semibold text-gray-800 mb-2">Offer Details:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <p><strong className="text-gray-600">Salary:</strong> {salary.amount.toLocaleString()} {salary.currency}</p>
            <p><strong className="text-gray-600">Start Date:</strong> {new Date(startDate).toLocaleDateString()}</p>
            {offerLetterUrl && (
              <p className="md:col-span-2"><strong className="text-gray-600">Offer Letter:</strong> <a href={offerLetterUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">View Document</a></p>
            )}
            {offerNotes && (
              <p className="md:col-span-2 mt-1 p-2 bg-gray-50 rounded text-gray-700 border border-gray-200">
                <strong className="text-gray-600">Internal Notes:</strong> {offerNotes}
              </p>
            )}
          </div>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
          <button
            onClick={() => onOfferAccepted(candidate.id)}
            className="flex items-center justify-center px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-md shadow-sm hover:shadow-md transition-colors text-sm"
            aria-label={`Mark offer for ${candidate.name} as accepted`}
          >
            <CheckCircleIcon className="w-5 h-5 mr-2" />
            Mark Accepted
          </button>
          <button
            onClick={() => onOfferDeclined(candidate.id)}
            className="flex items-center justify-center px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-md shadow-sm hover:shadow-md transition-colors text-sm"
            aria-label={`Mark offer for ${candidate.name} as declined`}
          >
            <XCircleIcon className="w-5 h-5 mr-2" />
            Mark Declined
          </button>
          <button
            onClick={() => onEditOffer(candidate, requisition)}
            className="flex items-center justify-center px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded-md shadow-sm hover:shadow-md transition-colors text-sm"
            aria-label={`Edit offer for ${candidate.name}`}
          >
            <PencilIcon className="w-4 h-4 mr-2" /> {/* Adjusted size for consistency */}
            Edit Offer
          </button>
        </div>
      </div>
    </Card>
  );
};

export default OfferCard;