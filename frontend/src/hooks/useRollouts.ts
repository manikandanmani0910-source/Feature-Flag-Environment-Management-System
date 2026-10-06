import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  createRollout,
  deleteRollout,
  getRollout,
  getRollouts,
  updateRollout,
} from "../services/rollouts/rolloutService";

import type {
  FeatureRolloutCreateRequest,
  FeatureRolloutUpdateRequest,
} from "../types/rollout";

export function useRollouts() {
  return useQuery({
    queryKey: ["rollouts"],
    queryFn: getRollouts,
  });
}

export function useRollout(
  id: number | string,
) {
  return useQuery({
    queryKey: ["rollouts", id],
    queryFn: () => getRollout(id),
    enabled: Boolean(id),
  });
}

export function useCreateRollout() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: (
      payload: FeatureRolloutCreateRequest,
    ) => createRollout(payload),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["rollouts"],
      });
    },
  });
}

export function useUpdateRollout() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number | string;
      payload: FeatureRolloutUpdateRequest;
    }) =>
      updateRollout(id, payload),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["rollouts"],
      });
    },
  });
}

export function useDeleteRollout() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: deleteRollout,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["rollouts"],
      });
    },
  });
}