package com.talentiq.backend.configuration;

import com.talentiq.backend.entity.Candidate;
import com.talentiq.backend.entity.Job;
import com.talentiq.backend.entity.Role;
import com.talentiq.backend.entity.User;
import com.talentiq.backend.repository.CandidateRepository;
import com.talentiq.backend.repository.JobRepository;
import com.talentiq.backend.repository.UserRepository;
import com.talentiq.backend.service.MatchService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final CandidateRepository candidateRepository;
    private final JobRepository jobRepository;
    private final MatchService matchService;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(
            UserRepository userRepository,
            CandidateRepository candidateRepository,
            JobRepository jobRepository,
            MatchService matchService,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.candidateRepository = candidateRepository;
        this.jobRepository = jobRepository;
        this.matchService = matchService;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        try {
            if (userRepository.count() == 0) {
                log.info("No users found in database. Initializing default recruitment platform data...");

                // 1. Seed Recruiter
                User recruiter = new User();
                recruiter.setName("TalentIQ Lead Recruiter");
                recruiter.setEmail("recruiter@talentiq.com");
                recruiter.setPassword(passwordEncoder.encode("Password@123"));
                recruiter.setRole(Role.RECRUITER);
                userRepository.save(recruiter);

                // 2. Seed Candidate
                User candidateUser = new User();
                candidateUser.setName("Priya Sharma");
                candidateUser.setEmail("candidate@talentiq.com");
                candidateUser.setPassword(passwordEncoder.encode("Password@123"));
                candidateUser.setRole(Role.CANDIDATE);
                User savedCandidateUser = userRepository.save(candidateUser);

                // 3. Seed Candidate Profile
                Candidate candidate = new Candidate();
                candidate.setName("Priya Sharma");
                candidate.setEmail("candidate@talentiq.com");
                candidate.setUser(savedCandidateUser);
                candidate.setSubmissionStatus("VALIDATED");
                candidate.setSubmittedAt(LocalDateTime.now().minusDays(3));
                candidate.setValidatedAt(LocalDateTime.now().minusDays(1));
                candidate.setValidatedBy("recruiter@talentiq.com");
                candidate.setValidationNotes("Verified strong technical proficiency in Java, Spring Boot, and Cloud Architecture.");
                candidate.setResumeText("""
                        PRIYA SHARMA - SENIOR JAVA BACKEND DEVELOPER
                        Email: candidate@talentiq.com | Phone: +91 98765 43210
                        Location: Bangalore, India | LinkedIn: linkedin.com/in/priya-sharma-dev

                        PROFESSIONAL SUMMARY:
                        Senior Java Software Engineer with 5+ years of experience designing scalable microservices,
                        enterprise REST APIs, and cloud-native applications. Proficient in Java 17, Spring Boot,
                        MySQL, Docker, Kubernetes, AWS (ECS, S3, RDS), and distributed system design.

                        TECHNICAL SKILLS:
                        - Languages & Frameworks: Java 17/21, Spring Boot, Spring Security, Hibernate/JPA, React.js
                        - Databases: MySQL, PostgreSQL, Redis, MongoDB
                        - Cloud & DevOps: AWS (EC2, ECS, S3, RDS), Docker, Kubernetes, CI/CD GitHub Actions
                        - Architecture: Microservices, RESTful APIs, Event-Driven Architecture, Kafka

                        WORK EXPERIENCE:
                        Senior Backend Developer - CloudScale Solutions (2022 - Present)
                        - Designed high-throughput microservices using Spring Boot and MySQL handling 10M+ daily events.
                        - Architected REST APIs secured with JWT and OAuth2.
                        - Containerized 12+ backend services using Docker and orchestrated deployments on AWS ECS.

                        Software Engineer - FinTech Innovations (2020 - 2022)
                        - Developed core banking modules with Java, Spring Boot, and relational databases.
                        - Optimized complex SQL queries reducing report generation latency by 45%.

                        EDUCATION:
                        B.Tech in Computer Science and Engineering - Tier 1 University (2016 - 2020)
                        """);
                Candidate savedCandidate = candidateRepository.save(candidate);

                // 4. Seed Jobs
                Job job1 = new Job();
                job1.setTitle("Senior Java Backend Engineer");
                job1.setDescription("We are seeking an experienced Java Backend Engineer to design scalable microservices and REST APIs using Spring Boot, Hibernate, and MySQL. Candidates should have deep knowledge of clean architecture, unit testing, and distributed systems.");
                job1.setRequiredSkills("Java, Spring Boot, MySQL, REST APIs, Microservices");
                job1.setExperience("4+ years");
                job1.setLocation("Bangalore, India (Hybrid)");
                job1.setRecruiter(recruiter);
                jobRepository.save(job1);

                Job job2 = new Job();
                job2.setTitle("Senior Cloud & Java Architect");
                job2.setDescription("Looking for a Cloud Architect proficient in enterprise Java, Spring Boot, Docker containerization, AWS cloud infrastructure, and microservices patterns to lead our platform modernization.");
                job2.setRequiredSkills("Java, Spring Boot, AWS, Docker, Microservices, Kubernetes");
                job2.setExperience("5+ years");
                job2.setLocation("Remote / Bangalore");
                job2.setRecruiter(recruiter);
                jobRepository.save(job2);

                Job job3 = new Job();
                job3.setTitle("Full Stack Developer (React & Spring Boot)");
                job3.setDescription("Seeking a full stack developer skilled in modern React, Tailwind CSS, Java Spring Boot backends, and relational databases to build customer-facing recruitment and talent portals.");
                job3.setRequiredSkills("React, JavaScript, Java, Spring Boot, Tailwind CSS, MySQL");
                job3.setExperience("2-4 years");
                job3.setLocation("Hyderabad, India");
                job3.setRecruiter(recruiter);
                jobRepository.save(job3);

                Job job4 = new Job();
                job4.setTitle("DevOps & Cloud Infrastructure Engineer");
                job4.setDescription("Responsible for building robust CI/CD pipelines, containerizing Spring Boot and React applications using Docker, managing cloud infrastructure on AWS, and monitoring system health.");
                job4.setRequiredSkills("AWS, Docker, Kubernetes, CI/CD, Terraform, Linux");
                job4.setExperience("3+ years");
                job4.setLocation("Chennai, India");
                job4.setRecruiter(recruiter);
                jobRepository.save(job4);

                // 5. Evaluate candidate matches against seeded jobs
                matchService.matchCandidateAgainstAllJobs(savedCandidate.getId());

                log.info("Default recruitment platform data initialized successfully.");
            }
        } catch (Exception e) {
            log.warn("Data initialization encountered non-fatal note: {}", e.getMessage());
        }
    }
}
