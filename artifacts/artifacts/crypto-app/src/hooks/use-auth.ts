import { useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { 
  useAdminLogin as useGeneratedAdminLogin,
  useAdminLogout as useGeneratedAdminLogout,
  useGetAuthStatus as useGeneratedGetAuthStatus,
  getGetAuthStatusQueryKey,
} from "@workspace/api-client-react";

export function useAuth() {
  return useGeneratedGetAuthStatus({ query: { retry: false } });
}

export function useLogin() {
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  
  return useGeneratedAdminLogin({
    mutation: {
      onSuccess: (data) => {
        if (data.token) {
          localStorage.setItem('adminToken', data.token);
        }
        queryClient.invalidateQueries({ queryKey: getGetAuthStatusQueryKey() });
        setLocation("/admin");
      }
    }
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  
  return useGeneratedAdminLogout({
    mutation: {
      onSuccess: () => {
        localStorage.removeItem('adminToken');
        queryClient.invalidateQueries({ queryKey: getGetAuthStatusQueryKey() });
        setLocation("/admin/secret-login");
      }
    }
  });
}
