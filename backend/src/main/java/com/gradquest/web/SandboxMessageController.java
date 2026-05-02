package com.gradquest.web;

import com.gradquest.dto.CreateMessageRequest;
import com.gradquest.security.AuthenticatedUser;
import com.gradquest.service.SandboxMessageService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/sandbox/messages")
public class SandboxMessageController {

    private final SandboxMessageService sandboxMessageService;

    public SandboxMessageController(SandboxMessageService sandboxMessageService) {
        this.sandboxMessageService = sandboxMessageService;
    }

    @GetMapping
    public Object listMessages(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "200") int size
    ) {
        return ApiResponses.ok(sandboxMessageService.listMessages(page, size));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('STUDENT','TEACHER')")
    public Object createMessage(Authentication authentication, @Valid @RequestBody CreateMessageRequest request) {
        AuthenticatedUser currentUser = (AuthenticatedUser) authentication.getPrincipal();
        return ApiResponses.created(sandboxMessageService.createMessage(currentUser.id(), request));
    }
}
