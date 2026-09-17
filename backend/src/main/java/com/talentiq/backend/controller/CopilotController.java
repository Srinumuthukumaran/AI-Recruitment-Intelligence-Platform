package com.talentiq.backend.controller;

import com.talentiq.backend.service.CopilotService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/copilot")
public class CopilotController {

    private final CopilotService copilotService;

    public CopilotController(CopilotService copilotService) {
        this.copilotService = copilotService;
    }

    @PostMapping({"/chat", "/ask"})
    @PreAuthorize("hasRole('RECRUITER')")
    public Map<String, Object> askCopilot(@RequestBody Map<String, Object> request) {
        String question = (String) request.get("question");
        Long jobId = null;
        if (request.get("jobId") != null) {
            jobId = Long.valueOf(request.get("jobId").toString());
        }
        return copilotService.askCopilot(question, jobId);
    }
}
