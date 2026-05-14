import React from 'react';
import { ResumeMatchAnalysis, ResumeMatchAssessment } from '../types';
import Card from './Card'; // Assuming you have a Card component

interface ResumeAnalysisDisplayProps {
  analysis: ResumeMatchAnalysis | null;
  candidateName?: string;
  requisitionRole?: string;
}

const getAssessmentChipClass = (assessment: ResumeMatchAssessment | undefined) => {
  switch (assessment) {
    case ResumeMatchAssessment.STRONG_MATCH:
      return 'bg-green-100 text-green-700 border-green-300';
    case ResumeMatchAssessment.GOOD_MATCH:
      return 'bg-blue-100 text-blue-700 border-blue-300';
    case ResumeMatchAssessment.PARTIAL_MATCH:
      return 'bg-yellow-100 text-yellow-700 border-yellow-300';
    case ResumeMatchAssessment.LOW_MATCH:
      return 'bg-orange-100 text-orange-700 border-orange-300';
    case ResumeMatchAssessment.NOT_A_FIT:
      return 'bg-red-100 text-red-700 border-red-300';
    case ResumeMatchAssessment.INSUFFICIENT_DATA:
      return 'bg-gray-100 text-gray-700 border-gray-300';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-300';
  }
};

const ResumeAnalysisDisplay: React.FC<ResumeAnalysisDisplayProps> = ({ analysis, candidateName, requisitionRole }) => {
  if (!analysis) {
    return (
      <Card title="Resume Analysis">
        <p className="text-gray-600 p-4">No analysis data available.</p>
      </Card>
    );
  }

  const {
    matchAssessment,
    summary,
    matchingSkills,
    missingSkills,
    experienceAlignment,
    educationAlignment,
    overallFitReasoning
  } = analysis;

  const renderSkillList = (skills: string[], title: string, itemClass: string) => (
    <div>
      <h4 className="text-sm font-semibold text-gray-700 mb-1">{title}:</h4>
      {skills.length > 0 ? (
        <ul className="flex flex-wrap gap-2">
          {skills.map((skill, index) => (
            <li key={index} className={`text-xs px-2 py-0.5 rounded-full ${itemClass}`}>
              {skill}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-gray-500 italic">None highlighted.</p>
      )}
    </div>
  );

  return (
    <div className="space-y-5 p-1">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-2 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div>
          {candidateName && requisitionRole && (
            <h2 className="text-lg font-semibold text-indigo-700">
              Analysis for: {candidateName}
            </h2>
          )}
          {requisitionRole && (
             <p className="text-sm text-gray-600 -mt-1">Role: {requisitionRole}</p>
          )}
        </div>
        <div className={`mt-2 sm:mt-0 px-3 py-1.5 text-sm font-bold rounded-md border ${getAssessmentChipClass(matchAssessment)}`}>
          {matchAssessment}
        </div>
      </div>

      <Card title="Overall Summary" bodyClassName="text-sm text-gray-700 leading-relaxed">
        <p>{summary}</p>
        {overallFitReasoning && <p className="mt-2 text-xs text-gray-500 italic"><strong>Reasoning:</strong> {overallFitReasoning}</p>}
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card title="Skill Alignment">
          {renderSkillList(matchingSkills, 'Matching Skills', 'bg-green-100 text-green-800')}
          <div className="mt-3">
            {renderSkillList(missingSkills, 'Potentially Missing Skills (from JD)', 'bg-red-100 text-red-800')}
          </div>
        </Card>

        <Card title="Experience Alignment">
          {experienceAlignment.overallYears && <p className="text-sm mb-1"><strong>Overall Experience:</strong> {experienceAlignment.overallYears}</p>}
          {experienceAlignment.relevantRoles && experienceAlignment.relevantRoles.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-gray-600 mb-0.5">Relevant Roles Mentioned:</h4>
              <ul className="list-disc list-inside text-sm pl-2">
                {experienceAlignment.relevantRoles.map((role, i) => <li key={i}>{role}</li>)}
              </ul>
            </div>
          )}
          {experienceAlignment.notes && <p className="text-xs text-gray-500 italic mt-1"><strong>Notes:</strong> {experienceAlignment.notes}</p>}
          {!experienceAlignment.overallYears && (!experienceAlignment.relevantRoles || experienceAlignment.relevantRoles.length === 0) && !experienceAlignment.notes && (
            <p className="text-sm text-gray-500 italic">No specific experience alignment notes from AI.</p>
          )}
        </Card>
      </div>
      
      <Card title="Education Alignment">
        {educationAlignment.degree && <p className="text-sm mb-1"><strong>Degree:</strong> {educationAlignment.degree}</p>}
        {educationAlignment.institution && <p className="text-sm mb-1"><strong>Institution:</strong> {educationAlignment.institution}</p>}
        {educationAlignment.notes && <p className="text-xs text-gray-500 italic mt-1"><strong>Notes:</strong> {educationAlignment.notes}</p>}
        {!educationAlignment.degree && !educationAlignment.institution && !educationAlignment.notes && (
             <p className="text-sm text-gray-500 italic">No specific education alignment notes from AI.</p>
        )}
      </Card>
    </div>
  );
};

export default ResumeAnalysisDisplay;