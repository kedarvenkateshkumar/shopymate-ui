import { useEffect, useState } from "react";
import apiRequest from "../services/api";
import { Link } from "react-router-dom";
import { getProductMeta, resolveImageUrl } from "../utils/productMeta";

function Order() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function fetchOrders() {
            try {
                setLoading(true);
                setError("");

                const data = await apiRequest("/orders");

                setOrders(data);
            } catch (err) {
                setError(err.message || "Unable to load orders.");
            } finally {
                setLoading(false);
            }
        }

        fetchOrders();
    }, []);

    if (loading) {
        return <p className="state-msg">Loading your orders...</p>;
    }

    if (error) {
        return <p className="state-msg error" role="alert">{error}</p>;
    }

    return (
        <div className="orders-page">
            <h1>My Orders</h1>

            {orders.length === 0 ? (
                <p className="state-msg">You haven't placed any orders yet.</p>
            ) : (
                [...orders]
                    .sort(
                        (a, b) =>
                            new Date(b.createdAt).getTime() -
                            new Date(a.createdAt).getTime()
                    )
                    .map((order) => (
                        <div className="order-card" key={order.orderId}>
                            <div className="order-head">
                                <div>
                                    <h2>Order #{order.orderId}</h2>
                                    <p>
                                        Ordered on {new Date(order.createdAt).toLocaleString()}
                                    </p>
                                </div>
                                <span className={`status-badge status-${String(order.status).toLowerCase()}`}>
                                    {order.status}
                                </span>
                            </div>

                            {order.items.map((item) => {
                                const meta = getProductMeta(item.productName, item.price);
                                return (
                                    <div className="order-item" key={item.id}>
                                        <div className="cart-thumb order-product-thumb" style={{ background: meta.gradient }}>
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
                                        <div className="order-item-info">
                                            <h4>{item.productName}</h4>
                                            <p>Qty: {item.quantity} × ₹{item.price}</p>
                                        </div>
                                        <strong>₹{item.subtotal}</strong>
                                    </div>
                                );
                            })}

                            <div className="order-foot">
                                <Link to={`/orders/${order.orderId}`}>View Order Details</Link>
                                <h3>
                                    Total: ₹
                                    {Number(order.totalAmount).toLocaleString("en-IN", {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2
                                    })}
                                </h3>
                            </div>
                        </div>
                    ))
            )}
        </div>
    );
}

export default Order;
