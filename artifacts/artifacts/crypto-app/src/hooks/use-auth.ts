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
        console.log("Login success - data received:", data);

        if (data?.token) {
          localStorage.setItem('adminToken', data.token);
          console.log("Token saved to localStorage");
        } else {
          console.warn("No token received from login response");
        }

        queryClient.invalidateQueries({ queryKey: getGetAuthStatusQueryKey() });

        // Force redirect with a small delay to ensure everything is ready
        setTimeout(() => {
          setLocation("/admin");
        }, 150);
      },
      onError: (error: any) => {
        console.error("Login error:", error);
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
