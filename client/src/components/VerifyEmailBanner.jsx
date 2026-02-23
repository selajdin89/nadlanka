import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import "./VerifyEmailBanner.scss";

const VerifyEmailBanner = () => {
	const { user, resendVerification } = useAuth();
	const { t } = useLanguage();
	const [loading, setLoading] = useState(false);
	const [sent, setSent] = useState(false);
	const [error, setError] = useState("");

	if (!user || user.isVerified) return null;

	const handleResend = async () => {
		setLoading(true);
		setSent(false);
		setError("");
		const result = await resendVerification();
		setLoading(false);
		if (result?.success) setSent(true);
		else if (result?.error) setError(result.detail ? `${result.error} (${result.detail})` : result.error);
	};

	return (
		<div className="verify-email-banner" role="banner">
			<p className="verify-email-banner__text">{t("auth.verifyEmail.banner")}</p>
			{error && <p className="verify-email-banner__error">{error}</p>}
			<div className="verify-email-banner__actions">
				<button
					type="button"
					className="verify-email-banner__resend"
					onClick={handleResend}
					disabled={loading || sent}
				>
					{loading ? "..." : sent ? t("auth.verifyEmail.resendSent") : t("auth.verifyEmail.resend")}
				</button>
				<Link to="/verify-email" className="verify-email-banner__link">
					{t("auth.verifyEmail.title")}
				</Link>
			</div>
		</div>
	);
};

export default VerifyEmailBanner;
