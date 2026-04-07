package com.mutualfunds.backend.config;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;

import javax.annotation.PostConstruct;

import org.springframework.context.annotation.Configuration;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;

@Configuration
public class FirebaseConfig {

    @PostConstruct
    public void initFirebase() throws IOException {
        String json = System.getenv("FIREBASE_SERVICE_ACCOUNT_JSON");
        
        if (json == null || json.isEmpty()) {
            throw new RuntimeException("FIREBASE_SERVICE_ACCOUNT_JSON is not set");
        }

        InputStream serviceAccount = new ByteArrayInputStream(json.getBytes());
        FirebaseOptions options = FirebaseOptions.builder()
                .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                .build();

        if (FirebaseApp.getApps().isEmpty()) {
            FirebaseApp.initializeApp(options);
        }
    }
}