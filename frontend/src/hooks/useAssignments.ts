import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  createAssignment,
  deleteAssignment,
  getAssignment,
  getAssignments,
  updateAssignment,
} from "../services/assignments/assignmentService";

import type {
  AssignmentCreateRequest,
  AssignmentUpdateRequest,
} from "../types/assignment";

export function useAssignments() {
  return useQuery({
    queryKey: ["assignments"],
    queryFn: getAssignments,
  });
}

export function useAssignment(
  id: number | string,
) {
  return useQuery({
    queryKey: ["assignments", id],
    queryFn: () => getAssignment(id),
    enabled: Boolean(id),
  });
}

export function useCreateAssignment() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: (
      payload: AssignmentCreateRequest,
    ) => createAssignment(payload),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["assignments"],
      });
    },
  });
}

export function useUpdateAssignment() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number | string;
      payload: AssignmentUpdateRequest;
    }) =>
      updateAssignment(id, payload),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["assignments"],
      });
    },
  });
}

export function useDeleteAssignment() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: deleteAssignment,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["assignments"],
      });
    },
  });
}