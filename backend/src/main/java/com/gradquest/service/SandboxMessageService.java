package com.gradquest.service;

import com.gradquest.dto.CreateMessageRequest;
import com.gradquest.dto.SandboxMessageDTO;
import com.gradquest.exception.ApiException;
import com.gradquest.model.SandboxMessage;
import com.gradquest.repository.SandboxMessageRepository;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SandboxMessageService {

    private static final int DAILY_LIMIT = 20;
    private static final String DEFAULT_EMOJI = "\uD83D\uDCAC";
    private final SandboxMessageRepository sandboxMessageRepository;

    public SandboxMessageService(SandboxMessageRepository sandboxMessageRepository) {
        this.sandboxMessageRepository = sandboxMessageRepository;
    }

    @Transactional(readOnly = true)
    public LinkedHashMap<String, Object> listMessages(int page, int size) {
        var pageable = PageRequest.of(Math.max(page, 0), normalizePageSize(size));
        var rows = sandboxMessageRepository.findAllByOrderByCreatedAtDesc(pageable)
            .map(this::toDto)
            .getContent();

        LinkedHashMap<String, Object> payload = new LinkedHashMap<>();
        payload.put("messages", rows);
        payload.put("page", pageable.getPageNumber());
        payload.put("size", pageable.getPageSize());
        return payload;
    }

    @Transactional
    public SandboxMessageDTO createMessage(long userId, CreateMessageRequest request) {
        enforceDailyLimit(userId);

        SandboxMessage message = new SandboxMessage();
        message.setUserId(userId);
        message.setContent(stripHtml(request.content()));
        message.setX(request.x());
        message.setY(request.y());
        message.setEmoji(normalizeEmoji(request.emoji()));

        SandboxMessage saved = sandboxMessageRepository.save(message);
        return toDto(saved);
    }

    private void enforceDailyLimit(long userId) {
        LocalDate today = LocalDate.now();
        LocalDateTime start = today.atStartOfDay();
        LocalDateTime end = today.plusDays(1).atStartOfDay();
        long count = sandboxMessageRepository.countByUserIdAndCreatedAtBetween(userId, start, end);
        if (count >= DAILY_LIMIT) {
            throw new ApiException(HttpStatus.TOO_MANY_REQUESTS, "Daily message limit reached (20/day).");
        }
    }

    private int normalizePageSize(int size) {
        if (size <= 0) {
            return 200;
        }
        return Math.min(size, 500);
    }

    private String stripHtml(String raw) {
        if (raw == null) {
            return "";
        }
        return raw.replaceAll("<[^>]*>", "").trim();
    }

    private String normalizeEmoji(String emoji) {
        if (emoji == null || emoji.isBlank()) {
            return DEFAULT_EMOJI;
        }
        return emoji.trim();
    }

    private SandboxMessageDTO toDto(SandboxMessage message) {
        return new SandboxMessageDTO(
            message.getId(),
            message.getContent(),
            message.getX(),
            message.getY(),
            message.getEmoji(),
            message.getUserId(),
            message.getCreatedAt()
        );
    }
}
