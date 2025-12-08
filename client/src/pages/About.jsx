import React from "react";
import { useLanguage } from "../contexts/LanguageContext";

const About = () => {
	const { t } = useLanguage();
	return (
		<div className="about-container">
			<div className="about-header">
				<h1>{t("about.title")}</h1>
				<p>{t("about.subtitle")}</p>
			</div>

			<div className="about-content">
				<section className="about-section">
					<h2>{t("about.mission")}</h2>
					<p>{t("about.mission.text")}</p>
				</section>

				<section className="about-section">
					<h2>{t("about.features")}</h2>
					<div className="features-grid">
						<div className="feature-card">
							<div className="feature-icon">🔍</div>
							<h3>{t("about.feature1.title")}</h3>
							<p>{t("about.feature1.desc")}</p>
						</div>
						<div className="feature-card">
							<div className="feature-icon">📍</div>
							<h3>{t("about.feature2.title")}</h3>
							<p>{t("about.feature2.desc")}</p>
						</div>
						<div className="feature-card">
							<div className="feature-icon">🛡️</div>
							<h3>{t("about.feature4.title")}</h3>
							<p>{t("about.feature4.desc")}</p>
						</div>
						<div className="feature-card">
							<div className="feature-icon">📱</div>
							<h3>{t("about.feature3.title")}</h3>
							<p>{t("about.feature3.desc")}</p>
						</div>
						<div className="feature-card">
							<div className="feature-icon">💰</div>
							<h3>{t("about.feature3.title")}</h3>
							<p>{t("about.feature3.desc")}</p>
						</div>
						<div className="feature-card">
							<div className="feature-icon">🌱</div>
							<h3>{t("about.feature4.title")}</h3>
							<p>{t("about.feature4.desc")}</p>
						</div>
					</div>
				</section>

				<section className="about-section">
					<h2>How It Works</h2>
					<div className="steps-container">
						<div className="step">
							<div className="step-number">1</div>
							<div className="step-content">
								<h3>Browse or Search</h3>
								<p>
									Explore products in your area or use our search function to
									find specific items.
								</p>
							</div>
						</div>
						<div className="step">
							<div className="step-number">2</div>
							<div className="step-content">
								<h3>Contact Seller</h3>
								<p>
									Get in touch with the seller using the contact information
									provided.
								</p>
							</div>
						</div>
						<div className="step">
							<div className="step-number">3</div>
							<div className="step-content">
								<h3>Meet & Complete</h3>
								<p>
									Arrange a safe meeting place and complete your transaction
									locally.
								</p>
							</div>
						</div>
					</div>
				</section>

				<section className="about-section">
					<h2>Safety Tips</h2>
					<div className="safety-tips">
						<div className="tip">
							<h4>🔒 Meet in Public Places</h4>
							<p>Always meet in well-lit, public areas for your safety.</p>
						</div>
						<div className="tip">
							<h4>👥 Bring a Friend</h4>
							<p>
								Consider bringing someone with you for important transactions.
							</p>
						</div>
						<div className="tip">
							<h4>💰 Inspect Before Paying</h4>
							<p>
								Always inspect the item thoroughly before completing payment.
							</p>
						</div>
						<div className="tip">
							<h4>📱 Trust Your Instincts</h4>
							<p>
								If something feels wrong, don't proceed with the transaction.
							</p>
						</div>
					</div>
				</section>

				<section className="about-section">
					<h2>{t("about.contact")}</h2>
					<div className="contact-info">
						<p>{t("about.contact.text")}</p>
						<div className="contact-methods">
							<div className="contact-method">
								<strong>{t("about.contact.email")}:</strong>{" "}
								support@nadlanka.com
							</div>
							<div className="contact-method">
								<strong>{t("about.contact.phone")}:</strong> +389 XX XXX XXX
							</div>
							<div className="contact-method">
								<strong>Address:</strong> Skopje, North Macedonia
							</div>
						</div>
					</div>
				</section>
			</div>
		</div>
	);
};

export default About;
