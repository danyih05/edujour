package com.gradquest.web;

import java.util.LinkedHashMap;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class RootController {

    @GetMapping("/")
    public Object index() {
        LinkedHashMap<String, Object> payload = new LinkedHashMap<>();
        payload.put("message", "GradQuest backend is running.");
        payload.put("health", "/api/health");
        payload.put("frontend", "http://localhost:5173");
        return ApiResponses.ok(payload);
    }
}
