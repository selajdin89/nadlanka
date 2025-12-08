import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { X, Heart, ShoppingBag, Trash2 } from "lucide-react";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import {
	translateCategory,
	translateCondition,
} from "../utils/productTranslations";
import "./FavoritesSidebar.scss";

const FavoritesSidebar = ({ isOpen, onClose }) => {
	const { user } = useAuth();
	const navigate = useNavigate();
	const { t } = useLanguage();
	const [favorites, setFavorites] = useState([]);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (isOpen && user) {
			fetchFavorites();
		}
	}, [isOpen, user]);

	const fetchFavorites = async () => {
		try {
			setLoading(true);
			const response = await axios.get("/api/favorites?limit=20", {
				headers: {
					Authorization: `Bearer ${user.token}`,
				},
			});
			setFavorites(response.data.favorites);
		} catch (error) {
			console.error("Error fetching favorites:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleRemoveFavorite = async (e, productId) => {
		e.preventDefault();
		e.stopPropagation();

		try {
			await axios.delete(`/api/favorites/${productId}`, {
				headers: {
					Authorization: `Bearer ${user.token}`,
				},
			});
			// Remove from local state
			setFavorites(favorites.filter((fav) => fav.product._id !== productId));

			// Notify other components (like FavoriteButton) about the change
			window.dispatchEvent(
				new CustomEvent("favoriteChanged", {
					detail: { productId, isFavorite: false },
				})
			);
		} catch (error) {
			console.error("Error removing favorite:", error);
		}
	};

	const handleViewAll = () => {
		navigate("/favorites");
		onClose();
	};

	const handleProductClick = () => {
		onClose();
	};

	const formatPrice = (price, currency = "MKD") => {
		return new Intl.NumberFormat("mk-MK", {
			style: "currency",
			currency: currency,
		}).format(price);
	};

	if (!user) {
		return (
			<div className={`favorites-sidebar ${isOpen ? "open" : ""}`}>
				<div className="sidebar-overlay" onClick={onClose}></div>
				<div className="sidebar-content">
					<div className="sidebar-header">
						<div className="header-title">
							<Heart size={24} fill="#ff6e00" stroke="#ff6e00" />
							<h2>{t("favorites.title")}</h2>
						</div>
						<button className="close-btn" onClick={onClose}>
							<X size={24} />
						</button>
					</div>
					<div className="sidebar-body">
						<div className="empty-state">
							<Heart size={48} />
							<h3>{t("auth.loginRequired")}</h3>
							<p>{t("favorites.loginToView")}</p>
							<button
								className="login-btn"
								onClick={() => {
									navigate("/login");
									onClose();
								}}
							>
								{t("auth.signIn")}
							</button>
						</div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className={`favorites-sidebar ${isOpen ? "open" : ""}`}>
			<div className="sidebar-overlay" onClick={onClose}></div>
			<div className="sidebar-content">
				<div className="sidebar-header">
					<div className="header-title">
						<Heart size={24} fill="#ff6e00" stroke="#ff6e00" />
						<h2>{t("favorites.title")}</h2>
						{favorites.length > 0 && (
							<span className="count">{favorites.length}</span>
						)}
					</div>
					<button className="close-btn" onClick={onClose}>
						<X size={24} />
					</button>
				</div>

				<div className="sidebar-body">
					{loading ? (
						<div className="loading-state">
							<div className="spinner"></div>
							<p>{t("favorites.loading")}</p>
						</div>
					) : favorites.length === 0 ? (
						<div className="empty-state">
							<Heart size={48} />
							<h3>{t("favorites.noFavorites")}</h3>
							<p>{t("favorites.noFavoritesDesc")}</p>
							<button
								className="browse-btn"
								onClick={() => {
									navigate("/products");
									onClose();
								}}
							>
								<ShoppingBag size={18} />
								{t("favorites.browseCatalogue")}
							</button>
						</div>
					) : (
						<>
							<div className="favorites-list">
								{favorites.map((favorite) => {
									const product = favorite.product;
									if (!product) return null;

									return (
										<Link
											key={favorite._id}
											to={`/products/${product._id}`}
											className="favorite-item"
											onClick={handleProductClick}
										>
											<div className="item-image">
												<img
													src={product.images[0]}
													alt={product.title}
													onError={(e) => {
														e.target.src = "/placeholder-image.jpg";
													}}
												/>
											</div>
											<div className="item-info">
												<h4 className="item-title">{product.title}</h4>
												<p className="item-price">
													{formatPrice(product.price, product.currency)}
												</p>
												<div className="item-meta">
													<span className="item-category">
														{translateCategory(product.category, t)}
													</span>
													<span className="item-condition">
														{translateCondition(product.condition, t)}
													</span>
												</div>
											</div>
											<button
												className="remove-btn"
												onClick={(e) => handleRemoveFavorite(e, product._id)}
												title={t("favorites.removeFromFavorites")}
											>
												<Trash2 size={18} />
											</button>
										</Link>
									);
								})}
							</div>

							{favorites.length > 0 && (
								<div className="sidebar-footer">
									<button className="view-all-btn" onClick={handleViewAll}>
										{t("favorites.viewAll") || "View All Favorites"}
									</button>
								</div>
							)}
						</>
					)}
				</div>
			</div>
		</div>
	);
};

export default FavoritesSidebar;
