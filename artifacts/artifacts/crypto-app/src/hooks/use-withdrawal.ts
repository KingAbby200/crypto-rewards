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
    ...getGetWithdrawalRequestQueryOptions(slug),
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
