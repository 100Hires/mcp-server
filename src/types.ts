/** Standard pagination parameters accepted by list endpoints */
export interface PaginationParams {
  page?: number;
  size?: number;
}

/** Pagination metadata returned in list responses */
export interface Pagination {
  current_page: number;
  per_page: number;
  total_pages: number;
  total_items: number;
}

/** Standard error response from the 100Hires API */
export interface ApiError {
  error: {
    name: string;
    message: string;
    code: number;
    status: number;
    validation_errors?: Record<string, string[]>;
  };
}

/** Rate limit info extracted from response headers */
export interface RateLimitInfo {
  remaining: number;
  limit: number;
  reset: number; // Unix timestamp
}
