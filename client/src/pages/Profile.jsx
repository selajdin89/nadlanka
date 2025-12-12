import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import axios from "axios";
import { translateCondition } from "../utils/productTranslations";
import ProductImageSlider from "../components/ProductImageSlider";
import FavoriteButton from "../components/FavoriteButton";
import { isValidMacedoniaPhone } from "../utils/phoneValidation";

const Profile = () => {
	const {
		user: authUser,
		isAuthenticated,
		loading: authLoading,
		updateProfile,
	} = useAuth();
	const { t } = useLanguage();
	const navigate = useNavigate();
	const [userProducts, setUserProducts] = useState([]);
	const [loading, setLoading] = useState(true);
	const [activeTab, setActiveTab] = useState("products");
	const [isEditing, setIsEditing] = useState(false);
	const [editForm, setEditForm] = useState({
		name: "",
		phone: "",
		location: "",
	});
	const [editError, setEditError] = useState(null);
	const [editSuccess, setEditSuccess] = useState(null);
	const [saving, setSaving] = useState(false);

	useEffect(() => {
		if (!authLoading) {
			if (!isAuthenticated) {
				navigate("/login", { state: { from: { pathname: "/profile" } } });
				return;
			}

			if (authUser) {
				fetchUserProducts(authUser._id || authUser.userId);
				// Initialize edit form with current user data
				setEditForm({
					name: authUser.name || "",
					phone: authUser.phone || "",
					location: authUser.location || "",
				});
			}
		}
	}, [authUser, isAuthenticated, authLoading, navigate]);

	const fetchUserProducts = async (userId) => {
		try {
			const response = await axios.get(`/api/products/seller/${userId}`);
			setUserProducts(response.data);
		} catch (error) {
			console.error("Error fetching user products:", error);
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
			month: "short",
			day: "numeric",
		});
	};

	const translateStatus = (status) => {
		return t(`product.status.${status}`) || status;
	};

	const handleEditChange = (e) => {
		const { name, value } = e.target;
		setEditForm((prev) => ({
			...prev,
			[name]: value,
		}));
		setEditError(null);
	};

	const handleSaveProfile = async (e) => {
		e.preventDefault();
		setSaving(true);
		setEditError(null);
		setEditSuccess(null);

		// Validate phone number if provided
		if (editForm.phone && !isValidMacedoniaPhone(editForm.phone)) {
			setEditError(
				t("profile.invalidPhone") ||
					"Please enter a valid North Macedonia phone number (e.g., +389 XX XXX XXX or 0XX XXX XXX)"
			);
			setSaving(false);
			return;
		}

		try {
			const result = await updateProfile({
				name: editForm.name,
				phone: editForm.phone || undefined,
				location: editForm.location || undefined,
			});

			if (result.success) {
				setEditSuccess(
					t("profile.updateSuccess") || "Profile updated successfully!"
				);
				setIsEditing(false);
				setTimeout(() => setEditSuccess(null), 3000);
			} else {
				setEditError(
					result.error || t("profile.updateError") || "Failed to update profile"
				);
			}
		} catch (error) {
			console.error("Error updating profile:", error);
			setEditError(t("profile.updateError") || "Failed to update profile");
		} finally {
			setSaving(false);
		}
	};

	const handleCancelEdit = () => {
		setIsEditing(false);
		setEditForm({
			name: authUser?.name || "",
			phone: authUser?.phone || "",
			location: authUser?.location || "",
		});
		setEditError(null);
		setEditSuccess(null);
	};

	if (authLoading || loading) {
		return (
			<div className="loading">
				{t("common.loading") || "Loading profile..."}
			</div>
		);
	}

	if (!isAuthenticated || !authUser) {
		return null; // Will redirect to login
	}

	return (
		<div className="profile-container">
			<div className="profile-header">
				<div className="profile-info">
					<div className="profile-avatar">
						{authUser?.name?.charAt(0).toUpperCase()}
					</div>
					{!isEditing ? (
						<div className="profile-details">
							<h1>{authUser?.name}</h1>
							<p className="profile-email">{authUser?.email}</p>
							{authUser?.location && (
								<p className="profile-location">📍 {authUser.location}</p>
							)}
							{authUser?.phone && (
								<p className="profile-phone">📞 {authUser.phone}</p>
							)}
						</div>
					) : (
						<form className="profile-edit-form" onSubmit={handleSaveProfile}>
							{editError && <div className="error-message">{editError}</div>}
							{editSuccess && (
								<div className="success-message">{editSuccess}</div>
							)}
							<div className="form-group">
								<label htmlFor="edit-name">{t("profile.name") || "Name"}</label>
								<input
									type="text"
									id="edit-name"
									name="name"
									value={editForm.name}
									onChange={handleEditChange}
									required
								/>
							</div>
							<div className="form-group">
								<label htmlFor="edit-phone">
									{t("common.phone") || "Phone"}
								</label>
								<input
									type="tel"
									id="edit-phone"
									name="phone"
									value={editForm.phone}
									onChange={handleEditChange}
									placeholder="+389 XX XXX XXX or 0XX XXX XXX"
								/>
								{editForm.phone && !isValidMacedoniaPhone(editForm.phone) && (
									<small className="field-error">
										{t("profile.invalidPhoneFormat") ||
											"Please enter a valid North Macedonia phone number"}
									</small>
								)}
							</div>
							<div className="form-group">
								<label htmlFor="edit-location">
									{t("common.location") || "Location"}
								</label>
								<input
									type="text"
									id="edit-location"
									name="location"
									value={editForm.location}
									onChange={handleEditChange}
									placeholder={
										t("profile.locationPlaceholder") || "City, Country"
									}
								/>
							</div>
							<div className="form-actions">
								<button
									type="submit"
									className="btn btn-primary"
									disabled={saving}
								>
									{saving
										? t("common.saving") || "Saving..."
										: t("common.save") || "Save"}
								</button>
								<button
									type="button"
									className="btn btn-secondary"
									onClick={handleCancelEdit}
								>
									{t("common.cancel") || "Cancel"}
								</button>
							</div>
						</form>
					)}
				</div>
				<div className="profile-actions">
					{!isEditing && (
						<>
							<button
								className="btn btn-outline"
								onClick={() => setIsEditing(true)}
							>
								{t("profile.editProfile") || "Edit Profile"}
							</button>
							<Link to="/create-product" className="btn btn-primary">
								+ {t("profile.addProduct") || "Add Product"}
							</Link>
						</>
					)}
				</div>
			</div>

			<div className="profile-content">
				<div className="profile-tabs">
					<button
						className={`tab-button ${activeTab === "products" ? "active" : ""}`}
						onClick={() => setActiveTab("products")}
					>
						{t("profile.myProducts") || "My Products"} ({userProducts.length})
					</button>
					<button
						className={`tab-button ${activeTab === "stats" ? "active" : ""}`}
						onClick={() => setActiveTab("stats")}
					>
						{t("profile.statistics") || "Statistics"}
					</button>
					<button
						className={`tab-button ${activeTab === "settings" ? "active" : ""}`}
						onClick={() => setActiveTab("settings")}
					>
						{t("profile.settings") || "Settings"}
					</button>
				</div>

				<div className="tab-content">
					{activeTab === "products" && (
						<div className="products-section">
							{userProducts.length === 0 ? (
								<div className="empty-state">
									<h3>{t("profile.noProducts") || "No products yet"}</h3>
									<p>
										{t("profile.startSelling") ||
											"Start selling by creating your first product listing."}
									</p>
									<Link to="/create-product" className="btn btn-primary">
										{t("profile.createFirstProduct") || "Create First Product"}
									</Link>
								</div>
							) : (
								<div className="products-grid">
									{userProducts.map((product) => (
										<div key={product._id} className="product-card">
											<div className="product-image-wrapper">
												<ProductImageSlider
													images={product.images}
													title={product.title}
												/>
												<div className="favorite-btn-wrapper">
													<FavoriteButton
														productId={product._id}
														size="small"
													/>
												</div>
											</div>
											<div className="product-info">
												<h3 className="product-title">{product.title}</h3>
												<p className="product-price">
													{formatPrice(product.price, product.currency)}
												</p>
												<p className="product-location">{product.location}</p>
												<div className="product-meta">
													<span className={`status status-${product.status}`}>
														{translateStatus(product.status)}
													</span>
													<span className="product-views">
														👁 {product.views} {t("common.views")}
													</span>
												</div>
												<div className="product-actions">
													<Link
														to={`/products/${product._id}`}
														className="btn btn-view"
													>
														{t("common.view") || "View"}
													</Link>
													<Link
														to={`/edit-product/${product._id}`}
														className="btn btn-edit"
													>
														{t("common.edit") || "Edit"}
													</Link>
												</div>
											</div>
										</div>
									))}
								</div>
							)}
						</div>
					)}

					{activeTab === "stats" && (
						<div className="stats-section">
							<div className="stats-grid">
								<div className="stat-card">
									<h3>{userProducts.length}</h3>
									<p>{t("profile.totalProducts") || "Total Products"}</p>
								</div>
								<div className="stat-card">
									<h3>
										{userProducts.filter((p) => p.status === "active").length}
									</h3>
									<p>{t("profile.activeListings") || "Active Listings"}</p>
								</div>
								<div className="stat-card">
									<h3>{userProducts.reduce((sum, p) => sum + p.views, 0)}</h3>
									<p>{t("profile.totalViews") || "Total Views"}</p>
								</div>
								<div className="stat-card">
									<h3>
										{userProducts.filter((p) => p.status === "sold").length}
									</h3>
									<p>{t("profile.soldItems") || "Sold Items"}</p>
								</div>
							</div>

							<div className="recent-activity">
								<h3>{t("profile.recentActivity") || "Recent Activity"}</h3>
								{userProducts.length === 0 ? (
									<p>{t("profile.noActivity") || "No activity yet"}</p>
								) : (
									<div className="activity-list">
										{userProducts.slice(0, 5).map((product) => (
											<div key={product._id} className="activity-item">
												<div className="activity-info">
													<strong>{product.title}</strong>
													<span className="activity-date">
														{formatDate(product.createdAt)}
													</span>
												</div>
												<span className={`status status-${product.status}`}>
													{translateStatus(product.status)}
												</span>
											</div>
										))}
									</div>
								)}
							</div>
						</div>
					)}

					{activeTab === "settings" && (
						<div className="settings-section">
							<div className="settings-card">
								<h3>{t("profile.profileSettings") || "Profile Settings"}</h3>
								<p>
									{t("profile.profileSettingsDesc") ||
										"Update your personal information and contact details."}
								</p>
								<button
									className="btn btn-primary"
									onClick={() => setIsEditing(true)}
								>
									{t("profile.editProfile") || "Edit Profile"}
								</button>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default Profile;
