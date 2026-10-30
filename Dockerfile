# Multi-Stage Dockerfile for TalentIQ AI Recruitment Platform

# -------------------------------------------------------------
# Stage 1: Build React Frontend
# -------------------------------------------------------------
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# -------------------------------------------------------------
# Stage 2: Build Spring Boot Backend with Bundled Frontend
# -------------------------------------------------------------
FROM maven:3.9.6-eclipse-temurin-17-alpine AS backend-builder
WORKDIR /app
COPY backend/pom.xml ./backend/
COPY backend/src ./backend/src

# Copy built frontend assets to Spring Boot static resources
COPY --from=frontend-builder /app/frontend/dist ./backend/src/main/resources/static/

WORKDIR /app/backend
RUN mvn clean package -DskipTests

# -------------------------------------------------------------
# Stage 3: Lightweight Production Runtime
# -------------------------------------------------------------
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Non-root application user
RUN addgroup -S talentiq && adduser -S talentiq -G talentiq

# Pre-create application directories with full ownership for non-root user
RUN mkdir -p /app/data /app/uploads /tmp \
    && chown -R talentiq:talentiq /app /tmp \
    && chmod -R 775 /app /tmp

USER talentiq

# Copy the executable fat JAR
COPY --from=backend-builder --chown=talentiq:talentiq /app/backend/target/*.jar app.jar

ENV PORT=8080
ENV SPRING_PROFILES_ACTIVE=prod
EXPOSE 8080

ENTRYPOINT ["java", "-XX:+UseContainerSupport", "-XX:MaxRAMPercentage=75.0", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]
