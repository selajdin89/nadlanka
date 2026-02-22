import React, { useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";
import { useAuth } from "../contexts/AuthContext";
import "./VerifyEmail.scss";

const VerifyEmail = () => {
	const [searchParams] = useSearchParams();
	const { t } = useLanguage();
	const { user, resendVerification, refreshUser } = useAuth();
	const success = searchParams.get("success") === "1";
	const error = searchParams.get("error");
	const [resendLoading, setResendLoading] = React.useState(false);
	const [resendMessage, setResendMessage] = React.useState("");

	// After successful verification, refresh user so banner disappears
	useEffect(() => {
		if (success) refreshUser();
	}, [success]);

	const handleResend = async () => {
		setResendLoading(true);
		setResendMessage("");
		const result = await resendVerification();
		setResendLoading(false);
		if (result?.success) setResendMessage(t("auth.verifyEmail.resendSent"));
		else setResendMessage(result?.error || "Failed to resend");
	};

	return (
		<div className="verify-email-page">
			<div className="verify-email-card">
				<h1>{t("auth.verifyEmail.title")}</h1>
				{success && (
					<div className="verify-email-success">
						<p>{t("auth.verifyEmail.success")}</p>
						<Link to="/" className="verify-email-link">
							{t("auth.verifyEmail.goHome")}
						</Link>
					</div>
				)}
				{error === "invalid" && (
					<div className="verify-email-error">
						<p>{t("auth.verifyEmail.invalid")}</p>
						{user && !user.isVerified && (
							<button
								type="button"
								className="verify-email-resend"
								onClick={handleResend}
								disabled={resendLoading}
							>
								{resendLoading ? "..." : t("auth.verifyEmail.resend")}
							</button>
						)}
						<Link to="/" className="verify-email-link">
							{t("auth.verifyEmail.goHome")}
						</Link>
					</div>
				)}
				{error === "missing" && (
					<div className="verify-email-error">
						<p>{t("auth.verifyEmail.invalid")}</p>
						<Link to="/" className="verify-email-link">
							{t("auth.verifyEmail.goHome")}
						</Link>
					</div>
				)}
				{error === "server" && (
					<div className="verify-email-error">
						<p>Something went wrong. Please try again later.</p>
						<Link to="/" className="verify-email-link">
							{t("auth.verifyEmail.goHome")}
						</Link>
					</div>
				)}
				{!success && !error && user && !user.isVerified && (
					<div className="verify-email-pending">
						<p>{t("auth.verifyEmail.checkInbox")}</p>
						<button
							type="button"
							className="verify-email-resend"
							onClick={handleResend}
							disabled={resendLoading}
						>
							{resendLoading ? "..." : t("auth.verifyEmail.resend")}
						</button>
						{resendMessage && <p className="verify-email-resend-msg">{resendMessage}</p>}
						<Link to="/" className="verify-email-link">
							{t("auth.verifyEmail.goHome")}
						</Link>
					</div>
				)}
				{!success && !error && !user && (
					<div className="verify-email-pending">
						<p>{t("auth.verifyEmail.checkInbox")}</p>
						<Link to="/" className="verify-email-link">
							{t("auth.verifyEmail.goHome")}
						</Link>
					</div>
				)}
			</div>
		</div>
	);
};

export default VerifyEmail;
