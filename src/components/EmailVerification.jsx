
import { useState } from "react";
import apiRequest from "../services/api";

function EmailVerification({ email, emailVerified, onVerified }) {
    const [otp, setOtp] = useState("");
    const [sent, setSent] = useState(false);
    const [sending, setSending] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    async function handleSendOtp() {
        setSending(true);
        setMessage("");
        setError("");

        try {
            await apiRequest("/users/me/email-verification/request", {
                method: "POST"
            });

            setSent(true);
            setOtp("");
            setMessage("Verification code sent. Check your email.");
        } catch (err) {
            setError(err.message || "Unable to send verification code.");
        } finally {
            setSending(false);
        }
    }

    async function handleVerify(event) {
        event.preventDefault();

        if (otp.length !== 6) {
            setError("Please enter the complete 6-digit OTP.");
            return;
        }

        setVerifying(true);
        setMessage("");
        setError("");

        try {
            console.log("Submitting email OTP to backend...");

            await apiRequest("/users/me/email-verification/confirm", {
                method: "POST",
                body: JSON.stringify({ otp })
            });

            setMessage("Email verified successfully!");

            // Refresh the profile separately so a refresh error
            // doesn't make verification appear to have failed.
            if (onVerified) {
                try {
                    await onVerified();
                } catch (refreshError) {
                    console.error("Profile refresh failed:", refreshError);
                }
            }

            setSent(false);
            setOtp("");
        } catch (err) {
            console.error("Email OTP verification failed:", err);
            setError(err.message || "Verification failed. Check the OTP and try again.");

            // Keep the OTP form visible so the user can retry.
        } finally {
            setVerifying(false);
        }
    }

    if (!email || emailVerified) return null;

    return (
        <div className="inline-verify">
            <button
                type="button"
                onClick={handleSendOtp}
                disabled={sending}
            >
                {sending
                    ? "Sending..."
                    : sent
                        ? "Resend code"
                        : "Send verification code"}
            </button>

            {sent && (
                <form onSubmit={handleVerify} className="otp-inline">
                    <input
                        id="email-otp"
                        type="text"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        pattern="[0-9]{6}"
                        maxLength={6}
                        placeholder="6-digit code"
                        aria-label="Six-digit verification code"
                        value={otp}
                        onChange={(event) =>
                            setOtp(event.target.value.replace(/\D/g, ""))
                        }
                        required
                    />

                    <button type="submit" disabled={verifying || otp.length !== 6}>
                        {verifying ? "Verifying..." : "Verify"}
                    </button>
                </form>
            )}

            {message && <p className="success-message" role="status">{message}</p>}
            {error && <p className="error-message" role="alert">{error}</p>}
        </div>
    );
}

export default EmailVerification;
