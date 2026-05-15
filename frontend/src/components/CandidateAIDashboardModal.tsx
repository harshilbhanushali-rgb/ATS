
import React, { useState } from 'react';
import { ResumeMatchAnalysis, CandidateAIDashboardData, ResumeMatchAssessment } from '../types';
import Card from './Card';
import ResumeAnalysisDisplay from './ResumeAnalysisDisplay';
import { Sparkles as SparklesIcon, FileSearch as DocumentMagnifyingGlassIcon, Eye as EyeIcon } from 'lucide-react';
import { getResumeMatchAnalysis } from '../services/aiApi';


interface CandidateAIDashboardModalProps {
  onClose: () => void;
  dashboardData: CandidateAIDashboardData;
  onTriggerResumeAnalysis: (candidateId: string, analysis: ResumeMatchAnalysis | null) => void; // To save analysis
}

const CandidateAIDashboardModal: React.FC<CandidateAIDashboardModalProps> = ({
  dashboardData,
  onTriggerResumeAnalysis,
}) => {
  const { candidate, requisition } = dashboardData;
  const [isAnalyzingResume, setIsAnalyzingResume] = useState(false);
  const [showFullResumeAnalysis, setShowFullResumeAnalysis] = useState(false);

  const handleAnalyzeResumeNow = async () => {
    if (!requisition.jobDescription || !candidate.resumeText) {
      alert("Job Description or Candidate Resume Text is missing. Cannot analyze.");
      return;
    }
    setIsAnalyzingResume(true);
    try {
      const analysis = await getResumeMatchAnalysis(candidate.resumeText, requisition.jobDescription);
      onTriggerResumeAnalysis(candidate.id, analysis); // This updates the candidate object in App.tsx
      // The modal will re-render with new candidate.resumeAnalysis
    } catch (error) {
      console.error("Error triggering resume analysis from dashboard:", error);
       const errorAnalysis: ResumeMatchAnalysis = {
        matchAssessment: ResumeMatchAssessment.INSUFFICIENT_DATA,
        summary: "An error occurred during analysis. Please try again.",
        matchingSkills: [], missingSkills: [],
        experienceAlignment: {}, educationAlignment: {},
        overallFitReasoning: "Error during analysis."
      };
      onTriggerResumeAnalysis(candidate.id, errorAnalysis);
    } finally {
      setIsAnalyzingResume(false);
    }
  };
  
  const hasResumeTextAndJD = !!candidate.resumeText?.trim() && !!requisition.jobDescription?.trim();


  const getAssessmentChipClass = (assessment: ResumeMatchAssessment | undefined) => {
    if (!assessment) return 'bg-gray-100 text-gray-700 border-gray-300';
    switch (assessment) {
        case ResumeMatchAssessment.STRONG_MATCH: return 'bg-green-100 text-green-700 border-green-300';
        case ResumeMatchAssessment.GOOD_MATCH: return 'bg-blue-100 text-blue-700 border-blue-300';
        case ResumeMatchAssessment.PARTIAL_MATCH: return 'bg-yellow-100 text-yellow-700 border-yellow-300';
        default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };


  return (
    <div className="space-y-6 p-1">
      <div className="p-4 bg-gray-100 rounded-lg border border-gray-200 shadow-sm">
        <h2 className="text-xl font-semibold text-indigo-800">{candidate.name}</h2>
        <p className="text-sm text-gray-600">Applied for: {requisition.role}</p>
        <p className="text-xs text-gray-500">Candidate ID: {candidate.id} | Requisition ID: {requisition.id}</p>
      </div>

      {/* Resume Match Analysis Section */}
      <Card title="Resume Match Analysis (vs. Job Description)" titleRightElement={
           candidate.resumeAnalysis && <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${getAssessmentChipClass(candidate.resumeAnalysis.matchAssessment)}`}>{candidate.resumeAnalysis.matchAssessment}</span>
      }>
        {isAnalyzingResume && (
          <div className="flex items-center justify-center p-6 text-sm text-gray-600">
            <SparklesIcon className="w-5 h-5 mr-2 animate-spin text-indigo-500" />
            Analyzing resume... please wait.
          </div>
        )}
        {!isAnalyzingResume && candidate.resumeAnalysis && (
          <div className="p-1 space-y-2">
            <p className="text-sm text-gray-700">{candidate.resumeAnalysis.summary}</p>
            {candidate.resumeAnalysis.matchingSkills.length > 0 && <p className="text-xs"><strong className="font-medium">Matches:</strong> {candidate.resumeAnalysis.matchingSkills.slice(0,5).join(', ')}{candidate.resumeAnalysis.matchingSkills.length > 5 ? '...' : ''}</p>}
            {candidate.resumeAnalysis.missingSkills.length > 0 && <p className="text-xs"><strong className="font-medium">Missing:</strong> {candidate.resumeAnalysis.missingSkills.slice(0,5).join(', ')}{candidate.resumeAnalysis.missingSkills.length > 5 ? '...' : ''}</p>}
            <div className="mt-3 text-right">
              <button 
                  onClick={() => setShowFullResumeAnalysis(prev => !prev)}
                  className="text-indigo-600 hover:text-indigo-800 text-xs font-medium py-1 px-2 rounded hover:bg-indigo-50 transition-colors"
              >
                  <EyeIcon className="w-3.5 h-3.5 mr-1 inline"/> {showFullResumeAnalysis ? 'Hide Full Analysis' : 'View Full Analysis'}
              </button>
            </div>
          </div>
        )}
        {!isAnalyzingResume && !candidate.resumeAnalysis && hasResumeTextAndJD && (
          <div className="p-4 text-center">
            <p className="text-sm text-gray-600 mb-3">Resume analysis has not been performed yet.</p>
            <button
              onClick={handleAnalyzeResumeNow}
              className="flex items-center justify-center mx-auto bg-purple-500 hover:bg-purple-600 text-white font-semibold py-2 px-4 rounded-md shadow-sm text-sm transition-all"
            >
              <DocumentMagnifyingGlassIcon className="w-4 h-4 mr-1.5" />
              Analyze Resume Now
            </button>
          </div>
        )}
        {!isAnalyzingResume && !candidate.resumeAnalysis && !hasResumeTextAndJD && (
          <p className="p-4 text-sm text-gray-500 italic">Resume text or job description is missing. Cannot perform analysis.</p>
        )}
        {showFullResumeAnalysis && candidate.resumeAnalysis && (
          <div className="mt-4 border-t pt-4">
              <ResumeAnalysisDisplay analysis={candidate.resumeAnalysis} candidateName={candidate.name} requisitionRole={requisition.role}/>
          </div>
        )}
      </Card>
    </div>
  );
};

export default CandidateAIDashboardModal;
