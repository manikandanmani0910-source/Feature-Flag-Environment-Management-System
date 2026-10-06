import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  activateFeatureFlag,
  createFeatureFlag,
  deactivateFeatureFlag,
  deleteFeatureFlag,
  getFeatureFlag,
  getFeatureFlags,
  updateFeatureFlag,
} from "../services/feature-flags/featureFlagService";

import type {
  FeatureFlagCreateRequest,
  FeatureFlagUpdateRequest,
} from "../types/featureFlag";

export function useFeatureFlags() {
  return useQuery({
    queryKey: ["feature-flags"],
    queryFn: getFeatureFlags,
  });
}

export function useFeatureFlag(
  id: number | string,
) {
  return useQuery({
    queryKey: ["feature-flags", id],
    queryFn: () => getFeatureFlag(id),
    enabled: Boolean(id),
  });
}

export function useCreateFeatureFlag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      payload: FeatureFlagCreateRequest,
    ) => createFeatureFlag(payload),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["feature-flags"],
      });
    },
  });
}

export function useUpdateFeatureFlag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number | string;
      payload: FeatureFlagUpdateRequest;
    }) =>
      updateFeatureFlag(
        id,
        payload,
      ),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["feature-flags"],
      });

      queryClient.invalidateQueries({
        queryKey: [
          "feature-flags",
          variables.id,
        ],
      });
    },
  });
}

export function useDeleteFeatureFlag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteFeatureFlag,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["feature-flags"],
      });
    },
  });
}

export function useActivateFeatureFlag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: activateFeatureFlag,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["feature-flags"],
      });
    },
  });
}

export function useDeactivateFeatureFlag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deactivateFeatureFlag,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["feature-flags"],
      });
    },
  });
}