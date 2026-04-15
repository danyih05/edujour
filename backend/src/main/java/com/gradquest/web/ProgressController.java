package com.gradquest.web;

import com.gradquest.dto.CompleteLevelRequest;
import com.gradquest.dto.SkipLevelRequest;
import com.gradquest.security.AuthenticatedUser;
import com.gradquest.service.ProgressService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/progress")
public class ProgressController {

    private final ProgressService progressService;

    public ProgressController(ProgressService progressService) {
        this.progressService = progressService;
    }

    @GetMapping
    public Object getProgress(Authentication authentication) {
        AuthenticatedUser currentUser = (AuthenticatedUser) authentication.getPrincipal();
        return ApiResponses.ok(progressService.getProgress(currentUser.id()));
    }

    @PostMapping("/complete")
    public Object completeLevel(Authentication authentication, @Valid @RequestBody CompleteLevelRequest request) {
        AuthenticatedUser currentUser = (AuthenticatedUser) authentication.getPrincipal();
        return ApiResponses.ok(progressService.completeLevel(currentUser.id(), request));
    }

    @PostMapping("/skip")
    public Object skipLevel(Authentication authentication, @Valid @RequestBody SkipLevelRequest request) {
        AuthenticatedUser currentUser = (AuthenticatedUser) authentication.getPrincipal();
        return ApiResponses.ok(progressService.skipLevel(currentUser.id(), request));
    }

    @PostMapping("/reset")
    public Object resetProgress(Authentication authentication) {
        AuthenticatedUser currentUser = (AuthenticatedUser) authentication.getPrincipal();
        return ApiResponses.ok(progressService.resetProgress(currentUser.id()));
    }
}
