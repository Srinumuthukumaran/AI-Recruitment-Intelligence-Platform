package com.talentiq.backend.controller;

import com.talentiq.backend.entity.Match;
import com.talentiq.backend.service.MatchService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

import com.talentiq.backend.entity.Candidate;
import com.talentiq.backend.repository.CandidateRepository;
import org.springframework.security.core.Authentication;

@RestController
@RequestMapping("/api/matches")
public class
MatchController {

    private final MatchService matchService;
    private final CandidateRepository candidateRepository;

    public MatchController(MatchService matchService, CandidateRepository candidateRepository) {
        this.matchService = matchService;
        this.candidateRepository = candidateRepository;
    }

    @PostMapping("/analyze")
    @PreAuthorize("hasRole('RECRUITER')")
    public Match analyzeCandidate(
            @RequestParam Long candidateId,
            @RequestParam Long jobId) {

        return matchService.analyzeCandidate(
                candidateId,
                jobId
        );
    }

    @GetMapping("/job/{jobId}")
    public List<Match> getRankedCandidates(
            @PathVariable Long jobId) {

        return matchService.getRankedCandidates(jobId);
    }

    @GetMapping("/{id}")
    public Match getMatchById(@PathVariable Long id) {
        return matchService.getMatchById(id);
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('CANDIDATE')")
    public List<Match> getMyMatches(Authentication authentication) {
        Candidate candidate = candidateRepository.findByEmail(authentication.getName()).orElse(null);
        if (candidate == null) {
            return List.of();
        }
        return matchService.getMatchesForCandidate(candidate.getId());
    }

    @GetMapping("/candidate/{candidateId}")
    public List<Match> getCandidateMatches(@PathVariable Long candidateId) {
        return matchService.getMatchesForCandidate(candidateId);
    }

    @GetMapping("/all")
    public List<Match> getAllMatches() {
        return matchService.getAllMatches();
    }

    @GetMapping("/check")
    public Match checkExistingMatch(@RequestParam Long candidateId, @RequestParam Long jobId) {
        return matchService.getMatchByCandidateAndJob(candidateId, jobId).orElse(null);
    }

    @PostMapping("/{id}/validate")
    @PreAuthorize("hasRole('RECRUITER')")
    public Match validateMatch(
            @PathVariable Long id,
            @RequestBody java.util.Map<String, String> body) {
        String status = body.getOrDefault("status", "VALIDATED");
        String notes = body.get("notes");
        return matchService.validateMatch(id, status, notes);
    }
}