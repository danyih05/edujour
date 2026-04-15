package com.gradquest.web;

import com.gradquest.security.AuthenticatedUser;
import com.gradquest.service.InventoryService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/inventory")
public class InventoryController {

    private final InventoryService inventoryService;

    public InventoryController(InventoryService inventoryService) {
        this.inventoryService = inventoryService;
    }

    @GetMapping
    public Object getInventory(Authentication authentication) {
        AuthenticatedUser currentUser = (AuthenticatedUser) authentication.getPrincipal();
        return ApiResponses.ok(inventoryService.getInventory(currentUser.id()));
    }
}
