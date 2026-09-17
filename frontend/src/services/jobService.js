import api from './api';

export const jobService = {
  async getAllJobs() {
    const response = await api.get('/jobs');
    return response.data;
  },

  async getJobById(id) {
    const response = await api.get(`/jobs/${id}`);
    return response.data;
  },

  async createJob({ title, description, requiredSkills, experience, location }) {
    const response = await api.post('/jobs', {
      title,
      description,
      requiredSkills,
      experience,
      location,
    });
    return response.data;
  },

  async deleteJob(id) {
    const response = await api.delete(`/jobs/${id}`);
    return response.data;
  },
};

export default jobService;
