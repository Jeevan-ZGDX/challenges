import { AnalysisResponse, Stage } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://127.0.0.1:8000';

async function parseResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const payload = await response.json().catch(() => ({ detail: 'Request failed' }));
    throw new Error(payload.detail ?? 'Request failed');
  }
  return response.json() as Promise<T>;
}

export async function fetchStages(): Promise<Stage[]> {
  const response = await fetch(`${API_BASE_URL}/api/stages`, { cache: 'no-store' });
  const payload = await parseResponse<{ stages: Stage[] }>(response);
  return payload.stages;
}

export async function fetchRoles(): Promise<{ id: string; label: string; description?: string }[]> {
  const response = await fetch(`${API_BASE_URL}/api/roles`, { cache: 'no-store' });
  const payload = await parseResponse<{ roles: { id: string; label: string; description?: string }[] }>(response);
  return payload.roles;
}

export async function fetchStage(stageId: number): Promise<Stage> {
  const response = await fetch(`${API_BASE_URL}/api/stages/${stageId}`, { cache: 'no-store' });
  const payload = await parseResponse<{ stage: Stage }>(response);
  return payload.stage;
}

export async function analyzeAudio(params: {
  stageId: number;
  audioBlob: Blob;
  durationSeconds: number;
  role?: string;
}): Promise<AnalysisResponse> {
  const formData = new FormData();
  formData.append('stage_id', String(params.stageId));
  formData.append('duration_seconds', String(params.durationSeconds));
  if (params.role) {
    formData.append('role', params.role);
  }
  formData.append('audio', params.audioBlob, `stage-${params.stageId}-attempt.webm`);

  const response = await fetch(`${API_BASE_URL}/api/analyze`, {
    method: 'POST',
    body: formData,
  });

  return parseResponse<AnalysisResponse>(response);
}
