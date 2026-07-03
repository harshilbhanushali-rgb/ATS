# AI Prompts for Hiring Management System
# These prompts are migrated from frontend/src/services/geminiService.ts
# to ensure consistent AI behavior when moving to backend

from typing import Any, Dict, List

# Constants from frontend
DEMO_COMPANY_NAME = "TechCorp Solutions"
DEMO_COMPANY_SELLING_POINTS = [
    "Industry-leading innovation in AI-driven solutions",
    "Collaborative culture with remote-first flexibility",
    "Competitive compensation with equity packages",
    "Continuous learning and professional development opportunities"
]


def build_requisition_context_prompt(requisition_partial: Dict[str, Any]) -> str:
    """Build requisition context prompt - migrated from frontend."""
    context = "Here is the current requisition information:\n"
    if requisition_partial.get('role'):
        context += f"- Role: {requisition_partial['role']}\n"
    if requisition_partial.get('function'):
        context += f"- Function: {requisition_partial['function']}\n"
    if requisition_partial.get('priority'):
        context += f"- Priority: {requisition_partial['priority']}\n"
    if requisition_partial.get('hire_type'):
        context += f"- Hire Type: {requisition_partial['hire_type']}\n"
    if requisition_partial.get('location'):
        context += f"- Location: {requisition_partial['location']}\n"
    if requisition_partial.get('cost'):
        context += f"- Proposed Cost: {requisition_partial['cost']['amount']} {requisition_partial['cost']['currency']}\n"
    if requisition_partial.get('req_status'):
        context += f"- Status: {requisition_partial['req_status']}\n"
    if requisition_partial.get('new_or_backfill'):
        context += f"- New or Backfill: {requisition_partial['new_or_backfill']}\n"
        if requisition_partial['new_or_backfill'] == 'BACKFILL' and requisition_partial.get('backfill_details'):
            context += f"  - Backfilling for: {requisition_partial['backfill_details']['employee_name']}\n"
            if requisition_partial['backfill_details'].get('previous_salary'):
                context += f"  - Previous Salary (Backfill): {requisition_partial['backfill_details']['previous_salary']}\n"
    if requisition_partial.get('hiring_manager_name'):
        context += f"- Hiring Manager: {requisition_partial['hiring_manager_name']}\n"
    if requisition_partial.get('function_head_name'):
        context += f"- Function Head: {requisition_partial['function_head_name']}\n"
    if requisition_partial.get('assigned_recruiter_name'):
        context += f"- Assigned Recruiter: {requisition_partial['assigned_recruiter_name']}\n"
    if requisition_partial.get('job_description') and requisition_partial['job_description'].strip():
        context += f'- Job Description: """{requisition_partial["job_description"]}"""\n'

    if context == "Here is the current requisition information:\n":
        context += "No specific details provided yet.\n"
    return context

# Requisition Suggestions Prompt
REQUISITION_SUGGESTIONS_PROMPT = """
You are an AI assistant for a hiring requisition system.
{requisition_context}

Please provide actionable suggestions to improve or validate this requisition.
If a Job Description is provided, pay close attention to it for context.
Your response MUST be a JSON array of suggestion objects.
Each object in the array should have the following properties:
- "field": A string indicating which part of the requisition the suggestion applies to. Possible values are: 'role', 'priority', 'cost', 'location', 'function', 'newOrBackfill', 'hiringManagerName', 'jobDescription', 'general'. Use "general" for overall comments.
- "suggestion": A string containing your specific advice or observation.
- "reasoning": An optional string explaining the basis for your suggestion.

Example JSON output:
[
  {{"field": "priority", "suggestion": "For a 'Senior Manager' role, P0 priority is recommended.", "reasoning": "Senior leadership roles are critical."}},
  {{"field": "cost", "suggestion": "The proposed salary of 90000 USD for a junior role in this location seems high. Please verify market rates.", "reasoning": "Ensure cost aligns with role seniority and market data."}},
  {{"field": "jobDescription", "suggestion": "Consider adding specific measurable outcomes for the first 6 months to the JD.", "reasoning": "Attracts result-oriented candidates."}},
  {{"field": "general", "suggestion": "Consider specifying required years of experience for this role.", "reasoning": "Clarifies candidate expectations."}}
]

Output ONLY the JSON array. Do not include any other text before or after the JSON.
"""

# Priority Suggestion Prompt
PRIORITY_SUGGESTION_PROMPT = """
You are an AI assistant for a hiring system.
Based on the provided job role and function, suggest a priority level.
Job Role: {role}
Function: {function}

The possible priority levels are:
- "P0: Very Critical" (for very critical, urgent, or high-impact roles)
- "P1: Critical" (for standard critical roles)

Respond with ONLY the suggested priority string (e.g., "P0: Very Critical" or "P1: Critical").
Do not include any other text, explanation, or quotation marks around the priority string itself in your response.
"""

# Dashboard Insights Prompt
DASHBOARD_INSIGHTS_PROMPT = """
You are an AI assistant for a hiring dashboard in a corporate environment.
Provide 2 to 4 concise, strategic insights based on typical hiring data and trends.
These insights should help hiring managers or HR personnel make better decisions.
Focus on areas like critical role prioritization, hiring trends, efficiency improvements, or market conditions.
Your response MUST be a JSON array of strings, where each string is a single insight.
Example JSON output:
[
  "Engineering roles in US West Coast show the highest time-to-fill; explore alternative sourcing for this region.",
  "There's a notable increase in demand for contract-based marketing roles. Assess if this aligns with long-term strategy."
]
Output ONLY the JSON array. Do not include any other text before or after the JSON.
"""

# Resume Analysis Prompt
RESUME_ANALYSIS_PROMPT = """
You are an expert AI Talent Acquisition specialist. Your task is to analyze a candidate's resume against a job description and provide a structured assessment.

Job Description:
{job_description}

Candidate's Resume Text:
{resume_text}

Instructions:
1.  Carefully analyze both the Job Description and the Resume Text.
2.  Extract key requirements from the Job Description (skills, years of experience, specific qualifications, education).
3.  Extract key qualifications from the Resume Text (skills, roles held, duration of experience, education).
4.  Compare the extracted information.
5.  Provide a structured JSON response with the following fields:
    *   "matchAssessment": A string enum value from ["Strong Match", "Good Match", "Partial Match", "Low Match", "Not a Fit", "Insufficient Data to Assess"].
    *   "summary": A concise (2-3 sentences) overall summary of how well the candidate's resume matches the job description.
    *   "matchingSkills": An array of strings listing key skills mentioned in both the JD and the resume.
    *   "missingSkills": An array of strings listing key skills mentioned in the JD but apparently missing or not highlighted in the resume.
    *   "experienceAlignment": An object with:
        *   "overallYears" (optional string, can be null if not determinable): e.g., "5 years (meets requirement of 5-7 years)" or "2 years (below requirement of 5+ years)".
        *   "relevantRoles" (optional array of strings, can be null if none): e.g., ["Software Engineer (matches)", "Project Manager (partial match)"].
        *   "notes" (optional string, can be null): General notes on experience alignment, like specific project experiences or lack thereof.
    *   "educationAlignment": An object with:
        *   "degree" (optional string, can be null): e.g., "Bachelor's in CS (meets requirement)".
        *   "institution" (optional string, can be null): e.g., "XYZ University".
        *   "notes" (optional string, can be null): General notes on education alignment.
    *   "overallFitReasoning" (optional string, can be null): A brief explanation for the "matchAssessment" provided.

Example of a good "matchAssessment": "Good Match"
Example of a good "summary": "The candidate appears to be a good match, possessing several key technical skills like Python and SQL, and 5 years of relevant software development experience. However, experience with cloud platforms, specifically AWS, is not explicitly mentioned but is preferred in the JD."
Example of "matchingSkills": ["Python", "SQL", "Agile Methodology"]
Example of "missingSkills": ["AWS", "Terraform", "CI/CD Pipeline Development"]

Focus on an objective comparison based on the provided texts.
Output ONLY the JSON object. Do not include any other text before or after the JSON.
Ensure your response strictly adheres to the 'ResumeMatchAnalysis' interface structure and types, using null for optional fields if no data is available.
"""

# Candidate Matching Prompt
CANDIDATE_MATCHING_PROMPT = """
You are an AI Talent Sourcing Specialist.
Your task is to identify the top 5-7 candidates from the provided Talent Pools who best match the given Requisition.

Requisition Details:
Role: {role}
Function: {function}
Location: {location}
Job Description: {job_description}

Available Candidates from Talent Pools:
{candidates_prompt_part}

Instructions:
1. Analyze the Requisition details thoroughly, paying close attention to the Job Description, Role, Function, and any implied skills or experience requirements.
2. For each candidate provided, evaluate their profile (resume excerpt, notes, stage history, and source) against the Requisition.
3. Identify the top 5-7 candidates who are the strongest potential matches.
4. For each matched candidate, provide a brief justification (1-2 sentences) explaining why they are a good match, referencing specific skills, experiences, or keywords from their profile that align with the Requisition.
5. You can optionally provide a "matchScore" (an integer from 1 to 5, where 5 is the highest match) if you can confidently determine it based on the available information.

Your response MUST be a JSON array of objects. Each object should have the following properties:
- "candidateId": string (The ID of the matched candidate from the provided list)
- "justification": string (Your 1-2 sentence reasoning for the match, highlighting specific alignments)
- "matchScore": number (Optional, an integer from 1 to 5)

Example JSON output:
[
  {{ "candidateId": "CAND-123", "justification": "Strong match based on 5+ years Java experience and cloud platform knowledge mentioned in resume, aligning with key JD requirements.", "matchScore": 5 }},
  {{ "candidateId": "CAND-456", "justification": "Partial match. Shows relevant project management skills from notes and past roles, but technical skills for this specific role are not clearly evident.", "matchScore": 3 }}
]

If no candidates are a good match, return an empty array [].
Output ONLY the JSON array. Do not include any other text before or after the JSON.
"""

# Outreach Draft Prompt
OUTREACH_DRAFT_PROMPT = """
You are an elite Executive Talent Sourcer drafting a highly personalized, high-conversion outreach message for a candidate.

Candidate Profile:
{resume_context}

Job Opportunity:
- Role: {role}
- Company: {company_name}
- Job Description: {jd_context}
- Company Selling Points: {company_selling_points}

Instructions:
1. Analyze the candidate's profile to identify their 2 most impressive recent achievements or roles that align with the {role} position.
2. Craft a concise, sophisticated outreach message (Email/InMail style).
3. Start with a personalized greeting.
4. Mention a specific detail from their background (e.g., a project, a specific technology they mastered, or a recent promotion) that makes them a standout fit.
5. Connect their experience directly to a key challenge or opportunity mentioned in the Job Description.
6. Highlight one unique selling point of {company_name} that aligns with their career trajectory.
7. Maintain a {tone} tone that feels human and authentic, not like a template.
8. Do NOT include a subject line.
9. Sign off generally (e.g., "Best regards,").
10. Avoid all placeholders like "[Name]".

Generate ONLY the message body.
"""

# Debrief Summary Prompt
DEBRIEF_SUMMARY_PROMPT = """
You are an expert AI Talent Acquisition Analyst. Your task is to analyze structured interview feedback from multiple interviewers for a single candidate and provide a debrief summary.

Role Context:
- Role: {role}
- Job Description: '''
{job_description}
'''

Consolidated Interview Feedback:
{feedback_context}

Instructions:
Your response MUST be a JSON object adhering to the AIDebriefSummary schema.
The JSON object must have the following fields:
- "summary": A string (3-4 sentences) summarizing the key themes from all interviews. Synthesize the feedback to provide a holistic view of the candidate's performance against the role's requirements.
- "pointsOfConsensus": An array of strings. Identify 2-4 key areas (strengths or weaknesses) where most or all interviewers were in agreement. For each point, briefly state the consensus. Example: "All interviewers noted strong problem-solving skills, citing their performance in technical challenges."
- "pointsOfDivergence": An array of strings. Identify 2-4 areas where interviewer feedback was significantly different or conflicting. For each point, state the divergence clearly. Example: "Interviewer A found communication clear, while Interviewer B noted it was sometimes vague and hard to follow."

Focus on an objective synthesis of the provided feedback.
Output ONLY the JSON object. Do not include any other text.
"""

# Text Extraction Prompt
TEXT_EXTRACTION_PROMPT = "You are an expert text extraction tool. Extract all text content from the provided document accurately. Output only the raw, unformatted text from the document. Do not add any commentary, labels, summaries, or formatting like markdown."

# Resume Text + Contact Info Extraction Prompt
RESUME_CONTACT_EXTRACTION_PROMPT = """
You are an expert resume-parsing and text extraction tool.

From the provided document, produce a single JSON object with exactly these four keys:
- "text": the ENTIRE text content of the document, copied verbatim and completely. Do not summarize, paraphrase, truncate, or omit any part of it. Preserve line breaks by encoding them as "\\n" within the JSON string. Do not add commentary, labels, or markdown formatting.
- "name": the candidate's own full name, exactly as written, or null if not confidently identifiable.
- "email": the candidate's own primary email address, or null if not found. Do not use an email address belonging to a reference, referrer, or company.
- "phone": the candidate's own primary phone number, exactly as written, or null if not found. Do not use a phone number belonging to a reference or company.

If the document does not look like a resume/CV (e.g. it is a job description or an unrelated document), still extract the full text into "text" and use null for "name", "email", and "phone".

Output ONLY the JSON object. Do not include any other text, commentary, or code fences before or after it.
"""


def build_candidates_prompt_part(candidates: List[Dict[str, Any]]) -> str:
    """Build the candidates prompt part for candidate matching."""
    return "\n---\n".join([
        """
Candidate ID: {id}
Name: {name}
Resume Text (Excerpt/Summary): \"\"\"
{resume_text}
\"\"\"
Notes: {notes}
Source: {source}
Relevant Stage History: {stage_history}
Talent Pool IDs: {talent_pool_ids}
""".format(
            id=candidate['id'],
            name=candidate['name'],
            resume_text=(
                candidate.get('resume_text', 'No resume text available.')[:500] + '...'
                if candidate.get('resume_text') and len(candidate.get('resume_text', '')) > 500
                else candidate.get('resume_text', 'No resume text available.')
            ),
            notes=candidate.get('notes', 'No notes.'),
            source=candidate.get('source', 'Unknown'),
            stage_history=(
                '; '.join([
                    "{stage} on {date}".format(stage=sh['stage'], date=sh['date'])
                    for sh in (candidate.get('stage_history') or [])[-3:]
                ]) or 'No stage history.'
            ),
            talent_pool_ids=', '.join(candidate.get('talent_pool_ids', [])) or 'N/A'
        ).strip()
        for candidate in candidates
    ])


def build_feedback_context(interviews: List[Dict[str, Any]]) -> str:
    """Build the feedback context for debrief summary."""
    feedback_parts = []
    for i, interview in enumerate(interviews, 1):
        feedback_parts.append("\n--- Interview #{i} ---\n".format(i=i))
        feedback_parts.append("Interviewer: {interviewer_name}\n".format(interviewer_name=interview['interviewer_name']))
        feedback_parts.append("Round: {round}\n".format(round=interview['round']))
        feedback_parts.append("Overall Recommendation: {decision}\n".format(decision=interview['decision']))
        feedback_parts.append("Structured Feedback:\n")
        for result in interview.get('results', []):
            feedback_parts.append("  - Competency: {competency_name}\n".format(competency_name=result['competency_name']))
            feedback_parts.append("    Score: {score}/5\n".format(score=result['score']))
            feedback_parts.append("    Evidence: \"{evidence}\"\n".format(evidence=result['evidence']))
    return "".join(feedback_parts)