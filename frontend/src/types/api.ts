import type { ApiError } from "./common";

export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

export interface ApiListResponse<T> {
  items: T[];
  total: number;
}

export interface ApiRequestError {
  status?: number;
  message: string;
  detail?: string;
  data?: ApiError;
}