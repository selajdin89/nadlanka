import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import {
	translateCategory,
	translateCondition,
} from "../utils/productTranslations";
import ProductImageSlider from "../components/ProductImageSlider";
import FavoriteButton from "../components/FavoriteButton";
import { Heart, ShoppingBag } from "lucide-react";
import "./Favorites.scss";

const Favorites = () => {
	const { user } = useAuth();
	const navigate = useNavigate();
	const { t } = useLanguage();
	const [favorites, setFavorites] = useState([]);
	const [loading, setLoading] = useState(true);
	const [pagination, setPagination] = useState({});
	const [currentPage, setCurrentPage] = useState(1);

	useEffect(() => {
		if (!user) {
			navigate("/login", { state: { from: "/favorites" } });
			return;
		}
		fetchFavorites();
	}, [user, currentPage]);

	const fetchFavorites = async () => {
		try {
			setLoading(true);
			const response = await axios.get(
				`/api/favorites?page=${currentPage}&limit=12`,
				{
					headers: {
						Authorization: `Bearer ${user.token}`,
					},
				}
			);
			setFavorites(response.data.favorites);
			setPagination(response.data.pagination);
		} catch (error) {
			console.error("Error fetching favorites:", error);
			if (error.response?.status === 401) {
				navigate("/login", { state: { from: "/favorites" } });
			}
		} finally {
			setLoading(false);
		}
	};

	const handleFavoriteRemoved = () => {
		// Refresh the favorites list
		fetchFavorites();
	};

	const formatPrice = (price, currency = "MKD") => {
		return new Intl.NumberFormat("mk-MK", {
			style: "currency",
			currency: currency,
		}).format(price);
	};

	if (!user) {
		return null;
	}

	return (
		<div className="favorites-container">
			<div className="favorites-header">
				<div className="header-content">
					<Heart size={32} fill="#ff6e00" stroke="#ff6e00" />
					<div>
						<h1>{t("favorites.title")}</h1>
						{pagination.totalFavorites > 0 && (
							<p>
								{pagination.totalFavorites} {t("favorites.totalFavorites")}
							</p>
						)}
					</div>
				</div>
			</div>

			<div className="favorites-content">
				{loading ? (
					<div className="loading-state">
						<div className="spinner"></div>
						<p>{t("favorites.loading")}</p>
					</div>
				) : favorites.length === 0 ? (
					<div className="empty-state">
						<Heart size={64} />
						<h2>{t("favorites.noFavorites")}</h2>
						<p>{t("favorites.noFavoritesDesc")}</p>
						<Link to="/products" className="browse-btn">
							<ShoppingBag size={20} />
							{t("favorites.browseCatalogue")}
						</Link>
					</div>
				) : (
					<>
						<div className="products-grid">
							{favorites.map((favorite) => {
								const product = favorite.product;
								if (!product) return null;

								return (
									<Link
										key={favorite._id}
										to={`/products/${product._id}`}
										className="product-card"
									>
										<div className="product-image-wrapper">
											<ProductImageSlider
												images={product.images}
												title={product.title}
											/>
											<div className="favorite-btn-wrapper">
												<FavoriteButton
													productId={product._id}
													size="small"
													onToggle={handleFavoriteRemoved}
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
												<span className="product-category">
													{translateCategory(product.category, t)}
												</span>
												<span className="product-condition">
													{translateCondition(product.condition, t)}
												</span>
											</div>
										</div>
									</Link>
								);
							})}
						</div>

						{pagination.totalPages > 1 && (
							<div className="pagination">
								<button
									onClick={() => setCurrentPage(currentPage - 1)}
									disabled={currentPage === 1}
									className="pagination-btn"
								>
									{t("category.previous")}
								</button>
								<span className="pagination-info">
									{t("category.page")} {currentPage} {t("category.of")}{" "}
									{pagination.totalPages}
								</span>
								<button
									onClick={() => setCurrentPage(currentPage + 1)}
									disabled={currentPage === pagination.totalPages}
									className="pagination-btn"
								>
									{t("category.next")}
								</button>
							</div>
						)}
					</>
				)}
			</div>
		</div>
	);
};

export default Favorites;
