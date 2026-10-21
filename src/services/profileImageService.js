
const IMAGE_URL =
  "http://localhost:8080/api/users/me/profile-image";

export async function uploadProfileImage(file) {
  const token = localStorage.getItem("token");
  const formData = new FormData();

  formData.append("file", file);

  const response = await fetch(IMAGE_URL, {
    method: "POST",
    headers: token
      ? { Authorization: `Bearer ${token}` }
      : {},
    body: formData,
  });

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(
      data?.message || `Image upload failed: ${response.status}`
    );
  }
}

export async function fetchProfileImage() {
  const token = localStorage.getItem("token");

  const response = await fetch(IMAGE_URL, {
    headers: token
      ? { Authorization: `Bearer ${token}` }
      : {},
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error("Unable to load profile image.");
  }

  return URL.createObjectURL(await response.blob());
}


export async function deleteProfileImage() {
  const token = localStorage.getItem("token");

  const response = await fetch(IMAGE_URL, {
    method: "DELETE",
    headers: token
      ? { Authorization: `Bearer ${token}` }
      : {},
  });

  // 404 means there was no image to begin with, which is fine.
  if (!response.ok && response.status !== 404) {
    const data = await response.json().catch(() => null);
    throw new Error(
      data?.message || `Could not remove image: ${response.status}`
    );
  }
}
