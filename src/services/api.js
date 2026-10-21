
const BASE_URL = "http://localhost:8080/api";

async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem("token");
  const isFormData =
    typeof FormData !== "undefined" &&
    options.body instanceof FormData;

  const headers = {
    ...options.headers,
  };

  // Let the browser set the multipart boundary for FormData.
  if (options.body !== undefined && !isFormData) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 204) {
    return null;
  }

  // Read the response body once, whether it contains JSON or text.
  const responseText = await response.text();
  let data = null;

  if (responseText) {
    try {
      data = JSON.parse(responseText);
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    const errorMessage =
      (typeof data === "string" && data) ||
      data?.message ||
      data?.detail ||
      data?.error_description ||
      data?.error ||
      data?.title ||
      responseText ||
      `Request failed: ${response.status}`;

    throw new Error(errorMessage);
  }

  // Return parsed JSON when possible; otherwise return plain text.
  return data !== null ? data : responseText;
}

export default apiRequest;
