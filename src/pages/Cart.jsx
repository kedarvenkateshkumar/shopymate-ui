import { useCallback, useEffect, useState } from "react";
import {
    getCart,
    updateCartItem,
    removeCartItem,
    clearCart,
    placeOrder
} from "../services/CartService";
import { Link, useNavigate } from "react-router-dom";
import { getProductMeta, resolveImageUrl } from "../utils/productMeta";
function Cart() {
    const navigate = useNavigate();
    const [placingOrder, setPlacingOrder] = useState(false);
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [updatingId, setUpdatingId] = useState(null);
    const [clearing, setClearing] = useState(false);

    const fetchCart = useCallback(async (showLoading = true) => {
        try {
            if (showLoading) setLoading(true);
            setError("");

            const data = await getCart();
            setCart(data);
        } catch (err) {
            setError(err.message || "Unable to load cart.");
        } finally {
            if (showLoading) setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCart();
    }, [fetchCart]);

    async function changeQuantity(item, newQuantity) {
        if (newQuantity < 1) return;

        setError("");
        setUpdatingId(item.id);

        try {
            await updateCartItem(item.id, newQuantity);
            await fetchCart(false);
        } catch (err) {
            setError(err.message || "Unable to update quantity.");
        } finally {
            setUpdatingId(null);
        }
    }

    async function handleRemove(itemId) {
        setError("");
        setUpdatingId(itemId);

        try {
            await removeCartItem(itemId);
            await fetchCart(false);
        } catch (err) {
            setError(err.message || "Unable to remove item.");
        } finally {
            setUpdatingId(null);
        }
    }

    async function handleClearCart() {
        const confirmed = window.confirm(
            "Are you sure you want to clear your cart?"
        );

        if (!confirmed) return;

        setError("");
        setClearing(true);

        try {
            await clearCart();
            await fetchCart(false);
        } catch (err) {
            setError(err.message || "Unable to clear cart.");
        } finally {
            setClearing(false);
        }
    }

    if (loading) {
        return <p className="state-msg">Loading your cart...</p>;
    }

    if (!cart) {
        return <p className="state-msg error" role="alert">{error || "Unable to load your cart."}</p>;
    }


    async function handleCheckout() {
        setError("");

        if (!cart || cart.items.length === 0) {
            setError("Your cart is empty.");
            return;
        }

        try {
            setPlacingOrder(true);

            await placeOrder();

            // Navigate only after the backend confirms success
            navigate("/orders");
        } catch (err) {
            setError(err.message || "Unable to place your order.");
        } finally {
            setPlacingOrder(false);
        }
    }


    const itemCount = cart.items.reduce((n, item) => n + item.quantity, 0);
    const total = Number(cart.totalPrice).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });

    return (
        <div className="cart-page">
            {error && <p className="state-msg error" role="alert">{error}</p>}

            {cart.items.length === 0 ? (
                <div className="cart-empty">
                    <h2>Your cart is empty!</h2>
                    <p>Add items to it now.</p>
                    <Link to="/products" className="btn-buy">Shop now</Link>
                </div>
            ) : (
                <div className="cart-layout">
                    <section className="cart-main">
                        <div className="cart-title">My Cart ({cart.items.length})</div>

                        <div className="cart-items">
                            {cart.items.map((item) => {
                                const meta = getProductMeta(item.productId ?? item.productName, item.price);
                                const imageSrc = resolveImageUrl(
                                    item.imageUrl ||
                                    item.image ||
                                    (item.productId ? `/api/products/${item.productId}/image` : null)
                                );
                                return (
                                    <div className="cart-item" key={item.id}>

                                        <div className="cart-thumb" style={{ background: meta.gradient }}>
                                            <img
                                                src={imageSrc}
                                                alt={item.productName}
                                                onError={(e) => {
                                                    e.currentTarget.style.display = "none";
                                                    e.currentTarget.nextElementSibling.style.display = "flex";
                                                }}
                                            />
                                            <span style={{ display: "none" }}>
                                                {item.productName?.charAt(0)?.toUpperCase() || "?"}
                                            </span>
                                        </div>


                                        <div className="cart-item-details">
                                            <h3>{item.productName}</h3>
                                            <p className="cart-price">
                                                ₹{Number(item.price).toLocaleString("en-IN")}
                                            </p>
                                            <p className="cart-sub">
                                                Subtotal: ₹
                                                {Number(item.subtotal ?? item.price * item.quantity).toLocaleString("en-IN")}
                                            </p>

                                            <div className="cart-row">
                                                <div className="cart-quantity">
                                                    <button
                                                        type="button"
                                                        disabled={item.quantity <= 1 || updatingId === item.id}
                                                        onClick={() => changeQuantity(item, item.quantity - 1)}
                                                    >
                                                        −
                                                    </button>
                                                    <span>{item.quantity}</span>
                                                    <button
                                                        type="button"
                                                        disabled={updatingId === item.id}
                                                        onClick={() => changeQuantity(item, item.quantity + 1)}
                                                    >
                                                        +
                                                    </button>
                                                </div>

                                                <button
                                                    type="button"
                                                    className="link-btn"
                                                    disabled={updatingId === item.id}
                                                    onClick={() => handleRemove(item.id)}
                                                >
                                                    {updatingId === item.id ? "Updating..." : "REMOVE"}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="cart-footer">
                            <button
                                type="button"
                                className="link-btn"
                                onClick={handleClearCart}
                                disabled={clearing}
                            >
                                {clearing ? "Clearing..." : "CLEAR CART"}
                            </button>

                            <button
                                type="button"
                                className="btn-buy"
                                onClick={handleCheckout}
                                disabled={placingOrder || cart.items.length === 0}
                            >
                                {placingOrder ? "Placing Order..." : "PLACE ORDER"}
                            </button>
                        </div>
                    </section>

                    <aside className="price-details">
                        <div className="cart-title">PRICE DETAILS</div>
                        <div className="pd-row">
                            <span>Price ({itemCount} {itemCount === 1 ? "item" : "items"})</span>
                            <span>₹{total}</span>
                        </div>
                        <div className="pd-row">
                            <span>Delivery Charges</span>
                            <span className="pd-free">FREE</span>
                        </div>
                        <div className="pd-row pd-total">
                            <span>Total Amount</span>
                            <span>₹{total}</span>
                        </div>
                    </aside>
                </div>
            )}
        </div>
    );
}

export default Cart;
