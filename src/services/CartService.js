import apiRequest from "./api";



export async function getCart() {
    return await apiRequest("/cart");
}

export async function addToCart(productId, quantity) {
    return await apiRequest("/cart/items", {
        method: "POST",
        body: JSON.stringify({
            productId,
            quantity
        })
    });
}

export async function updateCartItem(cartItemId, quantity) {
    return await apiRequest(`/cart/items/${cartItemId}`, {
        method: "PUT",
        body: JSON.stringify({ quantity })
    });
}

export async function removeCartItem(cartItemId) {
    return await apiRequest(`/cart/items/${cartItemId}`, {
        method: "DELETE"
    });
}

export async function clearCart() {
    return await apiRequest("/cart", {
        method: "DELETE"
    });
}

export async function placeOrder() {
    return await apiRequest("/orders", {
        method: "POST"
    });
}

