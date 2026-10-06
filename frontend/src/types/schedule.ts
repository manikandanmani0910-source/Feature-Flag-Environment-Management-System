import type {
  ID,
  ISODateString,
  PaginatedResponse,
} from "./common";

export type ScheduleStatus =
  | "SCHEDULED"
  | "ACTIVE"
  | "COMPLETED"
  | "CANCELLED";

export interface FeatureSchedule {
  id: ID;
  feature_flag_id: number;
  environment_id: number;

  start_time: ISODateString;
  end_time?: ISODateString | null;

  status: string;
}

export interface FeatureScheduleCreateRequest {
  feature_flag_id: number;
  environment_id: number;
  start_time: ISODateString;
  end_time?: ISODateString | null;
  status?: string;
}

export interface FeatureScheduleUpdateRequest {
  start_time?: ISODateString;
  end_time?: ISODateString | null;
  status?: string;
}

export type FeatureScheduleListResponse =
  PaginatedResponse<FeatureSchedule>;