export type ID = number | string;

export type ISODateString = string;

export interface ApiError {
  detail?: string;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface MessageResponse {
  message: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page?: number;
  page_size?: number;
  pages?: number;
}

export interface SelectOption {
  id: ID;
  name: string;
  label?: string;
  value?: string;
}