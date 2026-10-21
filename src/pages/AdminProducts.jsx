import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import apiRequest from "../services/api";

function AdminProducts() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    async function fetchProducts() {
        try {
            setLoading(true);
            setError("");

            const data = await apiRequest(
                "/products?page=0&size=50&sort=id,asc"
            );

            // Spring Boot returns a Page<ProductResponse>
            setProducts(data.content);
        } catch (err) {
            setError(err.message || "Unable to load products.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchProducts();
    }, []);

    async function handleDelete(productId) {
        const confirmed = window.confirm(
            "Are you sure you want to delete this product?"
        );

        if (!confirmed) return;

        try {
            await apiRequest(`/products/${productId}`, {
                method: "DELETE"
            });

            // Remove the deleted product from the UI
            setProducts((currentProducts) =>
                currentProducts.filter(
                    (product) => product.id !== productId
                )
            );
        } catch (err) {
            setError(err.message || "Unable to delete product.");
        }
    }

    if (loading) {
        return <p>Loading products...</p>;
    }

    return (
        <div className="admin-products">
            <div className="admin-products-header">
                <div>
                    <h1>Product Management</h1>
                    <p>Manage your store products.</p>
                </div>

                <Link
                    to="/admin/products/new"
                    className="admin-add-button"
                >
                    + Add Product
                </Link>
            </div>

            {error && <p role="alert">{error}</p>}

            {products.length === 0 ? (
                <p>No products found.</p>
            ) : (
                <div className="product-table-wrapper">
                    <table className="product-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Product</th>
                                <th>Price</th>
                                <th>Stock</th>
                                <th>Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {products.map((product) => (
                                <tr key={product.id}>
                                    <td>{product.id}</td>
                                    <td>
                                        <strong>{product.name}</strong>
                                        <p>{product.description}</p>
                                    </td>
                                    <td>
                                        ₹{Number(product.price).toLocaleString("en-IN")}
                                    </td>
                                    <td>{product.quantity}</td>
                                    <td>
                                        <div className="product-actions">
                                            <Link
                                                to={`/admin/products/edit/${product.id}`}
                                            >
                                                Edit
                                            </Link>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleDelete(product.id)
                                                }
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default AdminProducts;
