
import { useEffect, useState } from "react";
import apiRequest from "../services/api";
import EmailVerification from "../components/EmailVerification";
import PhoneVerification from "../components/PhoneVerification";
import ProfileImageUpload from "../components/ProfileImageUpload";

function Profile() {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [saving, setSaving] = useState(false);
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [addressLine, setAddressLine] = useState("");
    const [city, setCity] = useState("");
    const [state, setState] = useState("");
    const [postalCode, setPostalCode] = useState("");
    const [country, setCountry] = useState("");
    const [openVerify, setOpenVerify] = useState(null); // "email" | "phone" | null

    useEffect(() => {
        async function loadProfile() {
            try {
                const data = await apiRequest("/users/me");

                setProfile(data);
                setUsername(data.username || "");
                setEmail(data.email || "");
                setPhoneNumber(data.phoneNumber || "");
                setAddressLine(data.addressLine || "");
                setCity(data.city || "");
                setState(data.state || "");
                setPostalCode(data.postalCode || "");
                setCountry(data.country || "");
            } catch (err) {
                console.error("Profile save error:", err);
                setError(
                    err instanceof Error
                        ? err.message
                        : "Unable to update profile."
                );
            } finally {
                setLoading(false);
            }
        }

        loadProfile();
    }, []);



    async function handleSave(event) {
        event.preventDefault();

        setError("");
        setMessage("");
        setSaving(true);

        try {
            const updated = await apiRequest("/users/me", {
                method: "PUT",
                body: JSON.stringify({
                    username,
                    email,
                    phoneNumber,
                    addressLine,
                    city,
                    state,
                    postalCode,
                    country,
                }),
            });

            setProfile(updated);
            setUsername(updated.username || "");
            setEmail(updated.email || "");
            setPhoneNumber(updated.phoneNumber || "");
            setAddressLine(updated.addressLine || "");
            setCity(updated.city || "");
            setState(updated.state || "");
            setPostalCode(updated.postalCode || "");
            setCountry(updated.country || "");

            setMessage("Profile updated successfully.");
        } catch (err) {
            console.error("Profile save error:", err);
            setError(err.message || "Unable to update profile.");
        }
        finally{
            setSaving(false);
        }
    }



    async function refreshProfile() {
        const updatedProfile = await apiRequest("/users/me");
        setProfile(updatedProfile);
        setOpenVerify(null);
    }

    if (loading) return <p className="state-msg">Loading profile...</p>;

    if (!profile) {
        return <p className="state-msg error" role="alert">{error || "Profile unavailable."}</p>;
    }

    // Tick/cross only reflects the SAVED value; hide it while the field has unsaved edits.
    const emailDirty = email !== (profile.email || "");
    const phoneDirty = phoneNumber !== (profile.phoneNumber || "");

    return (
        <div className="profile-page">
            <div className="profile-card">
                <ProfileImageUpload />

                <h1 className="profile-name">{profile.username}</h1>
                <p className="profile-meta">
                    <span>ID: {profile.id}</span>
                    <span className="dot">•</span>
                    <span>{profile.role}</span>
                </p>

                {error && <p className="error-message center" role="alert">{error}</p>}
                {message && <p className="success-message center" role="status">{message}</p>}

                <form onSubmit={handleSave} className="profile-form">
                    <div className="pf-field">
                        <label htmlFor="username">Username</label>
                        <input
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            minLength={3}
                            maxLength={50}
                        />
                    </div>

                    <div className="pf-field">
                        <label htmlFor="email">Email</label>
                        <div className="pf-input-row">
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                maxLength={255}
                            />
                            {!emailDirty && (
                                <VerifyStatus
                                    verified={!!profile.emailVerified}
                                    label="Email"
                                    canVerify={!!profile.email}
                                    onVerify={() =>
                                        setOpenVerify(openVerify === "email" ? null : "email")
                                    }
                                />
                            )}
                        </div>
                        {openVerify === "email" && (
                            <EmailVerification
                                email={profile.email}
                                emailVerified={profile.emailVerified}
                                onVerified={refreshProfile}
                            />
                        )}
                    </div>

                    <div className="pf-field">
                        <label htmlFor="phoneNumber">Phone Number</label>
                        <div className="pf-input-row">
                            <input
                                id="phoneNumber"
                                type="tel"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                placeholder="+919876543210"
                                pattern="\+[1-9][0-9]{7,14}"
                            />
                            {!phoneDirty && (
                                <VerifyStatus
                                    verified={!!profile.phoneVerified}
                                    label="Phone number"
                                    canVerify={!!profile.phoneNumber}
                                    onVerify={() =>
                                        setOpenVerify(openVerify === "phone" ? null : "phone")
                                    }
                                />
                            )}
                        </div>
                        {openVerify === "phone" && (
                            <PhoneVerification
                                phoneNumber={profile.phoneNumber}
                                phoneVerified={profile.phoneVerified}
                                onVerified={refreshProfile}
                            />
                        )}
                    </div>

                    <div className="pf-field">
                        <label htmlFor="addressLine">Address</label>
                        <input
                            id="addressLine"
                            value={addressLine}
                            onChange={(e) => setAddressLine(e.target.value)}
                            maxLength={255}
                        />
                    </div>

                    <div className="pf-field">
                        <label htmlFor="city">City</label>
                        <input
                            id="city"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            maxLength={100}
                        />
                    </div>

                    <div className="pf-field">
                        <label htmlFor="state">State</label>
                        <input
                            id="state"
                            value={state}
                            onChange={(e) => setState(e.target.value)}
                            maxLength={100}
                        />
                    </div>

                    <div className="pf-field">
                        <label htmlFor="postalCode">Postal Code</label>
                        <input
                            id="postalCode"
                            value={postalCode}
                            onChange={(e) => setPostalCode(e.target.value)}
                            maxLength={20}
                        />
                    </div>

                    <div className="pf-field">
                        <label htmlFor="country">Country</label>
                        <input
                            id="country"
                            value={country}
                            onChange={(e) => setCountry(e.target.value)}
                            maxLength={100}
                        />
                    </div>

                    <div className="pf-actions">
                        <button type="submit" className="btn-buy" disabled={saving}>
                            {saving ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// Green tick = verified, red cross = not verified (with a small "Verify" link).
function VerifyStatus({ verified, label, canVerify, onVerify }) {
    if (verified) {
        return (
            <span className="vs vs-ok" title={`${label} verified`} role="img" aria-label={`${label} verified`}>
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m4 12.5 5 5L20 6.5" />
                </svg>
            </span>
        );
    }

    return (
        <span className="vs vs-no">
            <span title={`${label} not verified`} role="img" aria-label={`${label} not verified`}>
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round">
                    <path d="M6 6l12 12M18 6 6 18" />
                </svg>
            </span>
            {canVerify && (
                <button type="button" className="verify-link" onClick={onVerify}>
                    Verify
                </button>
            )}
        </span>
    );
}

export default Profile;
