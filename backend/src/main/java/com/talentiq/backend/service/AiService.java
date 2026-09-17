package com.talentiq.backend.service;

import com.google.genai.Client;
import com.google.genai.errors.ApiException;
import com.google.genai.types.GenerateContentResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.InputStreamReader;

@Service
public class AiService {

    private static final Logger log = LoggerFactory.getLogger(AiService.class);

    private static final String PRIMARY_MODEL = "gemini-2.0-flash";
    private static final String FALLBACK_MODEL = "gemini-1.5-flash";

    private final java.util.concurrent.ExecutorService executor = java.util.concurrent.Executors.newCachedThreadPool();
    private Client client;

    public AiService() {
        try {
            String apiKey = resolveApiKey();
            if (apiKey != null && !apiKey.isBlank()) {
                this.client = Client.builder().apiKey(apiKey).build();
                log.info("Google GenAI Client initialized successfully with resolved API key.");
            } else {
                log.warn("GEMINI_API_KEY environment variable not detected at startup. Client will be initialized lazily.");
            }
        } catch (Exception e) {
            log.warn("Google GenAI Client initialization deferred: {}. Ensure GEMINI_API_KEY is set.", e.getMessage());
            this.client = null;
        }
    }

    private synchronized Client getClient() {
        if (this.client == null) {
            String apiKey = resolveApiKey();
            if (apiKey == null || apiKey.isBlank()) {
                throw new RuntimeException("Gemini API key is not configured. Please set the GEMINI_API_KEY environment variable.");
            }
            try {
                this.client = Client.builder().apiKey(apiKey).build();
                log.info("Google GenAI Client initialized lazily with resolved API key.");
            } catch (Exception e) {
                throw new RuntimeException("Failed to initialize Google GenAI Client: " + e.getMessage(), e);
            }
        }
        return this.client;
    }

    private static String resolveApiKey() {
        String key = System.getenv("GEMINI_API_KEY");
        if (key != null && !key.isBlank()) return key.trim();

        key = System.getProperty("gemini.api.key");
        if (key != null && !key.isBlank()) return key.trim();

        key = System.getenv("GOOGLE_API_KEY");
        if (key != null && !key.isBlank()) return key.trim();

        key = readWindowsRegistryEnv("GEMINI_API_KEY");
        if (key != null && !key.isBlank()) return key.trim();

        key = readWindowsRegistryEnv("GOOGLE_API_KEY");
        if (key != null && !key.isBlank()) return key.trim();

        return null;
    }

    private static String readWindowsRegistryEnv(String varName) {
        if (!System.getProperty("os.name", "").toLowerCase().contains("win")) {
            return null;
        }
        try {
            Process process = new ProcessBuilder("reg", "query", "HKCU\\Environment", "/v", varName).start();
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    if (line.contains(varName)) {
                        String[] tokens = line.trim().split("\\s+", 3);
                        if (tokens.length >= 3) {
                            return tokens[2].trim();
                        }
                    }
                }
            }
        } catch (Exception ignored) {}
        return null;
    }

    private String callGeminiWithFallback(String prompt) {
        Client c = getClient();
        try {
            java.util.concurrent.Future<String> future = executor.submit(() -> {
                try {
                    GenerateContentResponse response = c.models.generateContent(PRIMARY_MODEL, prompt, null);
                    if (response != null && response.text() != null) {
                        return response.text();
                    }
                } catch (ApiException e) {
                    int code = e.code();
                    log.warn("Gemini API call to {} returned status {}. Attempting fallback to {}.", PRIMARY_MODEL, code, FALLBACK_MODEL);
                    if (code == 429 || code == 503 || code == 404 || code == 500) {
                        try {
                            if (code == 429) Thread.sleep(500);
                            GenerateContentResponse fallbackResponse = c.models.generateContent(FALLBACK_MODEL, prompt, null);
                            if (fallbackResponse != null && fallbackResponse.text() != null) {
                                return fallbackResponse.text();
                            }
                        } catch (Exception fallbackEx) {
                            log.error("Fallback to {} also failed: {}", FALLBACK_MODEL, fallbackEx.getMessage());
                        }
                    }
                    throw handleApiException(e);
                }
                throw new RuntimeException("Gemini returned an empty response.");
            });

            return future.get(8, java.util.concurrent.TimeUnit.SECONDS);
        } catch (java.util.concurrent.TimeoutException te) {
            log.warn("Gemini API call timed out after 8 seconds.");
            throw new RuntimeException("AI processing timed out. Using high-accuracy rule-based engine.");
        } catch (java.util.concurrent.ExecutionException ee) {
            Throwable cause = ee.getCause() != null ? ee.getCause() : ee;
            if (cause instanceof RuntimeException re) throw re;
            throw new RuntimeException("AI processing failed: " + sanitizeErrorMessage(cause.getMessage()), cause);
        } catch (Exception e) {
            log.error("Unexpected error during Gemini API call: {}", e.getMessage());
            throw new RuntimeException("AI processing failed: " + sanitizeErrorMessage(e.getMessage()), e);
        }
    }

    // ==========================================
    // 1. RESUME ANALYSIS
    // ==========================================
    public String analyzeResume(String resumeText, String jobDescription) {
        String prompt = """
                You are an AI recruitment assistant for TalentIQ.

                Analyze the candidate resume against the job description.

                Return the analysis as a clean JSON object with this exact structure:
                {
                  "matchScore": <number from 0 to 100>,
                  "matchingSkills": "<comma-separated list of matching skills>",
                  "missingSkills": "<comma-separated list of missing skills>",
                  "strengths": "<summary of candidate strengths for this role>",
                  "weaknesses": "<summary of candidate weaknesses or areas for improvement>",
                  "experienceMatch": "<Good / Moderate / Poor>",
                  "explanation": "<concise explanation of the overall match recommendation>"
                }

                IMPORTANT GUIDELINES:
                - Evaluate ONLY job-related qualifications, skills, and experience.
                - Do NOT use or infer sensitive personal characteristics (race, religion, gender, age, disability, political views, sexual orientation, etc.).
                - Do NOT make the final hiring decision; this is decision-support information for human recruiters.
                - Respond ONLY with the JSON object. Do not include extra markdown fences or surrounding commentary.

                JOB DESCRIPTION:
                %s

                CANDIDATE RESUME:
                %s
                """.formatted(jobDescription, resumeText);

        return callGeminiWithFallback(prompt);
    }

    // ==========================================
    // 2. INTERVIEW QUESTION GENERATION
    // ==========================================
    public String generateInterviewQuestions(String candidateInfo) {
        // If candidateInfo is already a structured prompt from InterviewService, execute directly
        String prompt;
        if (candidateInfo != null && (candidateInfo.contains("TalentIQ AI Interview Assistant") || candidateInfo.contains("FORMAT REQUIREMENTS:"))) {
            prompt = candidateInfo;
        } else {
            prompt = """
                    You are an AI interview assistant for TalentIQ.

                    Generate interview questions based on the candidate information provided below.

                    Create:
                    1. Five technical questions
                    2. Three experience-based questions
                    3. Two problem-solving questions

                    Questions must be based on the candidate's skills and experience.
                    Do not use or infer sensitive personal characteristics.
                    Provide a clean, readable response.

                    CANDIDATE INFORMATION:
                    %s
                    """.formatted(candidateInfo);
        }

        return callGeminiWithFallback(prompt);
    }

    // ==========================================
    // 3. GEMINI TEST
    // ==========================================
    public String testGemini() {
        return callGeminiWithFallback("Say hello from TalentIQ AI recruitment system.");
    }

    // ==========================================
    // 4. AI RECRUITER COPILOT
    // ==========================================
    public String askCopilot(String question) {
        String prompt = (question != null && question.contains("TalentIQ AI Recruiter Copilot"))
                ? question
                : """
                You are TalentIQ AI Recruiter Copilot, an intelligent recruitment assistant.
                Help the recruiter with recruitment-related questions.

                Provide clear, practical, and concise answers.

                You can help with:
                - Candidate evaluation
                - Resume analysis
                - Job requirements
                - Skill matching
                - Interview preparation
                - Candidate strengths and weaknesses
                - Recruitment recommendations

                Important:
                - Evaluate only job-related information.
                - Do not use or infer sensitive personal characteristics (race, religion, gender, age, disability, etc.).
                - Do not make the final hiring decision.
                - Your response is only decision-support information.

                Recruiter's Question:
                %s
                """.formatted(question);

        return callGeminiWithFallback(prompt);
    }

    // ==========================================
    // ERROR HANDLING & SANITIZATION
    // ==========================================
    private RuntimeException handleApiException(ApiException e) {
        int code = e.code();
        String msg = e.getMessage() != null ? e.getMessage() : "";

        if (code == 401 || code == 403 || msg.toLowerCase().contains("api_key") || msg.toLowerCase().contains("api key")) {
            return new RuntimeException("Gemini API authentication failed. Please verify that GEMINI_API_KEY is valid.");
        } else if (code == 429 || msg.toLowerCase().contains("quota") || msg.toLowerCase().contains("resource_exhausted")) {
            return new RuntimeException("Gemini API rate limit or quota exceeded. Please try again shortly.");
        } else if (code == 503 || msg.toLowerCase().contains("unavailable") || msg.toLowerCase().contains("high demand")) {
            return new RuntimeException("Gemini AI service is temporarily experiencing high demand. Please try again shortly.");
        } else if (code == 404 || msg.toLowerCase().contains("not found")) {
            return new RuntimeException("Configured Gemini model is not found or unavailable.");
        } else {
            return new RuntimeException("Gemini API error (HTTP " + code + "): " + sanitizeErrorMessage(msg));
        }
    }

    private String sanitizeErrorMessage(String msg) {
        if (msg == null) return "Unknown error";
        // Ensure no API keys (starts with AIzaSy... or similar) are exposed
        return msg.replaceAll("AIza[0-9A-Za-z-_]{35}", "[REDACTED_API_KEY]");
    }
}