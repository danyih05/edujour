package com.gradquest.web;

import com.gradquest.dto.PurchaseRequest;
import com.gradquest.security.AuthenticatedUser;
import com.gradquest.service.ShopService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/shop")
public class ShopController {

    private final ShopService shopService;

    public ShopController(ShopService shopService) {
        this.shopService = shopService;
    }

    @GetMapping("/items")
    public Object getItems(Authentication authentication) {
        AuthenticatedUser currentUser = (AuthenticatedUser) authentication.getPrincipal();
        return ApiResponses.ok(shopService.getItems(currentUser.id()));
    }

    @PostMapping("/purchase")
    public Object purchase(Authentication authentication, @Valid @RequestBody PurchaseRequest request) {
        AuthenticatedUser currentUser = (AuthenticatedUser) authentication.getPrincipal();
        return ApiResponses.ok(shopService.purchase(currentUser.id(), request.itemId()));
    }
}
