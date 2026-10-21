import { useEffect, useState } from "react";
import apiRequest from "../services/api";

function AdminOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [updatingId, setUpdatingId] = useState(null);

    // Fetch all orders from the backend
    async function fetchOrders() {
        try {
            setLoading(true);
            setError("");

            const data = await apiRequest("/orders/admin");
            setOrders(data);
        } catch (err) {
            setError(
                err.message || "Unable to load orders."
            );
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchOrders();
    }, []);

    // Define allowed next statuses
    const allowedStatuses = {
        PENDING: [
            "CONFIRMED",
            "SHIPPED",
            "DELIVERED",
            "CANCELLED"
        ],
        CONFIRMED: [
            "SHIPPED",
            "DELIVERED",
            "CANCELLED"
        ],
        SHIPPED: [
            "DELIVERED",
            "CANCELLED"
        ],
        DELIVERED: [],
        CANCELLED: []
    };

    // Update order status
    async function updateStatus(orderId, newStatus) {
        try {
            setError("");
            setUpdatingId(orderId);

            await apiRequest(`/orders/${orderId}/status`, {
                method: "PUT",
                body: JSON.stringify({
                    status: newStatus
                })
            });

            // Update the UI after successful backend response
            setOrders((currentOrders) =>
                currentOrders.map((order) =>
                    order.orderId === orderId
                        ? { ...order, status: newStatus }
                        : order
                )
            );
        } catch (err) {
            setError(
                err.message || "Unable to update order status."
            );
        } finally {
            setUpdatingId(null);
        }
    }

    if (loading) {
        return <p>Loading orders...</p>;
    }

    return (
        <div className="admin-orders">
            <h1>Order Management</h1>
            <p>View customer orders and manage their status.</p>

            {error && (
                <p className="order-error" role="alert">
                    {error}
                </p>
            )}

            {orders.length === 0 ? (
                <p>No orders found.</p>
            ) : (
                <div className="product-table-wrapper">
                    <table className="product-table">
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Items</th>
                                <th>Total Amount</th>
                                <th>Order Date</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {orders.map((order) => {
                                const statuses =
                                    allowedStatuses[order.status] || [];

                                const isFinalStatus = [
                                    "DELIVERED",
                                    "CANCELLED"
                                ].includes(order.status);

                                return (
                                    <tr key={order.orderId}>
                                        <td>#{order.orderId}</td>

                                        <td>
                                            {order.items?.length ? (
                                                order.items.map((item) => (
                                                    <div
                                                        className="admin-order-item"
                                                        key={item.id}
                                                    >
                                                        <strong>
                                                            {item.productName}
                                                        </strong>
                                                        <span>
                                                            {" "}× {item.quantity}
                                                        </span>
                                                        <div>
                                                            ₹
                                                            {Number(
                                                                item.subtotal ??
                                                                item.price *
                                                                    item.quantity
                                                            ).toLocaleString(
                                                                "en-IN"
                                                            )}
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <span>No items</span>
                                            )}
                                        </td>

                                        <td>
                                            ₹
                                            {Number(
                                                order.totalAmount
                                            ).toLocaleString("en-IN", {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2
                                            })}
                                        </td>

                                        <td>
                                            {order.createdAt
                                                ? new Date(
                                                      order.createdAt
                                                  ).toLocaleString()
                                                : "N/A"}
                                        </td>

                                        <td>
                                            <span
                                                className={`status-badge status-${String(
                                                    order.status
                                                ).toLowerCase()}`}
                                            >
                                                {order.status}
                                            </span>
                                        </td>

                                        <td>
                                            {isFinalStatus ? (
                                                <span className="status-final">
                                                    No further actions
                                                </span>
                                            ) : (
                                                <select
                                                    value=""
                                                    disabled={
                                                        updatingId ===
                                                        order.orderId
                                                    }
                                                    onChange={(event) => {
                                                        const newStatus =
                                                            event.target.value;

                                                        if (newStatus) {
                                                            updateStatus(
                                                                order.orderId,
                                                                newStatus
                                                            );
                                                        }
                                                    }}
                                                >
                                                    <option
                                                        value=""
                                                        disabled
                                                    >
                                                        {updatingId ===
                                                        order.orderId
                                                            ? "Updating..."
                                                            : "Change status"}
                                                    </option>

                                                    {statuses.map((status) => (
                                                        <option
                                                            key={status}
                                                            value={status}
                                                        >
                                                            {status}
                                                        </option>
                                                    ))}
                                                </select>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default AdminOrders;
