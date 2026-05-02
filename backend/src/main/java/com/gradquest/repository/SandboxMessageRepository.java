package com.gradquest.repository;

import com.gradquest.model.SandboxMessage;
import java.time.LocalDateTime;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SandboxMessageRepository extends JpaRepository<SandboxMessage, Long> {

    Page<SandboxMessage> findAllByOrderByCreatedAtDesc(Pageable pageable);

    long countByUserIdAndCreatedAtBetween(Long userId, LocalDateTime start, LocalDateTime end);
}
