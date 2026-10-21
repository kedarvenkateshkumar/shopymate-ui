import { useEffect, useRef, useState } from "react";
import {
  uploadProfileImage,
  fetchProfileImage,
  deleteProfileImage,
} from "../services/profileImageService";

function ProfileImageUpload() {
  const [imageUrl, setImageUrl] = useState(null);
  const [busy, setBusy] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const imageUrlRef = useRef(null);
  const fileInputRef = useRef(null);
  const menuRef = useRef(null);

  function replaceImageUrl(newUrl) {
    if (imageUrlRef.current) {
      URL.revokeObjectURL(imageUrlRef.current);
    }

    imageUrlRef.current = newUrl;
    setImageUrl(newUrl);
  }

  useEffect(() => {
    let active = true;

    async function loadImage() {
      try {
        const url = await fetchProfileImage();

        if (active) {
          replaceImageUrl(url);
        } else if (url) {
          URL.revokeObjectURL(url);
        }
      } catch {
        if (active) {
          setError("Could not load your saved profile image.");
        }
      }
    }

    loadImage();

    return () => {
      active = false;

      if (imageUrlRef.current) {
        URL.revokeObjectURL(imageUrlRef.current);
      }
    };
  }, []);

  // Close the edit menu when clicking elsewhere, and the viewer with Esc.
  useEffect(() => {
    function onDocClick(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    }

    function onKey(event) {
      if (event.key === "Escape") {
        setViewerOpen(false);
        setMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);

    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  function openFilePicker() {
    setMenuOpen(false);
    fileInputRef.current?.click();
  }

  async function handleFileChange(event) {
    const selectedFile = event.target.files?.[0];
    event.target.value = ""; // allow picking the same file again

    setMessage("");
    setError("");

    if (!selectedFile) return;

    if (!["image/jpeg", "image/png"].includes(selectedFile.type)) {
      setError("Please select a JPG or PNG image.");
      return;
    }

    if (selectedFile.size > 2 * 1024 * 1024) {
      setError("Image size must be 2 MB or less.");
      return;
    }

    // Upload straight away - no separate "Upload" button needed.
    try {
      setBusy(true);
      await uploadProfileImage(selectedFile);

      const savedImageUrl = await fetchProfileImage();
      replaceImageUrl(savedImageUrl);

      setMessage("Profile image updated.");
    } catch (err) {
      setError(err.message || "Image upload failed.");
    } finally {
      setBusy(false);
    }
  }

  async function handleRemove() {
    setMenuOpen(false);
    setMessage("");
    setError("");

    if (!window.confirm("Remove your profile image?")) return;

    try {
      setBusy(true);
      await deleteProfileImage();
      replaceImageUrl(null);
      setMessage("Profile image removed.");
    } catch (err) {
      setError(err.message || "Could not remove the image.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="avatar-section">
      <button
        type="button"
        className="avatar"
        onClick={() => imageUrl && setViewerOpen(true)}
        disabled={!imageUrl}
        aria-label={imageUrl ? "View profile image" : "No profile image"}
        title={imageUrl ? "Click to view" : "No profile image"}
      >
        {imageUrl ? (
          <img src={imageUrl} alt="Your profile" />
        ) : (
          <svg viewBox="0 0 24 24" width="56" height="56" fill="#b0b8c4">
            <circle cx="12" cy="8" r="4.2" />
            <path d="M3.5 21c0-4.7 3.8-7.5 8.5-7.5s8.5 2.8 8.5 7.5z" />
          </svg>
        )}
      </button>

      <div className="avatar-edit" ref={menuRef}>
        <button
          type="button"
          className="edit-btn"
          onClick={() => setMenuOpen((open) => !open)}
          disabled={busy}
        >
          {busy ? "Please wait..." : "✎ Edit"}
        </button>

        {menuOpen && (
          <div className="avatar-menu" role="menu">
            <button type="button" role="menuitem" onClick={openFilePicker}>
              Upload image
            </button>
            <button
              type="button"
              role="menuitem"
              onClick={handleRemove}
              disabled={!imageUrl}
            >
              Remove image
            </button>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png"
        onChange={handleFileChange}
        hidden
      />

      {message && <p className="success-message" role="status">{message}</p>}
      {error && <p className="error-message" role="alert">{error}</p>}

      {viewerOpen && imageUrl && (
        <div
          className="image-viewer"
          onClick={() => setViewerOpen(false)}
          role="dialog"
          aria-label="Profile image"
        >
          <button
            type="button"
            className="viewer-close"
            onClick={() => setViewerOpen(false)}
            aria-label="Close"
          >
            ✕
          </button>
          <img
            src={imageUrl}
            alt="Your profile, enlarged"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </section>
  );
}

export default ProfileImageUpload;
