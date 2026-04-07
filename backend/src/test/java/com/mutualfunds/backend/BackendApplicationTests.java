package com.mutualfunds.backend;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;

import org.junit.jupiter.api.Test;

class BackendApplicationTests {

    @Test
    void mainMethodExists() {
        assertDoesNotThrow(() -> BackendApplication.class.getDeclaredMethod("main", String[].class));
    }
}
