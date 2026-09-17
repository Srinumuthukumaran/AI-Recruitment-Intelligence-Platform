package com.talentiq.backend.controller;

import com.talentiq.backend.entity.Candidate;
import com.talentiq.backend.repository.CandidateRepository;
import com.talentiq.backend.service.SkillGapService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/skills")
public class SkillGapController {

    private final SkillGapService skillGapService;
    private final CandidateRepository candidateRepository;
    private final com.talentiq.backend.repository.UserRepository userRepository;

    public SkillGapController(
            SkillGapService skillGapService,
            CandidateRepository candidateRepository,
            com.talentiq.backend.repository.UserRepository userRepository) {
        this.skillGapService = skillGapService;
        this.candidateRepository = candidateRepository;
        this.userRepository = userRepository;
    }

    @GetMapping("/gap")
    public Map<String, Object> getSkillGap(
            @RequestParam(required = false) Long candidateId,
            @RequestParam Long jobId,
            Authentication authentication) {

        Long targetCandidateId = candidateId;

        if (targetCandidateId == null && authentication != null) {
            Candidate candidate = candidateRepository.findByEmail(authentication.getName()).orElse(null);
            if (candidate == null) {
                candidate = resolveOrCreateCandidate(authentication.getName());
            }
            if (candidate != null) {
                targetCandidateId = candidate.getId();
            }
        }

        if (targetCandidateId == null) {
            throw new RuntimeException("Candidate ID must be provided or user must be logged in as a candidate");
        }

        return skillGapService.analyzeSkillGap(targetCandidateId, jobId);
    }

    @GetMapping("/gap/job/{jobId}")
    public Map<String, Object> getMySkillGapForJob(
            @PathVariable Long jobId,
            Authentication authentication) {

        Candidate candidate = candidateRepository.findByEmail(authentication.getName()).orElse(null);
        if (candidate == null) {
            candidate = resolveOrCreateCandidate(authentication.getName());
        }

        if (candidate == null) {
            throw new RuntimeException("Candidate record not found for user: " + authentication.getName());
        }

        return skillGapService.analyzeSkillGap(candidate.getId(), jobId);
    }

    private Candidate resolveOrCreateCandidate(String email) {
        return userRepository.findByEmail(email).map(user -> {
            Optional<Candidate> candOpt = candidateRepository.findByUserId(user.getId());
            if (candOpt.isPresent()) {
                return candOpt.get();
            }
            Candidate c = new Candidate();
            c.setUser(user);
            c.setEmail(user.getEmail());
            c.setName(user.getName());
            c.setSubmissionStatus("NOT_SUBMITTED");
            return candidateRepository.save(c);
        }).orElse(null);
    }
}
