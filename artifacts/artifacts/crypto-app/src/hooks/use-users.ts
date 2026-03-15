import { useQueryClient } from "@tanstack/react-query";
import {
  useListUsers as useGeneratedListUsers,
  useCreateUser as useGeneratedCreateUser,
  useGetUserBySlug as useGeneratedGetUserBySlug,
  useUpdateUser as useGeneratedUpdateUser,
  useDeleteUser as useGeneratedDeleteUser,
  getListUsersQueryKey,
  getGetUserBySlugQueryKey
} from "@workspace/api-client-react";

export function useUsers() {
  return useGeneratedListUsers();
}

export function useUser(slug: string) {
  return useGeneratedGetUserBySlug(slug, {
    query: { enabled: !!slug }
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useGeneratedCreateUser({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListUsersQueryKey() });
      }
    }
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useGeneratedUpdateUser({
    mutation: {
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: getListUsersQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetUserBySlugQueryKey(data.slug) });
      }
    }
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useGeneratedDeleteUser({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListUsersQueryKey() });
      }
    }
  });
}
