import axios from 'axios';

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';

const api = axios.create({
  baseURL: API_BASE_URL,
});

const getAuthHeaders = (token) => ({
  Authorization: `Bearer ${token}`,
});

export const login = (data) =>
  api.post('/auth/login', data, {
    headers: {
      'Content-Type': 'application/json',
    },
  });

export const register = (data) =>
  api.post('/auth/register', data, {
    headers: {
      'Content-Type': 'application/json',
    },
  });

export const chat = (data, token) =>
  api.post('/chat/query', data, {
    headers: {
      ...getAuthHeaders(token),
      'Content-Type': 'application/json',
    },
  });

export const getConversations = (token) =>
  api.get('/chat/conversations', {
    headers: getAuthHeaders(token),
  });

export const getConversation = (conversationId, token) =>
  api.get(`/chat/conversations/${conversationId}`, {
    headers: getAuthHeaders(token),
  });

export const uploadFile = (file, token) => {
  const formData = new FormData();
  formData.append('file', file);

  return api.post('/documents/upload', formData, {
    headers: {
      ...getAuthHeaders(token),
      'Content-Type': 'multipart/form-data',
    },
  });
};

export { API_BASE_URL };
export default api;
