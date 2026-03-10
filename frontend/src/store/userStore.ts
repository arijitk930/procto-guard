// src/store/userStore.ts
import { create } from "zustand";
import { User } from "../api/auth.api";

// Define the shape of our global state
interface UserState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions to update the state
  setUser: (user: User) => void;
  clearUser: () => void;
  setLoading: (status: boolean) => void;
}

// Create the actual store
export const useUserStore = create<UserState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true, // Starts true so we can check auth on initial page load

  setUser: (user) => set({ user, isAuthenticated: true, isLoading: false }),
  clearUser: () =>
    set({ user: null, isAuthenticated: false, isLoading: false }),
  setLoading: (status) => set({ isLoading: status }),
}));
