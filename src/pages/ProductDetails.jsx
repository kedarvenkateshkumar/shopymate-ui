import { useEffect, useState } from "react";
import { Link, useNavigate, useParams, useLocation} from "react-router-dom";
import apiRequest from "../services/api";
import { addToCart } from "../services/CartService";
import { useAuth } from "../context/AuthContext";
import { getProductMeta, formatINR, resolveImageUrl } from "../utils/productMeta";

function ProductDetails() {
    const location = useLocation();
    const { id } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated, role } = useAuth();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [cartQuantity, setCartQuantity] = useState(1);
    const [adding, setAdding] = useState(false);
    const [message, setMessage] = useState("");
    const [actionError, setActionError] = useState("");

    useEffect(() => {
        let active = true;

        async function loadProduct() {
            try {
                setLoading(true);
                setError("");
                const data = await apiRequest(`/products/${id}`);
                if (active) {
                    setProduct(data);
                    setCartQuantity(1);
                }
            } catch (err) {
                if (active) setError(err.message || "Unable to load this product.");
            } finally {
                if (active) setLoading(false);
            }
        }

        loadProduct();
        return () => { active = false; };
    }, [id]);

    async function handleAdd(goToCart) {
        if (!isAuthenticated) {
            navigate("/login");
            return;
        }

        try {
            setAdding(true);
            setActionError("");
            setMessage("");

            await addToCart(product.id, cartQuantity);

            if (goToCart) {
                navigate("/cart");
            } else {
                setMessage("Added to cart!");
            }
        } catch (err) {
            setActionError(err.message || "Unable to add product to cart.");
        } finally {
            setAdding(false);
        }
    }

    if (loading) return <p className="state-msg">Loading product...</p>;

    if (error || !product) {
        return (
            <div className="state-msg error" role="alert">
                <p>{error || "Product not found."}</p>
                <Link to="/products">← Back to products</Link>
            </div>
        );
    }

    const meta = getProductMeta(product.id, product.price);
    const outOfStock = product.quantity <= 0;
    const imageUrl = resolveImageUrl(
        product.imageUrl || product.image || location.state?.imageUrl
    );
    const isAdmin = role === "ADMIN";

    return (
        <div className="pd-page">
            <div className="pd-breadcrumb">
                <Link to="/products">Products</Link> <span>›</span> {product.name}
            </div>

            <div className="pd-layout">
                {/* LEFT: image + buttons */}
                <div className="pd-left">
                    <div className="pd-image" style={{ background: meta.gradient }}>
                        {imageUrl ? (
                            <img src={imageUrl} alt={product.name} />
                        ) : (
                            <span>{product.name?.charAt(0)?.toUpperCase()}</span>
                        )}
                        {outOfStock && <div className="pc-oos">Out of stock</div>}
                    </div>

                    {!isAdmin && (
                        <div className="pd-buttons">
                            <button
                                type="button"
                                className="btn-cart-lg"
                                onClick={() => handleAdd(false)}
                                disabled={adding || outOfStock}
                            >
                                {adding ? "Adding..." : "ADD TO CART"}
                            </button>
                            <button
                                type="button"
                                className="btn-buy-lg"
                                onClick={() => handleAdd(true)}
                                disabled={adding || outOfStock}
                            >
                                BUY NOW
                            </button>
                        </div>
                    )}
                </div>

                {/* RIGHT: details */}
                <div className="pd-right">
                    <h1 className="pd-title">{product.name}</h1>

                    <div className="pc-rating">
                        <span className="rating-badge">{meta.rating} ★</span>
                        <span className="pc-reviews">{formatINR(meta.reviews)} Ratings</span>
                    </div>

                    <div className="pd-price">
                        <span className="pd-current">₹{formatINR(product.price)}</span>
                        <span className="pc-mrp">₹{formatINR(meta.mrp)}</span>
                        <span className="pc-off">{meta.discount}% off</span>
                    </div>

                    <p className={outOfStock ? "pd-stock out" : "pd-stock"}>
                        {outOfStock
                            ? "Currently out of stock"
                            : product.quantity <= 5
                                ? `Hurry, only ${product.quantity} left!`
                                : "In stock"}
                    </p>

                    {!isAdmin && !outOfStock && (
                        <div className="pd-qty">
                            <span>Quantity</span>
                            <div className="quantity-controls">
                                <button
                                    type="button"
                                    onClick={() => setCartQuantity((q) => Math.max(q - 1, 1))}
                                    disabled={cartQuantity <= 1}
                                    aria-label="Decrease quantity"
                                >−</button>
                                <span>{cartQuantity}</span>
                                <button
                                    type="button"
                                    onClick={() => setCartQuantity((q) => Math.min(q + 1, product.quantity))}
                                    disabled={cartQuantity >= product.quantity}
                                    aria-label="Increase quantity"
                                >+</button>
                            </div>
                        </div>
                    )}

                    {message && <p className="pc-msg ok" role="status">{message}</p>}
                    {actionError && <p className="pc-msg err" role="alert">{actionError}</p>}

                    <div className="pd-section">
                        <h3>Delivery</h3>
                        <p>Free delivery on this item</p>
                    </div>

                    <div className="pd-section">
                        <h3>Description</h3>
                        <p className="pd-desc">{product.description || "No description available."}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProductDetails;