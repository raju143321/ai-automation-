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

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  if (response.status === 204) {
    return {} as T;
  }

  // Check if response is binary/attachment
  const disposition = response.headers.get('Content-Disposition');
  if (disposition && disposition.includes('attachment')) {
    const blob = await response.blob();
    return blob as unknown as T;
  }

  const data = await response.json();

  if (!response.ok) {
    const errorInfo = data.error || {};
    throw new ApiError(
      errorInfo.message || `Request failed with status ${response.status}`,
      errorInfo.code || 'HTTP_ERROR',
      errorInfo.details,
      errorInfo.requestId
    );
  }

  return data.data;
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
