# AI Hiring Management System (AI HMS) - Deep Documentation & Context Guide

A state-of-the-art recruitment platform built on **React 19** and **Google Gemini AI**. This system automates and enhances every stage of the recruitment funnel—from requisition creation to final offer—using multi-modal AI interactions (Text-to-Speech, Speech-to-Text, and advanced reasoning).

---

## 🏗️ System Architecture

### Frontend Stack
- **Framework**: React 19 (Functional Components, Hooks).
- **Build Tool**: Vite.
- **Language**: TypeScript (Strong emphasis on interfaces in `src/types.ts`).
- **Styling**: Tailwind CSS with custom fonts ('Outfit' for UI headers, 'Inter' for body, 'JetBrains Mono' for data).
- **Icons**: Lucide React.
- **Animations**: CSS Keyframes + Framer Motion (Ready).

### AI Infrastructure (Gemini SDK)
The system leverages the `@google/genai` SDK with three specialized models:
1. **Orchestrator (`gemini-3.1-pro-preview`)**: Used for complex reasoning, summarization, resume analysis, and interview dialogue flow.
2. **STT Engine (`gemini-3-flash-preview`)**: Performs high-speed transcription of candidate audio responses.
3. **TTS Engine (`gemini-2.5-flash-preview-tts`)**: Generates professional audio responses for the AI Hiring Partner.

---

## 🔐 Security & Access Control (RBAC)

### Authentication Flow (`src/App.tsx`)
- **Admin Access**: Whitelisted emails (`sanjay123chandel@gmail.com`, `sanjay.chandel@joveo.com`) bypass role selection and gain full system control.
- **Domain Restriction**: Only `@joveo.com` email addresses are permitted.
- **Role Selection**: New users must select a role which persists in the mock `users` database.

### User Roles (`UserRole` enum)
1. **Admin**: Global visibility, user management, and system configuration.
2. **Lead Recruiter**: Manages requisitions, recruiter assignments, and offer approvals.
3. **Recruiter**: Focuses on candidate screening, scheduling, and interview management.
4. **Sourcer**: Manages talent pools, outreach campaigns, and candidate prospecting.
5. **Hiring Manager**: Reviews dashboards, provides structured interview feedback, and makes final hiring decisions.

---

## 🤖 Deep-Dive: AI Service Logic (`src/services/geminiService.ts`)

### 1. Requisition Intelligence
- `getAISuggestionsForRequisition`: Analyzes partial requisition data + JD to suggest improvements (priority, cost validation, JD enhancements).
- `getAIPrioritySuggestion`: Predicts role criticality based on title and function.

### 2. Candidate Matching & Sourcing
- `getResumeMatchAnalysis`: Performs a multi-point comparison between resume text and JD. Outputs `ResumeMatchAssessment` (Strong, Good, Partial, Low).
- `getAICandidateMatchesFromPools`: Scans thousands of rows (mocked) to find the best current pool candidates for a specific open req.

### 3. Mutli-modal AI Interviewer
- `createChatbotSession`: Initializes a stateful chat session with deep system instructions mimicking an empathetic recruiter.
- `transcribeAudio`: Converts candidate `webm` audio blobs (Base64) into text.
- `getAITextToSpeech`: Converts AI text into `Base64` PCM audio data.
- `getChatbotInterviewAssessment`: Synthesizes a full transcript into structured scores, strengths, and concerns.

### 4. Structured Decision Making
- `getAIDebriefSummary`: Aggregates qualitative/quantitative feedback from multiple human interviewers to find consensus and divergence.

---

## 🎙️ Audio Processing Pipeline (`src/audioUtils.ts`)

The system handles audio manually to ensure low latency and compatibility with Gemini's raw PCM requirements.
- **Sampling Rate**: 24,000Hz (Gemini TTS default).
- **Encoding**: Candidate audio is captured via `MediaRecorder` as `audio/webm;codecs=opus`, converted to Base64, and sent to Gemini Flash for transcription.
- **Decoding**: AI audio is received as raw PCM Base64, decoded using `Uint8Array`, and played via the browser's `AudioContext`.

---

## 📂 Key Components Repository

### Core Views
- `Dashboard.tsx`: Global health metrics and AI-generated strategic insights.
- `HiringHubView.tsx`: Collaborative "war room" for specific candidates where HMs and Recruiters review the **AI Debrief**.
- `RecruiterView.tsx`: Pipeline management (Applied -> Screening -> Interview).
- `SourcerHubView.tsx`: AI-assisted outreach and talent pool management.
- `AdminView.tsx`: User role auditing and system-wide data visibility.

### Interactive Components
- `CandidateInteractionPortal.tsx`: The primary interface for candidates to take the AI interview.
- `ChatbotInterviewModal.tsx`: Internal view for recruiters to test/re-run AI interviews.
- `ScorecardTemplateBuilder.tsx`: Allows creation of custom competency templates for structured interviewing.

---

## 💾 Data Persistence Model

- **Persistence Layer**: `localStorage` mimics an asynchronous database. Key keys: `app_requisitions`, `app_candidates`, `app_interviews`.
- **Session Layer**: `sessionStorage` handles `app_logged_in_user` for quick recovery on refresh.
- **Mock Fallbacks**: `src/constants.ts` provides initial `SAMPLE_*` data if LocalStorage is empty.

---

## 🛠️ Developer Guidance for AI Agents

1. **Adding a Feature**:
    - Update `types.ts` first if data structural changes are needed.
    - Check `geminiService.ts` for prompt patterns; always use structured JSON output instructions for the LLM.
    - Ensure new fields are mapped in `App.tsx`'s set-state functions to maintain persistence.

2. **UI Consistency**:
    - Use `Card.tsx` for containers.
    - Use `Badge` and `Button` patterns from existing components (like `RecruiterView`).
    - Stick to the defined color palette: `slate` for background/borders, `indigo` (or `emerald/amber` for status) for accents.

3. **Environment Constraints**:
    - `GEMINI_API_KEY` is mandatory.
    - Port must remain `3000`.
    - No HMR—it is disabled; manually trigger UI refreshes via state.

---

## 📝 Configuration
- **Vite Config**: Defined in `vite.config.ts`, handles environment injection for the Gemini API key.
- **Meta Data**: `metadata.json` manages frame permissions (microphone is critical for the interview portal).