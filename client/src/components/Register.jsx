import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import "./Register.scss";

const Register = () => {
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		password: "",
		confirmPassword: "",
		phone: "",
		location: "",
	});
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	const { register } = useAuth();
	const { t } = useLanguage();
	const navigate = useNavigate();

	const handleChange = (e) => {
		setFormData({
			...formData,
			[e.target.name]: e.target.value,
		});
		setError("");
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError("");

		// Validation
		if (formData.password !== formData.confirmPassword) {
			setError(t("auth.register.passwordMismatch"));
			setLoading(false);
			return;
		}

		if (formData.password.length < 6) {
			setError(t("auth.register.passwordTooShort"));
			setLoading(false);
			return;
		}

		const result = await register({
			name: formData.name,
			email: formData.email,
			password: formData.password,
			phone: formData.phone,
			location: formData.location,
		});

		if (result.success) {
			navigate("/");
		} else {
			setError(result.error);
		}

		setLoading(false);
	};

	return (
		<div className="auth-container">
			<div className="auth-card">
				<div className="auth-header">
					<h2>{t("auth.register.title")}</h2>
					<p>{t("auth.register.subtitle")}</p>
				</div>

				<form onSubmit={handleSubmit} className="auth-form">
					{error && <div className="error-message">{error}</div>}

					<div className="form-group">
						<label htmlFor="name">{t("auth.name")}</label>
						<input
							type="text"
							id="name"
							name="name"
							value={formData.name}
							onChange={handleChange}
							required
							placeholder={t("auth.namePlaceholder")}
						/>
					</div>

					<div className="form-group">
						<label htmlFor="email">{t("auth.email")}</label>
						<input
							type="email"
							id="email"
							name="email"
							value={formData.email}
							onChange={handleChange}
							required
							placeholder={t("auth.emailPlaceholder")}
						/>
					</div>

					<div className="form-group">
						<label htmlFor="phone">{t("auth.phone")}</label>
						<input
							type="tel"
							id="phone"
							name="phone"
							value={formData.phone}
							onChange={handleChange}
							placeholder={t("auth.phonePlaceholder")}
						/>
					</div>

					<div className="form-group">
						<label htmlFor="location">{t("auth.location")}</label>
						<input
							type="text"
							id="location"
							name="location"
							value={formData.location}
							onChange={handleChange}
							placeholder={t("auth.locationPlaceholder")}
						/>
					</div>

					<div className="form-group">
						<label htmlFor="password">{t("auth.password")}</label>
						<input
							type="password"
							id="password"
							name="password"
							value={formData.password}
							onChange={handleChange}
							required
							placeholder={t("auth.passwordPlaceholder")}
						/>
					</div>

					<div className="form-group">
						<label htmlFor="confirmPassword">{t("auth.confirmPassword")}</label>
						<input
							type="password"
							id="confirmPassword"
							name="confirmPassword"
							value={formData.confirmPassword}
							onChange={handleChange}
							required
							placeholder={t("auth.confirmPasswordPlaceholder")}
						/>
					</div>

					<button type="submit" className="auth-button" disabled={loading}>
						{loading ? t("auth.registering") : t("auth.register.button")}
					</button>
				</form>

				{/* Divider */}
				<div className="auth-divider">
					<span>{t("common.or")}</span>
				</div>

				{/* Google OAuth Button */}
				<a href={`${import.meta.env.VITE_API_URL || ""}/api/auth/google`} className="google-auth-button">
					<svg
						width="20"
						height="20"
						viewBox="0 0 24 24"
						className="google-icon"
					>
						<path
							fill="#4285F4"
							d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
						/>
						<path
							fill="#34A853"
							d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
						/>
						<path
							fill="#FBBC05"
							d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
						/>
						<path
							fill="#EA4335"
							d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
						/>
					</svg>
					{t("auth.google.signUp")}
				</a>

				<div className="auth-footer">
					<p>
						{t("auth.register.hasAccount")}{" "}
						<Link to="/login" className="auth-link">
							{t("auth.register.loginLink")}
						</Link>
					</p>
				</div>
			</div>
		</div>
	);
};

export default Register;
