"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { fetchApi } from "@/lib/api";

/** Auto-logout after 30 minutes of no user activity */
const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000;

/** Re-validate session with the server every 5 minutes while the tab is active */
const HEARTBEAT_INTERVAL_MS = 5 * 60 * 1000;

/** Refresh the JWT cookie every 15 minutes of active use (sliding window) */
const REFRESH_INTERVAL_MS = 15 * 60 * 1000;

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (pin: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const inactivityTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const heartbeatTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const refreshTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  // ─── Core auth check ────────────────────────────────────────────────────────

  const checkAuth = useCallback(async () => {
    try {
      setIsLoading(true);
      await fetchApi("/auth/me", { skipAuthRedirect: true });
      setIsAuthenticated(true);
      if (pathname === "/login") router.push("/");
    } catch {
      setIsAuthenticated(false);
      if (pathname !== "/login") router.push("/login");
    } finally {
      setIsLoading(false);
    }
  }, [pathname, router]);

  // ─── Force logout helper ─────────────────────────────────────────────────────

  const forceLogout = useCallback(async (reason?: string) => {
    if (reason) console.info(`[Auth] Logging out: ${reason}`);
    stopTimers();
    try {
      await fetchApi("/auth/logout", { method: "POST", skipAuthRedirect: true });
    } catch { /* best-effort */ }
    setIsAuthenticated(false);
    router.push("/login");
  }, [router]);

  // ─── Timer management ────────────────────────────────────────────────────────

  function stopTimers() {
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    if (heartbeatTimer.current) clearInterval(heartbeatTimer.current);
    if (refreshTimer.current) clearInterval(refreshTimer.current);
    inactivityTimer.current = null;
    heartbeatTimer.current = null;
    refreshTimer.current = null;
  }

  const resetInactivityTimer = useCallback(() => {
    if (!isAuthenticated) return;
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    inactivityTimer.current = setTimeout(
      () => forceLogout("30 minutes of inactivity"),
      INACTIVITY_TIMEOUT_MS
    );
  }, [isAuthenticated, forceLogout]);

  const startTimers = useCallback(() => {
    stopTimers();

    // Inactivity timeout
    inactivityTimer.current = setTimeout(
      () => forceLogout("30 minutes of inactivity"),
      INACTIVITY_TIMEOUT_MS
    );

    // Heartbeat — silently verify session is still valid on the server
    heartbeatTimer.current = setInterval(async () => {
      if (document.visibilityState !== "visible") return;
      try {
        await fetchApi("/auth/me", { skipAuthRedirect: true });
      } catch {
        forceLogout("Session expired (heartbeat)");
      }
    }, HEARTBEAT_INTERVAL_MS);

    // Sliding window refresh — extend the cookie while the user is active
    refreshTimer.current = setInterval(async () => {
      if (document.visibilityState !== "visible") return;
      try {
        await fetchApi("/auth/refresh", { method: "POST", skipAuthRedirect: true });
      } catch {
        forceLogout("Session could not be refreshed");
      }
    }, REFRESH_INTERVAL_MS);
  }, [forceLogout]);

  // ─── Activity event listeners ────────────────────────────────────────────────

  useEffect(() => {
    if (!isAuthenticated) {
      stopTimers();
      return;
    }

    startTimers();

    const activityEvents = ["mousemove", "mousedown", "keydown", "touchstart", "scroll"];
    activityEvents.forEach((e) => window.addEventListener(e, resetInactivityTimer, { passive: true }));

    // Re-validate session when the user switches back to this tab
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        checkAuth();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      stopTimers();
      activityEvents.forEach((e) => window.removeEventListener(e, resetInactivityTimer));
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isAuthenticated, startTimers, resetInactivityTimer, checkAuth]);

  // Initial session check on mount
  useEffect(() => {
    checkAuth();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Public API ──────────────────────────────────────────────────────────────

  const login = async (pin: string) => {
    await fetchApi("/auth/login", {
      method: "POST",
      body: JSON.stringify({ pin }),
      skipAuthRedirect: true,
    });
    setIsAuthenticated(true);
    router.push("/");
  };

  const logout = async () => forceLogout("User logged out");

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
