package com.talentiq.backend.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class RecruiterController {

    @GetMapping("/api/recruiter/test")
    @PreAuthorize("hasRole('RECRUITER')")
    public String recruiterTest() {

        return "Recruiter API Access Granted!";
    }
}