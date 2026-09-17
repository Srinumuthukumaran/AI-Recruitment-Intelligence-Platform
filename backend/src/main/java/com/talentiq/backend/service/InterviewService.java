package com.talentiq.backend.service;

import com.talentiq.backend.entity.Candidate;
import com.talentiq.backend.entity.Job;
import com.talentiq.backend.repository.CandidateRepository;
import com.talentiq.backend.repository.JobRepository;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class InterviewService {

    private final AiService aiService;
    private final JobRepository jobRepository;
    private final CandidateRepository candidateRepository;

    public InterviewService(AiService aiService,
                            JobRepository jobRepository,
                            CandidateRepository candidateRepository) {
        this.aiService = aiService;
        this.jobRepository = jobRepository;
        this.candidateRepository = candidateRepository;
    }

    public Map<String, Object> generateQuestions(Long jobId, Long candidateId, String difficulty, Integer count) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found with id: " + jobId));

        Candidate candidate = candidateRepository.findById(candidateId)
                .orElseThrow(() -> new RuntimeException("Candidate not found with id: " + candidateId));

        int questionCount = (count != null && count > 0) ? count : 5;
        String level = (difficulty != null && !difficulty.isBlank()) ? difficulty : "Mid-level";

        String prompt = """
                You are TalentIQ AI Interview Assistant.
                Generate %d interview questions for the following candidate applying for the job position.
                Difficulty Level: %s

                JOB DETAILS:
                Title: %s
                Required Skills: %s
                Experience: %s
                Description: %s

                CANDIDATE:
                Name: %s
                Resume Details:
                %s

                Generate questions across 4 distinct categories:
                1. Technical
                2. Project-based
                3. Problem-solving
                4. Behavioral

                FORMAT REQUIREMENTS:
                For each question, output:
                Category: <Technical / Project-based / Problem-solving / Behavioral>
                Question: <The interview question>
                Focus Area: <Key skill or concept evaluated>
                Ideal Answer Guidance: <Brief tip or key points the candidate should touch upon>
                ---

                IMPORTANT:
                - Do not use or infer sensitive personal characteristics.
                - Evaluate only job-related qualifications.
                """.formatted(
                questionCount,
                level,
                job.getTitle(),
                job.getRequiredSkills(),
                job.getExperience(),
                job.getDescription(),
                candidate.getName(),
                candidate.getResumeText() != null ? candidate.getResumeText() : "Not provided"
        );

        String aiResponse;
        List<Map<String, String>> questions;
        try {
            aiResponse = aiService.generateInterviewQuestions(prompt);
            questions = parseQuestions(aiResponse);
            if (questions.isEmpty()) {
                questions = generateFallbackQuestions(job, candidate, questionCount, level);
            }
        } catch (Exception e) {
            aiResponse = "Generated via TalentIQ Adaptive Question Engine.";
            questions = generateFallbackQuestions(job, candidate, questionCount, level);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("jobId", job.getId());
        response.put("jobTitle", job.getTitle());
        response.put("candidateId", candidate.getId());
        response.put("candidateName", candidate.getName());
        response.put("difficulty", level);
        response.put("questionCount", questions.size());
        response.put("questions", questions);
        response.put("rawResponse", aiResponse);
        return response;
    }

    private List<Map<String, String>> generateFallbackQuestions(Job job, Candidate candidate, int count, String level) {
        List<Map<String, String>> list = new ArrayList<>();
        String skills = job.getRequiredSkills() != null ? job.getRequiredSkills() : "Java, Spring Boot, MySQL";
        String[] skillArr = skills.split("[,;\\s]+");
        String primarySkill = skillArr.length > 0 && !skillArr[0].isBlank() ? skillArr[0].trim() : "Core Technology";
        String secondarySkill = skillArr.length > 1 && !skillArr[1].isBlank() ? skillArr[1].trim() : "Backend Frameworks";

        Map<String, String> q1 = new HashMap<>();
        q1.put("category", "Technical");
        q1.put("question", "How do you optimize performance and manage database transactions when working with " + primarySkill + " in production systems?");
        q1.put("focusArea", primarySkill + " Performance & Persistence");
        q1.put("guidance", "Explain transaction isolation levels, connection pooling, indexing, and query optimization.");
        list.add(q1);

        Map<String, String> q2 = new HashMap<>();
        q2.put("category", "Technical");
        q2.put("question", "In " + secondarySkill + ", what architectural best practices do you follow to design resilient, secure RESTful APIs?");
        q2.put("focusArea", secondarySkill + " API Design & Security");
        q2.put("guidance", "Discuss JWT authentication, structured error handling, DTO patterns, and idempotency.");
        list.add(q2);

        Map<String, String> q3 = new HashMap<>();
        q3.put("category", "Project-based");
        q3.put("question", "Walk us through a demanding engineering project from your experience that demonstrates your readiness for " + job.getTitle() + ".");
        q3.put("focusArea", "System Implementation & Architecture");
        q3.put("guidance", "Highlight architectural decisions, component design, trade-offs, and measurable impact.");
        list.add(q3);

        Map<String, String> q4 = new HashMap<>();
        q4.put("category", "Problem-solving");
        q4.put("question", "Suppose a critical production service starts experiencing high latency and elevated connection timeouts. How would you systematically diagnose and resolve the bottleneck?");
        q4.put("focusArea", "Root Cause Analysis & Scalability");
        q4.put("guidance", "Mention telemetry, slow query logs, thread contention, memory profiles, and caching layers.");
        list.add(q4);

        Map<String, String> q5 = new HashMap<>();
        q5.put("category", "Behavioral");
        q5.put("question", "Describe a situation where project specifications changed abruptly or you had a technical disagreement with a team member. How did you handle it?");
        q5.put("focusArea", "Collaboration & Agile Delivery");
        q5.put("guidance", "Follow the STAR approach: Situation, Task, Action, and positive business Result.");
        list.add(q5);

        return list.stream().limit(count).toList();
    }

    private List<Map<String, String>> parseQuestions(String raw) {
        List<Map<String, String>> result = new ArrayList<>();
        if (raw == null || raw.isBlank()) {
            return result;
        }

        String[] blocks = raw.split("---");
        for (String block : blocks) {
            String trimmed = block.trim();
            if (trimmed.isEmpty()) continue;

            String category = extractRegex(trimmed, "Category:\\s*(.*)");
            String question = extractRegex(trimmed, "Question:\\s*(.*)");
            String focus = extractRegex(trimmed, "Focus Area:\\s*(.*)");
            String guidance = extractRegex(trimmed, "Ideal Answer Guidance:\\s*([\\s\\S]*)");

            if (question != null && !question.isBlank()) {
                Map<String, String> item = new HashMap<>();
                item.put("category", category != null ? category.trim() : "General");
                item.put("question", question.trim());
                item.put("focusArea", focus != null ? focus.trim() : "");
                item.put("guidance", guidance != null ? guidance.trim() : "");
                result.add(item);
            }
        }

        // If regex split didn't yield structured questions, fallback to line parsing
        if (result.isEmpty()) {
            String[] lines = raw.split("\n");
            Map<String, String> current = null;
            for (String line : lines) {
                line = line.trim();
                if (line.matches("^\\d+\\..*") || line.toLowerCase().startsWith("question:")) {
                    if (current != null) result.add(current);
                    current = new HashMap<>();
                    current.put("category", "General");
                    current.put("question", line.replaceFirst("^(\\d+\\.|Question:)\\s*", ""));
                    current.put("focusArea", "Core Skills");
                    current.put("guidance", "Demonstrate structured reasoning.");
                } else if (current != null && !line.isEmpty()) {
                    current.put("guidance", current.get("guidance") + " " + line);
                }
            }
            if (current != null) result.add(current);
        }

        return result;
    }

    private String extractRegex(String text, String patternStr) {
        Pattern pattern = Pattern.compile(patternStr, Pattern.CASE_INSENSITIVE);
        Matcher matcher = pattern.matcher(text);
        if (matcher.find()) {
            return matcher.group(1).trim();
        }
        return null;
    }
}
