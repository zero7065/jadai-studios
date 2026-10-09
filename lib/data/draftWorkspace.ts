export interface WorkspaceDraft {
  id: string;
  serviceSlug: string;
  serviceName: string;
  projectName: string;
  inputData: any;
  resultData?: any;
  thumbnailUrl?: string;
  updatedAt: string;
  createdAt: string;
}

const STORAGE_KEY = 'jadai-workspace-drafts';

export function getLocalDrafts(): WorkspaceDraft[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveLocalDraft(draft: Omit<WorkspaceDraft, 'id' | 'updatedAt' | 'createdAt'> & { id?: string }): WorkspaceDraft {
  const current = getLocalDrafts();
  const now = new Date().toISOString();
  const id = draft.id || `draft-${Date.now()}`;

  const existingIndex = current.findIndex((d) => d.id === id);
  let updatedDraft: WorkspaceDraft;

  if (existingIndex >= 0) {
    updatedDraft = {
      ...current[existingIndex],
      ...draft,
      id,
      updatedAt: now,
    };
    current[existingIndex] = updatedDraft;
  } else {
    updatedDraft = {
      ...draft,
      id,
      createdAt: now,
      updatedAt: now,
    };
    current.unshift(updatedDraft);
  }

  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
  }
  return updatedDraft;
}

export function deleteLocalDraft(id: string): void {
  const current = getLocalDrafts().filter((d) => d.id !== id);
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
  }
}
