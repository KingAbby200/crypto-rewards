import { useQueryClient } from "@tanstack/react-query";
import {
  useGetUserTransactions as useGeneratedGetUserTransactions,
  useCreateTransaction as useGeneratedCreateTransaction,
  useUpdateTransaction as useGeneratedUpdateTransaction,
  useDeleteTransaction as useGeneratedDeleteTransaction,
  getGetUserTransactionsQueryKey
} from "@workspace/api-client-react";

export function useUserTransactions(slug: string) {
  return useGeneratedGetUserTransactions(slug, {
    query: { enabled: !!slug }
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();
  return useGeneratedCreateTransaction({
    mutation: {
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: getGetUserTransactionsQueryKey(variables.slug) });
      }
    }
  });
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient();
  return useGeneratedUpdateTransaction({
    mutation: {
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: getGetUserTransactionsQueryKey(variables.slug) });
      }
    }
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();
  return useGeneratedDeleteTransaction({
    mutation: {
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: getGetUserTransactionsQueryKey(variables.slug) });
      }
    }
  });
}
