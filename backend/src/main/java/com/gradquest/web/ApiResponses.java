package com.gradquest.web;

import java.util.LinkedHashMap;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

public final class ApiResponses {

    private ApiResponses() {
    }

    public static ResponseEntity<LinkedHashMap<String, Object>> ok(Object data) {
        return ResponseEntity.ok(body(true, data, null));
    }

    public static ResponseEntity<LinkedHashMap<String, Object>> created(Object data) {
        return ResponseEntity.status(HttpStatus.CREATED).body(body(true, data, null));
    }

    public static ResponseEntity<LinkedHashMap<String, Object>> error(HttpStatus status, String message) {
        return ResponseEntity.status(status).body(body(false, null, message));
    }

    private static LinkedHashMap<String, Object> body(boolean success, Object data, String message) {
        LinkedHashMap<String, Object> payload = new LinkedHashMap<>();
        payload.put("success", success);
        if (success) {
            payload.put("data", data);
        } else {
            LinkedHashMap<String, Object> error = new LinkedHashMap<>();
            error.put("message", message);
            payload.put("error", error);
        }
        return payload;
    }
}
