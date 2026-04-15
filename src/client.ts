import axios, { AxiosInstance, AxiosResponse } from "axios";
import { RateLimitInfo } from "./types.js";

const BASE_URL = process.env.BASE_URL || "https://api.100hires.com/v2";

let apiClient: AxiosInstance;
let lastRateLimit: RateLimitInfo | null = null;

export function initClient(apiKey: string): void {
  apiClient = axios.create({
    baseURL: BASE_URL,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    paramsSerializer: { indexes: null },
  });

  apiClient.interceptors.response.use(
    (response) => {
      updateRateLimit(response);
      return response;
    },
    async (error) => {
      if (error.response) {
        updateRateLimit(error.response);

        if (error.response.status === 429 && lastRateLimit) {
          const waitMs =
            (lastRateLimit.reset - Math.floor(Date.now() / 1000)) * 1000;
          if (waitMs > 0 && waitMs < 120_000) {
            await new Promise((resolve) => setTimeout(resolve, waitMs));
            return apiClient.request(error.config);
          }
        }
      }
      return Promise.reject(error);
    }
  );
}

function updateRateLimit(response: AxiosResponse): void {
  const remaining = response.headers["x-ratelimit-remaining"];
  const limit = response.headers["x-ratelimit-limit"];
  const reset = response.headers["x-ratelimit-reset"];

  if (remaining !== undefined) {
    lastRateLimit = {
      remaining: parseInt(remaining, 10),
      limit: limit ? parseInt(limit, 10) : 100,
      reset: reset ? parseInt(reset, 10) : 0,
    };
  }
}

function getRateLimitWarning(): string | null {
  if (lastRateLimit && lastRateLimit.remaining < 5) {
    return `⚠️ Rate limit: ${lastRateLimit.remaining}/${lastRateLimit.limit} requests remaining. Resets at ${new Date(lastRateLimit.reset * 1000).toISOString()}.`;
  }
  return null;
}

/** Build MCP tool response content array, appending rate-limit warning as a separate block when needed. */
export function toolResult(json: string): { content: { type: "text"; text: string }[] } {
  const content: { type: "text"; text: string }[] = [{ type: "text", text: json }];
  const warning = getRateLimitWarning();
  if (warning) {
    content.push({ type: "text", text: warning });
  }
  return { content };
}

/** Build MCP tool error response. */
export function toolError(message: string): { content: { type: "text"; text: string }[]; isError: true } {
  return { content: [{ type: "text", text: message }], isError: true };
}

function formatError(error: unknown): string {
  if (axios.isAxiosError(error) && error.response) {
    const data = error.response.data;
    if (data?.error) {
      let msg = `API Error ${data.error.status}: ${data.error.message}`;
      if (data.error.validation_errors) {
        const details = Object.entries(data.error.validation_errors)
          .map(([field, msgs]) => `  ${field}: ${Array.isArray(msgs) ? msgs.join(", ") : String(msgs)}`)
          .join("\n");
        msg += `\nValidation errors:\n${details}`;
      }
      return msg;
    }
    return `HTTP ${error.response.status}: ${JSON.stringify(data)}`;
  }
  return String(error);
}

export async function apiGet(
  path: string,
  params?: Record<string, unknown>
): Promise<string> {
  try {
    const response = await apiClient.get(path, { params });
    return JSON.stringify(response.data, null, 2);
  } catch (error) {
    throw new Error(formatError(error));
  }
}

export async function apiPost(
  path: string,
  data?: unknown,
  params?: Record<string, unknown>
): Promise<string> {
  try {
    const response = await apiClient.post(path, data, { params });
    return JSON.stringify(response.data, null, 2);
  } catch (error) {
    throw new Error(formatError(error));
  }
}

export async function apiPut(
  path: string,
  data?: unknown,
  params?: Record<string, unknown>
): Promise<string> {
  try {
    const response = await apiClient.put(path, data, { params });
    return JSON.stringify(response.data, null, 2);
  } catch (error) {
    throw new Error(formatError(error));
  }
}

export async function apiPatch(
  path: string,
  data?: unknown,
  params?: Record<string, unknown>
): Promise<string> {
  try {
    const response = await apiClient.patch(path, data, { params });
    return JSON.stringify(response.data, null, 2);
  } catch (error) {
    throw new Error(formatError(error));
  }
}

export async function apiDelete(
  path: string,
  params?: Record<string, unknown>,
  data?: unknown
): Promise<string> {
  try {
    const response = await apiClient.delete(path, { params, data });
    return JSON.stringify(response.data, null, 2);
  } catch (error) {
    throw new Error(formatError(error));
  }
}

/** Create a separate axios instance for career-site (public, no Bearer token) */
export function createCareerSiteClient(companySlug: string): {
  get: (path: string, params?: Record<string, unknown>) => Promise<string>;
  post: (path: string, data?: unknown) => Promise<string>;
} {
  const client = axios.create({
    baseURL: BASE_URL,
    headers: {
      "X-Company-Slug": companySlug,
      "Content-Type": "application/json",
    },
  });

  return {
    async get(path: string, params?: Record<string, unknown>): Promise<string> {
      try {
        const response = await client.get(path, { params });
        return JSON.stringify(response.data, null, 2);
      } catch (error) {
        throw new Error(formatError(error));
      }
    },
    async post(path: string, data?: unknown): Promise<string> {
      try {
        const response = await client.post(path, data);
        return JSON.stringify(response.data, null, 2);
      } catch (error) {
        throw new Error(formatError(error));
      }
    },
  };
}
