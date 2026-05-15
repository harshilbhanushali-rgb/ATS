import React, { useState, useEffect } from 'react';
import { Candidate, Requisition, OfferDetails, Cost } from '../types';

interface OfferFormProps {
  onSubmit: (candidateId: string, offerDetails: OfferDetails) => void;
  candidate: Candidate;
  requisition: Requisition;
  onClose: () => void;
}

const OfferForm: React.FC<OfferFormProps> = ({ onSubmit, candidate, requisition, onClose }) => {
  const [formData, setFormData] = useState<Omit<OfferDetails, 'salary'> & { salaryAmount: string; salaryCurrency: 'INR' | 'USD' }>({
    salaryAmount: candidate.offerDetails?.salary?.amount.toString() || '',
    salaryCurrency: candidate.offerDetails?.salary?.currency || 'USD',
    startDate: candidate.offerDetails?.startDate ? candidate.offerDetails.startDate.split('T')[0] : new Date().toISOString().split('T')[0],
    offerLetterUrl: candidate.offerDetails?.offerLetterUrl || '',
    offerNotes: candidate.offerDetails?.offerNotes || '',
  });

  useEffect(() => {
    // If candidate or their offerDetails change, update form.
    // This is useful if "Edit Offer" reopens this form.
    setFormData({
        salaryAmount: candidate.offerDetails?.salary?.amount.toString() || '',
        salaryCurrency: candidate.offerDetails?.salary?.currency || (requisition.cost.currency || 'USD'), // Default to requisition currency
        startDate: candidate.offerDetails?.startDate ? candidate.offerDetails.startDate.split('T')[0] : new Date().toISOString().split('T')[0],
        offerLetterUrl: candidate.offerDetails?.offerLetterUrl || '',
        offerNotes: candidate.offerDetails?.offerNotes || '',
    });
  }, [candidate, requisition]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const salary: Cost = {
        amount: parseFloat(formData.salaryAmount),
        currency: formData.salaryCurrency
    };

    if (isNaN(salary.amount) || salary.amount <= 0) {
        alert("Please enter a valid salary amount.");
        return;
    }
    if (!formData.startDate) {
        alert("Please select a start date.");
        return;
    }

    const offerDetailsToSubmit: OfferDetails = {
      salary,
      startDate: new Date(formData.startDate).toISOString(),
      offerLetterUrl: formData.offerLetterUrl,
      offerNotes: formData.offerNotes,
    };
    
    onSubmit(candidate.id, offerDetailsToSubmit);
  };

  const inputClass = "mt-1 block w-full px-3 py-2 bg-white border border-slate-200 text-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 sm:text-sm placeholder:text-slate-400";
  const labelClass = "block text-[10px] font-bold text-slate-400 uppercase tracking-widest";
  const requiredSpan = <span className="text-red-500">*</span>;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <p className="text-lg font-semibold text-blue-700">Prepare Offer for: {candidate.name}</p>
      <p className="text-sm text-slate-500 -mt-4">Requisition: {requisition.role} (Current Budget: {requisition.cost.amount.toLocaleString()} {requisition.cost.currency})</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
        <div className="grid grid-cols-2 gap-2">
            <div>
                <label htmlFor="salaryAmount" className={labelClass}>Proposed Salary {requiredSpan}</label>
                <input type="number" name="salaryAmount" id="salaryAmount" value={formData.salaryAmount} onChange={handleChange} className={inputClass} required min="0" step="any" placeholder="e.g., 60000" />
            </div>
            <div>
                <label htmlFor="salaryCurrency" className={labelClass}>Currency {requiredSpan}</label>
                <select name="salaryCurrency" id="salaryCurrency" value={formData.salaryCurrency} onChange={handleChange} className={inputClass} required>
                    <option value="USD">USD</option>
                    <option value="INR">INR</option>
                </select>
            </div>
        </div>

        <div>
          <label htmlFor="startDate" className={labelClass}>Proposed Start Date {requiredSpan}</label>
          <input type="date" name="startDate" id="startDate" value={formData.startDate} onChange={handleChange} className={inputClass} required />
        </div>
        
        <div className="md:col-span-2">
          <label htmlFor="offerLetterUrl" className={labelClass}>Offer Letter URL (Optional)</label>
          <input type="url" name="offerLetterUrl" id="offerLetterUrl" value={formData.offerLetterUrl} onChange={handleChange} className={inputClass} placeholder="https://link.to/offer_letter.pdf"/>
        </div>
        
        <div className="md:col-span-2">
          <label htmlFor="offerNotes" className={labelClass}>Internal Offer Notes (Optional)</label>
          <textarea name="offerNotes" id="offerNotes" value={formData.offerNotes} onChange={handleChange} rows={3} className={inputClass} placeholder="Any internal notes related to this offer, e.g., special conditions, negotiation points."></textarea>
        </div>
      </div>

      <div className="pt-5 border-t border-slate-100 mt-8">
        <div className="flex justify-end space-x-3">
          <button type="button" onClick={onClose}
            className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 bg-white hover:bg-slate-50 transition-colors">
            Cancel
          </button>
          <button type="submit"
            className="px-4 py-2 rounded-xl text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 shadow-sm shadow-blue-200 transition-colors">
            {candidate.offerDetails ? 'Update Offer' : 'Submit Offer to Candidate'}
          </button>
        </div>
      </div>
    </form>
  );
};

export default OfferForm;