package com.gradquest.service;

import com.gradquest.exception.ApiException;
import com.gradquest.model.UserAccount;
import com.gradquest.model.UserRole;
import com.gradquest.repository.InventoryRepository;
import com.gradquest.repository.UserRepository;
import java.util.LinkedHashMap;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
public class InventoryService {

    private final UserRepository userRepository;
    private final InventoryRepository inventoryRepository;
    private final PayloadBuilder payloadBuilder;

    public InventoryService(
        UserRepository userRepository,
        InventoryRepository inventoryRepository,
        PayloadBuilder payloadBuilder
    ) {
        this.userRepository = userRepository;
        this.inventoryRepository = inventoryRepository;
        this.payloadBuilder = payloadBuilder;
    }

    public LinkedHashMap<String, Object> getInventory(long userId) {
        UserAccount userAccount = requireStudent(userId);
        LinkedHashMap<String, Object> payload = new LinkedHashMap<>();
        payload.put("user", payloadBuilder.toUserPayload(userAccount));
        payload.put("items", payloadBuilder.toInventoryPayload(inventoryRepository.findByUserId(userId)));
        return payload;
    }

    private UserAccount requireStudent(long userId) {
        UserAccount userAccount = userRepository.findById(userId)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found."));
        if (userAccount.role() != UserRole.STUDENT) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Only students can access this resource.");
        }
        return userAccount;
    }
}
