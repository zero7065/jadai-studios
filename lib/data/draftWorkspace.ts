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
    if (!raw) return getDefaultDrafts();
    return JSON.parse(raw);
  } catch {
    return getDefaultDrafts();
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

function getDefaultDrafts(): WorkspaceDraft[] {
  return [
    {
      id: 'draft-initial-doc',
      serviceSlug: 'doc-analyzer',
      serviceName: 'Doc Analyzer',
      projectName: 'Master Services Agreement Redline',
      inputData: 'Clause 8.3 Perpetual Indemnity Clause Review',
      resultData: 'Flagged 2 high-risk clauses.',
      thumbnailUrl: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=400&auto=format&fit=crop&q=80',
      updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    },
    {
      id: 'draft-diagnostic-exampadi',
      serviceSlug: 'diagnostic',
      serviceName: 'Diagnostic',
      projectName: 'ExamPadi Edge Latency Audit',
      inputData: 'https://exampadi.com',
      resultData: 'Score: 98/100, TTFB 42ms.',
      thumbnailUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&auto=format&fit=crop&q=80',
      updatedAt: new Date(Date.now() - 3600000 * 8).toISOString(),
      createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    },
    {
      id: 'draft-resume-hudson',
      serviceSlug: 'resume-editor',
      serviceName: 'Resume Editor',
      projectName: 'Staff Architect Dossier',
      inputData: 'Spearheaded resilient edge mesh...',
      thumbnailUrl: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=400&auto=format&fit=crop&q=80',
      updatedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
      createdAt: new Date(Date.now() - 3600000 * 72).toISOString(),
    }
  ];
}
