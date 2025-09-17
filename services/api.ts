// NOTE: The backend URL is assumed to be served relative to the frontend.
// If your backend is on a different domain, replace '/api' with the full URL,
// e.g., 'https://your-backend.onrender.com/api'.
const API_BASE_URL = 'https://ab-tu-dekh-beta.onrender.com/api';

class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
    this.name = 'ApiError';
  }
}

async function fetchWithAuth<T,>(endpoint: string, initData: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set('X-Telegram-Init-Data', initData);

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMessage = `HTTP error! status: ${response.status}`;
    try {
        const errorBody = await response.json();
        errorMessage = errorBody.detail || errorMessage;
    } catch (e) {
        // Not a JSON error response
    }
    throw new ApiError(errorMessage, response.status);
  }
  
  // Handle endpoints that don't return JSON (like video stream blobs)
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.indexOf("application/json") !== -1) {
    return response.json() as Promise<T>;
  } else {
    return response.blob() as Promise<T>;
  }
}

export const api = {
  get: <T,>(endpoint: string, initData: string) => fetchWithAuth<T>(endpoint, initData),
  post: <T,>(endpoint: string, initData: string, body: any) =>
    fetchWithAuth<T>(endpoint, initData, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    }),
};