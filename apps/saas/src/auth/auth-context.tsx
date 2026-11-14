import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import {
  authenticateUser,
  clearActiveSession,
  getActiveSession,
  getTemporaryDemoCredentials,
  type AuthSession,
  type LoginCredentials,
} from "../data/auth-service";

interface AuthContextType {
  session: AuthSession | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string; session?: AuthSession }>;
  logout: () => void;
  demoCredentials: LoginCredentials;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Restaurar sesión activa si existe y no ha expirado
    const current = getActiveSession();
    setSession(current);
    setIsLoading(false);

    const onStorageChange = () => {
      setSession(getActiveSession());
    };
    window.addEventListener("storage", onStorageChange);
    return () => window.removeEventListener("storage", onStorageChange);
  }, []);

  const login = async (credentials: LoginCredentials) => {
    const result = await authenticateUser(credentials);
    if (result.success && result.session) {
      setSession(result.session);
    }
    return result;
  };

  const logout = () => {
    clearActiveSession();
    setSession(null);
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        isAuthenticated: !!session && session.status === "authenticated",
        isLoading,
        login,
        logout,
        demoCredentials: getTemporaryDemoCredentials(),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe utilizarse dentro de un AuthProvider");
  }
  return context;
}
