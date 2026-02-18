export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  success: boolean;
  message?: string;
  statusCode?: number;
}

export interface ApiErrorResponse {
  error: string;
  message?: string;
  statusCode: number;
  details?: Record<string, any>;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    limit: number;
  };
}

export interface ListQueryParams {
  page?: number;
  limit?: number;
  sort?: string;
  search?: string;
  filters?: Record<string, any>;
}

export interface AuthenticatedApiRequest {
  headers: {
    Authorization: string;
  };
}

export interface FileUploadResponse {
  url: string;
  key: string;
  size: number;
  type: string;
}

export interface SearchParams {
  [key: string]: string | string[] | undefined;
}