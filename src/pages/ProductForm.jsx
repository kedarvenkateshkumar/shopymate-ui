
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import apiRequest from "../services/api";

const IMAGE_BASE_URL = "http://localhost:8080";

function resolveImage(url) {
    if (!url) return "";
    return url.startsWith("http") ? url : `${IMAGE_BASE_URL}${url}`;
}

function ProductForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = Boolean(id);

    const [name, setName] = useState("");
    const [price, setPrice] = useState("");
    const [description, setDescription] = useState("");
    const [quantity, setQuantity] = useState("");
    const [categories, setCategories] = useState([]);
    const [categoryId, setCategoryId] = useState("");
    const [imageFile, setImageFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState("");
    const [existingImage, setExistingImage] = useState("");

    const [loading, setLoading] = useState(isEditMode);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        async function fetchCategories() {
            try {
                const data = await apiRequest("/categories");
                setCategories(Array.isArray(data) ? data : []);
            } catch (err) {
                setError(err.message || "Unable to load categories.");
            }
        }

        fetchCategories();
    }, []);

    // Load existing product when editing
    useEffect(() => {
        if (!isEditMode) return;

        async function fetchProduct() {
            try {
                setLoading(true);
                setError("");

                const product = await apiRequest(`/products/${id}`);

                setName(product.name ?? "");
                setDescription(product.description ?? "");
                setPrice(String(product.price ?? ""));
                setQuantity(String(product.quantity ?? ""));
                setExistingImage(product.imageUrl ?? "");
                setCategoryId(
                    String(product.category?.id ?? product.categoryId ?? "")
                );
            } catch (err) {
                setError(err.message || "Unable to load product.");
            } finally {
                setLoading(false);
            }
        }

        fetchProduct();
    }, [id, isEditMode]);

    // Create and clean up local image preview
    useEffect(() => {
        if (!imageFile) {
            setPreviewUrl("");
            return;
        }

        const url = URL.createObjectURL(imageFile);
        setPreviewUrl(url);

        return () => URL.revokeObjectURL(url);
    }, [imageFile]);

    function handleImageChange(event) {
        const file = event.target.files?.[0];
        setError("");

        if (!file) {
            setImageFile(null);
            return;
        }

        if (!["image/jpeg", "image/png"].includes(file.type)) {
            setError("Only JPG and PNG images are allowed.");
            event.target.value = "";
            setImageFile(null);
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            setError("Image must be 2 MB or smaller.");
            event.target.value = "";
            setImageFile(null);
            return;
        }

        setImageFile(file);
    }

    async function handleSubmit(event) {
        event.preventDefault();
        if (saving) return;

        setSaving(true);
        setError("");

        try {
            const productData = {
                name,
                description,
                price: Number(price),
                quantity: Number(quantity),
                categoryId: Number(categoryId),
            };

            // Create or update the product using JSON.
            const product = await apiRequest(
                isEditMode ? `/products/${id}` : "/products",
                {
                    method: isEditMode ? "PUT" : "POST",
                    body: JSON.stringify(productData),
                }
            );

            // Upload image separately after product save.
            if (imageFile) {
                const formData = new FormData();
                formData.append("file", imageFile);

                await apiRequest(
                    `/products/${product.id ?? id}/image`,
                    {
                        method: "POST",
                        body: formData,
                    }
                );
            }

            alert(
                imageFile
                    ? "Product and image saved successfully!"
                    : "Product saved successfully!"
            );

            navigate("/admin/products");
        } catch (err) {
            setError(err.message || "Unable to save product.");
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return <p>Loading product...</p>;
    }

    const shownImage = previewUrl || resolveImage(existingImage);

    return (
        <div className="product-form-page">
            <h1>{isEditMode ? "Edit Product" : "Add Product"}</h1>

            {error && <p role="alert" className="error-message">{error}</p>}

            <form onSubmit={handleSubmit} className="product-form">
                <label htmlFor="name">Product Name</label>
                <input
                    id="name"
                    name="name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    required
                />

                <label htmlFor="description">Description</label>
                <textarea
                    id="description"
                    name="description"
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    rows={4}
                />


                <label htmlFor="categoryId">Product Category</label>
                <select
                    id="categoryId"
                    name="categoryId"
                    value={categoryId}
                    onChange={(event) => setCategoryId(event.target.value)}
                    required
                >
                    <option value="">Select a category</option>

                    {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                            {category.name}
                        </option>
                    ))}
                </select>


                <label htmlFor="price">Price (₹)</label>
                <input
                    id="price"
                    name="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={price}
                    onChange={(event) => setPrice(event.target.value)}
                    required
                />

                <label htmlFor="quantity">Quantity</label>
                <input
                    id="quantity"
                    name="quantity"
                    type="number"
                    min="0"
                    step="1"
                    value={quantity}
                    onChange={(event) => setQuantity(event.target.value)}
                    required
                />

                <label htmlFor="image">Product Image (JPG or PNG)</label>
                <input
                    id="image"
                    name="image"
                    type="file"
                    accept="image/jpeg,image/png"
                    onChange={handleImageChange}
                />

                {shownImage && (
                    <img
                        src={shownImage}
                        alt="Product preview"
                        style={{
                            maxWidth: "200px",
                            maxHeight: "200px",
                            objectFit: "contain",
                            marginTop: "8px",
                        }}
                    />
                )}

                <button type="submit" disabled={saving}>
                    {saving
                        ? "Saving..."
                        : isEditMode
                            ? "Update Product"
                            : "Create Product"}
                </button>

                <button
                    type="button"
                    onClick={() => navigate("/admin/products")}
                    disabled={saving}
                >
                    Cancel
                </button>
            </form>
        </div>
    );
}

export default ProductForm;
