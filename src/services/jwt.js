export function getRoleFromToken(token) {
    if (!token) return null;

    try {
        const parts = token.split(".");

        if (parts.length !== 3) {
            return null;
        }

        // Decode the JWT payload (second part)
        const payload = parts[1]
            .replace(/-/g, "+")
            .replace(/_/g, "/");

        const paddedPayload = payload.padEnd(
            payload.length + (4 - payload.length % 4) % 4,
            "="
        );

        const decodedPayload = atob(paddedPayload);
        const claims = JSON.parse(decodedPayload);

        // Adjust "role" if your backend uses a different claim name
        return claims.role ?? null;
    } catch (error) {
        console.error("Unable to decode JWT:", error);
        return null;
    }
}
