// Fix: Manually define types for import.meta.env to work around build environment issues.
// This ensures the project can compile even if Vite's client types are not automatically discovered.
declare global {
  interface ImportMeta {
    readonly env: {
      readonly VITE_API_BASE_URL: string;
    }
  }
}

// The backend URL is now loaded from environment variables via Vite.
// See the .env.example file for configuration.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
  throw new Error("Configuration error: VITE_API_BASE_URL is not defined. Please check your .env file.");
}

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
