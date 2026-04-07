package com.mutualfunds.backend.service;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseToken;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.HashMap;
import java.util.Map;
import org.springframework.stereotype.Component;

@Component
public class FirebaseTokenVerifier {

    private FirebaseAuth firebaseAuth;

    public FirebaseTokenVerifier() {
        Map<String, String> env = loadFirebaseEnvironment();
        String projectId = env.get("FIREBASE_PROJECT_ID");
        String clientEmail = env.get("FIREBASE_CLIENT_EMAIL");
        String privateKey = env.get("FIREBASE_PRIVATE_KEY");

        if (isBlank(projectId) || isBlank(clientEmail) || isBlank(privateKey)) {
            return;
        }

        try {
            Map<String, Object> serviceAccount = new HashMap<>();
            serviceAccount.put("type", "service_account");
            serviceAccount.put("project_id", projectId);
            serviceAccount.put("private_key_id", env.get("FIREBASE_PRIVATE_KEY_ID"));
            serviceAccount.put("private_key", privateKey.replace("\\n", "\n"));
            serviceAccount.put("client_email", clientEmail);
            serviceAccount.put("client_id", env.get("FIREBASE_CLIENT_ID"));
            serviceAccount.put("auth_uri", "https://accounts.google.com/o/oauth2/auth");
            serviceAccount.put("token_uri", "https://oauth2.googleapis.com/token");
            serviceAccount.put("auth_provider_x509_cert_url", "https://www.googleapis.com/oauth2/v1/certs");
            serviceAccount.put("client_x509_cert_url", env.get("FIREBASE_CLIENT_CERT_URL"));

            String json = """
                    {
                      "type":"%s",
                      "project_id":"%s",
                      "private_key_id":"%s",
                      "private_key":"%s",
                      "client_email":"%s",
                      "client_id":"%s",
                      "auth_uri":"%s",
                      "token_uri":"%s",
                      "auth_provider_x509_cert_url":"%s",
                      "client_x509_cert_url":"%s"
                    }
                    """.formatted(
                    serviceAccount.get("type"),
                    escape(serviceAccount.get("project_id")),
                    escape(serviceAccount.get("private_key_id")),
                    escape(serviceAccount.get("private_key")),
                    escape(serviceAccount.get("client_email")),
                    escape(serviceAccount.get("client_id")),
                    escape(serviceAccount.get("auth_uri")),
                    escape(serviceAccount.get("token_uri")),
                    escape(serviceAccount.get("auth_provider_x509_cert_url")),
                    escape(serviceAccount.get("client_x509_cert_url"))
            );

            GoogleCredentials credentials = GoogleCredentials.fromStream(
                    new ByteArrayInputStream(json.getBytes(StandardCharsets.UTF_8))
            );

            FirebaseOptions options = FirebaseOptions.builder()
                    .setCredentials(credentials)
                    .setProjectId(projectId)
                    .build();

            FirebaseApp app = FirebaseApp.getApps().isEmpty()
                    ? FirebaseApp.initializeApp(options)
                    : FirebaseApp.getInstance();
            this.firebaseAuth = FirebaseAuth.getInstance(app);
        } catch (Exception ignored) {
            this.firebaseAuth = null;
        }
    }

    public FirebaseToken verify(String idToken) {
        if (firebaseAuth == null) {
            throw new IllegalArgumentException("Firebase Admin is not configured on the backend");
        }
        try {
            return firebaseAuth.verifyIdToken(idToken);
        } catch (Exception exception) {
            throw new IllegalArgumentException("Invalid Google token");
        }
    }

    private static boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    private static Map<String, String> loadFirebaseEnvironment() {
        Map<String, String> values = new HashMap<>();
        values.putAll(System.getenv());

        Path dotenvPath = Path.of(".env");
        if (!Files.exists(dotenvPath)) {
            return values;
        }

        try {
            for (String line : Files.readAllLines(dotenvPath, StandardCharsets.UTF_8)) {
                String trimmed = line.trim();
                if (trimmed.isEmpty() || trimmed.startsWith("#") || !trimmed.contains("=")) {
                    continue;
                }
                String[] parts = trimmed.split("=", 2);
                String key = parts[0].trim();
                String value = parts[1].trim();
                if ((value.startsWith("\"") && value.endsWith("\"")) || (value.startsWith("'") && value.endsWith("'"))) {
                    value = value.substring(1, value.length() - 1);
                }
                values.putIfAbsent(key, value);
            }
        } catch (IOException ignored) {
        }

        return values;
    }

    private static String escape(Object value) {
        if (value == null) {
            return "";
        }
        return value.toString()
                .replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\n", "\\n");
    }
}
