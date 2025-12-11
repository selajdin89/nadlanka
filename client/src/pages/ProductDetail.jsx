import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import { useSocket } from "../contexts/SocketContext";
import axios from "axios";
import {
	translateCategory,
	translateCondition,
} from "../utils/productTranslations";
import {
	isValidMacedoniaPhone,
	formatPhoneForWhatsApp,
} from "../utils/phoneValidation";
import {
	Edit3,
	Trash2,
	Eye,
	EyeOff,
	ArrowLeft,
	MessageCircle,
	User,
	Calendar,
	MapPin,
	Tag,
	Mail,
	Send,
	Phone,
} from "lucide-react";
import "./ProductDetail.scss";

const ProductDetail = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const location = useLocation();
	const { user, isAuthenticated } = useAuth();
	const { t } = useLanguage();
	const { socket } = useSocket();
	const [product, setProduct] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [deleting, setDeleting] = useState(false);
	const [messageText, setMessageText] = useState("");
	const [sendingMessage, setSendingMessage] = useState(false);
	const [currentChat, setCurrentChat] = useState(null);
	const [messageSent, setMessageSent] = useState(false);
	const [selectedImageIndex, setSelectedImageIndex] = useState(0);

	useEffect(() => {
		fetchProduct();
	}, [id]);

	// Reset selected image when product changes
	useEffect(() => {
		if (product) {
			setSelectedImageIndex(0);
		}
	}, [product?._id]);

	// Load or create chat when product and user are available
	useEffect(() => {
		if (product && product.seller && isAuthenticated && user && !isOwner) {
			loadOrCreateChat();
		}
	}, [product?._id, product?.seller?._id, isAuthenticated, user?._id]);

	// Join chat room when chat is available
	useEffect(() => {
		if (currentChat && socket) {
			socket.emit("join_chat", currentChat._id);
		}
	}, [currentChat, socket]);

	const fetchProduct = async () => {
		try {
			setLoading(true);
			const response = await axios.get(`/api/products/${id}`);
			setProduct(response.data);
		} catch (error) {
			console.error("Error fetching product:", error);
			setError("Product not found");
		} finally {
			setLoading(false);
		}
	};

	const formatPrice = (price, currency = "MKD") => {
		return new Intl.NumberFormat("mk-MK", {
			style: "currency",
			currency: currency,
		}).format(price);
	};

	const formatDate = (dateString) => {
		return new Date(dateString).toLocaleDateString("mk-MK", {
			year: "numeric",
			month: "long",
			day: "numeric",
		});
	};

	// Check if current user owns this product
	const isOwner =
		isAuthenticated && user && product && product.seller?._id === user._id;

	const handleDeleteProduct = async () => {
		if (
			!window.confirm(
				t("product.deleteConfirm") ||
					"Are you sure you want to delete this product? This action cannot be undone."
			)
		) {
			return;
		}

		try {
			setDeleting(true);
			await axios.delete(`/api/products/${id}`);
			navigate("/profile", {
				state: {
					message:
						t("product.deletedSuccess") || "Product deleted successfully",
				},
			});
		} catch (error) {
			console.error("Error deleting product:", error);
			alert(
				t("product.deleteError") ||
					"Failed to delete product. Please try again."
			);
		} finally {
			setDeleting(false);
		}
	};

	const handleToggleStatus = async () => {
		try {
			const newStatus = product.status === "active" ? "inactive" : "active";
			await axios.patch(`/api/products/${id}`, { status: newStatus });
			setProduct((prev) => ({ ...prev, status: newStatus }));
		} catch (error) {
			console.error("Error updating product status:", error);
			alert(
				t("product.statusError") ||
					"Failed to update product status. Please try again."
			);
		}
	};

	const loadOrCreateChat = async () => {
		if (!product || !product.seller || !user?.token) return;

		try {
			const response = await axios.post(
				"/api/chat/start",
				{
					sellerId: product.seller._id,
					productId: product._id,
				},
				{
					headers: {
						Authorization: `Bearer ${user.token}`,
					},
				}
			);
			setCurrentChat(response.data.chat);
		} catch (error) {
			console.error("Error loading/creating chat:", error);
		}
	};

	const handleSendMessage = async () => {
		if (!messageText.trim()) return;

		setSendingMessage(true);

		try {
			if (isAuthenticated && currentChat && socket) {
				// Send via chat (Socket.IO)
				socket.emit("send_message", {
					chatId: currentChat._id,
					content: messageText.trim(),
					type: "text",
				});
				setMessageText("");
				setMessageSent(true);
				setTimeout(() => setMessageSent(false), 3000);
			} else if (!isAuthenticated) {
				// Send via email for unauthenticated users
				const senderName = prompt(t("contact.yourName") || "Your Name:");
				const senderEmail = prompt(t("contact.yourEmail") || "Your Email:");

				if (!senderName || !senderEmail) {
					setSendingMessage(false);
					return;
				}

				await axios.post("/api/messages", {
					senderName,
					senderEmail,
					productId: product._id,
					message: messageText.trim(),
					preferredContactMethod: "email",
				});

				setMessageText("");
				setMessageSent(true);
				setTimeout(() => setMessageSent(false), 3000);
				alert(t("contact.messageSent") || "Message sent successfully!");
			} else {
				// Fallback: try to create chat and send
				await loadOrCreateChat();
				if (currentChat && socket) {
					socket.emit("send_message", {
						chatId: currentChat._id,
						content: messageText.trim(),
						type: "text",
					});
					setMessageText("");
					setMessageSent(true);
					setTimeout(() => setMessageSent(false), 3000);
				}
			}
		} catch (error) {
			console.error("Error sending message:", error);
			alert(
				t("contact.messageError") || "Failed to send message. Please try again."
			);
		} finally {
			setSendingMessage(false);
		}
	};

	const handleKeyPress = (e) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSendMessage();
		}
	};

	// Get seller phone number
	const getSellerPhone = () => {
		return product?.contactInfo?.phone || product?.seller?.phone || "";
	};

	// Get seller email
	const getSellerEmail = () => {
		return product?.contactInfo?.email || product?.seller?.email || "";
	};

	const handleSendEmail = async () => {
		const senderName = prompt(t("contact.yourName") || "Your Name:");
		const senderEmail = prompt(t("contact.yourEmail") || "Your Email:");
		const message = prompt(t("contact.message") || "Message:");

		if (!senderName || !senderEmail || !message) {
			return;
		}

		setSendingMessage(true);

		try {
			await axios.post("/api/messages", {
				senderName,
				senderEmail,
				productId: product._id,
				message,
				preferredContactMethod: "email",
			});

			alert(t("contact.messageSent") || "Message sent successfully!");
		} catch (error) {
			console.error("Error sending email:", error);
			alert(
				t("contact.messageError") || "Failed to send message. Please try again."
			);
		} finally {
			setSendingMessage(false);
		}
	};

	const handleCall = () => {
		const phone = getSellerPhone();
		if (phone) {
			window.location.href = `tel:${phone}`;
		}
	};

	const handleWhatsApp = () => {
		const phone = getSellerPhone();
		if (phone) {
			const formattedPhone = formatPhoneForWhatsApp(phone);
			const message = encodeURIComponent(
				`Hello! I'm interested in your product: ${product.title}`
			);
			window.open(`https://wa.me/${formattedPhone}?text=${message}`, "_blank");
		}
	};

	if (loading) {
		return <div className="loading">Loading product...</div>;
	}

	if (error || !product) {
		return (
			<div className="error-container">
				<h2>Product Not Found</h2>
				<p>The product you're looking for doesn't exist or has been removed.</p>
				<Link to="/products" className="btn btn-primary">
					Browse Products
				</Link>
			</div>
		);
	}

	return (
		<div className="product-detail-container">
			<div className="product-detail-layout">
				{/* Left Column: Images and Messaging */}
				<div className="product-left-column">
					{/* Product Images */}
					<div className="product-images">
						{product.images && product.images.length > 0 ? (
							<>
								{/* Main Image */}
								<div className="main-image-container">
									<img
										src={product.images[selectedImageIndex]}
										alt={`${product.title} ${selectedImageIndex + 1}`}
										className="main-product-image"
										onError={(e) => {
											// Prevent infinite loop by stopping after first error
											e.target.style.display = "none";
											e.target.parentElement.innerHTML =
												'<div class="placeholder-image">Image failed to load</div>';
										}}
									/>
								</div>
								{/* Thumbnail Gallery - Only show if more than one image */}
								{product.images.length > 1 && (
									<div className="thumbnail-gallery">
										{product.images.map((image, index) => (
											<div
												key={index}
												className={`thumbnail-item ${
													index === selectedImageIndex ? "active" : ""
												}`}
												onClick={() => setSelectedImageIndex(index)}
											>
												<img
													src={image}
													alt={`${product.title} thumbnail ${index + 1}`}
													className="thumbnail-image"
													onError={(e) => {
														// Prevent infinite loop by hiding broken images
														e.target.style.display = "none";
													}}
												/>
											</div>
										))}
									</div>
								)}
							</>
						) : (
							<div className="no-image">No images available</div>
						)}
					</div>

					{/* Messaging Interface - Only show for non-owners, below images */}
					{!isOwner && (
						<div className="product-messaging-left">
							<div className="messaging-header-left">
								<h3>
									{isAuthenticated
										? t("contact.startChat") || "Message the Seller"
										: t("contact.sendEmail") || "Send Message to Seller"}
								</h3>
								{!isAuthenticated && (
									<p className="login-prompt">
										{t("contact.loginForChat") || "Login to use live chat"}
									</p>
								)}
							</div>
							<div className="messaging-input-container-left">
								<textarea
									className="messaging-textarea-left"
									placeholder={
										isAuthenticated
											? t("chat.typeMessage") || "Type your message..."
											: t("contact.messagePlaceholder") ||
											  "Write your message to the seller..."
									}
									value={messageText}
									onChange={(e) => setMessageText(e.target.value)}
									onKeyPress={handleKeyPress}
									rows={4}
									disabled={sendingMessage}
								/>
								<button
									className="btn btn-primary send-message-btn-left"
									onClick={handleSendMessage}
									disabled={sendingMessage || !messageText.trim()}
								>
									{sendingMessage ? (
										<span className="spinner-small"></span>
									) : (
										<Send size={18} />
									)}
									<span>{t("contact.sendMessage") || "Send"}</span>
								</button>
							</div>
							{messageSent && (
								<div className="message-sent-confirmation-left">
									{t("contact.messageSent") || "Message sent successfully!"}
								</div>
							)}
						</div>
					)}
				</div>

				{/* Product Info */}
				<div className="product-info">
					<div className="product-header">
						<h1 className="product-title">{product.title}</h1>
						<div className="product-price">
							{formatPrice(product.price, product.currency)}
						</div>
					</div>

					{/* Owner Status Banner */}
					{isOwner && (
						<div className={`owner-banner ${product.status}`}>
							<div className="banner-content">
								<span className="status-indicator">
									{product.status === "active" ? (
										<Eye size={16} />
									) : (
										<EyeOff size={16} />
									)}
									{t(`product.status.${product.status}`) || product.status}
								</span>
								<span className="owner-text">
									{t("product.yourListing") || "This is your listing"}
								</span>
							</div>
						</div>
					)}

					<div className="product-meta">
						<div className="meta-item">
							<Tag size={16} />
							<span>
								<strong>{t("common.category") || "Category"}:</strong>{" "}
								{translateCategory(product.category, t)}
							</span>
						</div>
						<div className="meta-item">
							<span>
								<strong>{t("common.condition") || "Condition"}:</strong>{" "}
								{translateCondition(product.condition, t)}
							</span>
						</div>
						<div className="meta-item">
							<MapPin size={16} />
							<span>
								<strong>{t("common.location") || "Location"}:</strong>{" "}
								{product.location}
							</span>
						</div>
						<div className="meta-item">
							<Eye size={16} />
							<span>
								<strong>{t("common.views") || "Views"}:</strong> {product.views}
							</span>
						</div>
						<div className="meta-item">
							<Calendar size={16} />
							<span>
								<strong>{t("product.posted") || "Posted"}:</strong>{" "}
								{formatDate(product.createdAt)}
							</span>
						</div>
					</div>

					{/* Category-specific details */}
					{product.categorySpecific && (
						<div className="category-specific-details">
							{product.category === "Real Estate" && (
								<div className="real-estate-details">
									<h3>Property Details</h3>
									<div className="details-grid">
										{product.categorySpecific.propertyType && (
											<div className="detail-item">
												<strong>Property Type:</strong>{" "}
												{product.categorySpecific.propertyType
													.charAt(0)
													.toUpperCase() +
													product.categorySpecific.propertyType.slice(1)}
											</div>
										)}
										{product.categorySpecific.area && (
											<div className="detail-item">
												<strong>Area:</strong> {product.categorySpecific.area}{" "}
												m²
											</div>
										)}
										{product.categorySpecific.address && (
											<div className="detail-item">
												<strong>Address:</strong>{" "}
												{product.categorySpecific.address}
											</div>
										)}
										{product.categorySpecific.bedrooms && (
											<div className="detail-item">
												<strong>Bedrooms:</strong>{" "}
												{product.categorySpecific.bedrooms}
											</div>
										)}
										{product.categorySpecific.bathrooms && (
											<div className="detail-item">
												<strong>Bathrooms:</strong>{" "}
												{product.categorySpecific.bathrooms}
											</div>
										)}
									</div>
								</div>
							)}

							{product.category === "Cars" && (
								<div className="car-details">
									<h3>Vehicle Details</h3>
									<div className="details-grid">
										{product.categorySpecific.year && (
											<div className="detail-item">
												<strong>Year:</strong> {product.categorySpecific.year}
											</div>
										)}
										{product.categorySpecific.mileage && (
											<div className="detail-item">
												<strong>Mileage:</strong>{" "}
												{product.categorySpecific.mileage.toLocaleString()} km
											</div>
										)}
										{product.categorySpecific.fuelType && (
											<div className="detail-item">
												<strong>Fuel Type:</strong>{" "}
												{product.categorySpecific.fuelType
													.charAt(0)
													.toUpperCase() +
													product.categorySpecific.fuelType.slice(1)}
											</div>
										)}
										{product.categorySpecific.transmission && (
											<div className="detail-item">
												<strong>Transmission:</strong>{" "}
												{product.categorySpecific.transmission
													.charAt(0)
													.toUpperCase() +
													product.categorySpecific.transmission.slice(1)}
											</div>
										)}
										{product.categorySpecific.color && (
											<div className="detail-item">
												<strong>Color:</strong> {product.categorySpecific.color}
											</div>
										)}
									</div>
								</div>
							)}
						</div>
					)}

					<div className="product-description">
						<h3>Description</h3>
						<p>{product.description}</p>
					</div>

					{product.tags && product.tags.length > 0 && (
						<div className="product-tags">
							<h3>Tags</h3>
							<div className="tags-list">
								{product.tags.map((tag, index) => (
									<span key={index} className="tag">
										{tag}
									</span>
								))}
							</div>
						</div>
					)}

					{/* Seller Info - Different for owners vs visitors */}
					<div className="seller-info">
						{isOwner ? (
							<>
								<h3>{t("product.yourDetails") || "Your Details"}</h3>
								<div className="seller-details">
									<div className="seller-name">
										<User size={16} />
										{product.seller?.name}
									</div>
									{product.seller?.location && (
										<div className="seller-location">
											<MapPin size={16} />
											{product.seller.location}
										</div>
									)}
									{product.seller?.phone && (
										<div className="contact-info">
											<strong>{t("common.phone") || "Phone"}:</strong>{" "}
											{product.seller.phone}
										</div>
									)}
									<div className="contact-info">
										<strong>{t("common.email") || "Email"}:</strong>{" "}
										{product.seller?.email}
									</div>
								</div>
								<Link
									to={`/products?seller=${product.seller?._id}`}
									className="btn btn-outline"
								>
									{t("product.viewYourProducts") || "View Your Products"}
								</Link>
							</>
						) : (
							<>
								<h3>{t("product.sellerInfo") || "Seller Information"}</h3>
								<div className="seller-details">
									<div className="seller-name">
										<User size={16} />
										{product.seller?.name}
									</div>
									{product.seller?.location && (
										<div className="seller-location">
											<MapPin size={16} />
											{product.seller.location}
										</div>
									)}
									{product.contactInfo?.phone && (
										<div className="contact-info">
											<strong>{t("common.phone") || "Phone"}:</strong>{" "}
											{product.contactInfo.phone}
										</div>
									)}
									{product.contactInfo?.email && (
										<div className="contact-info">
											<strong>{t("common.email") || "Email"}:</strong>{" "}
											{product.contactInfo.email}
										</div>
									)}
								</div>
								<Link
									to={`/products?seller=${product.seller?._id}`}
									className="btn btn-outline"
								>
									{t("product.viewSellerProducts") || "View Seller's Products"}
								</Link>
							</>
						)}
					</div>
				</div>
			</div>

			{/* Action Buttons - Different for owners vs visitors */}
			<div className="product-actions">
				<Link to="/products" className="btn btn-secondary">
					<ArrowLeft size={16} />
					{t("product.backToProducts") || "Back to Products"}
				</Link>

				{isOwner ? (
					<>
						<Link to={`/edit-product/${id}`} className="btn btn-primary">
							<Edit3 size={16} />
							{t("common.edit") || "Edit Product"}
						</Link>
						<button
							onClick={handleToggleStatus}
							className={`btn btn-${
								product.status === "active" ? "warning" : "success"
							}`}
						>
							{product.status === "active" ? (
								<EyeOff size={16} />
							) : (
								<Eye size={16} />
							)}
							{product.status === "active"
								? t("product.deactivate") || "Deactivate"
								: t("product.activate") || "Activate"}
						</button>
						<button
							onClick={handleDeleteProduct}
							disabled={deleting}
							className="btn btn-danger"
						>
							<Trash2 size={16} />
							{deleting
								? t("common.deleting") || "Deleting..."
								: t("common.delete") || "Delete"}
						</button>
					</>
				) : null}
			</div>

			{/* Contact Options - Only show for non-owners */}
			{!isOwner && (
				<>
					{/* Quick Contact Buttons */}
					<div className="contact-options-bar">
						{getSellerEmail() && (
							<button
								className="contact-option-btn email-btn"
								onClick={handleSendEmail}
								title={t("contact.sendEmail") || "Send Email"}
							>
								<Mail size={20} />
								<span>{t("contact.sendEmail") || "Email"}</span>
							</button>
						)}
						{isValidMacedoniaPhone(getSellerPhone()) && (
							<>
								<button
									className="contact-option-btn call-btn"
									onClick={handleCall}
									title={t("contact.call") || "Call"}
								>
									<Phone size={20} />
									<span>{t("contact.call") || "Call"}</span>
								</button>
								<button
									className="contact-option-btn whatsapp-btn"
									onClick={handleWhatsApp}
									title={t("contact.whatsapp") || "WhatsApp"}
								>
									<svg
										width="20"
										height="20"
										viewBox="0 0 24 24"
										fill="currentColor"
									>
										<path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
									</svg>
									<span>{t("contact.whatsapp") || "WhatsApp"}</span>
								</button>
							</>
						)}
					</div>
				</>
			)}
		</div>
	);
};

export default ProductDetail;
