package com.talentiq.backend.service;

import com.talentiq.backend.repository.JobRepository;
import com.talentiq.backend.repository.CandidateRepository;
import com.talentiq.backend.repository.MatchRepository;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class DashboardService {

    private final JobRepository jobRepository;
    private final CandidateRepository candidateRepository;
    private final MatchRepository matchRepository;

    public DashboardService(
            JobRepository jobRepository,
            CandidateRepository candidateRepository,
            MatchRepository matchRepository) {

        this.jobRepository = jobRepository;
        this.candidateRepository = candidateRepository;
        this.matchRepository = matchRepository;
    }

    public Map<String, Object> getDashboardStats() {

        Map<String, Object> stats = new HashMap<>();

        stats.put("totalJobs",
                jobRepository.count());

        stats.put("totalCandidates",
                candidateRepository.count());

        stats.put("totalMatches",
                matchRepository.count());

        java.util.List<com.talentiq.backend.entity.Match> allMatches = matchRepository.findAll();
        double avg = allMatches.isEmpty() ? 0.0 :
                allMatches.stream()
                        .filter(m -> m.getMatchScore() != null)
                        .mapToDouble(com.talentiq.backend.entity.Match::getMatchScore)
                        .average()
                        .orElse(0.0);
        stats.put("averageMatchScore", Math.round(avg * 10.0) / 10.0);

        java.util.List<com.talentiq.backend.entity.Job> allJobs = jobRepository.findAll();
        int jobsSize = allJobs.size();
        stats.put("recentJobs", allJobs.subList(Math.max(0, jobsSize - 5), jobsSize));

        java.util.List<com.talentiq.backend.entity.Match> rankedMatches = matchRepository.findAllByOrderByMatchScoreDesc();
        stats.put("topCandidates", rankedMatches.stream().limit(5).toList());
        stats.put("recentMatches", allMatches.subList(Math.max(0, allMatches.size() - 5), allMatches.size()));

        // Candidate submission and validation metrics
        long pending = candidateRepository.countBySubmissionStatus("SUBMITTED");
        long validated = candidateRepository.countBySubmissionStatus("VALIDATED");
        stats.put("pendingSubmissions", pending);
        stats.put("validatedCandidates", validated);
        stats.put("recentSubmissions", candidateRepository.findBySubmissionStatusOrderBySubmittedAtDesc("SUBMITTED").stream().limit(5).toList());

        return stats;
    }
}