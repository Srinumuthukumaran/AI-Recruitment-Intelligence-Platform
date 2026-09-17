package com.talentiq.backend.service;

import com.talentiq.backend.entity.Candidate;
import com.talentiq.backend.entity.Job;
import com.talentiq.backend.entity.Match;
import com.talentiq.backend.repository.CandidateRepository;
import com.talentiq.backend.repository.JobRepository;
import com.talentiq.backend.repository.MatchRepository;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class SkillGapService {

    private final CandidateRepository candidateRepository;
    private final JobRepository jobRepository;
    private final MatchRepository matchRepository;

    public SkillGapService(CandidateRepository candidateRepository,
                           JobRepository jobRepository,
                           MatchRepository matchRepository) {
        this.candidateRepository = candidateRepository;
        this.jobRepository = jobRepository;
        this.matchRepository = matchRepository;
    }

    public Map<String, Object> analyzeSkillGap(Long candidateId, Long jobId) {
        Candidate candidate = candidateRepository.findById(candidateId)
                .orElseThrow(() -> new RuntimeException("Candidate not found with id: " + candidateId));

        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found with id: " + jobId));

        Optional<Match> matchOpt = matchRepository.findByCandidateIdAndJobId(candidateId, jobId);

        List<String> skillsYouHave = new ArrayList<>();
        List<String> rawMissingSkills = new ArrayList<>();
        Double score = null;
        String explanation = null;

        if (matchOpt.isPresent()) {
            Match match = matchOpt.get();
            score = match.getMatchScore();
            explanation = match.getExplanation();

            if (match.getMatchingSkills() != null && !match.getMatchingSkills().isBlank()) {
                skillsYouHave.addAll(parseSkillList(match.getMatchingSkills()));
            }

            if (match.getMissingSkills() != null && !match.getMissingSkills().isBlank()) {
                rawMissingSkills.addAll(parseSkillList(match.getMissingSkills()));
            }
        } else {
            // Compare candidate resume text with job required skills directly
            String resumeLower = candidate.getResumeText() != null ? candidate.getResumeText().toLowerCase() : "";
            String[] required = job.getRequiredSkills().split("[,;\\n]+");

            for (String req : required) {
                String clean = req.trim();
                if (clean.isEmpty()) continue;
                if (resumeLower.contains(clean.toLowerCase())) {
                    skillsYouHave.add(clean);
                } else {
                    rawMissingSkills.add(clean);
                }
            }

            if (skillsYouHave.isEmpty() && rawMissingSkills.isEmpty()) {
                rawMissingSkills.addAll(Arrays.asList("System Design", "Cloud Deployment", "Automated Testing"));
            }

            int total = skillsYouHave.size() + rawMissingSkills.size();
            score = total > 0 ? Math.round((skillsYouHave.size() * 100.0 / total) * 10.0) / 10.0 : 50.0;
            explanation = "Direct skill assessment based on job specifications and uploaded resume profile.";
        }

        List<Map<String, String>> skillsToImprove = new ArrayList<>();
        for (String missing : rawMissingSkills) {
            String clean = missing.replaceAll("^[•\\-*\\s]+", "").trim();
            if (clean.isEmpty()) continue;

            Map<String, String> item = new HashMap<>();
            item.put("skill", clean);
            item.put("priority", determinePriority(clean));
            item.put("reason", generateReason(clean, job.getTitle()));
            item.put("recommendation", generateRecommendation(clean));
            skillsToImprove.add(item);
        }

        Map<String, Object> result = new HashMap<>();
        result.put("candidateId", candidate.getId());
        result.put("candidateName", candidate.getName());
        result.put("candidateEmail", candidate.getEmail());
        result.put("jobId", job.getId());
        result.put("jobTitle", job.getTitle());
        result.put("matchScore", score != null ? score : 0.0);
        result.put("skillsYouHave", skillsYouHave);
        result.put("skillsToImprove", skillsToImprove);
        result.put("explanation", explanation);
        return result;
    }

    private List<String> parseSkillList(String text) {
        List<String> list = new ArrayList<>();
        String[] lines = text.split("[,\\n]+");
        for (String line : lines) {
            String clean = line.replaceAll("^[•\\-*\\d.]+\\s*", "").trim();
            if (!clean.isEmpty() && !clean.equalsIgnoreCase("none") && !clean.equalsIgnoreCase("n/a")) {
                list.add(clean);
            }
        }
        return list;
    }

    private String determinePriority(String skill) {
        String s = skill.toLowerCase();
        if (s.contains("docker") || s.contains("aws") || s.contains("cloud") || s.contains("kubernetes") ||
                s.contains("microservices") || s.contains("spring") || s.contains("sql") || s.contains("system design")) {
            return "HIGH";
        }
        if (s.contains("kafka") || s.contains("redis") || s.contains("ci/cd") || s.contains("git") || s.contains("unit test")) {
            return "MEDIUM";
        }
        return "LOW";
    }

    private String generateReason(String skill, String jobTitle) {
        String s = skill.toLowerCase();
        if (s.contains("docker") || s.contains("container")) {
            return "Frequently required for modern containerized microservices and automated deployment.";
        }
        if (s.contains("aws") || s.contains("azure") || s.contains("gcp") || s.contains("cloud")) {
            return "Cloud architecture and hosting is essential for production scalability in " + jobTitle + ".";
        }
        if (s.contains("microservice")) {
            return "Essential architectural pattern for building modular, resilient distributed enterprise applications.";
        }
        if (s.contains("redis") || s.contains("cache")) {
            return "High-performance in-memory caching is critical for optimizing database latency and throughput.";
        }
        if (s.contains("kafka") || s.contains("mq") || s.contains("rabbit")) {
            return "Core for event-driven asynchronous messaging across backend services.";
        }
        return "Frequently required qualification for " + jobTitle + " to ensure robust software engineering.";
    }

    private String generateRecommendation(String skill) {
        String s = skill.toLowerCase();
        if (s.contains("docker")) {
            return "Learn containerization fundamentals and build a multi-stage Docker container for your application.";
        }
        if (s.contains("aws") || s.contains("cloud")) {
            return "Practice deploying an API to AWS ECS, Lambda, or App Runner with an RDS database.";
        }
        if (s.contains("microservice")) {
            return "Design and implement service-to-service communication with an API Gateway and Eureka/Consul.";
        }
        if (s.contains("redis")) {
            return "Integrate Redis cache annotations (e.g., @Cacheable) into a Spring Boot CRUD application.";
        }
        if (s.contains("kafka")) {
            return "Build a simple producer and consumer application using Apache Kafka or Spring Cloud Stream.";
        }
        return "Build a practical hands-on project demonstrating " + skill + " and publish it to GitHub.";
    }
}
