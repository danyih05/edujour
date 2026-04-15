package com.gradquest.service;

import com.gradquest.config.AppProperties;
import com.gradquest.data.LevelCatalog;
import com.gradquest.dto.LoginRequest;
import com.gradquest.dto.RegisterRequest;
import com.gradquest.exception.ApiException;
import com.gradquest.model.UserAccount;
import com.gradquest.model.UserRole;
import com.gradquest.repository.ProgressRepository;
import com.gradquest.repository.UserRepository;
import com.gradquest.security.AuthenticatedUser;
import com.gradquest.security.JwtService;
import java.util.LinkedHashMap;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final ProgressRepository progressRepository;
    private final LevelCatalog levelCatalog;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    private final AppProperties appProperties;
    private final PayloadBuilder payloadBuilder;
    private final AvatarPresetService avatarPresetService;

    public AuthService(
        UserRepository userRepository,
        ProgressRepository progressRepository,
        LevelCatalog levelCatalog,
        JwtService jwtService,
        PasswordEncoder passwordEncoder,
        AppProperties appProperties,
        PayloadBuilder payloadBuilder,
        AvatarPresetService avatarPresetService
    ) {
        this.userRepository = userRepository;
        this.progressRepository = progressRepository;
        this.levelCatalog = levelCatalog;
        this.jwtService = jwtService;
        this.passwordEncoder = passwordEncoder;
        this.appProperties = appProperties;
        this.payloadBuilder = payloadBuilder;
        this.avatarPresetService = avatarPresetService;
    }

    @Transactional
    public LinkedHashMap<String, Object> register(RegisterRequest request) {
        String email = request.email().trim().toLowerCase();
        String displayName = request.displayName().trim();
        if (userRepository.findByEmail(email).isPresent()) {
            throw new ApiException(HttpStatus.CONFLICT, "Email is already registered.");
        }

        UserRole role = UserRole.from(request.role());
        int initialCoins = role == UserRole.STUDENT ? appProperties.getGameplay().getInitialCoins() : 0;

        UserAccount userAccount = userRepository.create(
            email,
            email,
            displayName,
            passwordEncoder.encode(request.password()),
            role,
            initialCoins
        );

        userRepository.updateTravelerProfile(
            userAccount.id(),
            payloadBuilder.serializeTravelerProfile(
                avatarPresetService.buildTravelerProfile(displayName, role, request.avatarKey())
            )
        );

        if (role == UserRole.STUDENT) {
            progressRepository.createDefaultRows(userAccount.id(), levelCatalog.getAllLevels());
        }

        userRepository.updateLastLogin(userAccount.id());
        return buildSessionPayload(userRepository.findById(userAccount.id()).orElseThrow());
    }

    public LinkedHashMap<String, Object> login(LoginRequest request) {
        String email = request.email().trim().toLowerCase();
        UserAccount userAccount = userRepository.findByEmail(email)
            .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Invalid email or password."));

        if (!passwordEncoder.matches(request.password(), userAccount.passwordHash())) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Invalid email or password.");
        }

        userRepository.updateLastLogin(userAccount.id());
        return buildSessionPayload(userRepository.findById(userAccount.id()).orElseThrow());
    }

    public LinkedHashMap<String, Object> currentUser(AuthenticatedUser authenticatedUser) {
        UserAccount userAccount = requireUser(authenticatedUser.id());
        LinkedHashMap<String, Object> payload = new LinkedHashMap<>();
        payload.put("user", payloadBuilder.toUserPayload(userAccount));
        return payload;
    }

    public LinkedHashMap<String, Object> logout() {
        LinkedHashMap<String, Object> payload = new LinkedHashMap<>();
        payload.put("message", "Logged out.");
        return payload;
    }

    public UserAccount requireUser(long userId) {
        return userRepository.findById(userId)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found."));
    }

    private LinkedHashMap<String, Object> buildSessionPayload(UserAccount userAccount) {
        LinkedHashMap<String, Object> payload = new LinkedHashMap<>();
        payload.put("token", jwtService.issueToken(userAccount));
        payload.put("user", payloadBuilder.toUserPayload(userAccount));
        return payload;
    }
}
