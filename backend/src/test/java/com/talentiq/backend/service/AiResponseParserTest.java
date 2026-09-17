package com.talentiq.backend.service;

import com.talentiq.backend.entity.Match;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class AiResponseParserTest {

    private AiResponseParser parser;

    @BeforeEach
    void setUp() {
        parser = new AiResponseParser();
    }

    @Test
    void testParseStructuredJson() {
        String json = """
                {
                  "matchScore": 85,
                  "matchingSkills": "Java, Spring Boot, MySQL",
                  "missingSkills": "React, Docker",
                  "strengths": "Strong backend development experience",
                  "weaknesses": "Limited frontend experience",
                  "experienceMatch": "Good",
                  "explanation": "The candidate strongly matches the backend requirements."
                }
                """;

        Match match = new Match();
        match = parser.parse(json, match);

        assertEquals(85.0, match.getMatchScore());
        assertEquals("Java, Spring Boot, MySQL", match.getMatchingSkills());
        assertEquals("React, Docker", match.getMissingSkills());
        assertEquals("Strong backend development experience", match.getStrengths());
        assertEquals("Limited frontend experience", match.getWeaknesses());
        assertEquals("Good", match.getExperienceMatch());
        assertEquals("The candidate strongly matches the backend requirements.", match.getExplanation());
    }

    @Test
    void testParseMarkdownFencedJson() {
        String fencedJson = """
                Here is the analysis:
                ```json
                {
                  "matchScore": 92.5,
                  "matchingSkills": ["Java", "Spring Boot", "Microservices"],
                  "missingSkills": ["Kubernetes"],
                  "strengths": "Extensive enterprise architecture experience",
                  "weaknesses": "No direct Kubernetes production usage",
                  "experienceMatch": "Good",
                  "explanation": "Excellent alignment with senior backend engineering role."
                }
                ```
                """;

        Match match = new Match();
        match = parser.parse(fencedJson, match);

        assertEquals(92.5, match.getMatchScore());
        assertTrue(match.getMatchingSkills().contains("Java"));
        assertTrue(match.getMatchingSkills().contains("Spring Boot"));
        assertEquals("Kubernetes", match.getMissingSkills());
        assertEquals("Good", match.getExperienceMatch());
    }

    @Test
    void testParseLegacyTextFormat() {
        String legacyText = """
                Match Score: 78

                Matching Skills:
                Java, SQL, REST APIs

                Missing Skills:
                AWS, Docker

                Strengths:
                Solid core Java and relational database fundamentals.

                Weaknesses:
                Lacks cloud infrastructure experience.

                Experience Match:
                Moderate

                Explanation:
                Well-suited for traditional backend stack with minor cloud gaps.
                """;

        Match match = new Match();
        match = parser.parse(legacyText, match);

        assertEquals(78.0, match.getMatchScore());
        assertEquals("Java, SQL, REST APIs", match.getMatchingSkills());
        assertEquals("AWS, Docker", match.getMissingSkills());
        assertEquals("Solid core Java and relational database fundamentals.", match.getStrengths());
        assertEquals("Lacks cloud infrastructure experience.", match.getWeaknesses());
        assertEquals("Moderate", match.getExperienceMatch());
        assertEquals("Well-suited for traditional backend stack with minor cloud gaps.", match.getExplanation());
    }
}
