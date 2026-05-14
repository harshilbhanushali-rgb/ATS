import React, { useState, useEffect, useRef } from 'react';
import { Candidate, CandidateStage, CandidateSource, Requisition } from '../types';
import { extractTextFromFile } from '../services/aiApi';
import ArrowUpTrayIcon from './icons/ArrowUpTrayIcon';
import SparklesIcon from './icons/SparklesIcon';

interface CandidateFormProps {
  onSubmit: (candidate: Candidate, defaultTalentPoolId?: string) => void;
  initialData?: Candidate | null;
  requisitions: Requisition[]; // To select a requisition for the candidate
  defaultRequisitionId?: string | null; // Pre-select requisition if provided
  defaultTalentPoolId?: string | null; // Pre-select talent pool if adding from specific pool context
  onClose: () => void;
}

const emptyCandidateState = (requisitionId?: string | null) => ({
  name: '',
  email: '',
  phone: '',
  applicationDate: new Date().toISOString().split('T')[0], // Default to today
  stage: CandidateStage.APPLIED,
  source: CandidateSource.OTHER,
  requisitionId: requisitionId || '',
  resumeUrl: '',
  resumeText: '', // Added resumeText
  notes: ''
});

const CandidateForm: React.FC<CandidateFormProps> = ({ onSubmit, initialData, requisitions, defaultRequisitionId, defaultTalentPoolId, onClose }) => {
  const [formData, setFormData] = useState(emptyCandidateState(defaultRequisitionId));
  const [isExtracting, setIsExtracting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        email: initialData.email,
        phone: initialData.phone || '',
        applicationDate: initialData.applicationDate.split('T')[0],
        stage: initialData.stage,
        source: initialData.source,
        requisitionId: initialData.requisitionId || '',
        resumeUrl: initialData.resumeUrl || '',
        resumeText: initialData.resumeText || '', // Load resumeText
        notes: initialData.notes || '',
      });
    } else {
      const isNewForPool = defaultTalentPoolId && !defaultRequisitionId;
      setFormData({
        ...emptyCandidateState(defaultRequisitionId),
        stage: isNewForPool ? CandidateStage.POOLED : CandidateStage.APPLIED,
      });
    }
  }, [initialData, defaultRequisitionId, defaultTalentPoolId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
        return;
    }

    const file = e.target.files[0];
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
        alert("File is too large. Please upload a file smaller than 10MB.");
        return;
    }

    setIsExtracting(true);
    setFormData(prev => ({...prev, resumeText: 'AI is extracting text from CV... Please wait.'}));

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = async () => {
        try {
            const base64String = reader.result?.toString().split(',')[1];
            if (!base64String) {
                throw new Error("Could not read file data.");
            }
            const extractedText = await extractTextFromFile(base64String, file.type);
            setFormData(prev => ({ ...prev, resumeText: extractedText }));
        } catch (error) {
            console.error("Error during file extraction:", error);
            const errorMessage = `Failed to extract text. Error: ${(error as Error).message}`;
            setFormData(prev => ({ ...prev, resumeText: errorMessage }));
            alert(errorMessage);
        } finally {
            setIsExtracting(false);
            if(fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };
    reader.onerror = () => {
        setIsExtracting(false);
        const errorMessage = "Error reading the file.";
        setFormData(prev => ({...prev, resumeText: errorMessage}));
        alert(errorMessage);
        if(fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const isNewForPool = defaultTalentPoolId && !initialData;
    if (!formData.requisitionId && !isNewForPool) {
        alert("Please select a Requisition for this candidate.");
        return;
    }
    const candidateToSubmit: Omit<Candidate, 'id'> = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      applicationDate: new Date(formData.applicationDate).toISOString(),
      stage: formData.stage,
      source: formData.source,
      requisitionId: formData.requisitionId,
      resumeUrl: formData.resumeUrl,
      resumeText: formData.resumeText, // Save resumeText
      notes: formData.notes,
    };
    
    const finalCandidate: Candidate = {
        ...candidateToSubmit,
        id: initialData?.id || `CAND-${Date.now().toString().slice(-6)}`,
    };

    onSubmit(finalCandidate, defaultTalentPoolId);
  };

  const inputClass = "mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-100";
  const labelClass = "block text-sm font-medium text-gray-700";
  const requiredSpan = <span className="text-red-500">*</span>;
  const isNewForPool = defaultTalentPoolId && !initialData;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
        <div>
          <label htmlFor="name" className={labelClass}>Full Name {requiredSpan}</label>
          <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} className={inputClass} required />
        </div>
        <div>
          <label htmlFor="email" className={labelClass}>Email Address {requiredSpan}</label>
          <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} className={inputClass} required />
        </div>
        <div>
          <label htmlFor="phone" className={labelClass}>Phone (Optional)</label>
          <input type="tel" name="phone" id="phone" value={formData.phone} onChange={handleChange} className={inputClass} />
        </div>
        <div>
          <label htmlFor="applicationDate" className={labelClass}>Application Date {requiredSpan}</label>
          <input type="date" name="applicationDate" id="applicationDate" value={formData.applicationDate} onChange={handleChange} className={inputClass} required />
        </div>
        <div>
          <label htmlFor="stage" className={labelClass}>Current Stage {requiredSpan}</label>
          <select name="stage" id="stage" value={formData.stage} onChange={handleChange} className={inputClass} required>
            {Object.values(CandidateStage).map(stage => <option key={stage} value={stage}>{stage}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="source" className={labelClass}>Source {requiredSpan}</label>
          <select name="source" id="source" value={formData.source} onChange={handleChange} className={inputClass} required>
            {Object.values(CandidateSource).map(source => <option key={source} value={source}>{source}</option>)}
          </select>
        </div>
        <div className="md:col-span-2">
          <label htmlFor="requisitionId" className={labelClass}>Associated Requisition {!isNewForPool && requiredSpan}</label>
          <select 
            name="requisitionId" 
            id="requisitionId" 
            value={formData.requisitionId} 
            onChange={handleChange} 
            className={inputClass} 
            required={!isNewForPool}
            disabled={!!defaultRequisitionId && !!initialData && !defaultTalentPoolId}
          >
            <option value="">{isNewForPool ? 'Talent Pool Only (No Requisition)' : 'Select Requisition'}</option>
            {requisitions.map(req => <option key={req.id} value={req.id}>{req.role} (ID: {req.id})</option>)}
          </select>
           {defaultTalentPoolId && <p className="text-xs text-gray-500 mt-1">This candidate will be added to the selected Talent Pool.</p>}
        </div>
        <div className="md:col-span-2">
          <label htmlFor="resumeUrl" className={labelClass}>Resume URL (Optional)</label>
          <input type="url" name="resumeUrl" id="resumeUrl" value={formData.resumeUrl} onChange={handleChange} className={inputClass} placeholder="https://example.com/resume.pdf"/>
        </div>
        <div className="md:col-span-2">
          <div className="flex justify-between items-center">
            <label htmlFor="resumeText" className={labelClass}>Resume Text (from upload or paste)</label>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              className="hidden" 
              accept=".pdf,.doc,.docx,.txt"
              disabled={isExtracting}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isExtracting}
              className="flex items-center text-xs text-indigo-600 hover:text-indigo-800 font-medium py-1 px-2 rounded-md hover:bg-indigo-50 transition-colors disabled:opacity-50 disabled:cursor-wait"
            >
              {isExtracting ? (
                <>
                  <SparklesIcon className="w-4 h-4 mr-1.5 animate-spin" />
                  Extracting...
                </>
              ) : (
                <>
                  <ArrowUpTrayIcon className="w-4 h-4 mr-1.5" />
                  Upload CV & Extract Text
                </>
              )}
            </button>
          </div>
          <textarea name="resumeText" id="resumeText" value={formData.resumeText} onChange={handleChange} rows={8} className={inputClass} placeholder="Upload a CV or paste the full text of the candidate's resume here." disabled={isExtracting}></textarea>
        </div>
        <div className="md:col-span-2">
          <label htmlFor="notes" className={labelClass}>Notes (Optional)</label>
          <textarea name="notes" id="notes" value={formData.notes} onChange={handleChange} rows={3} className={inputClass} placeholder="Any notes about the candidate, communication logs, etc."></textarea>
        </div>
      </div>

      <div className="pt-5 border-t border-gray-200 mt-8">
        <div className="flex justify-end space-x-3">
          <button type="button" onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors">
            Cancel
          </button>
          <button type="submit"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors">
            {initialData ? 'Update Candidate' : 'Add Candidate'}
          </button>
        </div>
      </div>
    </form>
  );
};

export default CandidateForm;
