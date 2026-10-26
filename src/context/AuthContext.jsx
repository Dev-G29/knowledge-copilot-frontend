import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { authApi, onUnauthorized, tokenStore } from '../lib/api';

const AuthContext = createContext(null);
const USER_KEY = 'kc-user';

function readCachedUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function cacheUser(user) {
  try {
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
    else localStorage.removeItem(USER_KEY);
  } catch {
    /* ignore */
  }
}

const toUser = (data) => ({
  username: data.username,
  email: data.email ?? null,
  roles: Array.isArray(data.roles) ? data.roles : [],
});

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => tokenStore.get());
  const [user, setUser] = useState(() => (tokenStore.get() ? readCachedUser() : null));
  // While a stored token is being re-validated we can still render from the cached user.
  const [status, setStatus] = useState(() => (tokenStore.get() ? 'checking' : 'anonymous'));

  const logout = useCallback((reason) => {
    tokenStore.clear();
    cacheUser(null);
    setToken(null);
    setUser(null);
    setStatus('anonymous');
    if (reason === 'expired') {
      // Several requests can fail with 401 at once; a fixed id shows the message only once.
      toast.info('Your session expired. Please sign in again.', { id: 'session-expired' });
    }
  }, []);

  const applySession = useCallback((data) => {
    tokenStore.set(data.accessToken);
    const nextUser = toUser(data);
    cacheUser(nextUser);
    setToken(data.accessToken);
    setUser(nextUser);
    setStatus('authenticated');
    return nextUser;
  }, []);

  const login = useCallback(async (email, password) => applySession(await authApi.login(email, password)), [applySession]);

  const register = useCallback(async (payload) => applySession(await authApi.register(payload)), [applySession]);

  useEffect(() => {
    onUnauthorized(() => logout('expired'));
    return () => onUnauthorized(null);
  }, [logout]);

  // Re-validate a stored token on load (and pick up role changes).
  useEffect(() => {
    if (!token || status !== 'checking') return;
    let cancelled = false;
    authApi
      .me()
      .then((profile) => {
        if (cancelled) return;
        const nextUser = toUser(profile);
        cacheUser(nextUser);
        setUser(nextUser);
        setStatus('authenticated');
      })
      .catch((error) => {
        if (cancelled) return;
        // A network error shouldn't log the user out; a 401 is handled by the interceptor.
        if (error.response?.status !== 401) setStatus(readCachedUser() ? 'authenticated' : 'anonymous');
      });
    return () => {
      cancelled = true;
    };
  }, [token, status]);

  const value = useMemo(
    () => ({
      token,
      user,
      status,
      isAuthenticated: Boolean(token),
      isAdmin: Boolean(user?.roles?.includes('ADMIN')),
      login,
      register,
      logout,
    }),
    [token, user, status, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>');
  return context;
}
