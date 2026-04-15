package com.gradquest.web;

import com.gradquest.dto.LoginRequest;
import com.gradquest.dto.RegisterRequest;
import com.gradquest.security.AuthenticatedUser;
import com.gradquest.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public Object register(@Valid @RequestBody RegisterRequest request) {
        return ApiResponses.created(authService.register(request));
    }

    @PostMapping("/login")
    public Object login(@Valid @RequestBody LoginRequest request) {
        return ApiResponses.ok(authService.login(request));
    }

    @GetMapping("/me")
    public Object me(Authentication authentication) {
        return ApiResponses.ok(authService.currentUser((AuthenticatedUser) authentication.getPrincipal()));
    }

    @PostMapping("/logout")
    public Object logout() {
        return ApiResponses.ok(authService.logout());
    }
}
