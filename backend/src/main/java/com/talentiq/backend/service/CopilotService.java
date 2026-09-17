package com.talentiq.backend.service;

import com.talentiq.backend.entity.Candidate;
import com.talentiq.backend.entity.Job;
import com.talentiq.backend.entity.Match;
import com.talentiq.backend.repository.CandidateRepository;
import com.talentiq.backend.repository.JobRepository;
import com.talentiq.backend.repository.MatchRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class CopilotService {

    private final AiService aiService;
    private final JobRepository jobRepository;
    private final CandidateRepository candidateRepository;
    private final MatchRepository matchRepository;

    public CopilotService(AiService aiService,
                          JobRepository jobRepository,
                          CandidateRepository candidateRepository,
                          MatchRepository matchRepository) {
        this.aiService = aiService;
        this.jobRepository = jobRepository;
        this.candidateRepository = candidateRepository;
        this.matchRepository = matchRepository;
    }

    public Map<String, Object> askCopilot(String question, Long jobId) {
        if (question == null || question.isBlank()) {
            throw new RuntimeException("Question cannot be empty");
        }

        StringBuilder context = new StringBuilder();

        if (jobId != null) {
            Optional<Job> jobOpt = jobRepository.findById(jobId);
            if (jobOpt.isPresent()) {
                Job job = jobOpt.get();
                context.append("TARGET JOB:\n")
                        .append("Title: ").append(job.getTitle()).append("\n")
                        .append("Required Skills: ").append(job.getRequiredSkills()).append("\n")
                        .append("Experience Required: ").append(job.getExperience()).append("\n")
                        .append("Location: ").append(job.getLocation()).append("\n")
                        .append("Description: ").append(job.getDescription()).append("\n\n");

                List<Match> matches = matchRepository.findByJobIdOrderByMatchScoreDesc(jobId);
                context.append("CANDIDATES ANALYZED FOR THIS JOB (").append(matches.size()).append(" candidates):\n");
                for (Match m : matches) {
                    context.append("- Candidate: ").append(m.getCandidate().getName())
                            .append(" (").append(m.getCandidate().getEmail()).append(")")
                            .append(" | Match Score: ").append(m.getMatchScore()).append("%")
                            .append(" | Matching Skills: ").append(m.getMatchingSkills())
                            .append(" | Missing Skills: ").append(m.getMissingSkills())
                            .append(" | Strengths: ").append(m.getStrengths())
                            .append(" | Weaknesses: ").append(m.getWeaknesses())
                            .append("\n");
                }
            }
        } else {
            List<Job> allJobs = jobRepository.findAll();
            context.append("ACTIVE JOBS IN SYSTEM (").append(allJobs.size()).append(" jobs):\n");
            for (Job j : allJobs) {
                context.append("- Job #").append(j.getId()).append(": ").append(j.getTitle())
                        .append(" | Required: ").append(j.getRequiredSkills())
                        .append(" | Exp: ").append(j.getExperience()).append("\n");
            }

            List<Candidate> candidates = candidateRepository.findAll();
            context.append("\nREGISTERED CANDIDATES (").append(candidates.size()).append(" candidates):\n");
            for (Candidate c : candidates) {
                context.append("- ").append(c.getName()).append(" (").append(c.getEmail()).append(")\n");
            }

            List<Match> topMatches = matchRepository.findAllByOrderByMatchScoreDesc();
            context.append("\nRECENT TOP MATCHES:\n");
            for (Match m : topMatches.stream().limit(10).toList()) {
                context.append("- ").append(m.getCandidate().getName())
                        .append(" for ").append(m.getJob().getTitle())
                        .append(": ").append(m.getMatchScore()).append("%\n");
            }
        }

        String prompt = """
                You are TalentIQ AI Recruiter Copilot, an intelligent recruitment assistant.
                You assist recruiters in analyzing candidates, explaining rankings, identifying skill gaps, and recommending best matches.

                %s

                RECRUITER QUESTION:
                %s

                IMPORTANT GUIDELINES:
                - Answer concisely, professionally, and clearly.
                - Use bullet points and clear sections where helpful.
                - Do not use or infer sensitive personal characteristics (race, religion, gender, age, disability, etc.).
                - Evaluate only job-related qualifications.
                - Remind recruiters that TalentIQ provides AI-assisted recommendations, and final hiring decisions remain with human recruiters.
                """.formatted(context.toString(), question);

        String answer;
        try {
            answer = aiService.askCopilot(prompt);
        } catch (Exception e) {
            StringBuilder fallback = new StringBuilder();
            fallback.append("### TalentIQ Recruiter Copilot Assistant (Contextual Summary)\n\n");
            fallback.append("Based on the current candidate directory and job listings in TalentIQ:\n\n");
            if (jobId != null) {
                fallback.append("- **Target Job Evaluated:** Job ID #").append(jobId).append("\n");
                List<Match> matches = matchRepository.findByJobIdOrderByMatchScoreDesc(jobId);
                if (!matches.isEmpty()) {
                    fallback.append("- **Top Recommended Candidate:** ").append(matches.get(0).getCandidate().getName())
                            .append(" with a match score of **").append(matches.get(0).getMatchScore()).append("%**.\n");
                    fallback.append("- **Key Verified Skills:** ").append(matches.get(0).getMatchingSkills()).append("\n");
                    if (matches.get(0).getMissingSkills() != null && !matches.get(0).getMissingSkills().isBlank()) {
                        fallback.append("- **Identified Skill Gaps:** ").append(matches.get(0).getMissingSkills()).append("\n");
                    }
                } else {
                    fallback.append("- No candidates have been evaluated against this position yet. Select 'Analyze New Candidate' to evaluate candidates.\n");
                }
            } else {
                List<Job> allJobs = jobRepository.findAll();
                List<Candidate> candidates = candidateRepository.findAll();
                fallback.append("- **Active Open Positions:** ").append(allJobs.size()).append(" job listings posted.\n");
                fallback.append("- **Registered Candidates:** ").append(candidates.size()).append(" applicants in directory.\n");
                List<Match> topMatches = matchRepository.findAllByOrderByMatchScoreDesc();
                if (!topMatches.isEmpty()) {
                    fallback.append("- **Highest Match Alignment:** ").append(topMatches.get(0).getCandidate().getName())
                            .append(" for ").append(topMatches.get(0).getJob().getTitle())
                            .append(" (**").append(topMatches.get(0).getMatchScore()).append("%**).\n");
                }
            }
            fallback.append("\n*Tip: Recruiters can view complete skill gap breakdowns and practice interview questions directly from the candidate profile.*");
            answer = fallback.toString();
        }

        Map<String, Object> result = new HashMap<>();
        result.put("answer", answer);
        result.put("question", question);
        result.put("jobId", jobId);
        result.put("timestamp", Instant.now().toString());
        return result;
    }
}


