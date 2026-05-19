const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";
const TOKEN_KEY = "condolivre_token";

export const getStoredToken = (): string | null => {
  if (typeof window === "undefined") {
    return null;
  }
  return window.localStorage.getItem(TOKEN_KEY);
};

export const storeToken = (token: string): void => {
  window.localStorage.setItem(TOKEN_KEY, token);
};

export const clearStoredToken = (): void => {
  window.localStorage.removeItem(TOKEN_KEY);
};

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly errors?: Record<string, unknown>,
  ) {
    super(message);
  }
}

export interface ApiEnvelope<T> {
  data: T;
  meta?: { page: number; pageSize: number; total: number };
}

export const apiRequestEnvelope = async <T>(
  path: string,
  options: RequestInit = {},
): Promise<ApiEnvelope<T>> => {
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");

  const token = getStoredToken();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_URL}/api/v1${path}`, {
    ...options,
    headers,
  });

  if (response.status === 204) {
    return { data: undefined as T };
  }

  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new ApiError(
      response.status,
      body?.message || "Não foi possível concluir a solicitação",
      body?.errors,
    );
  }

  return body as ApiEnvelope<T>;
};

export const apiRequest = async <T>(
  path: string,
  options: RequestInit = {},
): Promise<T> => {
  const envelope = await apiRequestEnvelope<T>(path, options);
  return envelope.data;
};
