import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getGetWithdrawalRequestQueryOptions,
  getGetWithdrawalRequestQueryKey,
  getListWithdrawalRequestsQueryOptions,
  getListWithdrawalRequestsQueryKey,
  useSubmitWithdrawalRequest as useGeneratedSubmitWithdrawalRequest,
  useVerifyWithdrawalRequest as useGeneratedVerifyWithdrawalRequest,
  useRejectWithdrawalRequest as useGeneratedRejectWithdrawalRequest,
} from "@workspace/api-client-react";

export function useWithdrawalRequest(slug: string) {
  return useQuery({
    queryKey: ['withdrawal-request', slug],
    queryFn: async () => {
      const res = await fetch(`/api/withdrawal-requests/${slug}`);
      if (!res.ok) throw new Error('Failed to load withdrawal request');
      return res.json();
    },
    enabled: !!slug,
  });
}

export function useListWithdrawalRequests() {
  return useQuery({
    ...getListWithdrawalRequestsQueryOptions(),
  });
}

export function useSubmitWithdrawalRequest(slug: string) {
  const queryClient = useQueryClient();
  return useGeneratedSubmitWithdrawalRequest({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: getGetWithdrawalRequestQueryKey(slug),
        });
      },
    },
  });
}

export function useVerifyWithdrawalRequest() {
  const queryClient = useQueryClient();
  return useGeneratedVerifyWithdrawalRequest({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: getListWithdrawalRequestsQueryKey(),
        });
      },
    },
  });
}

export function useRejectWithdrawalRequest() {
  const queryClient = useQueryClient();
  return useGeneratedRejectWithdrawalRequest({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: getListWithdrawalRequestsQueryKey(),
        });
      },
    },
  });
}
