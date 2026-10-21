import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import apiRequest from "../services/api";
import { resolveImageUrl, getProductMeta } from "../utils/productMeta";

function OrderDetails() {
    const { id } = useParams();

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [cancelling, setCancelling] = useState(false);
    const [message, setMessage] = useState("");

    const fetchOrder = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const data = await apiRequest(`/orders/${id}`);
            setOrder(data);
        } catch (err) {
            setError(err.message || "Unable to load order details.");
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchOrder();
    }, [fetchOrder]);

    async function handleCancel() {
        const confirmed = window.confirm(
            `Are you sure you want to cancel order #${id}?`
        );

        if (!confirmed) return;

        try {
            setCancelling(true);
            setError("");
            setMessage("");

            await apiRequest(`/orders/${id}/cancel`, {
                method: "PUT"
            });

            setMessage("Order cancelled successfully.");

            // Reload the order to get its actual status from the backend
            await fetchOrder();
        } catch (err) {
            setError(err.message || "Unable to cancel this order.");
        } finally {
            setCancelling(false);
        }
    }

    if (loading) {
        return <p>Loading order details...</p>;
    }

    if (error && !order) {
        return (
            <div className="order-details-page">
                <p role="alert">{error}</p>
                <Link to="/orders">Back to My Orders</Link>
            </div>
        );
    }

    if (!order) {
        return <p>Order not found.</p>;
    }

    const canCancel = ["PENDING", "CONFIRMED"].includes(order.status);

    return (
        <div className="order-details-page">
            <Link to="/orders">← Back to My Orders</Link>

            <h1>Order #{order.orderId}</h1>

            {message && <p role="status">{message}</p>}
            {error && <p role="alert">{error}</p>}

            <div className="order-details-summary">
                <p>
                    Status:{" "}
                    <span
                        className={`status-badge status-${order.status.toLowerCase()}`}
                    >
                        {order.status}
                    </span>
                </p>

                <p>
                    Order date:{" "}
                    {new Date(order.createdAt).toLocaleString()}
                </p>

                <h2>
                    Total: ₹
                    {Number(order.totalAmount).toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                    })}
                </h2>
            </div>

            <h2>Order Items</h2>

            {order.items.length === 0 ? (
                <p>No items found for this order.</p>
            ) : (
                <div className="order-detail-items">
                    {order.items.map((item) => (
                        <div className="order-detail-item" key={item.id}>
                            <div className="order-detail-product-thumb" style={{ background: getProductMeta(item.productName, item.price).gradient }}>
                                <img
                                    src={resolveImageUrl(`/api/products/${item.productId}/image`)}
                                    alt={item.productName || "Product"}
                                    onError={(event) => {
                                        event.currentTarget.style.display = "none";
                                        const thumb = event.currentTarget.parentElement;
                                        thumb.classList.add("image-fallback");
                                        thumb.textContent = item.productName?.charAt(0)?.toUpperCase() || "?";
                                    }}
                                />
                            </div>
                            <div className="order-detail-product-info">
                                <h3>{item.productName}</h3>
                                <p>Product ID: {item.productId}</p>
                                <p>Price: ₹{item.price}</p>
                                <p>Quantity: {item.quantity}</p>
                            </div>

                            <strong>
                                ₹
                                {Number(item.subtotal).toLocaleString("en-IN")}
                            </strong>
                        </div>
                    ))}
                </div>
            )}

            {canCancel && (
                <button
                    type="button"
                    className="cancel-order-button"
                    onClick={handleCancel}
                    disabled={cancelling}
                >
                    {cancelling ? "Cancelling..." : "Cancel Order"}
                </button>
            )}
        </div>
    );
}

export default OrderDetails;
