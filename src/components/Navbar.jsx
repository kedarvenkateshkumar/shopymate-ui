import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import apiRequest from "../services/api";

function Navbar() {

    const [categories, setCategories] = useState([]);
    const [categoriesLoading, setCategoriesLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;

        async function fetchCategories() {
            try {
                const data = await apiRequest("/categories");

                if (!cancelled) {
                    setCategories(Array.isArray(data) ? data : []);
                }
            } catch (error) {
                console.error("Failed to fetch categories:", error);
            } finally {
                if (!cancelled) {
                    setCategoriesLoading(false);
                }
            }
        }

        fetchCategories();

        return () => {
            cancelled = true;
        };
    }, []);

    const { isAuthenticated, role, logout } = useAuth();
    const navigate = useNavigate();
    const [params] = useSearchParams();
    const currentQuery = params.get("q") || "";
    const isAdmin = role === "ADMIN";

    function handleLogout() {
        logout();
        navigate("/");
    }

    function handleSearch(event) {
        event.preventDefault();
        const q = new FormData(event.currentTarget).get("q").toString().trim();
        navigate(q ? `/products?q=${encodeURIComponent(q)}` : "/products");
    }

    return (
        <header className="site-header">
            <nav className="topbar">
                <Link to="/products" className="brand">
                    <span>ShopyMate</span>
                    <em>Explore <b>Plus</b> ✦</em>
                </Link>

                {!isAdmin && (
                    <form className="search-box" onSubmit={handleSearch} role="search">
                        <input
                            key={currentQuery}
                            name="q"
                            type="search"
                            defaultValue={currentQuery}
                            placeholder="Search for products, brands and more"
                        />
                        <button type="submit" aria-label="Search">
                            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#2874f0" strokeWidth="2.4" strokeLinecap="round">
                                <circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" />
                            </svg>
                        </button>
                    </form>
                )}

                <div className="nav-actions">
                    {isAdmin && (
                        <>
                            <Link to="/admin">Dashboard</Link>
                            <Link to="/admin/products">Products</Link>
                            <Link to="/admin/inventory">Inventory</Link>
                            <Link to="/admin/orders">Orders</Link>
                        </>
                    )}

                    {!isAuthenticated && (
                        <>
                            <Link to="/login" className="login-btn">Login</Link>
                            <Link to="/register">Register</Link>
                        </>
                    )}

                    {isAuthenticated && (
                        <div className="account-menu">
                            <button type="button" className="account-trigger">
                                My Account <span aria-hidden="true">▾</span>
                            </button>
                            <div className="account-dropdown">
                                <Link to="/profile">My Profile</Link>
                                {!isAdmin && <Link to="/orders">My Orders</Link>}
                                <button type="button" onClick={handleLogout}>Logout</button>
                            </div>
                        </div>
                    )}

                    {!isAdmin && (
                        <Link to="/cart" className="cart-link">
                            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="9" cy="20" r="1.5" /><circle cx="18" cy="20" r="1.5" />
                                <path d="M2 3h3l2.7 12.4a1 1 0 0 0 1 .8h9.1a1 1 0 0 0 1-.8L21 7H6" />
                            </svg>
                            Cart
                        </Link>
                    )}
                </div>
            </nav>

            {!isAdmin && (
                <div className="category-strip">
                    <Link to="/products">All Products</Link>

                    {categoriesLoading && categories.length === 0 && (
                        <span>Loading categories...</span>
                    )}

                    {categories.map((category) => (
                        <Link
                            key={category.id}
                            to={`/products?categoryId=${category.id}`}
                        >
                            {category.name}
                        </Link>
                    ))}
                </div>
            )}
        </header>
    );
}

export default Navbar;
