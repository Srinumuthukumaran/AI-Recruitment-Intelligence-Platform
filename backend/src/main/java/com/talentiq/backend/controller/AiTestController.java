package com.talentiq.backend.controller;

import com.talentiq.backend.service.AiService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class AiTestController {

    private final AiService aiService;

    public AiTestController(AiService aiService) {
        this.aiService = aiService;
    }

    @GetMapping("/api/ai/test")
    public String testGemini() {
        return aiService.testGemini();
    }
}