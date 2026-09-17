import api from './api';

export const authService = {
  async register({ name, email, password, role }) {
    const response = await api.post('/auth/register', {
      name,
      email,
      password,
      role, // 'RECRUITER' or 'CANDIDATE'
    });
    return response.data;
  },

  async login({ email, password }) {
    const response = await api.post('/auth/login', {
      email,
      password,
    });
    // The backend returns the JWT token as a raw string
    const token = typeof response.data === 'string' ? response.data : response.data.token;
    if (token) {
      localStorage.setItem('talentiq_token', token);
    }
    return token;
  },

  async getCurrentUser() {
    const response = await api.get('/auth/me');
    return response.data;
  },

  logout() {
    localStorage.removeItem('talentiq_token');
    localStorage.removeItem('talentiq_user');
  },

  getToken() {
    return localStorage.getItem('talentiq_token');
  },

  parseJwt(token) {
    if (!token) return null;
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch {
      return null;
    }
  },
};

export default authService;
