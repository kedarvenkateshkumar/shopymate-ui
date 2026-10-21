import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import apiRequest from "../services/api";
import ProductCard from "../components/ProductCard";
import HeroBanner from "../components/HeroBanner";

const SORTS = [
    { value: "name,asc", label: "Relevance" },
    { value: "price,asc", label: "Price: Low to High" },
    { value: "price,desc", label: "Price: High to Low" }
];

function Products() {
    const [params, setParams] = useSearchParams();
    // Search, sort and page live in the URL so the header search bar can drive them.
    const search = params.get("q") || "";
    const categoryId = params.get("categoryId") || "";
    const sort = params.get("sort") || "name,asc";
    const page = Math.max(0, Number(params.get("page")) || 0);

    const [products, setProducts] = useState([]);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const pageSize = 10;

    

    useEffect(() => {
        async function fetchProducts() {
            try {
                setLoading(true);
                setError("");

                const endpoint = search.trim()
                    ? `/products/search?name=${encodeURIComponent(search.trim())}&page=${page}&size=${pageSize}&sort=${sort}`
                    : `/products?page=${page}&size=${pageSize}&sort=${sort}${categoryId ? `&categoryId=${categoryId}` : ""
                    }`;

                console.log("Selected category:", categoryId);
                console.log("Products API endpoint:", endpoint);

                const data = await apiRequest(endpoint);

                setProducts(data.content);
                setTotalPages(data.totalPages);
                setTotalElements(data.totalElements ?? null);
            } catch (err) {
                setError(err.message || "Unable to load products.");
            } finally {
                setLoading(false);
            }
        }

        fetchProducts();
    }, [search, categoryId, sort, page]);

    function update(changes) {
        const next = new URLSearchParams(params);
        Object.entries(changes).forEach(([key, value]) => {
            if (value === "" || value === null || value === undefined) next.delete(key);
            else next.set(key, String(value));
        });
        setParams(next);
    }

    function handleSortChange(value) {
        update({ sort: value === "name,asc" ? "" : value, page: "" });
    }

    function goToPage(p) {
        update({ page: p === 0 ? "" : p });
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    const pageNumbers = [];
    const start = Math.max(0, Math.min(page - 2, totalPages - 5));
    for (let i = start; i < Math.min(totalPages, start + 5); i++) pageNumbers.push(i);

    return (
        <div className="products-page">
            {!search && !categoryId && page === 0 && <HeroBanner />}

            <div className="results-panel">
                <div className="results-head">
                    <h1>
                        {search
                            ? <>Results for “{search}”</>
                            : categoryId
                                ? "Category Products"
                                : "Our Products"}

                        {totalElements !== null && !loading && !error && (
                            <small> ({totalElements} items)</small>
                        )}
                    </h1>

                    <div className="sort-bar">
                        <span>Sort By</span>
                        {SORTS.map((s) => (
                            <button
                                key={s.value}
                                type="button"
                                className={sort === s.value ? "active" : ""}
                                onClick={() => handleSortChange(s.value)}
                            >
                                {s.label}
                            </button>
                        ))}
                    </div>
                </div>

                {loading && <p className="state-msg">Loading products...</p>}

                {error && <p className="state-msg error" role="alert">{error}</p>}

                {!loading && !error && products.length === 0 && (
                    <p className="state-msg">Sorry, no products found.</p>
                )}

                {!loading && !error && products.length > 0 && (
                    <div className="product-grid">
                        {products.map((product) => (
                            <ProductCard
                                key={product.id}
                                id={product.id}
                                name={product.name}
                                description={product.description}
                                price={product.price}
                                quantity={product.quantity}
                                imageUrl={
                                    product.imageUrl ||
                                    product.image ||
                                    `/api/products/${product.id}/image`
                                }
                            />
                        ))}
                    </div>
                )}

                {!loading && !error && totalPages > 1 && (
                    <div className="pagination">
                        <button onClick={() => goToPage(page - 1)} disabled={page === 0}>
                            Previous
                        </button>

                        {pageNumbers.map((n) => (
                            <button
                                key={n}
                                className={n === page ? "active" : ""}
                                onClick={() => goToPage(n)}
                            >
                                {n + 1}
                            </button>
                        ))}

                        <button onClick={() => goToPage(page + 1)} disabled={page >= totalPages - 1}>
                            Next
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Products;
