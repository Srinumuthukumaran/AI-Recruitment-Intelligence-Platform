package com.talentiq.backend.repository;

import com.talentiq.backend.entity.Candidate;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CandidateRepository
        extends JpaRepository<Candidate, Long> {

    Optional<Candidate> findByUserId(Long userId);

    Optional<Candidate> findByEmail(String email);

    List<Candidate> findBySubmissionStatus(String submissionStatus);

    List<Candidate> findBySubmissionStatusOrderBySubmittedAtDesc(String submissionStatus);

    List<Candidate> findAllByOrderBySubmittedAtDesc();

    long countBySubmissionStatus(String submissionStatus);
}