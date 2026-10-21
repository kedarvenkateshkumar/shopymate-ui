import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import apiRequest from "../services/api";

function AdminDashboard() {
    const [stats, setStats] = useState({
        totalProducts: 0,
        totalOrders: 0,
        pendingOrders: 0,
        lowStockProducts: 0
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function fetchDashboardData() {
            try {
                setLoading(true);
                setError("");

                const [productsData, ordersData, lowStockData] =
                    await Promise.all([
                        apiRequest("/products?page=0&size=1000"),
                        apiRequest("/orders/admin"),
                        apiRequest("/products/admin/low-stock?threshold=5")
                    ]);

                const products = productsData.content ?? [];

                setStats({
                    totalProducts:
                        productsData.totalElements ?? products.length,
                    totalOrders: ordersData.length,
                    pendingOrders: ordersData.filter(
                        (order) => order.status === "PENDING"
                    ).length,
                    lowStockProducts: lowStockData.length
                });
            } catch (err) {
                setError(
                    err.message || "Unable to load dashboard statistics."
                );
            } finally {
                setLoading(false);
            }
        }

        fetchDashboardData();
    }, []);

    const cards = [
        {
            title: "Total Products",
            value: stats.totalProducts,
            link: "/admin/products"
        },
        {
            title: "Total Orders",
            value: stats.totalOrders,
            link: "/admin/orders"
        },
        {
            title: "Pending Orders",
            value: stats.pendingOrders,
            link: "/admin/orders"
        },
        {
            title: "Low-Stock Products",
            value: stats.lowStockProducts,
            link: "/admin/inventory"
        }
    ];

    return (
        <div className="admin-dashboard">
            <header>
                <h1>Admin Dashboard</h1>
                <p>Monitor and manage your store.</p>
            </header>

            {loading && <p>Loading dashboard...</p>}
            {error && <p role="alert">{error}</p>}

            {!loading && !error && (
                <div className="admin-stats-grid">
                    {cards.map((card) => (
                        <Link
                            to={card.link}
                            className="admin-stat-card"
                            key={card.title}
                        >
                            <h3>{card.title}</h3>
                            <p className="admin-stat-value">
                                {card.value}
                            </p>
                        </Link>
                    ))}
                </div>
            )}

            <div className="admin-grid">
                <Link to="/admin/products" className="admin-card">
                    <h2>Product Management</h2>
                    <p>Add, update, and delete products.</p>
                </Link>

                <Link to="/admin/inventory" className="admin-card">
                    <h2>Inventory Management</h2>
                    <p>Monitor stock and low-stock products.</p>
                </Link>

                <Link to="/admin/orders" className="admin-card">
                    <h2>Order Management</h2>
                    <p>View orders and manage order statuses.</p>
                </Link>
            </div>
        </div>
    );
}

export default AdminDashboard;
