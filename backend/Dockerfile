# Standalone Backend Dockerfile
FROM maven:3.9.6-eclipse-temurin-17-alpine AS builder
WORKDIR /app
COPY pom.xml ./
COPY src ./src
RUN mvn clean package -DskipTests

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

RUN addgroup -S talentiq && adduser -S talentiq -G talentiq
RUN mkdir -p /app/data /app/uploads /tmp \
    && chown -R talentiq:talentiq /app /tmp \
    && chmod -R 775 /app /tmp

USER talentiq

COPY --from=builder --chown=talentiq:talentiq /app/target/*.jar app.jar

ENV PORT=8080
ENV SPRING_PROFILES_ACTIVE=prod
EXPOSE 8080

ENTRYPOINT ["java", "-XX:+UseContainerSupport", "-XX:MaxRAMPercentage=75.0", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]
