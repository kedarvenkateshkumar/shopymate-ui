import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { addToCart } from "../services/CartService";
import { useAuth } from "../context/AuthContext";
import { getProductMeta, formatINR, resolveImageUrl } from "../utils/productMeta";

function ProductCard({
    id,
    name,
    description,
    price,
    quantity,
    imageUrl,
}) {
    const [cartQuantity, setCartQuantity] = useState(1);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

    const meta = getProductMeta(id, price);
    const imageSrc = resolveImageUrl(imageUrl);
    const outOfStock = quantity <= 0;

    function increaseQuantity() {
        setCartQuantity((current) => Math.min(current + 1, quantity));
    }

    function decreaseQuantity() {
        setCartQuantity((current) => Math.max(current - 1, 1));
    }

    async function handleAddToCart() {
        if (!isAuthenticated) {
            navigate("/login");
            return;
        }

        if (cartQuantity < 1 || cartQuantity > quantity) {
            setError("Please select a valid quantity.");
            return;
        }

        try {
            setLoading(true);
            setError("");
            setMessage("");

            await addToCart(id, cartQuantity);

            setMessage("Added to cart!");
        } catch (err) {
            setError(err.message || "Unable to add product to cart.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="product-card">
            <Link
                to={`/products/${id}`}
                state={{imageUrl}}
                className="pc-image"
                style={{ background: meta.gradient }}
            >
                {imageSrc ? (
                    <img src={imageSrc} alt={name} />
                ) : (
                    <span>{name?.charAt(0)?.toUpperCase()}</span>
                )}
                {outOfStock && <div className="pc-oos">Out of stock</div>}
            </Link>

            <div className="pc-body">
                <h2 className="pc-name">
                    <Link to={`/products/${id}`} state={{ imageUrl }} title={name}>{name}</Link>
                </h2>
                <p className="pc-desc">{description}</p>

                <div className="pc-rating">
                    <span className="rating-badge">{meta.rating} ★</span>
                    <span className="pc-reviews">({formatINR(meta.reviews)})</span>
                </div>

                <div className="pc-price">
                    <span className="pc-current">₹{formatINR(price)}</span>
                    <span className="pc-mrp">₹{formatINR(meta.mrp)}</span>
                    <span className="pc-off">{meta.discount}% off</span>
                </div>

                {!outOfStock && quantity <= 5 && (
                    <p className="pc-low">Only {quantity} left</p>
                )}
                <p className="pc-free">Free delivery</p>

                <div className="pc-actions">
                    <div className="quantity-controls">
                        <button
                            type="button"
                            onClick={decreaseQuantity}
                            disabled={cartQuantity <= 1 || outOfStock}
                            aria-label="Decrease quantity"
                        >
                            −
                        </button>
                        <span>{cartQuantity}</span>
                        <button
                            type="button"
                            onClick={increaseQuantity}
                            disabled={cartQuantity >= quantity}
                            aria-label="Increase quantity"
                        >
                            +
                        </button>
                    </div>

                    <button
                        type="button"
                        className="btn-cart"
                        onClick={handleAddToCart}
                        disabled={loading || outOfStock}
                    >
                        {outOfStock ? "Out of Stock" : loading ? "Adding..." : "Add to Cart"}
                    </button>
                </div>

                {message && <p className="pc-msg ok" role="status">{message}</p>}
                {error && <p className="pc-msg err" role="alert">{error}</p>}
            </div>
        </div>
    );
}

export default ProductCard;