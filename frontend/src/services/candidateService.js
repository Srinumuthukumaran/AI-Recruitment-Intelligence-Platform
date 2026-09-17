import api from './api';

export const candidateService = {
  async getAllCandidates(status) {
    const url = status && status !== 'ALL' ? `/candidates?status=${status}` : '/candidates';
    const response = await api.get(url);
    return response.data;
  },

  async getCandidateById(id) {
    const response = await api.get(`/candidates/${id}`);
    return response.data;
  },

  async getMyProfile() {
    const response = await api.get('/candidates/me');
    return response.data;
  },

  async submitMyResume(notes) {
    const response = await api.post('/candidates/me/submit', { notes });
    return response.data;
  },

  async validateCandidate(id, status = 'VALIDATED', notes = '') {
    const response = await api.post(`/candidates/${id}/validate`, { status, notes });
    return response.data;
  },

  async updateMyProfile(profileData) {
    const response = await api.put('/candidates/me', profileData);
    return response.data;
  },

  async uploadResume(file, email) {
    const formData = new FormData();
    formData.append('file', file);
    if (email) {
      formData.append('email', email);
    }

    const response = await api.post('/resumes/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async updateCandidate(id, candidateData) {
    const response = await api.put(`/candidates/${id}`, candidateData);
    return response.data;
  },

  async deleteCandidate(id) {
    const response = await api.delete(`/candidates/${id}`);
    return response.data;
  },

  async createCandidate(candidateData) {
    const response = await api.post('/candidates', candidateData);
    return response.data;
  },

  async uploadCandidateResume(file, name, email) {
    const formData = new FormData();
    formData.append('file', file);
    if (name) formData.append('name', name);
    if (email) formData.append('email', email);

    const response = await api.post('/candidates/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async bulkUploadResumes(files) {
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i]);
    }

    const response = await api.post('/candidates/bulk-upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async createCandidatesBatch(candidatesList) {
    const response = await api.post('/candidates/batch', candidatesList);
    return response.data;
  },
};

export default candidateService;
