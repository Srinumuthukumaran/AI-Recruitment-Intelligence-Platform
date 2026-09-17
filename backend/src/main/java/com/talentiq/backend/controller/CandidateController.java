package com.talentiq.backend.controller;

import com.talentiq.backend.entity.Candidate;
import com.talentiq.backend.service.CandidateService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
public class CandidateController {

    private final CandidateService candidateService;

    public CandidateController(CandidateService candidateService) {
        this.candidateService = candidateService;
    }

    @GetMapping("/api/candidate/test")
    @PreAuthorize("hasRole('CANDIDATE')")
    public String candidateTest() {
        return "Candidate API Access Granted!";
    }

    @GetMapping("/api/candidates")
    @PreAuthorize("hasRole('RECRUITER')")
    public List<Candidate> getAllCandidates(@RequestParam(value = "status", required = false) String status) {
        if (status != null && !status.isBlank() && !status.equalsIgnoreCase("ALL")) {
            return candidateService.getCandidatesByStatus(status);
        }
        return candidateService.getAllCandidates();
    }

    @GetMapping("/api/candidates/{id}")
    public Candidate getCandidateById(@PathVariable Long id) {
        return candidateService.getCandidateById(id);
    }

    @GetMapping({"/api/candidates/me", "/api/candidate/me"})
    @PreAuthorize("hasRole('CANDIDATE')")
    public Map<String, Object> getMyProfile(Authentication authentication) {
        Candidate candidate = candidateService.getOrCreateProfileForEmail(authentication.getName());
        Map<String, Object> profile = new HashMap<>();
        profile.put("id", candidate.getId());
        profile.put("name", candidate.getName());
        profile.put("email", candidate.getEmail());
        profile.put("resumeText", candidate.getResumeText());
        profile.put("hasResume", candidate.getResumeText() != null && !candidate.getResumeText().isBlank());
        profile.put("submissionStatus", candidate.getSubmissionStatus());
        profile.put("submittedAt", candidate.getSubmittedAt());
        profile.put("validatedAt", candidate.getValidatedAt());
        profile.put("validationNotes", candidate.getValidationNotes());
        profile.put("validatedBy", candidate.getValidatedBy());
        return profile;
    }

    @PostMapping({"/api/candidates/me/submit", "/api/candidate/me/submit"})
    @PreAuthorize("hasRole('CANDIDATE')")
    public Candidate submitMyResume(@RequestBody(required = false) Map<String, String> body, Authentication authentication) {
        String notes = body != null ? body.get("notes") : null;
        return candidateService.submitCandidateResume(authentication.getName(), notes);
    }

    @PostMapping("/api/candidates/{id}/validate")
    @PreAuthorize("hasRole('RECRUITER')")
    public Candidate validateCandidate(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            Authentication authentication) {
        String status = body.getOrDefault("status", "VALIDATED");
        String notes = body.get("notes");
        String recruiterEmail = authentication != null ? authentication.getName() : "Recruiter";
        return candidateService.validateCandidate(id, status, notes, recruiterEmail);
    }

    @PutMapping({"/api/candidates/me", "/api/candidate/me"})
    @PreAuthorize("hasRole('CANDIDATE')")
    public Candidate updateMyProfile(@RequestBody Map<String, String> body, Authentication authentication) {
        String name = body.get("name");
        return candidateService.updateProfile(authentication.getName(), name);
    }

    @PutMapping("/api/candidates/{id}")
    @PreAuthorize("hasRole('RECRUITER')")
    public Candidate updateCandidate(@PathVariable Long id, @RequestBody Map<String, String> body) {
        return candidateService.updateCandidate(
                id,
                body.get("name"),
                body.get("email"),
                body.get("resumeText")
        );
    }

    @DeleteMapping("/api/candidates/{id}")
    @PreAuthorize("hasRole('RECRUITER')")
    public Map<String, String> deleteCandidate(@PathVariable Long id) {
        candidateService.deleteCandidate(id);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Candidate deleted successfully");
        return response;
    }

    @PostMapping("/api/candidates")
    @PreAuthorize("hasRole('RECRUITER')")
    public Candidate createCandidate(@RequestBody Map<String, String> body) {
        return candidateService.createCandidate(
                body.get("name"),
                body.get("email"),
                body.get("resumeText")
        );
    }

    @PostMapping("/api/candidates/upload")
    @PreAuthorize("hasRole('RECRUITER')")
    public Candidate uploadCandidate(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "name", required = false) String name,
            @RequestParam(value = "email", required = false) String email
    ) throws Exception {
        return candidateService.createCandidateFromPdf(file, name, email);
    }

    @PostMapping("/api/candidates/bulk-upload")
    @PreAuthorize("hasRole('RECRUITER')")
    public List<Candidate> bulkUploadCandidates(@RequestParam("files") List<MultipartFile> files) {
        return candidateService.createCandidatesFromPdfs(files);
    }

    @PostMapping("/api/candidates/batch")
    @PreAuthorize("hasRole('RECRUITER')")
    public List<Candidate> createCandidatesBatch(@RequestBody List<Map<String, String>> candidatesList) {
        return candidateService.createCandidatesBatch(candidatesList);
    }
}