package com.talentiq.backend.controller;

import com.talentiq.backend.entity.Candidate;
import com.talentiq.backend.repository.CandidateRepository;
import com.talentiq.backend.service.InterviewService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping({"/api/interview", "/api/interviews"})
public class InterviewController {

    private final InterviewService interviewService;
    private final CandidateRepository candidateRepository;

    public InterviewController(InterviewService interviewService, CandidateRepository candidateRepository) {
        this.interviewService = interviewService;
        this.candidateRepository = candidateRepository;
    }

    @PostMapping("/generate")
    public Map<String, Object> generateQuestions(
            @RequestBody Map<String, Object> request,
            Authentication authentication) {

        Long jobId = Long.valueOf(request.get("jobId").toString());
        Long candidateId = null;

        if (request.get("candidateId") != null) {
            candidateId = Long.valueOf(request.get("candidateId").toString());
        } else if (authentication != null) {
            Candidate candidate = candidateRepository.findByEmail(authentication.getName()).orElse(null);
            if (candidate != null) {
                candidateId = candidate.getId();
            }
        }

        if (candidateId == null) {
            throw new RuntimeException("Candidate ID must be specified");
        }

        String difficulty = (String) request.getOrDefault("difficulty", "Mid-level");
        Integer count = request.get("questionCount") != null 
                ? Integer.valueOf(request.get("questionCount").toString()) 
                : 5;

        return interviewService.generateQuestions(jobId, candidateId, difficulty, count);
    }
}
