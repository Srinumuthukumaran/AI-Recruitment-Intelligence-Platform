package com.talentiq.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "candidates")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Candidate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(columnDefinition = "TEXT")
    private String resumeText;

    @OneToOne
    @JoinColumn(name = "user_id")
    private User user;

    private String submissionStatus; // e.g. "NOT_SUBMITTED", "SUBMITTED", "VALIDATED", "SHORTLISTED", "REJECTED"

    private java.time.LocalDateTime submittedAt;

    private java.time.LocalDateTime validatedAt;

    @Column(columnDefinition = "TEXT")
    private String validationNotes;

    private String validatedBy;
}