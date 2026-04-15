package com.gradquest.service;

import com.gradquest.exception.ApiException;
import com.gradquest.model.InventoryItem;
import com.gradquest.model.ShopItem;
import com.gradquest.model.UserAccount;
import com.gradquest.model.UserRole;
import com.gradquest.repository.InventoryRepository;
import com.gradquest.repository.ShopRepository;
import com.gradquest.repository.UserRepository;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Optional;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ShopService {

    private final UserRepository userRepository;
    private final ShopRepository shopRepository;
    private final InventoryRepository inventoryRepository;

    public ShopService(
        UserRepository userRepository,
        ShopRepository shopRepository,
        InventoryRepository inventoryRepository
    ) {
        this.userRepository = userRepository;
        this.shopRepository = shopRepository;
        this.inventoryRepository = inventoryRepository;
    }

    public LinkedHashMap<String, Object> getItems(long userId) {
        requireStudent(userId);
        List<LinkedHashMap<String, Object>> items = shopRepository.findActiveItems().stream()
            .map(item -> toShopPayload(userId, item))
            .toList();
        LinkedHashMap<String, Object> payload = new LinkedHashMap<>();
        payload.put("items", items);
        return payload;
    }

    @Transactional
    public LinkedHashMap<String, Object> purchase(long userId, long itemId) {
        UserAccount userAccount = requireStudent(userId);
        ShopItem shopItem = shopRepository.findById(itemId)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Shop item not found."));

        if (!shopItem.active()) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Shop item not found.");
        }

        Optional<InventoryItem> ownedItem = inventoryRepository.findByUserIdAndItemId(userId, itemId);
        if (ownedItem.isPresent()) {
            throw new ApiException(HttpStatus.CONFLICT, "This item has already been purchased.");
        }
        if (userAccount.coins() < shopItem.cost()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Not enough coins to purchase this item.");
        }

        userRepository.updateCoins(userId, userAccount.coins() - shopItem.cost());
        inventoryRepository.create(userId, itemId);

        LinkedHashMap<String, Object> payload = new LinkedHashMap<>();
        payload.put("purchasedItem", toShopPayload(userId, shopItem));
        payload.put("coinsRemaining", userAccount.coins() - shopItem.cost());
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

    private LinkedHashMap<String, Object> toShopPayload(long userId, ShopItem item) {
        Optional<InventoryItem> ownedItem = inventoryRepository.findByUserIdAndItemId(userId, item.id());
        LinkedHashMap<String, Object> payload = new LinkedHashMap<>();
        payload.put("id", item.id());
        payload.put("slug", item.slug());
        payload.put("name", item.name());
        payload.put("description", item.description());
        payload.put("cost", item.cost());
        payload.put("icon", item.icon());
        payload.put("category", item.category());
        payload.put("owned", ownedItem.isPresent());
        payload.put("quantity", ownedItem.map(InventoryItem::quantity).orElse(0));
        return payload;
    }
}
