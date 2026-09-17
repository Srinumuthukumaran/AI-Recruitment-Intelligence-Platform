package com.talentiq.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.talentiq.backend.entity.Match;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class AiResponseParser {

    private static final Logger log = LoggerFactory.getLogger(AiResponseParser.class);
    private final ObjectMapper objectMapper = new ObjectMapper();

    public Match parse(String analysis, Match match) {
        if (analysis == null || analysis.isBlank()) {
            match.setMatchScore(0.0);
            match.setMatchingSkills("None identified");
            match.setMissingSkills("None identified");
            match.setStrengths("Analysis unavailable");
            match.setWeaknesses("Analysis unavailable");
            match.setExperienceMatch("Moderate");
            match.setExplanation("AI analysis returned an empty result.");
            return match;
        }

        // 1. Try structured JSON parsing first
        boolean jsonParsed = tryParseJson(analysis, match);

        // 2. If JSON parsing didn't find fields, fallback to text/regex extraction
        if (!jsonParsed || match.getMatchScore() == null) {
            parseTextFormat(analysis, match);
        }

        // 3. Fallback defaults if any field remains null
        if (match.getMatchScore() == null) {
            match.setMatchScore(50.0);
        }
        if (match.getMatchingSkills() == null || match.getMatchingSkills().isBlank()) {
            match.setMatchingSkills("None identified");
        }
        if (match.getMissingSkills() == null || match.getMissingSkills().isBlank()) {
            match.setMissingSkills("None identified");
        }
        if (match.getStrengths() == null || match.getStrengths().isBlank()) {
            match.setStrengths("Relevant background evaluated against job requirements.");
        }
        if (match.getWeaknesses() == null || match.getWeaknesses().isBlank()) {
            match.setWeaknesses("Review specific skill alignment for detailed evaluation.");
        }
        if (match.getExperienceMatch() == null || match.getExperienceMatch().isBlank()) {
            match.setExperienceMatch("Moderate");
        }
        if (match.getExplanation() == null || match.getExplanation().isBlank()) {
            match.setExplanation("AI evaluation completed based on candidate profile and job requirements.");
        }

        return match;
    }

    private boolean tryParseJson(String raw, Match match) {
        try {
            String jsonStr = extractJsonString(raw);
            if (jsonStr == null) {
                return false;
            }

            JsonNode root = objectMapper.readTree(jsonStr);
            if (!root.isObject()) {
                return false;
            }

            // matchScore
            if (root.has("matchScore")) {
                JsonNode scoreNode = root.get("matchScore");
                if (scoreNode.isNumber()) {
                    match.setMatchScore(scoreNode.asDouble());
                } else if (scoreNode.isTextual()) {
                    String scoreText = scoreNode.asText().replaceAll("[^0-9.]", "");
                    if (!scoreText.isBlank()) {
                        match.setMatchScore(Double.parseDouble(scoreText));
                    }
                }
            }

            // matchingSkills
            if (root.has("matchingSkills")) {
                match.setMatchingSkills(extractTextOrArray(root.get("matchingSkills")));
            }

            // missingSkills
            if (root.has("missingSkills")) {
                match.setMissingSkills(extractTextOrArray(root.get("missingSkills")));
            }

            // strengths
            if (root.has("strengths")) {
                match.setStrengths(extractTextOrArray(root.get("strengths")));
            }

            // weaknesses
            if (root.has("weaknesses")) {
                match.setWeaknesses(extractTextOrArray(root.get("weaknesses")));
            }

            // experienceMatch
            if (root.has("experienceMatch")) {
                match.setExperienceMatch(root.get("experienceMatch").asText().trim());
            }

            // explanation
            if (root.has("explanation")) {
                match.setExplanation(root.get("explanation").asText().trim());
            }

            return match.getMatchScore() != null;
        } catch (Exception e) {
            log.debug("JSON parsing skipped or failed: {}", e.getMessage());
            return false;
        }
    }

    private String extractTextOrArray(JsonNode node) {
        if (node == null || node.isNull()) {
            return null;
        }
        if (node.isArray()) {
            List<String> items = new ArrayList<>();
            for (JsonNode item : node) {
                String text = item.asText().trim();
                if (!text.isBlank()) {
                    items.add(text);
                }
            }
            return String.join(", ", items);
        }
        return node.asText().trim();
    }

    private String extractJsonString(String text) {
        // Strip markdown code fences if present: ```json ... ```
        Matcher fenceMatcher = Pattern.compile("```(?:json)?\\s*([\\s\\S]*?)\\s*```", Pattern.CASE_INSENSITIVE).matcher(text);
        if (fenceMatcher.find()) {
            return fenceMatcher.group(1).trim();
        }

        // Find outer curly braces
        int firstBrace = text.indexOf('{');
        int lastBrace = text.lastIndexOf('}');
        if (firstBrace != -1 && lastBrace != -1 && lastBrace > firstBrace) {
            return text.substring(firstBrace, lastBrace + 1).trim();
        }

        return null;
    }

    private void parseTextFormat(String analysis, Match match) {
        if (match.getMatchScore() == null) {
            match.setMatchScore(extractScore(analysis, "Match Score:"));
            if (match.getMatchScore() == null) {
                match.setMatchScore(extractScore(analysis, "Score:"));
            }
        }

        if (match.getMatchingSkills() == null) {
            match.setMatchingSkills(extractSection(analysis, "Matching Skills:", "Missing Skills:"));
        }

        if (match.getMissingSkills() == null) {
            match.setMissingSkills(extractSection(analysis, "Missing Skills:", "Strengths:"));
        }

        if (match.getStrengths() == null) {
            match.setStrengths(extractSection(analysis, "Strengths:", "Weaknesses:"));
        }

        if (match.getWeaknesses() == null) {
            match.setWeaknesses(extractSection(analysis, "Weaknesses:", "Experience Match:"));
        }

        if (match.getExperienceMatch() == null) {
            match.setExperienceMatch(extractSection(analysis, "Experience Match:", "Explanation:"));
        }

        if (match.getExplanation() == null) {
            match.setExplanation(extractSection(analysis, "Explanation:", null));
        }
    }

    private Double extractScore(String text, String label) {
        Pattern pattern = Pattern.compile(
                Pattern.quote(label) + "\\s*(\\d+(?:\\.\\d+)?)",
                Pattern.CASE_INSENSITIVE
        );
        Matcher matcher = pattern.matcher(text);
        if (matcher.find()) {
            return Double.parseDouble(matcher.group(1));
        }
        return null;
    }

    private String extractSection(String text, String startLabel, String endLabel) {
        String startMarker = startLabel.toLowerCase();
        String lowerText = text.toLowerCase();

        int start = lowerText.indexOf(startMarker);
        if (start == -1) {
            return null;
        }

        start += startLabel.length();

        int end;
        if (endLabel == null) {
            end = text.length();
        } else {
            end = lowerText.indexOf(endLabel.toLowerCase(), start);
            if (end == -1) {
                end = text.length();
            }
        }

        return text.substring(start, end).trim();
    }
}