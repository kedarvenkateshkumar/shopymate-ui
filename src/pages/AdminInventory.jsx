import { useEffect, useState } from "react";
import apiRequest from "../services/api";

function AdminInventory() {
    const [products, setProducts] = useState([]);
    const [threshold, setThreshold] = useState(5);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function fetchLowStock() {
            try {
                setLoading(true);
                setError("");

                const data = await apiRequest(
                    `/products/admin/low-stock?threshold=${threshold}`
                );

                setProducts(data);
            } catch (err) {
                setError(
                    err.message || "Unable to load inventory."
                );
            } finally {
                setLoading(false);
            }
        }

        fetchLowStock();
    }, [threshold]);

    return (
        <div className="admin-inventory">
            <div className="inventory-header">
                <h1>Inventory Management</h1>
                <p>Monitor products with low stock.</p>

                <div className="threshold-control">
                    <label htmlFor="threshold">
                        Low-stock threshold:
                    </label>

                    <input
                        id="threshold"
                        type="number"
                        min="0"
                        value={threshold}
                        onChange={(event) =>
                            setThreshold(Number(event.target.value))
                        }
                    />
                </div>
            </div>

            {loading && <p>Loading inventory...</p>}

            {error && <p role="alert">{error}</p>}

            {!loading && !error && products.length === 0 && (
                <p>No low-stock products found.</p>
            )}

            {!loading && !error && products.length > 0 && (
                <div className="product-table-wrapper">
                    <table className="product-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Product</th>
                                <th>Discription</th>
                                <th>Price</th>
                                <th>Available Stock</th>
                            </tr>
                        </thead>

                        <tbody>
                            {products.map((product) => (
                                <tr key={product.id}>
                                    <td>{product.id}</td>
                                    <td>{product.name}</td>
                                    <td>{product.description}</td>
                                    <td>₹{product.price}</td>
                                    <td>{product.quantity}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default AdminInventory;
