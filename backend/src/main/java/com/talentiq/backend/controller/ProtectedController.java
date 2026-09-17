package com.talentiq.backend.controller;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ProtectedController {

    @GetMapping("/api/protected")
    public String protectedEndpoint(
            Authentication authentication) {

        return "Welcome " +
                authentication.getName() +
                "! JWT Authentication is working.";
    }
}