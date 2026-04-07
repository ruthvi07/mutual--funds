package com.mutualfunds.backend.service;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.stereotype.Component;

@Component
public class CsvMapper {

    public String joinStrings(List<String> values) {
        return String.join("||", values);
    }

    public List<String> splitStrings(String value) {
        if (value == null || value.isBlank()) {
            return Collections.emptyList();
        }
        return Arrays.stream(value.split("\\|\\|")).toList();
    }

    public String joinDoubles(List<Double> values) {
        return values.stream().map(String::valueOf).collect(Collectors.joining(","));
    }

    public List<Double> splitDoubles(String value) {
        if (value == null || value.isBlank()) {
            return Collections.emptyList();
        }
        return Arrays.stream(value.split(",")).map(Double::parseDouble).toList();
    }

    public String mapToJsonish(Map<String, Double> values) {
        return values.entrySet().stream()
                .map(entry -> entry.getKey() + ":" + entry.getValue())
                .collect(Collectors.joining(","));
    }

    public Map<String, Double> jsonishToMap(String value) {
        if (value == null || value.isBlank()) {
            return Collections.emptyMap();
        }
        return Arrays.stream(value.split(","))
                .map(part -> part.split(":"))
                .collect(Collectors.toMap(parts -> parts[0], parts -> Double.parseDouble(parts[1])));
    }
}
