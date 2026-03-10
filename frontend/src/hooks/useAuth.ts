// src/hooks/useAuth.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation"; // ADDED: Next.js router
import { authApi } from "../api/auth.api";
import { AxiosError } from "axios";
import { useUserStore } from "../store/userStore";
import { RegisterInput, LoginInput } from "../lib/validations/auth";
import { toast } from "sonner";

export const useAuth = () => {
  const queryClient = useQueryClient();
  const router = useRouter(); // ADDED: Initialize router
  const { user, setUser, clearUser } = useUserStore();

  // 1. Initial Load: Check if user is already logged in (via HTTP-only cookie)
  const useInitAuth = () => {
    return useQuery({
      queryKey: ["authUser"],
      queryFn: async () => {
        try {
          const response = await authApi.getCurrentUser();
          // getCurrentUser returns the user object directly as response.data
          // while login returns it as response.data.user
          const user = response?.data?.user || response?.data;
          if (user) {
            setUser(user);
            return user;
          }
          clearUser();
          return null; // Must return null, not undefined
        } catch {
          clearUser();
          return null; // Return null instead of throwing so it's not treated as a query error
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
      toast.success("Welcome back!");
    },
    onError: (error) => {
      const authError = error as AxiosError<{ message: string }>;
      toast.error(
        authError.response?.data?.message || "Login failed. Please try again.",
      );
    },
  });

  // 3. Register Hook
  const registerMutation = useMutation({
    mutationFn: (data: RegisterInput) => authApi.register(data),
    onSuccess: (response) => {
      setUser(response.data.user);
      toast.success("Registration successful!");
    },
    onError: (error) => {
      const authError = error as AxiosError<{ message: string }>;
      toast.error(
        authError.response?.data?.message ||
          "Registration failed. Please try again.",
      );
    },
  });

  // 4. Logout Hook
  const logoutMutation = useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      clearUser();
      // Clear all cached queries so no sensitive data is left behind
      queryClient.clear();
      // ADDED: Redirect back to login
      router.push("/login");
    },
    onError: (error) => {
      console.error("Logout failed on backend, forcing local logout", error);
      // ADDED: Failsafe clear and redirect even if backend connection drops
      clearUser();
      queryClient.clear();
      router.push("/login");
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
