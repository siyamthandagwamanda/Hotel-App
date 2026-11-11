const BASE_URL = import.meta.env.VITE_API_URL;

// An error that remembers the HTTP status, so callers can react to 401 (signed out) or 409 (taken)
export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

// Sends a request to the API with the visitor's token and returns the JSON reply
export async function apiRequest<T>(
  path: string,
  token: string | null,
  method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE' = 'GET',
  body?: object,
): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token !== null) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    method: method,
    headers: headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (!response.ok) {
    let message = 'Something went wrong. Please try again.';
    try {
      const data = await response.json();
      message = data.error.message as string;
    } catch {
      // The reply was not JSON: keep the general message
    }
    throw new ApiError(response.status, message);
  }

  // Some replies (like a successful delete) have no body
  if (response.status === 204) {
    return undefined as T;
  }
  return (await response.json()) as T;
}