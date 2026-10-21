
import { useState } from "react";
import apiRequest from "../services/api";

function PhoneVerification({ phoneNumber, phoneVerified, onVerified }) {
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
            await apiRequest("/users/me/phone-verification/request", {
                method: "POST"
            });

            setSent(true);
            setOtp("");
            setMessage("Development OTP generated. Check the Spring Boot console.");
        } catch (err) {
            setError(err.message || "Unable to generate OTP.");
        } finally {
            setSending(false);
        }
    }

    async function handleVerify(event) {
        event.preventDefault();
        setVerifying(true);
        setMessage("");
        setError("");

        try {
            await apiRequest("/users/me/phone-verification/confirm", {
                method: "POST",
                body: JSON.stringify({ otp })
            });

            setSent(false);
            setOtp("");
            setMessage("Phone number verified successfully!");

            if (onVerified) {
                await onVerified();
            }
        } catch (err) {
            setError(err.message || "Invalid or expired OTP.");
        } finally {
            setVerifying(false);
        }
    }

    if (!phoneNumber || phoneVerified) return null;

    return (
        <div className="inline-verify">
            <button
                type="button"
                onClick={handleSendOtp}
                disabled={sending}
            >
                {sending ? "Generating..." : sent ? "Resend OTP" : "Generate OTP"}
            </button>

            {sent && (
                <form onSubmit={handleVerify} className="otp-inline">
                    <input
                        id="phone-otp"
                        type="text"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        pattern="[0-9]{6}"
                        maxLength={6}
                        value={otp}
                        onChange={(event) =>
                            setOtp(event.target.value.replace(/\D/g, ""))
                        }
                        placeholder="6-digit OTP"
                        aria-label="Six-digit OTP"
                        required
                    />

                    <button
                        type="submit"
                        disabled={verifying || otp.length !== 6}
                    >
                        {verifying ? "Verifying..." : "Verify"}
                    </button>
                </form>
            )}

            {message && <p className="success-message" role="status">{message}</p>}
            {error && <p className="error-message" role="alert">{error}</p>}
        </div>
    );
}

export default PhoneVerification;
