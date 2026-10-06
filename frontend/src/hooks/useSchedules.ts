import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  createSchedule,
  deleteSchedule,
  getSchedule,
  getSchedules,
  updateSchedule,
} from "../services/schedules/scheduleService";

import type {
  FeatureScheduleCreateRequest,
  FeatureScheduleUpdateRequest,
} from "../types/schedule";

export function useSchedules() {
  return useQuery({
    queryKey: ["schedules"],
    queryFn: getSchedules,
  });
}

export function useSchedule(
  id: number | string,
) {
  return useQuery({
    queryKey: ["schedules", id],
    queryFn: () => getSchedule(id),
    enabled: Boolean(id),
  });
}

export function useCreateSchedule() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: (
      payload: FeatureScheduleCreateRequest,
    ) => createSchedule(payload),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["schedules"],
      });
    },
  });
}

export function useUpdateSchedule() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number | string;
      payload: FeatureScheduleUpdateRequest;
    }) =>
      updateSchedule(id, payload),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["schedules"],
      });
    },
  });
}

export function useDeleteSchedule() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: deleteSchedule,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["schedules"],
      });
    },
  });
}