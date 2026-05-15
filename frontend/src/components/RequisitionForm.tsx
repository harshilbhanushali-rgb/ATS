
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Requisition, Priority, HireType, RequisitionStatus, Location, FunctionArea, NewOrBackfill, AISuggestion, Cost, UserRole } from '../types';
import { getAIPrioritySuggestion, getAISuggestionsForRequisition, extractTextFromFile } from '../services/aiApi';
import { Sparkles as SparklesIcon, Upload as ArrowUpTrayIcon } from 'lucide-react';

interface RequisitionFormProps {
  onSubmit: (requisition: Requisition) => void;
  initialData?: Requisition | null;
  onClose: () => void;
  currentUserRole: UserRole;
}

const emptyRequisitionState = {
    priority: Priority.P1,
    role: '',
    hireType: HireType.FULL_TIME,
    costAmount: '',
    costCurrency: 'USD' as 'INR' | 'USD',
    reqStatus: RequisitionStatus.OPEN,
    location: Location.US,
    function: FunctionArea.ENGINEERING,
    newOrBackfill: NewOrBackfill.NEW,
    hiringManagerName: '',
    functionHeadName: '',
    assignedRecruiterName: '',
    jobDescription: '',
    backfillEmployeeName: '',
    backfillPreviousSalary: ''
  };


const RequisitionForm: React.FC<RequisitionFormProps> = ({ onSubmit, initialData, onClose, currentUserRole }) => {
  const [formData, setFormData] = useState(emptyRequisitionState);
  const [aiSuggestions, setAiSuggestions] = useState<AISuggestion[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isExtractingJd, setIsExtractingJd] = useState(false);
  const jdFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        costAmount: initialData.cost.amount.toString(),
        costCurrency: initialData.cost.currency,
        jobDescription: initialData.jobDescription || '',
        backfillEmployeeName: initialData.backfillDetails?.employeeName || '',
        backfillPreviousSalary: initialData.backfillDetails?.previousSalary?.toString() || ''
      });
    } else {
      setFormData(emptyRequisitionState);
    }
    setAiSuggestions([]);
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleJdFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
        return;
    }

    const file = e.target.files[0];
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert("File is too large. Please upload a file smaller than 5MB.");
        return;
    }

    setIsExtractingJd(true);
    setFormData(prev => ({ ...prev, jobDescription: 'AI is extracting text from the Job Description file... Please wait.' }));

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = async () => {
        try {
            const base64String = reader.result?.toString().split(',')[1];
            if (!base64String) {
                throw new Error("Could not read file data.");
            }
            const extractedText = await extractTextFromFile(base64String, file.type);
            setFormData(prev => ({ ...prev, jobDescription: extractedText }));
        } catch (error) {
            console.error("Error during JD file extraction:", error);
            const errorMessage = `Failed to extract text. Error: ${(error as Error).message}`;
            setFormData(prev => ({ ...prev, jobDescription: errorMessage }));
            alert(errorMessage);
        } finally {
            setIsExtractingJd(false);
            if (jdFileInputRef.current) {
                jdFileInputRef.current.value = "";
            }
        }
    };
    reader.onerror = () => {
        setIsExtractingJd(false);
        const errorMessage = "Error reading the file.";
        setFormData(prev => ({ ...prev, jobDescription: errorMessage }));
        alert(errorMessage);
        if (jdFileInputRef.current) {
            jdFileInputRef.current.value = "";
        }
    };
  };

  const canUseAIPrioritySuggestion = currentUserRole === UserRole.ADMIN || currentUserRole === UserRole.LEAD_RECRUITER;

  const handleSuggestPriority = useCallback(async () => {
    if (!canUseAIPrioritySuggestion) {
        alert("You do not have permission to use AI Priority Suggestion.");
        return;
    }
    if (!formData.role || !formData.function) {
      alert("Please enter Role and Function to get an AI priority suggestion.");
      return;
    }
    setIsAiLoading(true);
    setAiSuggestions([{ field: 'priority', suggestion: 'Fetching AI priority suggestion...', reasoning: 'Please wait.'}]);
    try {
      const suggestedPriority = await getAIPrioritySuggestion(formData.role, formData.function);
      setFormData(prev => ({ ...prev, priority: suggestedPriority }));
      setAiSuggestions([{ field: 'priority', suggestion: `AI suggested priority: ${suggestedPriority} based on Role and Function.`}]);
    } catch (error) {
      console.error("Error fetching AI priority suggestion:", error);
      setAiSuggestions([{field: 'general', suggestion: "Failed to get AI priority suggestion."}]);
    } finally {
      setIsAiLoading(false);
    }
  }, [formData.role, formData.function, canUseAIPrioritySuggestion]);
  
  const handleFullAISuggestion = useCallback(async () => {
    setIsAiLoading(true);
    setAiSuggestions([{ field: 'general', suggestion: 'Fetching AI insights for the requisition...', reasoning: 'Please wait.'}]);
    const partialReq: Partial<Requisition> = {
        role: formData.role,
        function: formData.function,
        priority: formData.priority,
        hireType: formData.hireType,
        location: formData.location,
        cost: { amount: parseFloat(formData.costAmount) || 0, currency: formData.costCurrency },
        jobDescription: formData.jobDescription
    };
    try {
        const suggestions = await getAISuggestionsForRequisition(partialReq);
        setAiSuggestions(suggestions);
    } catch (error) {
        console.error("Error fetching AI suggestions:", error);
        setAiSuggestions([{field: 'general', suggestion: "Failed to get full AI suggestions."}]);
    } finally {
        setIsAiLoading(false);
    }
  }, [formData]);


  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const cost: Cost = {
        amount: parseFloat(formData.costAmount),
        currency: formData.costCurrency
    };

    if (isNaN(cost.amount) || cost.amount <=0) {
        alert("Please enter a valid cost amount.");
        return;
    }

    const requisitionToSubmit: Omit<Requisition, 'id' | 'reqApprovalDate'> = {
      priority: formData.priority,
      role: formData.role,
      hireType: formData.hireType,
      cost: cost,
      reqStatus: formData.reqStatus,
      location: formData.location,
      function: formData.function,
      newOrBackfill: formData.newOrBackfill,
      hiringManagerName: formData.hiringManagerName,
      functionHeadName: formData.functionHeadName,
      assignedRecruiterName: formData.assignedRecruiterName,
      jobDescription: formData.jobDescription,
    };

    if (formData.newOrBackfill === NewOrBackfill.BACKFILL) {
      requisitionToSubmit.backfillDetails = {
        employeeName: formData.backfillEmployeeName || '',
      };
      if (formData.backfillPreviousSalary) {
          const prevSalary = parseFloat(formData.backfillPreviousSalary);
          if (!isNaN(prevSalary) && prevSalary > 0) {
            requisitionToSubmit.backfillDetails.previousSalary = prevSalary;
          }
      }
      if (!requisitionToSubmit.backfillDetails.employeeName) {
        alert("Please enter backfill employee name.");
        return;
      }
    }
    
    const finalRequisition: Requisition = {
        ...requisitionToSubmit,
        id: initialData?.id || `REQ-${Date.now().toString().slice(-6)}`,
        reqApprovalDate: initialData?.reqApprovalDate || new Date().toISOString(),
    };

    onSubmit(finalRequisition);
  };

  const inputClass = "mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-50";
  const labelClass = "block text-sm font-medium text-gray-700";
  const requiredSpan = <span className="text-red-500">*</span>;

  const isArchived = initialData?.reqStatus === RequisitionStatus.ARCHIVED;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {isArchived && (
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl px-4 py-3 text-sm font-medium">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5 shrink-0">
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
          </svg>
          This requisition is archived and cannot be edited.
        </div>
      )}
      <fieldset disabled={isArchived} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
        <div>
          <label htmlFor="role" className={labelClass}>Role {requiredSpan}</label>
          <input type="text" name="role" id="role" value={formData.role} onChange={handleChange} className={inputClass} required />
        </div>
        <div>
          <label htmlFor="function" className={labelClass}>Function {requiredSpan}</label>
          <select name="function" id="function" value={formData.function} onChange={handleChange} className={inputClass} required>
            {Object.values(FunctionArea).map(area => <option key={area} value={area}>{area}</option>)}
          </select>
        </div>
      
        <div>
            <label htmlFor="priority" className={labelClass}>Priority {requiredSpan}</label>
            <select name="priority" id="priority" value={formData.priority} onChange={handleChange} className={inputClass} required>
                {Object.values(Priority).map(p => <option key={p} value={p}>{p}</option>)}
            </select>
        </div>
         <div className="self-end">
            <button 
                type="button" 
                onClick={handleSuggestPriority} 
                disabled={isAiLoading || !formData.role || !formData.function || !canUseAIPrioritySuggestion}
                className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed h-[2.375rem] mt-1"
                title={!canUseAIPrioritySuggestion ? "This feature is available for Admin or Lead Recruiter roles." : "Suggest priority based on role and function using AI"}
            >
                <SparklesIcon className="w-5 h-5 mr-2" />
                {isAiLoading && aiSuggestions.some(s=>s.field==='priority') ? 'Suggesting...' : 'AI Suggest Priority'}
            </button>
            {!canUseAIPrioritySuggestion && (
                 <p className="text-xs text-yellow-600 mt-1">Admin/Lead Recruiter role required for AI Priority Suggestion.</p>
            )}
        </div>
      
        <div>
          <label htmlFor="hireType" className={labelClass}>Hire Type {requiredSpan}</label>
          <select name="hireType" id="hireType" value={formData.hireType} onChange={handleChange} className={inputClass} required>
            {Object.values(HireType).map(type => <option key={type} value={type}>{type}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-2">
            <div>
                <label htmlFor="costAmount" className={labelClass}>Cost Amount {requiredSpan}</label>
                <input type="number" name="costAmount" id="costAmount" value={formData.costAmount} onChange={handleChange} className={inputClass} required min="0" step="any" placeholder="e.g., 50000" />
            </div>
            <div>
                <label htmlFor="costCurrency" className={labelClass}>Currency {requiredSpan}</label>
                <select name="costCurrency" id="costCurrency" value={formData.costCurrency} onChange={handleChange} className={inputClass} required>
                    <option value="USD">USD</option>
                    <option value="INR">INR</option>
                </select>
            </div>
        </div>

        <div>
          <label htmlFor="reqStatus" className={labelClass}>Requisition Status {requiredSpan}</label>
          <select name="reqStatus" id="reqStatus" value={formData.reqStatus} onChange={handleChange} className={inputClass} required>
            {Object.values(RequisitionStatus).map(status => <option key={status} value={status}>{status}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="location" className={labelClass}>Location {requiredSpan}</label>
          <select name="location" id="location" value={formData.location} onChange={handleChange} className={inputClass} required>
            {Object.values(Location).map(loc => <option key={loc} value={loc}>{loc}</option>)}
          </select>
        </div>
      
        <div>
          <label htmlFor="newOrBackfill" className={labelClass}>New/Backfill {requiredSpan}</label>
          <select name="newOrBackfill" id="newOrBackfill" value={formData.newOrBackfill} onChange={handleChange} className={inputClass} required>
            {Object.values(NewOrBackfill).map(val => <option key={val} value={val}>{val}</option>)}
          </select>
        </div>
        {formData.newOrBackfill === NewOrBackfill.BACKFILL ? (
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label htmlFor="backfillEmployeeName" className={labelClass}>Backfill Emp. Name {requiredSpan}</label>
              <input type="text" name="backfillEmployeeName" id="backfillEmployeeName" value={formData.backfillEmployeeName} onChange={handleChange} className={inputClass} required />
            </div>
            <div>
              <label htmlFor="backfillPreviousSalary" className={labelClass}>Prev. Salary (Optional)</label>
              <input type="number" name="backfillPreviousSalary" id="backfillPreviousSalary" value={formData.backfillPreviousSalary} onChange={handleChange} className={inputClass} min="0" step="any" placeholder="e.g., 45000"/>
            </div>
          </div>
        ) : <div /> /* Placeholder for grid alignment */}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
        <div>
          <label htmlFor="hiringManagerName" className={labelClass}>Hiring Manager {requiredSpan}</label>
          <input type="text" name="hiringManagerName" id="hiringManagerName" value={formData.hiringManagerName} onChange={handleChange} className={inputClass} required />
        </div>
        <div>
          <label htmlFor="functionHeadName" className={labelClass}>Function Head {requiredSpan}</label>
          <input type="text" name="functionHeadName" id="functionHeadName" value={formData.functionHeadName} onChange={handleChange} className={inputClass} required />
        </div>
        <div>
          <label htmlFor="assignedRecruiterName" className={labelClass}>Assigned Recruiter {requiredSpan}</label>
          <input type="text" name="assignedRecruiterName" id="assignedRecruiterName" value={formData.assignedRecruiterName} onChange={handleChange} className={inputClass} required />
        </div>
      </div>
       
      <div className="col-span-1 md:col-span-2">
        <div className="flex justify-between items-center mb-1">
            <label htmlFor="jobDescription" className={labelClass}>Job Description (Used for AI Features)</label>
            <input 
                type="file" 
                ref={jdFileInputRef} 
                onChange={handleJdFileChange} 
                className="hidden" 
                accept=".pdf,.doc,.docx,.txt"
                disabled={isExtractingJd}
            />
            <button
                type="button"
                onClick={() => jdFileInputRef.current?.click()}
                disabled={isExtractingJd}
                className="flex items-center text-xs text-indigo-600 hover:text-indigo-800 font-medium py-1 px-2 rounded-md hover:bg-indigo-50 transition-colors disabled:opacity-50 disabled:cursor-wait"
            >
                {isExtractingJd ? (
                    <>
                        <SparklesIcon className="w-4 h-4 mr-1.5 animate-spin" />
                        Extracting...
                    </>
                ) : (
                    <>
                        <ArrowUpTrayIcon className="w-4 h-4 mr-1.5" />
                        Upload JD & Extract Text
                    </>
                )}
            </button>
        </div>
        <textarea
            name="jobDescription"
            id="jobDescription"
            value={formData.jobDescription}
            onChange={handleChange}
            rows={6}
            className={`${inputClass} min-h-[100px]`}
            placeholder="Upload a JD file or paste the full job description here."
            disabled={isExtractingJd}
        />
      </div>
      
      <div className="mt-6">
            <button type="button" onClick={handleFullAISuggestion} disabled={isAiLoading || !formData.role}
                className="w-full flex items-center justify-center px-4 py-2.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50 disabled:cursor-not-allowed">
                <SparklesIcon className="w-5 h-5 mr-2" />
                {isAiLoading && aiSuggestions.some(s=>s.field==='general') ? 'Getting AI Insights...' : 'Get AI Insights for this Requisition'}
            </button>
      </div>

      {aiSuggestions.length > 0 && (
        <div className="mt-6 p-4 bg-indigo-50 border border-indigo-200 rounded-md shadow">
          <h4 className="text-md font-semibold text-indigo-800 mb-3 flex items-center">
            <SparklesIcon className="w-5 h-5 mr-2 text-indigo-600" />
            AI Suggestions
          </h4>
          <ul className="space-y-2">
            {aiSuggestions.map((s, i) => (
              <li key={i} className="text-sm text-indigo-700 bg-indigo-100 p-2 rounded">
                <strong className="capitalize">{s.field === 'general' ? 'General Note' : s.field}:</strong> {s.suggestion}
                {s.reasoning && <span className="text-xs block text-indigo-500 italic mt-1">- {s.reasoning}</span>}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="pt-5 border-t border-gray-200 mt-8">
        <div className="flex justify-end space-x-3">
          <button type="button" onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors">
            Cancel
          </button>
          <button type="submit"
            disabled={isArchived}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
            {initialData ? 'Update Requisition' : 'Create Requisition'}
          </button>
        </div>
      </div>
      </fieldset>
    </form>
  );
};

export default RequisitionForm;
