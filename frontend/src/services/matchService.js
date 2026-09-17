import api from './api';

export const matchService = {
  async analyzeCandidate(candidateId, jobId) {
    const response = await api.post(`/matches/analyze?candidateId=${candidateId}&jobId=${jobId}`);
    return response.data;
  },

  async getRankedCandidates(jobId) {
    const response = await api.get(`/matches/job/${jobId}`);
    return response.data;
  },

  async getMyMatches() {
    const response = await api.get('/matches/my');
    return response.data;
  },

  async getCandidateMatches(candidateId) {
    const response = await api.get(`/matches/candidate/${candidateId}`);
    return response.data;
  },

  async getAllMatches() {
    const response = await api.get('/matches/all');
    return response.data;
  },

  async getMatchById(id) {
    const response = await api.get(`/matches/${id}`);
    return response.data;
  },

  async checkMatch(candidateId, jobId) {
    const response = await api.get(`/matches/check?candidateId=${candidateId}&jobId=${jobId}`);
    return response.data;
  },

  async validateMatch(matchId, status = 'VALIDATED', notes = '') {
    const response = await api.post(`/matches/${matchId}/validate`, { status, notes });
    return response.data;
  },
};

export default matchService;
