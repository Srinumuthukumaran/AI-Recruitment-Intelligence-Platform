package com.talentiq.backend.repository;

import com.talentiq.backend.entity.Match;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MatchRepository extends JpaRepository<Match, Long> {

    List<Match> findByCandidateId(Long candidateId);

    List<Match> findByJobIdOrderByMatchScoreDesc(Long jobId);

    java.util.Optional<Match> findByCandidateIdAndJobId(Long candidateId, Long jobId);

    List<Match> findAllByOrderByMatchScoreDesc();
}