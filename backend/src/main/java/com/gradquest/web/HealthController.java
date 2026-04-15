package com.gradquest.web;

import java.util.LinkedHashMap;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/health")
public class HealthController {

    @GetMapping
    public Object health() {
        LinkedHashMap<String, Object> payload = new LinkedHashMap<>();
        payload.put("message", "Backend is running");
        payload.put("framework", "Spring Boot");
        return ApiResponses.ok(payload);
    }
}
