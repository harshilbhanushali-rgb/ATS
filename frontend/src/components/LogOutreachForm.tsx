import React, { useState, useEffect } from 'react';
import { Candidate, OutreachChannel } from '../types';

interface LogOutreachFormProps {
  candidate: Candidate;
  onSubmit: (
    candidateId: string, 
    channel: OutreachChannel, 
    outreachDate: string, 
    notes?: string,
    responded?: boolean, // New
    responseDate?: string, // New
    clickedLink?: boolean // New
  ) => void;
  onClose: () => void;
}

const LogOutreachForm: React.FC<LogOutreachFormProps> = ({ candidate, onSubmit, onClose }) => {
  const [channel, setChannel] = useState<OutreachChannel>(OutreachChannel.EMAIL);
  const [outreachDate, setOutreachDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState<string>('');
  const [responded, setResponded] = useState<boolean>(false);
  const [responseDate, setResponseDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [clickedLink, setClickedLink] = useState<boolean>(false);

  useEffect(() => {
    // If not responded, clear responseDate or disable it
    if (!responded) {
      setResponseDate(new Date().toISOString().split('T')[0]); // Reset or clear
    }
  }, [responded]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(
      candidate.id, 
      channel, 
      outreachDate, 
      notes,
      responded,
      responded ? responseDate : undefined, // Only pass responseDate if responded is true
      clickedLink
    );
  };

  const inputClass = "mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm";
  const labelClass = "block text-sm font-medium text-gray-700";
  const checkboxLabelClass = "flex items-center text-sm font-medium text-gray-700";
  const checkboxClass = "h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500";
  const requiredSpan = <span className="text-red-500">*</span>;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="channel" className={labelClass}>Outreach Channel {requiredSpan}</label>
        <select
          id="channel"
          name="channel"
          value={channel}
          onChange={(e) => setChannel(e.target.value as OutreachChannel)}
          className={inputClass}
          required
        >
          {Object.values(OutreachChannel).map((ch) => (
            <option key={ch} value={ch}>
              {ch}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="outreachDate" className={labelClass}>Outreach Date {requiredSpan}</label>
        <input
          type="date"
          id="outreachDate"
          name="outreachDate"
          value={outreachDate}
          onChange={(e) => setOutreachDate(e.target.value)}
          className={inputClass}
          required
        />
      </div>

      <div className="space-y-2">
        <div className={checkboxLabelClass}>
          <input
            type="checkbox"
            id="responded"
            name="responded"
            checked={responded}
            onChange={(e) => setResponded(e.target.checked)}
            className={checkboxClass}
          />
          <span className="ml-2">Candidate Responded?</span>
        </div>

        {responded && (
          <div>
            <label htmlFor="responseDate" className={`${labelClass} ml-6`}>Response Date {requiredSpan}</label>
            <input
              type="date"
              id="responseDate"
              name="responseDate"
              value={responseDate}
              onChange={(e) => setResponseDate(e.target.value)}
              className={`${inputClass} ml-6 w-[calc(100%-1.5rem)]`} 
              required={responded}
            />
          </div>
        )}
      </div>
      
      <div className={checkboxLabelClass}>
        <input
          type="checkbox"
          id="clickedLink"
          name="clickedLink"
          checked={clickedLink}
          onChange={(e) => setClickedLink(e.target.checked)}
          className={checkboxClass}
        />
        <span className="ml-2">Candidate Clicked Link in Outreach? (Manual Tracking)</span>
      </div>


      <div>
        <label htmlFor="notes" className={labelClass}>Notes (Optional)</label>
        <textarea
          id="notes"
          name="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className={inputClass}
          placeholder="e.g., Sent InMail about role X, candidate replied showing interest."
        />
      </div>

      <div className="pt-5 border-t border-gray-200 mt-8">
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Log Outreach
          </button>
        </div>
      </div>
    </form>
  );
};

export default LogOutreachForm;