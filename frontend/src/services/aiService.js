import api from './api';

export const aiService = {
  async askCopilot(question, jobId = null) {
    const payload = { question };
    if (jobId) {
      payload.jobId = jobId;
    }
    const response = await api.post('/copilot/chat', payload);
    return response.data;
  },

  async generateInterviewQuestions({ jobId, candidateId, difficulty = 'Mid-level', questionCount = 5 }) {
    const response = await api.post('/interview/generate', {
      jobId,
      candidateId,
      difficulty,
      questionCount,
    });
    return response.data;
  },

  async getSkillGap(candidateId, jobId) {
    const params = new URLSearchParams();
    if (candidateId) params.append('candidateId', candidateId);
    if (jobId) params.append('jobId', jobId);
    const response = await api.get(`/skills/gap?${params.toString()}`);
    return response.data;
  },

  async getMySkillGap(jobId) {
    const response = await api.get(`/skills/gap/job/${jobId}`);
    return response.data;
  },
};

export default aiService;
