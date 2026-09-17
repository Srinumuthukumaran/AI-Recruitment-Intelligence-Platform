package com.talentiq.backend.service;

import com.talentiq.backend.entity.Candidate;
import com.talentiq.backend.entity.Match;
import com.talentiq.backend.entity.Role;
import com.talentiq.backend.entity.User;
import com.talentiq.backend.repository.CandidateRepository;
import com.talentiq.backend.repository.MatchRepository;
import com.talentiq.backend.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class CandidateService {

    private static final Pattern EMAIL_PATTERN = Pattern.compile("[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}");

    private final CandidateRepository candidateRepository;
    private final UserRepository userRepository;
    private final MatchRepository matchRepository;
    private final ResumeParserService resumeParserService;
    private final PasswordEncoder passwordEncoder;
    private final MatchService matchService;

    public CandidateService(
            CandidateRepository candidateRepository,
            UserRepository userRepository,
            MatchRepository matchRepository,
            ResumeParserService resumeParserService,
            PasswordEncoder passwordEncoder,
            MatchService matchService) {
        this.candidateRepository = candidateRepository;
        this.userRepository = userRepository;
        this.matchRepository = matchRepository;
        this.resumeParserService = resumeParserService;
        this.passwordEncoder = passwordEncoder;
        this.matchService = matchService;
    }

    public List<Candidate> getAllCandidates() {
        return candidateRepository.findAll();
    }

    public Candidate getCandidateById(Long id) {
        return candidateRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Candidate not found with id: " + id));
    }

    public Optional<Candidate> getCandidateByEmail(String email) {
        return candidateRepository.findByEmail(email);
    }

    public Optional<Candidate> getCandidateByUserId(Long userId) {
        return candidateRepository.findByUserId(userId);
    }

    public Candidate getOrCreateProfileForEmail(String email) {
        return candidateRepository.findByEmail(email).orElseGet(() -> {
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found with email: " + email));
            Candidate c = new Candidate();
            c.setUser(user);
            c.setEmail(user.getEmail());
            c.setName(user.getName());
            return c;
        });
    }

    public Candidate updateProfile(String email, String name) {
        Candidate candidate = candidateRepository.findByEmail(email)
                .orElseGet(() -> {
                    User user = userRepository.findByEmail(email)
                            .orElseThrow(() -> new RuntimeException("User not found with email: " + email));
                    Candidate c = new Candidate();
                    c.setUser(user);
                    c.setEmail(user.getEmail());
                    return c;
                });

        if (name != null && !name.isBlank()) {
            candidate.setName(name);
            if (candidate.getUser() != null) {
                candidate.getUser().setName(name);
                userRepository.save(candidate.getUser());
            }
        }
        return candidateRepository.save(candidate);
    }

    @Transactional
    public Candidate updateCandidate(Long id, String name, String email, String resumeText) {
        Candidate candidate = candidateRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Candidate not found with id: " + id));

        if (name != null && !name.isBlank()) {
            candidate.setName(name.trim());
            if (candidate.getUser() != null) {
                candidate.getUser().setName(name.trim());
            }
        }

        if (email != null && !email.isBlank()) {
            String cleanEmail = email.trim().toLowerCase();
            if (!cleanEmail.equalsIgnoreCase(candidate.getEmail())) {
                Optional<Candidate> existingCandidate = candidateRepository.findByEmail(cleanEmail);
                if (existingCandidate.isPresent() && !existingCandidate.get().getId().equals(id)) {
                    throw new RuntimeException("Candidate with email " + cleanEmail + " already exists.");
                }

                if (candidate.getUser() != null) {
                    Optional<User> existingUser = userRepository.findByEmail(cleanEmail);
                    if (existingUser.isPresent() && !existingUser.get().getId().equals(candidate.getUser().getId())) {
                        throw new RuntimeException("User with email " + cleanEmail + " already exists.");
                    }
                    candidate.getUser().setEmail(cleanEmail);
                }
                candidate.setEmail(cleanEmail);
            }
        }

        if (resumeText != null) {
            candidate.setResumeText(resumeText);
        }

        if (candidate.getUser() != null) {
            userRepository.save(candidate.getUser());
        }

        return candidateRepository.save(candidate);
    }

    @Transactional
    public void deleteCandidate(Long id) {
        Candidate candidate = candidateRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Candidate not found with id: " + id));

        // 1. Delete associated matches
        List<Match> matches = matchRepository.findByCandidateId(id);
        if (!matches.isEmpty()) {
            matchRepository.deleteAll(matches);
        }

        // 2. Unlink User and delete candidate
        User user = candidate.getUser();
        candidate.setUser(null);
        candidateRepository.delete(candidate);

        // 3. Delete linked user account if role is CANDIDATE
        if (user != null && user.getRole() == Role.CANDIDATE) {
            userRepository.delete(user);
        }
    }

    @Transactional
    public Candidate submitCandidateResume(String email, String notes) {
        Candidate candidate = candidateRepository.findByEmail(email)
                .orElseGet(() -> {
                    User user = userRepository.findByEmail(email)
                            .orElseThrow(() -> new RuntimeException("User not found with email: " + email));
                    Candidate c = new Candidate();
                    c.setUser(user);
                    c.setEmail(user.getEmail());
                    c.setName(user.getName());
                    return c;
                });

        if (candidate.getResumeText() == null || candidate.getResumeText().isBlank()) {
            throw new RuntimeException("Please upload your PDF resume before submitting to recruiters.");
        }

        candidate.setSubmissionStatus("SUBMITTED");
        candidate.setSubmittedAt(java.time.LocalDateTime.now());
        if (notes != null && !notes.isBlank()) {
            candidate.setValidationNotes(notes.trim());
        }

        Candidate saved = candidateRepository.save(candidate);
        try {
            matchService.matchCandidateAgainstAllJobs(saved.getId());
        } catch (Exception ignored) {}
        return saved;
    }

    @Transactional
    public Candidate validateCandidate(Long candidateId, String status, String notes, String recruiterEmail) {
        Candidate candidate = candidateRepository.findById(candidateId)
                .orElseThrow(() -> new RuntimeException("Candidate not found with id: " + candidateId));

        String targetStatus = (status != null && !status.isBlank()) ? status.trim().toUpperCase() : "VALIDATED";
        candidate.setSubmissionStatus(targetStatus);
        candidate.setValidatedAt(java.time.LocalDateTime.now());
        if (notes != null) {
            candidate.setValidationNotes(notes.trim());
        }
        if (recruiterEmail != null && !recruiterEmail.isBlank()) {
            candidate.setValidatedBy(recruiterEmail);
        }

        // Also update all matches for this candidate
        List<Match> matches = matchRepository.findByCandidateId(candidateId);
        for (Match m : matches) {
            m.setValidationStatus(targetStatus);
            m.setValidatedAt(java.time.LocalDateTime.now());
            if (notes != null) {
                m.setRecruiterNotes(notes.trim());
            }
        }
        matchRepository.saveAll(matches);

        return candidateRepository.save(candidate);
    }

    public List<Candidate> getCandidatesByStatus(String status) {
        if (status == null || status.isBlank() || status.equalsIgnoreCase("ALL")) {
            return candidateRepository.findAllByOrderBySubmittedAtDesc();
        }
        return candidateRepository.findBySubmissionStatusOrderBySubmittedAtDesc(status.trim().toUpperCase());
    }

    @Transactional
    public Candidate createCandidate(String name, String email, String resumeText) {
        if (email == null || email.isBlank()) {
            throw new RuntimeException("Candidate email is required.");
        }
        String cleanEmail = email.trim().toLowerCase();

        String candidateName = (name != null && !name.isBlank()) ? name.trim() : cleanEmail.split("@")[0];

        Optional<Candidate> existingCandidate = candidateRepository.findByEmail(cleanEmail);
        if (existingCandidate.isEmpty()) {
            Optional<User> existingUser = userRepository.findByEmail(cleanEmail);
            if (existingUser.isPresent()) {
                existingCandidate = candidateRepository.findByUserId(existingUser.get().getId());
            }
        }

        if (existingCandidate.isPresent()) {
            Candidate existing = existingCandidate.get();
            if (name != null && !name.isBlank()) existing.setName(candidateName);
            if (resumeText != null && !resumeText.isBlank()) {
                existing.setResumeText(resumeText.trim());
                if (existing.getSubmissionStatus() == null || "NOT_SUBMITTED".equals(existing.getSubmissionStatus())) {
                    existing.setSubmissionStatus("SUBMITTED");
                }
                if (existing.getSubmittedAt() == null) {
                    existing.setSubmittedAt(java.time.LocalDateTime.now());
                }
            }
            Candidate saved = candidateRepository.save(existing);
            if (resumeText != null && !resumeText.isBlank()) {
                try {
                    matchService.matchCandidateAgainstAllJobs(saved.getId());
                } catch (Exception ignored) {}
            }
            return saved;
        }

        // Find or create User with CANDIDATE role
        User user = userRepository.findByEmail(cleanEmail).orElseGet(() -> {
            User newUser = new User();
            newUser.setEmail(cleanEmail);
            newUser.setName(candidateName);
            newUser.setPassword(passwordEncoder.encode("Candidate@123"));
            newUser.setRole(Role.CANDIDATE);
            return userRepository.save(newUser);
        });

        Candidate candidate = new Candidate();
        candidate.setName(candidateName);
        candidate.setEmail(cleanEmail);
        candidate.setResumeText(resumeText != null ? resumeText.trim() : "");
        candidate.setUser(user);
        candidate.setSubmissionStatus(resumeText != null && !resumeText.isBlank() ? "SUBMITTED" : "NOT_SUBMITTED");
        candidate.setSubmittedAt(resumeText != null && !resumeText.isBlank() ? java.time.LocalDateTime.now() : null);

        Candidate saved = candidateRepository.save(candidate);
        if (resumeText != null && !resumeText.isBlank()) {
            try {
                matchService.matchCandidateAgainstAllJobs(saved.getId());
            } catch (Exception ignored) {}
        }
        return saved;
    }

    @Transactional
    public Candidate createCandidateFromPdf(MultipartFile file, String name, String email) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new RuntimeException("Uploaded file is empty.");
        }

        String filename = file.getOriginalFilename();
        if (filename == null || !filename.toLowerCase().endsWith(".pdf")) {
            throw new RuntimeException("Invalid file format. Only PDF files are supported.");
        }

        String resumeText = resumeParserService.extractText(file.getBytes());
        if (resumeText == null || resumeText.isBlank()) {
            throw new RuntimeException("Could not extract readable text from PDF: " + filename);
        }

        String targetEmail = email;
        if (targetEmail == null || targetEmail.isBlank()) {
            Matcher matcher = EMAIL_PATTERN.matcher(resumeText);
            if (matcher.find()) {
                targetEmail = matcher.group();
            } else {
                String cleanBase = filename.replaceAll("(?i)\\.pdf$", "").replaceAll("[^a-zA-Z0-9]", "_").toLowerCase();
                targetEmail = cleanBase + "_" + (System.currentTimeMillis() % 10000) + "@talentiq.local";
            }
        }

        String targetName = name;
        if (targetName == null || targetName.isBlank()) {
            String[] lines = resumeText.split("\\r?\\n");
            for (String line : lines) {
                String trimmed = line.trim();
                if (!trimmed.isEmpty() && trimmed.length() <= 50 && !trimmed.contains("@") && !trimmed.toLowerCase().contains("resume")) {
                    targetName = trimmed;
                    break;
                }
            }
            if (targetName == null || targetName.isBlank()) {
                String base = filename.replaceAll("(?i)\\.pdf$", "").replace("_", " ").replace("-", " ").trim();
                targetName = base.isEmpty() ? "Candidate" : base;
            }
        }

        return createCandidate(targetName, targetEmail, resumeText);
    }

    @Transactional
    public List<Candidate> createCandidatesFromPdfs(List<MultipartFile> files) {
        if (files == null || files.isEmpty()) {
            throw new RuntimeException("No files provided for upload.");
        }

        List<Candidate> result = new ArrayList<>();
        List<String> errors = new ArrayList<>();

        for (MultipartFile file : files) {
            try {
                Candidate candidate = createCandidateFromPdf(file, null, null);
                result.add(candidate);
            } catch (Exception e) {
                errors.add(file.getOriginalFilename() + ": " + e.getMessage());
            }
        }

        if (result.isEmpty() && !errors.isEmpty()) {
            throw new RuntimeException("Bulk upload failed: " + String.join("; ", errors));
        }

        return result;
    }

    @Transactional
    public List<Candidate> createCandidatesBatch(List<Map<String, String>> candidatesList) {
        if (candidatesList == null || candidatesList.isEmpty()) {
            throw new RuntimeException("Candidate list cannot be empty.");
        }

        List<Candidate> result = new ArrayList<>();
        for (Map<String, String> item : candidatesList) {
            String name = item.get("name");
            String email = item.get("email");
            String resumeText = item.get("resumeText");
            result.add(createCandidate(name, email, resumeText));
        }
        return result;
    }
}
