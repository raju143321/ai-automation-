const API_BASE = '/api/v1';

export class ApiError extends Error {
  code: string;
  details?: unknown;
  requestId?: string;

  constructor(message: string, code = 'API_ERROR', details?: unknown, requestId?: string) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.details = details;
    this.requestId = requestId;
  }
}

function handleLocalProjectCreation<T>(rawBody: any): T {
  try {
    const parsed = typeof rawBody === 'string' ? JSON.parse(rawBody) : rawBody;
    const newId = 'local-' + Date.now();
    const newProject = {
      id: newId,
      owner_id: '00000000-0000-0000-0000-000000000001',
      title: parsed.title || 'Untitled Project',
      research_question: parsed.research_question || '',
      description: parsed.description || null,
      domain: parsed.domain || 'cs-ai',
      subdomain: parsed.subdomain || null,
      objectives: parsed.objectives || [],
      scope: parsed.scope || null,
      language: parsed.language || 'en',
      citation_style: parsed.citation_style || 'APA',
      research_depth: parsed.research_depth || 'standard',
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    const stored = JSON.parse(localStorage.getItem('researchsphere_local_projects') || '[]');
    stored.unshift(newProject);
    localStorage.setItem('researchsphere_local_projects', JSON.stringify(stored));
    return newProject as unknown as T;
  } catch {
    throw new ApiError('Failed to initialize local project workspace.', 'CLIENT_ERROR');
  }
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('researchsphere_token');

  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(options.headers as Record<string, string> || {})
  };

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers
    });
  } catch (netErr: any) {
    // If backend is unreachable, provide graceful local fallback for project creation
    if (endpoint === '/projects' && options.method === 'POST') {
      return handleLocalProjectCreation<T>(options.body);
    }
    throw new ApiError(
      'Unable to connect to the backend server. Please make sure the backend is running on http://localhost:3000.',
      'NETWORK_ERROR'
    );
  }

  if (response.status === 204) {
    return {} as T;
  }

  // Check if response is binary/attachment
  const disposition = response.headers.get('Content-Disposition');
  if (disposition && disposition.includes('attachment')) {
    const blob = await response.blob();
    return blob as unknown as T;
  }

  const rawText = await response.text();
  let data: any = {};
  if (rawText) {
    try {
      data = JSON.parse(rawText);
    } catch {
      data = { error: { message: rawText } };
    }
  }

  if (!response.ok) {
    // If proxy returned 502/504 or empty response when creating project
    if ((response.status === 502 || response.status === 504 || !rawText) && endpoint === '/projects' && options.method === 'POST') {
      return handleLocalProjectCreation<T>(options.body);
    }

    const errorInfo = data.error || {};
    const message = errorInfo.message || (
      response.status === 502 || response.status === 504 || !rawText
        ? 'The backend API server is unreachable on port 3000. Please start the backend with npm run dev or npm run dev:backend.'
        : `Request failed with status ${response.status}`
    );

    throw new ApiError(
      message,
      errorInfo.code || 'HTTP_ERROR',
      errorInfo.details,
      errorInfo.requestId
    );
  }

  return data.data !== undefined ? data.data : data;
}

export const api = {
  get: <T>(endpoint: string) => apiRequest<T>(endpoint, { method: 'GET' }),
  post: <T>(endpoint: string, body?: unknown) =>
    apiRequest<T>(endpoint, {
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body)
    }),
  patch: <T>(endpoint: string, body: unknown) =>
    apiRequest<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(body)
    }),
  delete: <T>(endpoint: string) => apiRequest<T>(endpoint, { method: 'DELETE' })
};
