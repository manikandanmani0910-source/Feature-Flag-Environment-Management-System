import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  createEnvironment,
  deleteEnvironment,
  getEnvironment,
  getEnvironments,
  updateEnvironment,
} from "../services/environments/environmentService";

import type {
  EnvironmentCreateRequest,
  EnvironmentUpdateRequest,
} from "../types/environment";

export function useEnvironments() {
  return useQuery({
    queryKey: ["environments"],
    queryFn: getEnvironments,
  });
}

export function useEnvironment(
  id: number | string,
) {
  return useQuery({
    queryKey: ["environments", id],
    queryFn: () => getEnvironment(id),
    enabled: Boolean(id),
  });
}

export function useCreateEnvironment() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: (
      payload: EnvironmentCreateRequest,
    ) => createEnvironment(payload),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["environments"],
      });
    },
  });
}

export function useUpdateEnvironment() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number | string;
      payload: EnvironmentUpdateRequest;
    }) =>
      updateEnvironment(id, payload),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["environments"],
      });
    },
  });
}

export function useDeleteEnvironment() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: deleteEnvironment,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["environments"],
      });
    },
  });
}