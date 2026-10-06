import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  createUser,
  deleteUser,
  getUser,
  getUsers,
  updateUser,
} from "../services/users/userService";

import type {
  UserCreateRequest,
  UserUpdateRequest,
} from "../types/user";

export function useUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: getUsers,
  });
}

export function useUser(
  id: number | string,
) {
  return useQuery({
    queryKey: ["users", id],
    queryFn: () => getUser(id),
    enabled: Boolean(id),
  });
}

export function useCreateUser() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: (
      payload: UserCreateRequest,
    ) => createUser(payload),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["users"],
      });
    },
  });
}

export function useUpdateUser() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number | string;
      payload: UserUpdateRequest;
    }) => updateUser(id, payload),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["users"],
      });

      queryClient.invalidateQueries({
        queryKey: [
          "users",
          variables.id,
        ],
      });
    },
  });
}

export function useDeleteUser() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: deleteUser,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["users"],
      });
    },
  });
}