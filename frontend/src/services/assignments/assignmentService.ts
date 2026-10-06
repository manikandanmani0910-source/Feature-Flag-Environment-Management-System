import type {
  UserAssignment,
  AssignmentCreateRequest,
  AssignmentUpdateRequest,
} from "../../types/assignment";

import { apiClient } from "../api/client";
import { endpoints } from "../api/endpoints";

import { normalizeList } from "../../utils/normalizeList";

/* ========================================================= */
/* GET ALL ASSIGNMENTS */
/* GET /api/v1/assignments */
/* ========================================================= */

export async function getAssignments(): Promise<
  UserAssignment[]
> {
  const response =
    await apiClient.get<unknown>(
      endpoints.assignments.list,
    );

  return normalizeList<UserAssignment>(
    response.data,
  );
}

/* ========================================================= */
/* GET SINGLE ASSIGNMENT */
/* GET /api/v1/assignments/{id} */
/* ========================================================= */

export async function getAssignment(
  id: number | string,
): Promise<UserAssignment> {
  const response =
    await apiClient.get<UserAssignment>(
      endpoints.assignments.detail(id),
    );

  return response.data;
}

/* ========================================================= */
/* CREATE ASSIGNMENT */
/* POST /api/v1/assignments */
/* ========================================================= */

export async function createAssignment(
  payload: AssignmentCreateRequest,
): Promise<UserAssignment> {
  const response =
    await apiClient.post<UserAssignment>(
      endpoints.assignments.create,
      payload,
    );

  return response.data;
}

/* ========================================================= */
/* UPDATE ASSIGNMENT */
/* PUT /api/v1/assignments/{id} */
/* ========================================================= */

export async function updateAssignment(
  id: number | string,
  payload: AssignmentUpdateRequest,
): Promise<UserAssignment> {
  const response =
    await apiClient.put<UserAssignment>(
      endpoints.assignments.update(id),
      payload,
    );

  return response.data;
}

/* ========================================================= */
/* DELETE ASSIGNMENT */
/* DELETE /api/v1/assignments/{id} */
/* ========================================================= */

export async function deleteAssignment(
  id: number | string,
): Promise<void> {
  await apiClient.delete(
    endpoints.assignments.delete(id),
  );
}