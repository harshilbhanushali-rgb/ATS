import React, { useState, useEffect, useCallback } from 'react';
import { Interview, InterviewRound, InterviewDecision, Candidate, Requisition, InterviewScorecardTemplate, InterviewScorecardResult } from '../types';
 

interface InterviewFormProps {
  onSubmit: (interview: Interview) => void;
  candidate: Candidate;
  requisition: Requisition; 
  existingInterviews: Interview[]; 
  scorecardTemplates: InterviewScorecardTemplate[];
  onClose: () => void;
}

const InterviewForm: React.FC<InterviewFormProps> = ({ onSubmit, candidate, requisition, existingInterviews, scorecardTemplates, onClose }) => {
  
  const getNextInterviewRound = useCallback((): InterviewRound => {
    const candidateInterviews = existingInterviews
        .filter(i => i.candidateId === candidate.id && i.requisitionId === requisition.id)
        .sort((a,b) => new Date(b.interviewDate).getTime() - new Date(a.interviewDate).getTime());

    if (candidateInterviews.length === 0) return InterviewRound.ROUND_1;

    const lastInterview = candidateInterviews[0];
    if (lastInterview.round === InterviewRound.ROUND_1) return InterviewRound.ROUND_2;
    if (lastInterview.round === InterviewRound.ROUND_2) return InterviewRound.ROUND_3;
    if (lastInterview.round === InterviewRound.ROUND_3) return InterviewRound.ROUND_4;
    return InterviewRound.ROUND_4; 
  }, [existingInterviews, candidate.id, requisition.id]);
  
  const [round, setRound] = useState<InterviewRound>(getNextInterviewRound());
  const [interviewerName, setInterviewerName] = useState<string>(requisition.hiringManagerName);
  const [interviewDate, setInterviewDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [decision, setDecision] = useState<InterviewDecision>(InterviewDecision.PROCEED);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(scorecardTemplates[0]?.id || '');
  const [results, setResults] = useState<InterviewScorecardResult[]>([]);

  useEffect(() => {
    setRound(getNextInterviewRound());
    setInterviewerName(requisition.hiringManagerName);
    setInterviewDate(new Date().toISOString().split('T')[0]);
    setDecision(InterviewDecision.PROCEED);
    setSelectedTemplateId(scorecardTemplates[0]?.id || '');
  }, [candidate, requisition, existingInterviews, getNextInterviewRound, scorecardTemplates]);

  useEffect(() => {
    const template = scorecardTemplates.find(t => t.id === selectedTemplateId);
    if (template) {
      setResults(template.competencies.map(c => ({
        competencyId: c.id,
        competencyName: c.name,
        score: 0, // Changed from 3 to 0 to avoid default scoring
        evidence: '',
      })));
    } else {
      setResults([]);
    }
  }, [selectedTemplateId, scorecardTemplates]);

  const handleResultChange = (index: number, field: 'score' | 'evidence', value: string | number) => {
    const updatedResults = [...results];
    updatedResults[index] = { ...updatedResults[index], [field]: value };
    setResults(updatedResults);
  };
  
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedTemplateId) {
        alert("Please select a scorecard template.");
        return;
    }

    if (results.some(r => r.score === 0)) {
        alert("Please provide a score for all competencies.");
        return;
    }

    const finalInterview: Interview = {
        id: `INT-${Date.now().toString().slice(-7)}`, 
        candidateId: candidate.id,
        requisitionId: requisition.id,
        round,
        interviewerName,
        interviewDate: new Date(interviewDate).toISOString(),
        decision,
        scorecardTemplateId: selectedTemplateId,
        results,
    };
    onSubmit(finalInterview);
  };

  const inputClass = "mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm";
  const labelClass = "block text-sm font-medium text-gray-700";
  const requiredSpan = <span className="text-red-500">*</span>;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-lg font-semibold text-indigo-700">Log Interview for: {candidate.name}</p>
          <p className="text-sm text-gray-500 -mt-1">Requisition: {requisition.role}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
        <div>
          <label htmlFor="round" className={labelClass}>Interview Round {requiredSpan}</label>
          <select name="round" id="round" value={round} onChange={(e) => setRound(e.target.value as InterviewRound)} className={inputClass} required>
            {Object.values(InterviewRound).map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="interviewerName" className={labelClass}>Interviewer Name {requiredSpan}</label>
          <input type="text" name="interviewerName" id="interviewerName" value={interviewerName} onChange={(e) => setInterviewerName(e.target.value)} className={inputClass} required />
        </div>
        <div>
          <label htmlFor="interviewDate" className={labelClass}>Interview Date {requiredSpan}</label>
          <input type="date" name="interviewDate" id="interviewDate" value={interviewDate} onChange={(e) => setInterviewDate(e.target.value)} className={inputClass} required />
        </div>
         <div>
          <label htmlFor="decision" className={labelClass}>Overall Recommendation {requiredSpan}</label>
          <select name="decision" id="decision" value={decision} onChange={(e) => setDecision(e.target.value as InterviewDecision)} className={inputClass} required>
            {Object.values(InterviewDecision).map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <label htmlFor="scorecardTemplateId" className={labelClass}>Scorecard Template {requiredSpan}</label>
          <select id="scorecardTemplateId" value={selectedTemplateId} onChange={(e) => setSelectedTemplateId(e.target.value)} className={inputClass} required>
            <option value="">-- Select a Template --</option>
            {scorecardTemplates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>
        
        {results.length > 0 && (
            <div className="space-y-3 border-t pt-4">
                {results.map((result, index) => (
                    <div key={result.competencyId} className="p-3 border rounded-lg bg-gray-50">
                        <label className="block text-sm font-semibold text-gray-800">{result.competencyName}</label>
                        <p className="text-[10px] text-gray-500 mb-2 leading-tight">{scorecardTemplates.find(t=>t.id===selectedTemplateId)?.competencies?.find(c=>c.id===result.competencyId)?.description}</p>
                        
                        <div className="mt-2">
                             <label className="block text-xs font-medium text-gray-700 mb-1">Score (1-5) {requiredSpan}</label>
                            <div className="flex space-x-2">
                                {[1, 2, 3, 4, 5].map(s => (
                                    <label key={s} className={`flex items-center justify-center w-8 h-8 cursor-pointer border rounded-md transition-all duration-200 ${result.score === s ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'}`}>
                                        <input type="radio" name={`score-${index}`} value={s} checked={result.score === s} onChange={(e) => handleResultChange(index, 'score', parseInt(e.target.value, 10))} className="sr-only" />
                                        <span className="text-xs font-medium">{s}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="mt-2">
                             <label className="block text-xs font-medium text-gray-700 mb-1">Evidence / Notes {requiredSpan}</label>
                             <textarea value={result.evidence} onChange={(e) => handleResultChange(index, 'evidence', e.target.value)} rows={2} className="mt-1 block w-full px-2 py-1.5 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-xs" required placeholder="Provide specific examples and evidence for the score." />
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>

      <div className="pt-5 border-t border-gray-200 mt-6 sticky bottom-0 bg-white pb-2 -mx-6 px-6">
        <div className="flex justify-end space-x-3">
          <button type="button" onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors">
            Cancel
          </button>
          <button type="submit"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors">
            Save Interview Log
          </button>
        </div>
      </div>
    </form>
  );
};

export default InterviewForm;