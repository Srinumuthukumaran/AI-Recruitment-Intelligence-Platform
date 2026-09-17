package com.talentiq.backend.controller;

import com.talentiq.backend.entity.Candidate;
import com.talentiq.backend.entity.User;
import com.talentiq.backend.repository.CandidateRepository;
import com.talentiq.backend.repository.UserRepository;
import com.talentiq.backend.service.ResumeParserService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import org.springframework.security.core.Authentication;

@RestController
@RequestMapping("/api/resumes")
public class ResumeController {

    private final ResumeParserService resumeParserService;
    private final UserRepository userRepository;
    private final CandidateRepository candidateRepository;
    private final com.talentiq.backend.service.MatchService matchService;

    public ResumeController(
            ResumeParserService resumeParserService,
            UserRepository userRepository,
            CandidateRepository candidateRepository,
            com.talentiq.backend.service.MatchService matchService) {

        this.resumeParserService = resumeParserService;
        this.userRepository = userRepository;
        this.candidateRepository = candidateRepository;
        this.matchService = matchService;
    }

    @PostMapping("/upload")
    public ResponseEntity<String> uploadResume(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "email", required = false) String email,
            Authentication authentication) {

        try {
            // 1. Validate file presence and non-emptiness
            if (file == null || file.isEmpty()) {
                return ResponseEntity.badRequest().body("Uploaded file is empty or missing.");
            }

            // 2. Validate PDF file type
            String filename = file.getOriginalFilename();
            String contentType = file.getContentType();
            boolean isPdfName = filename != null && filename.toLowerCase().endsWith(".pdf");
            boolean isPdfContent = contentType != null && contentType.equalsIgnoreCase("application/pdf");

            if (!isPdfName && !isPdfContent) {
                return ResponseEntity.badRequest().body("Invalid file format. Only PDF files are supported.");
            }

            // 3. Prioritize authenticated user from JWT token; fallback to email parameter for backward compatibility
            String targetEmail = null;
            if (authentication != null && authentication.isAuthenticated() && !"anonymousUser".equals(authentication.getName())) {
                targetEmail = authentication.getName();
            } else if (email != null && !email.isBlank()) {
                targetEmail = email.trim();
            }

            if (targetEmail == null) {
                return ResponseEntity.badRequest().body("User email could not be determined. Please log in or provide email.");
            }

            final String userEmail = targetEmail;
            User user = userRepository
                    .findByEmail(userEmail)
                    .orElseThrow(() ->
                            new RuntimeException("User not found with email: " + userEmail));

            // 4. Extract text using PDFBox
            String resumeText = resumeParserService.extractText(file.getBytes());
            if (resumeText == null || resumeText.isBlank()) {
                return ResponseEntity.badRequest().body("Could not extract any readable text from the uploaded PDF.");
            }

            // 5. Create or update candidate record
            Candidate candidate = candidateRepository
                    .findByUserId(user.getId())
                    .orElseGet(() -> candidateRepository.findByEmail(user.getEmail()).orElse(new Candidate()));

            candidate.setName(user.getName());
            candidate.setEmail(user.getEmail());
            candidate.setResumeText(resumeText);
            candidate.setUser(user);
            candidate.setSubmissionStatus("SUBMITTED");
            candidate.setSubmittedAt(java.time.LocalDateTime.now());

            Candidate saved = candidateRepository.save(candidate);

            // 6. Automatically evaluate candidate matches against open recruiter jobs
            try {
                matchService.matchCandidateAgainstAllJobs(saved.getId());
            } catch (Exception matchEx) {
                // Do not fail upload if async matching has non-fatal warning
            }

            return ResponseEntity.ok("Resume uploaded, parsed, and submitted to recruiters successfully! AI matches have been generated.");

        } catch (Exception e) {
            return ResponseEntity
                    .internalServerError()
                    .body("Resume processing failed: " + e.getMessage());
        }
    }
}