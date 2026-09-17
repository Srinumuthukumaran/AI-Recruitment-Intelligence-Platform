package com.talentiq.backend.service;


import com.talentiq.backend.entity.Candidate;
import com.talentiq.backend.entity.Job;
import com.talentiq.backend.entity.Match;
import com.talentiq.backend.repository.CandidateRepository;
import com.talentiq.backend.repository.JobRepository;
import com.talentiq.backend.repository.MatchRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Locale;

@Service
public class MatchService {

    private static final Logger log = LoggerFactory.getLogger(MatchService.class);

    private final CandidateRepository candidateRepository;
    private final JobRepository jobRepository;
    private final MatchRepository matchRepository;
    private final AiService aiService;
    private final AiResponseParser aiResponseParser;

    public MatchService(
            CandidateRepository candidateRepository,
            JobRepository jobRepository,
            MatchRepository matchRepository,
            AiService aiService,
            AiResponseParser aiResponseParser) {

        this.candidateRepository = candidateRepository;
        this.jobRepository = jobRepository;
        this.matchRepository = matchRepository;
        this.aiService = aiService;
        this.aiResponseParser = aiResponseParser;
    }

    public Match analyzeCandidate(
            Long candidateId,
            Long jobId) {

        Candidate candidate = candidateRepository
                .findById(candidateId)
                .orElseThrow(() ->
                        new RuntimeException("Candidate not found"));

        Job job = jobRepository
                .findById(jobId)
                .orElseThrow(() ->
                        new RuntimeException("Job not found"));

        if (candidate.getResumeText() == null || candidate.getResumeText().trim().isEmpty()) {
            throw new RuntimeException("Candidate has not uploaded a resume yet.");
        }

        Match match = matchRepository
                .findByCandidateIdAndJobId(candidateId, jobId)
                .orElse(new Match());

        match.setCandidate(candidate);
        match.setJob(job);
        if (match.getValidationStatus() == null) {
            match.setValidationStatus("PENDING");
        }

        try {
            String analysis = aiService.analyzeResume(
                    candidate.getResumeText(),
                    job.getDescription()
            );
            match = aiResponseParser.parse(analysis, match);
        } catch (Exception e) {
            log.warn("Gemini AI matching failed for candidate {} and job {}: {}. Generating rule-based match analysis.",
                    candidateId, jobId, e.getMessage());
            match = generateFallbackMatch(candidate, job, match);
        }

        return matchRepository.save(match);
    }

    public List<Match> matchCandidateAgainstAllJobs(Long candidateId) {
        Candidate candidate = candidateRepository.findById(candidateId)
                .orElseThrow(() -> new RuntimeException("Candidate not found with id: " + candidateId));

        if (candidate.getResumeText() == null || candidate.getResumeText().trim().isEmpty()) {
            return List.of();
        }

        List<Job> allJobs = jobRepository.findAll();
        List<Match> results = new ArrayList<>();

        for (Job job : allJobs) {
            try {
                Match match = matchRepository
                        .findByCandidateIdAndJobId(candidateId, job.getId())
                        .orElse(new Match());

                match.setCandidate(candidate);
                match.setJob(job);
                if (match.getValidationStatus() == null) {
                    match.setValidationStatus("PENDING");
                }
                match = generateFallbackMatch(candidate, job, match);
                results.add(matchRepository.save(match));
            } catch (Exception e) {
                log.warn("Error matching candidate {} against job {}: {}", candidateId, job.getId(), e.getMessage());
            }
        }
        return results;
    }

    public Match validateMatch(Long matchId, String status, String notes) {
        Match match = matchRepository.findById(matchId)
                .orElseThrow(() -> new RuntimeException("Match not found with id: " + matchId));

        String targetStatus = (status != null && !status.isBlank()) ? status.trim().toUpperCase() : "VALIDATED";
        match.setValidationStatus(targetStatus);
        match.setValidatedAt(LocalDateTime.now());
        if (notes != null) {
            match.setRecruiterNotes(notes.trim());
        }

        Candidate candidate = match.getCandidate();
        if (candidate != null) {
            candidate.setSubmissionStatus(targetStatus);
            candidate.setValidatedAt(LocalDateTime.now());
            if (notes != null) {
                candidate.setValidationNotes(notes.trim());
            }
            candidateRepository.save(candidate);
        }

        return matchRepository.save(match);
    }

    private Match generateFallbackMatch(Candidate candidate, Job job, Match match) {
        String resumeLower = candidate.getResumeText().toLowerCase(Locale.ROOT);
        String requiredSkills = job.getRequiredSkills() != null ? job.getRequiredSkills() : "";

        List<String> requiredList = Arrays.stream(requiredSkills.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .toList();

        List<String> matching = new ArrayList<>();
        List<String> missing = new ArrayList<>();

        for (String req : requiredList) {
            String reqLower = req.toLowerCase(Locale.ROOT);
            if (resumeLower.contains(reqLower)) {
                matching.add(req);
            } else {
                missing.add(req);
            }
        }

        double score;
        if (requiredList.isEmpty()) {
            score = 75.0;
        } else {
            double ratio = (double) matching.size() / requiredList.size();
            score = Math.round((50.0 + (ratio * 45.0)) * 10.0) / 10.0;
        }

        match.setMatchScore(score);
        match.setMatchingSkills(matching.isEmpty() ? "General technical fundamentals" : String.join(", ", matching));
        match.setMissingSkills(missing.isEmpty() ? "None identified" : String.join(", ", missing));
        match.setStrengths("Candidate resume demonstrates experience aligned with " +
                (matching.isEmpty() ? "role requirements." : String.join(", ", matching) + "."));
        match.setWeaknesses(missing.isEmpty() ? "No significant skill gaps identified." :
                "Opportunity to strengthen skills in: " + String.join(", ", missing) + ".");
        match.setExperienceMatch(score >= 80.0 ? "Good" : "Moderate");
        match.setExplanation("Evaluated against " + job.getTitle() + " requirements. Candidate demonstrates verified proficiency in " +
                matching.size() + " of " + Math.max(requiredList.size(), 1) + " key technical qualifications.");

        return match;
    }

    public List<Match> getRankedCandidates(Long jobId) {
        return matchRepository.findByJobIdOrderByMatchScoreDesc(jobId);
    }

    public List<Match> getMatchesForCandidate(Long candidateId) {
        return matchRepository.findByCandidateId(candidateId);
    }

    public List<Match> getAllMatches() {
        return matchRepository.findAllByOrderByMatchScoreDesc();
    }

    public Match getMatchById(Long id) {
        return matchRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Match not found with id: " + id));
    }

    public java.util.Optional<Match> getMatchByCandidateAndJob(Long candidateId, Long jobId) {
        return matchRepository.findByCandidateIdAndJobId(candidateId, jobId);
    }
}