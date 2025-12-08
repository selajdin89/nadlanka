import React, { useState } from "react";
import { X, User, MessageCircle } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import "./ContactModal.scss";

const ContactModal = ({ isOpen, onClose, seller, product }) => {
	const { t } = useLanguage();
	const { user, isAuthenticated } = useAuth();
	const navigate = useNavigate();
	const location = useLocation();
	const [sending, setSending] = useState(false);
	const [starting, setStarting] = useState(false);

	const handleStartChat = async () => {
		if (!isAuthenticated) {
			navigate("/login", { state: { from: location.pathname } });
			return;
		}

		setStarting(true);

		try {
			const response = await axios.post(
				"/api/chat/start",
				{
					sellerId: seller._id,
					productId: product._id,
				},
				{
					headers: {
						Authorization: `Bearer ${user.token}`,
					},
				}
			);

			onClose();
			navigate("/chat", { state: { chatId: response.data.chat._id } });
		} catch (error) {
			console.error("Error starting chat:", error);
			alert(
				t("contact.chatError") ||
					"Failed to start chat. Please try again."
			);
		} finally {
			setStarting(false);
		}
	};

	const handleEmailFallback = async () => {
		const senderName = prompt(t("contact.yourName") || "Your Name:");
		const senderEmail = prompt(t("contact.yourEmail") || "Your Email:");
		const message = prompt(t("contact.message") || "Message:");

		if (!senderName || !senderEmail || !message) {
			return;
		}

		setSending(true);

		try {
			await axios.post("/api/messages", {
				senderName,
				senderEmail,
				productId: product._id,
				message,
				preferredContactMethod: "email",
			});

			alert(t("contact.messageSent") || "Message sent successfully!");
			onClose();
		} catch (error) {
			console.error("Error sending email:", error);
			alert(
				t("contact.messageError") || "Failed to send message. Please try again."
			);
		} finally {
			setSending(false);
		}
	};

	if (!isOpen) return null;

	return (
		<div className="contact-modal-overlay" onClick={onClose}>
			<div className="contact-modal" onClick={(e) => e.stopPropagation()}>
				<div className="contact-modal-header">
					<h3>{t("contact.title") || "Contact Seller"}</h3>
					<button className="close-btn" onClick={onClose}>
						<X size={20} />
					</button>
				</div>

				<div className="contact-modal-content">
					{/* Seller Info */}
					<div className="seller-info">
						<div className="seller-header">
							<User size={20} />
							<h4>{seller?.name || "Seller"}</h4>
						</div>
						<div className="seller-details">
							{seller?.email && (
								<div className="contact-item">
									<span>📧 {seller.email}</span>
								</div>
							)}
							{seller?.location && (
								<div className="contact-item">
									<span>📍 {seller.location}</span>
								</div>
							)}
						</div>
					</div>

					{/* Product Info */}
					<div className="contact-product-info">
						<h5>{t("contact.aboutProduct") || "About this product:"}</h5>
						<p className="product-title">{product?.title}</p>
						<p className="product-price">
							{product?.price && product?.currency
								? new Intl.NumberFormat("mk-MK", {
										style: "currency",
										currency: product.currency,
								  }).format(product.price)
								: ""}
						</p>
					</div>

					{/* Contact Options */}
					<div className="contact-options">
						<div className="option-description">
							<h4>
								{t("contact.chooseMethod") ||
									"How would you like to contact the seller?"}
							</h4>
							<p>
								{t("contact.methodDescription") ||
									"Choose between live chat or email:"}
							</p>
						</div>

						<div className="contact-methods">
							{/* Live Chat Option */}
							{isAuthenticated ? (
								<button
									onClick={handleStartChat}
									disabled={starting}
									className="contact-method chat-method"
								>
									<MessageCircle size={24} />
									<div className="method-info">
										<h5>{t("contact.startChat") || "Start Live Chat"}</h5>
										<p>
											{t("contact.chatDesc") ||
												"Chat in real-time with the seller"}
										</p>
									</div>
									{starting && <div className="loading-spinner"></div>}
								</button>
							) : (
								<div className="login-notice">
									<p>
										{t("contact.loginForChat") ||
											"Please log in to use live chat"}
									</p>
								</div>
							)}

							{/* Email Option */}
							<button
								onClick={handleEmailFallback}
								disabled={sending}
								className="contact-method email-method"
							>
								<span className="email-icon">📧</span>
								<div className="method-info">
									<h5>{t("contact.sendEmail") || "Send Email"}</h5>
									<p>
										{t("contact.emailDesc") ||
											"Send a message via email (seller will be notified)"}
									</p>
								</div>
								{sending && <div className="loading-spinner"></div>}
							</button>
						</div>
					</div>

					<div className="form-actions">
						<button
							type="button"
							onClick={onClose}
							className="btn btn-secondary"
						>
							{t("common.cancel") || "Cancel"}
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ContactModal;
