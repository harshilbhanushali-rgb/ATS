import { apiFetch } from './apiClient';

const parseError = async (response: Response, fallback: string): Promise<Error> => {
  const payload = await response.json().catch(() => null);
  return new Error(payload?.detail || fallback);
};

export interface ExistingCandidateWarning {
  candidateId: string;
  requisitionId?: string;
  talentPoolIds: string[];
}

export interface ExtractedBulkRow {
  filename: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  resumeText: string | null;
  mimeType: string | null;
  extractionError: string | null;
  existingCandidateWarning: ExistingCandidateWarning | null;
}

type ApiExtractedBulkRow = {
  filename: string;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  resume_text?: string | null;
  mime_type?: string | null;
  extraction_error?: string | null;
  existing_candidate_warning?: {
    candidate_id: string;
    requisition_id?: string | null;
    talent_pool_ids: string[];
  } | null;
};

const fromExtractedRow = (r: ApiExtractedBulkRow): ExtractedBulkRow => ({
  filename: r.filename,
  name: r.name ?? null,
  email: r.email ?? null,
  phone: r.phone ?? null,
  resumeText: r.resume_text ?? null,
  mimeType: r.mime_type ?? null,
  extractionError: r.extraction_error ?? null,
  existingCandidateWarning: r.existing_candidate_warning
    ? {
        candidateId: r.existing_candidate_warning.candidate_id,
        requisitionId: r.existing_candidate_warning.requisition_id ?? undefined,
        talentPoolIds: r.existing_candidate_warning.talent_pool_ids,
      }
    : null,
});

export const extractBulkResumes = async (files: File[]): Promise<ExtractedBulkRow[]> => {
  const formData = new FormData();
  files.forEach((file) => formData.append('files', file));

  const response = await apiFetch('/api/v1/candidates/bulk-import/extract', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw await parseError(response, 'Failed to extract resumes.');
  }

  const data = (await response.json()) as { rows: ApiExtractedBulkRow[] };
  return data.rows.map(fromExtractedRow);
};

export interface BulkCommitRow {
  filename: string;
  name: string;
  email: string;
  phone?: string;
  resumeText?: string;
}

export interface BulkImportRowResult {
  filename: string;
  status: 'created' | 'merged' | 'duplicate' | 'error';
  candidateId?: string;
  message?: string;
}

export interface BulkCommitResult {
  created: number;
  merged: number;
  duplicate: number;
  errors: number;
  rows: BulkImportRowResult[];
}

type ApiBulkImportRowResult = {
  filename: string;
  status: string;
  candidate_id?: string | null;
  message?: string | null;
};

type ApiBulkCommitResult = {
  created: number;
  merged: number;
  duplicate: number;
  errors: number;
  rows: ApiBulkImportRowResult[];
};

export const commitBulkResumes = async (
  rows: BulkCommitRow[],
  source: string,
  requisitionId?: string,
  talentPoolId?: string
): Promise<BulkCommitResult> => {
  const response = await apiFetch('/api/v1/candidates/bulk-import/commit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      rows: rows.map((r) => ({
        filename: r.filename,
        name: r.name,
        email: r.email,
        phone: r.phone ?? null,
        resume_text: r.resumeText ?? null,
      })),
      source,
      requisition_id: requisitionId ?? null,
      talent_pool_id: talentPoolId ?? null,
    }),
  });

  if (!response.ok) {
    throw await parseError(response, 'Failed to create candidates.');
  }

  const data = (await response.json()) as ApiBulkCommitResult;
  return {
    created: data.created,
    merged: data.merged,
    duplicate: data.duplicate,
    errors: data.errors,
    rows: data.rows.map((r) => ({
      filename: r.filename,
      status: r.status as BulkImportRowResult['status'],
      candidateId: r.candidate_id ?? undefined,
      message: r.message ?? undefined,
    })),
  };
};
