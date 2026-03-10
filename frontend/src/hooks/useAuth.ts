// src/hooks/useAuth.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authApi } from "../api/auth.api";
import { useUserStore } from "../store/userStore";
import { RegisterInput, LoginInput } from "../lib/validations/auth";

export const useAuth = () => {
  const queryClient = useQueryClient();
  const { user, setUser, clearUser } = useUserStore();

  // 1. Initial Load: Check if user is already logged in (via HTTP-only cookie)
  const useInitAuth = () => {
    return useQuery({
      queryKey: ["authUser"],
      queryFn: async () => {
        try {
          const response = await authApi.getCurrentUser();
          setUser(response.data.user);
          return response.data.user;
        } catch (error) {
          clearUser();
          throw error;
        }
      },
      retry: false, // Don't retry if they just aren't logged in
    });
  };

  // 2. Login Hook
  const loginMutation = useMutation({
    mutationFn: (data: LoginInput) => authApi.login(data),
    onSuccess: (response) => {
      // Save user to global store
      setUser(response.data.user);
      // Optional: Show a success toast here later
    },
  });

  // 3. Register Hook
  const registerMutation = useMutation({
    mutationFn: (data: RegisterInput) => authApi.register(data),
    onSuccess: (response) => {
      setUser(response.data.user);
    },
  });

  // 4. Logout Hook
  const logoutMutation = useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      clearUser();
      // Clear all cached queries so no sensitive data is left behind
      queryClient.clear();
    },
  });

  return {
    user,
    useInitAuth,
    login: loginMutation.mutateAsync,
    register: registerMutation.mutateAsync,
    logout: logoutMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
    loginError: loginMutation.error,
    registerError: registerMutation.error,
  };
};
