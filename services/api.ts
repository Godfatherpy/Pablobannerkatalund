// The backend URL is now loaded from environment variables via Vite.
// See the .env.example file for configuration.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
  throw new Error("Configuration error: VITE_API_BASE_URL is not defined. Please check your .env file.");
}

export class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
    this.name = 'ApiError';
  }
}

async function fetchWithAuth<T,>(endpoint: string, initData: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set('X-Telegram-Init-Data', initData);

  try {
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
  } catch (error) {
    if (error instanceof ApiError) {
      throw error; // Re-throw API errors we've already handled
    }
    // This will catch network errors like "Failed to fetch"
    console.error("Network or fetch error:", error);
    throw new Error("Could not connect to the server. Please check your internet connection and try again.");
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
