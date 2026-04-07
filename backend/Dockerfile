FROM eclipse-temurin:24-jdk AS builder

WORKDIR /app

COPY backend/gradlew gradlew
COPY backend/gradle gradle
COPY backend/build.gradle backend/settings.gradle ./
RUN chmod +x gradlew
RUN ./gradlew dependencies --no-daemon || true

COPY backend/src src
RUN ./gradlew bootJar --no-daemon

FROM eclipse-temurin:24-jre

WORKDIR /app

COPY --from=builder /app/build/libs/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "/app/app.jar"]
