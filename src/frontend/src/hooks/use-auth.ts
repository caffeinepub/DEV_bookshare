import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { useQueryClient } from "@tanstack/react-query";

export function useAuth() {
  const {
    login,
    clear,
    isAuthenticated,
    isInitializing,
    isLoggingIn,
    identity,
  } = useInternetIdentity();
  const queryClient = useQueryClient();

  const handleLogin = () => {
    login();
  };

  const handleLogout = () => {
    clear();
    queryClient.clear();
  };

  const principalText = identity?.getPrincipal().toString() ?? null;

  return {
    isAuthenticated,
    isInitializing,
    isLoggingIn,
    identity,
    principalText,
    login: handleLogin,
    logout: handleLogout,
  };
}
