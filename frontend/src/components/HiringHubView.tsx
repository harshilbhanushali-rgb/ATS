import React, { useState, useMemo, FC } from 'react';
import { Candidate, Requisition, Interview } from '../types';
import Modal from './Modal';
import Card from './Card';
import { Sparkles as SparklesIcon, Send as PaperAirplaneIcon } from 'lucide-react';

interface HiringHubViewProps {
  isOpen: boolean;
  onClose: () => void;
  candidate: Candidate | null;
  requisition: Requisition | null;
  interviews: Interview[];
  onSaveComment: (candidateId: string, commentText: string) => void;
  onGenerateAISummary: (candidate: Candidate, requisition: Requisition, interviews: Interview[]) => void;
  onRecordDecision: (candidateId: string, decision: 'HIRE' | 'REJECT') => void;
}

const HiringHubView: FC<HiringHubViewProps> = ({
  isOpen,
  onClose,
  candidate,
  requisition,
  interviews,
  onSaveComment,
  onGenerateAISummary,
  onRecordDecision,
}) => {
  const [activeTab, setActiveTab] = useState<'debrief' | 'aiSummary' | 'decision'>('debrief');
  const [newComment, setNewComment] = useState('');

  const debriefData = useMemo(() => {
    if (!candidate || interviews.length === 0) return { interviewers: [], competencies: [] };

    const candidateInterviews = interviews.filter(i => i.candidateId === candidate.id && i.requisitionId === requisition?.id);

    const interviewers = [...new Set(candidateInterviews.map(i => i.interviewerName))];
    
    const competencyMap = new Map<string, { id: string, name: string, results: (any | null)[] }>();

    candidateInterviews.forEach(interview => {
      interview.results.forEach(result => {
        if (!competencyMap.has(result.competencyId)) {
          competencyMap.set(result.competencyId, {
            id: result.competencyId,
            name: result.competencyName,
            results: Array(interviewers.length).fill(null),
          });
        }
      });
    });
    
    candidateInterviews.forEach(interview => {
      const interviewerIndex = interviewers.indexOf(interview.interviewerName);
      interview.results.forEach(result => {
        const competency = competencyMap.get(result.competencyId);
        if (competency) {
          competency.results[interviewerIndex] = {
            score: result.score,
            evidence: result.evidence,
          };
        }
      });
    });

    return { interviewers, competencies: Array.from(competencyMap.values()) };
  }, [candidate, requisition, interviews]);

  const avgScore = useMemo(() => {
    const candidateInterviews = interviews.filter(i => i.candidateId === candidate?.id && i.requisitionId === requisition?.id);
    const scores = candidateInterviews.flatMap(i => i.results.map(r => r.score));
    if (scores.length === 0) return null;
    return (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2);
  }, [candidate, requisition, interviews]);
  
  const handleAddComment = () => {
    if (newComment.trim() && candidate) {
      onSaveComment(candidate.id, newComment.trim());
      setNewComment('');
    }
  };
  
  if (!isOpen || !candidate || !requisition) return null;

  const tabButtonClass = (tabName: 'debrief' | 'aiSummary' | 'decision') => 
    `px-4 py-2 text-sm font-medium rounded-md transition-colors ${
      activeTab === tabName
        ? 'bg-indigo-600 text-white shadow'
        : 'text-gray-600 hover:bg-gray-200'
    }`;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Hiring Hub: ${candidate.name} for ${requisition.role}`} size="6xl">
      <div className="flex flex-col h-[80vh]">
        <div className="flex-shrink-0 border-b border-gray-200 bg-white">
          <div className="px-6 py-4 flex justify-between items-center">
            <div>
               <h3 className="text-lg font-bold text-gray-900">{candidate.name}</h3>
               <p className="text-sm text-gray-500">{requisition.role} • {requisition.location}</p>
            </div>
            {avgScore && (
              <div className="text-right">
                <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Avg. Interview Score</p>
                <p className="text-2xl font-bold text-indigo-600">{avgScore} <span className="text-sm text-gray-400 font-normal">/ 5.00</span></p>
              </div>
            )}
          </div>
          <div className="px-4 pb-2 bg-gray-50 flex space-x-2">
            <button onClick={() => setActiveTab('debrief')} className={tabButtonClass('debrief')}>Debrief Grid</button>
            <button onClick={() => setActiveTab('aiSummary')} className={tabButtonClass('aiSummary')}>AI Summary</button>
            <button onClick={() => setActiveTab('decision')} className={tabButtonClass('decision')}>Comments & Decision</button>
          </div>
        </div>

        <div className="flex-grow overflow-y-auto p-4">
          {activeTab === 'debrief' && (
            <div className="space-y-6">
              {candidate.aiDebriefSummary && candidate.aiDebriefSummary.pointsOfDivergence.length > 0 && (
                <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-xl shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <SparklesIcon className="w-4 h-4 text-amber-600" />
                    <h4 className="text-sm font-bold text-amber-900 uppercase tracking-wider">Critical Divergence Detected</h4>
                  </div>
                  <ul className="space-y-1">
                    {candidate.aiDebriefSummary.pointsOfDivergence.map((point, i) => (
                      <li key={i} className="text-sm text-amber-800 flex items-start gap-2">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <Card title="Interview Debrief Grid">
              {debriefData.competencies.length === 0 ? (
                 <p className="text-center text-gray-500 py-10">No structured interview feedback has been logged for this candidate yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 border">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider sticky left-0 bg-gray-100 z-10">Competency</th>
                        {debriefData.interviewers.map(name => (
                          <th key={name} className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">{name}</th>
                        ))}
                      </tr>
                    </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {debriefData.competencies.map(comp => {
                          const isDivergent = candidate.aiDebriefSummary?.pointsOfDivergence.some(p => 
                            p.toLowerCase().includes(comp.name.toLowerCase())
                          );

                          return (
                            <tr key={comp.id} className={isDivergent ? 'bg-amber-50/30' : ''}>
                              <td className="px-4 py-4 text-sm font-medium text-gray-800 sticky left-0 bg-inherit z-10 w-48">
                                <div className="flex items-center gap-2">
                                  {comp.name}
                                  {isDivergent && (
                                    <span title="AI detected divergence in feedback for this competency" className="text-amber-500">
                                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                        <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                                      </svg>
                                    </span>
                                  )}
                                </div>
                              </td>
                              {comp.results.map((result, index) => {
                                const isOutlier = result && (result.score === 1 || result.score === 5);
                                return (
                                  <td key={index} className="px-4 py-4 text-center align-top">
                                    {result ? (
                                      <div className="group relative flex flex-col items-center">
                                        <span className={`text-lg font-bold ${result.score >= 4 ? 'text-green-600' : result.score === 3 ? 'text-yellow-600' : 'text-red-600'}`}>
                                          {result.score}
                                        </span>
                                        
                                        {isOutlier ? (
                                          <div className="mt-2 p-2 bg-slate-50 border border-slate-100 rounded text-[10px] text-left text-slate-600 italic max-w-[120px] line-clamp-3">
                                            &quot;{result.evidence}&quot;
                                          </div>
                                        ) : (
                                          <div className="absolute z-20 w-64 p-2 text-xs text-left text-white bg-gray-800 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 bottom-full -translate-x-1/2 left-1/2 mb-2 transition-opacity pointer-events-none">
                                            <h5 className="font-bold mb-1">Evidence:</h5>
                                            <p className="whitespace-pre-wrap">{result.evidence || 'No evidence provided.'}</p>
                                          </div>
                                        )}
                                      </div>
                                    ) : <span className="text-gray-400 text-sm">-</span>}
                                  </td>
                                );
                              })}
                            </tr>
                          );
                        })}
                      </tbody>
                  </table>
                </div>
              )}
            </Card>
          </div>
        )}

          {activeTab === 'aiSummary' && (
            <Card title="AI-Powered Debrief Summary">
              <div className="text-center mb-4">
                <button
                    onClick={() => onGenerateAISummary(candidate, requisition, interviews.filter(i => i.candidateId === candidate.id))}
                    className="flex items-center justify-center mx-auto bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-md shadow-sm text-sm transition-colors"
                >
                    <SparklesIcon className="w-4 h-4 mr-2" />
                    {candidate.aiDebriefSummary ? 'Refresh AI Summary' : 'Generate AI Summary'}
                </button>
              </div>
              {candidate.aiDebriefSummary ? (
                <div className="space-y-4">
                    <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-md">
                        <h4 className="font-semibold text-indigo-800">Overall Summary</h4>
                        <p className="text-sm text-gray-700 mt-1">{candidate.aiDebriefSummary.summary}</p>
                    </div>
                     <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                        <h4 className="font-semibold text-green-800">Points of Consensus</h4>
                        <ul className="list-disc list-inside mt-1 text-sm text-gray-700">
                            {candidate.aiDebriefSummary.pointsOfConsensus.map((point, i) => <li key={`con-${i}`}>{point}</li>)}
                        </ul>
                    </div>
                     <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                        <h4 className="font-semibold text-yellow-800">Points of Divergence</h4>
                        <ul className="list-disc list-inside mt-1 text-sm text-gray-700">
                            {candidate.aiDebriefSummary.pointsOfDivergence.map((point, i) => <li key={`div-${i}`}>{point}</li>)}
                        </ul>
                    </div>
                </div>
              ) : (
                <p className="text-center text-gray-500 py-10">Click the button above to generate an AI summary of all interview feedback.</p>
              )}
            </Card>
          )}

          {activeTab === 'decision' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card title="Team Comments">
                    <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                        {(candidate.hiringHubComments || []).map(comment => (
                            <div key={comment.id} className="p-2 bg-gray-100 border border-gray-200 rounded-md">
                                <div className="flex justify-between items-center text-xs mb-1">
                                    <span className="font-semibold text-gray-800">{comment.authorName}</span>
                                    <span className="text-gray-500">{new Date(comment.timestamp).toLocaleString()}</span>
                                </div>
                                <p className="text-sm text-gray-700">{comment.text}</p>
                            </div>
                        ))}
                    </div>
                     <div className="mt-4 flex space-x-2">
                        <textarea value={newComment} onChange={e => setNewComment(e.target.value)} rows={2} className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm" placeholder="Add a comment..."/>
                        <button onClick={handleAddComment} className="p-2 bg-indigo-600 text-white rounded-md h-fit" aria-label="Add Comment"><PaperAirplaneIcon className="w-5 h-5"/></button>
                    </div>
                </Card>
                <Card title="Final Decision">
                    <p className="text-sm text-gray-600 mb-4">Record the final decision for this candidate for this requisition.</p>
                    <div className="space-y-3">
                         <button onClick={() => onRecordDecision(candidate.id, 'HIRE')} className="w-full py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-md shadow-md transition-transform transform hover:scale-105">
                            RECOMMEND FOR HIRE
                         </button>
                         <button onClick={() => onRecordDecision(candidate.id, 'REJECT')} className="w-full py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-md shadow-md transition-transform transform hover:scale-105">
                            REJECT CANDIDATE
                         </button>
                    </div>
                </Card>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default HiringHubView;
