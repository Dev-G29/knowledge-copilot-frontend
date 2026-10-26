import axios from 'axios';

export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080').replace(/\/$/, '');

const TOKEN_KEY = 'kc-token';

export const tokenStore = {
  get: () => {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },
  set: (token) => {
    try {
      localStorage.setItem(TOKEN_KEY, token);
    } catch {
      /* storage unavailable (private mode) – the session just won't persist */
    }
  },
  clear: () => {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch {
      /* ignore */
    }
  },
};

export const api = axios.create({ baseURL: API_BASE_URL, timeout: 60_000 });

api.interceptors.request.use((config) => {
  const token = tokenStore.get();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// AuthProvider registers a handler so an expired/invalid token anywhere logs the user out.
let unauthorizedHandler = null;
export function onUnauthorized(handler) {
  unauthorizedHandler = handler;
}

export function notifyUnauthorized() {
  unauthorizedHandler?.();
}

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || '';
    if (status === 401 && !url.startsWith('/auth/login') && !url.startsWith('/auth/register')) {
      notifyUnauthorized();
    }
    return Promise.reject(error);
  },
);

// Turns the backend's ApiErrorResponse ({ message, details[] }) into one readable sentence.
export function getErrorMessage(error, fallback = 'Something went wrong. Please try again.') {
  if (!error) return fallback;
  if (error.name === 'ApiError') return error.message || fallback;
  if (error.code === 'ERR_NETWORK') return 'Cannot reach the server. Check your connection and try again.';
  if (error.code === 'ECONNABORTED') return 'The server took too long to respond. Please try again.';

  const data = error.response?.data;
  const detail = Array.isArray(data?.details) && data.details.length > 0 ? data.details[0] : null;
  if (detail) {
    // "password: Password must be between 8 and 100 characters" -> "Password must be ..."
    const separator = detail.indexOf(': ');
    return separator > -1 ? detail.slice(separator + 2) : detail;
  }
  return data?.message || fallback;
}

// ---- Endpoints -----------------------------------------------------------------

export const authApi = {
  login: (email, password) => api.post('/auth/login', { email, password }).then((r) => r.data),
  register: (payload) => api.post('/auth/register', payload).then((r) => r.data),
  me: () => api.get('/auth/me').then((r) => r.data),
};

export const conversationsApi = {
  list: () => api.get('/chat/conversations').then((r) => r.data),
  messages: (id) => api.get(`/chat/conversations/${id}`).then((r) => r.data),
  rename: (id, title) => api.patch(`/chat/conversations/${id}`, { title }).then((r) => r.data),
  remove: (id) => api.delete(`/chat/conversations/${id}`),
};

export const documentsApi = {
  list: () => api.get('/documents').then((r) => r.data),
  upload: (file, onProgress) => {
    const form = new FormData();
    form.append('file', file);
    return api
      .post('/documents/upload', form, {
        // Embedding a large document can take a while after the bytes are sent.
        timeout: 10 * 60_000,
        onUploadProgress: (event) => {
          if (event.total) onProgress?.(Math.round((event.loaded / event.total) * 100));
        },
      })
      .then((r) => r.data);
  },
  remove: (id) => api.delete(`/documents/${id}`),
};
