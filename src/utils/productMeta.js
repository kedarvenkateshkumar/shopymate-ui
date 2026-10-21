// Presentation-only helpers. Your backend doesn't send ratings, MRP or images,
// so these are derived deterministically from the product id for UI purposes.
// Delete/replace once the backend provides real values.
// Backend may return a relative path like "/uploads/x.png" - make it absolute.
export function resolveImageUrl(imageUrl) {
    if (!imageUrl) return "";
    return imageUrl.startsWith("http")
        ? imageUrl
        : `http://localhost:8080${imageUrl}`;
}
const GRADIENTS = [
    ["#e3f2fd", "#90caf9"],
    ["#fff3e0", "#ffcc80"],
    ["#e8f5e9", "#a5d6a7"],
    ["#f3e5f5", "#ce93d8"],
    ["#fce4ec", "#f48fb1"],
    ["#e0f7fa", "#80deea"]
];

function hashOf(id) {
    let h = 0;
    for (const c of String(id)) h = (h * 31 + c.charCodeAt(0)) >>> 0;
    return h;
}

export function getProductMeta(id, price) {
    const h = hashOf(id);
    const discount = 10 + (h % 6) * 5; // 10–35%
    const current = Number(price) || 0;
    const [from, to] = GRADIENTS[h % GRADIENTS.length];

    return {
        rating: (3.6 + (h % 13) / 10).toFixed(1), // 3.6–4.8
        reviews: 120 + ((h * 7) % 9800),
        discount,
        mrp: Math.round(current / (1 - discount / 100)),
        gradient: `linear-gradient(135deg, ${from}, ${to})`
    };
}

export function formatINR(value) {
    return Number(value || 0).toLocaleString("en-IN");
}
