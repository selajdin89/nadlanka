import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useLanguage } from "../contexts/LanguageContext";
import {
	translateCategory,
	translateCondition,
} from "../utils/productTranslations";
import ProductImageSlider from "../components/ProductImageSlider";
import FavoriteButton from "../components/FavoriteButton";
import ExclusiveAdsCarousel from "../components/ExclusiveAdsCarousel";
import logo1 from "../assets/logomk.png";
import logo2 from "../assets/logo-without-text.png";
import logosvg from "../assets/logo-nadlanka-full-dark.svg";

const Home = () => {
	const { t } = useLanguage();
	const navigate = useNavigate();
	const [searchQuery, setSearchQuery] = useState("");
	const [allProducts, setAllProducts] = useState([]);
	const [exclusiveProducts, setExclusiveProducts] = useState([]);
	const [loading, setLoading] = useState(true);
	const [loadingMore, setLoadingMore] = useState(false);
	const [exclusiveLoading, setExclusiveLoading] = useState(true);
	const [displayLimit, setDisplayLimit] = useState(16); // 4 rows x 4 columns (or 5 rows x 3 columns)
	const [pagination, setPagination] = useState({});
	const [stats, setStats] = useState({
		totalProducts: 0,
		totalUsers: 0,
	});

	useEffect(() => {
		fetchExclusiveProducts();
		fetchAllProducts(16); // Initial load: 16 products (4-5 rows)
		fetchStats();
	}, []);

	const fetchExclusiveProducts = async () => {
		try {
			const response = await axios.get(
				"/api/products?limit=8&sortBy=createdAt&sortOrder=desc&isUrgent=true"
			);
			setExclusiveProducts(response.data.products);
		} catch (error) {
			console.error("Error fetching exclusive products:", error);
		} finally {
			setExclusiveLoading(false);
		}
	};

	const fetchAllProducts = async (limit, page = 1, append = false) => {
		try {
			if (!append) {
				// Initial load
				setLoading(true);
			}
			// Note: loadingMore is set in handleShowMore before calling this
			const response = await axios.get(
				`/api/products?limit=${limit}&page=${page}&sortBy=createdAt&sortOrder=desc`
			);
			if (append) {
				// Append new products to existing ones, filtering out duplicates
				setAllProducts((prev) => {
					const existingIds = new Set(prev.map((p) => p._id));
					const newProducts = response.data.products.filter(
						(p) => !existingIds.has(p._id)
					);
					return [...prev, ...newProducts];
				});
			} else {
				// Replace products (initial load)
				setAllProducts(response.data.products);
			}
			setPagination(response.data.pagination || {});
		} catch (error) {
			console.error("Error fetching products:", error);
		} finally {
			setLoading(false);
			if (append) {
				setLoadingMore(false);
			}
		}
	};

	const handleShowMore = async () => {
		const limit = 12;
		// Calculate the next page: skip = (page - 1) * limit
		// We want to skip allProducts.length products
		// So: allProducts.length = (page - 1) * limit
		// page = Math.floor(allProducts.length / limit) + 1
		const nextPage = Math.floor(allProducts.length / limit) + 1;
		// Set loading state immediately for instant UI feedback
		setLoadingMore(true);
		// Fetch only new products using page to maintain scroll position
		await fetchAllProducts(limit, nextPage, true);
		// Update display limit after products are loaded
		setDisplayLimit(displayLimit + limit);
	};

	const fetchStats = async () => {
		try {
			const [productsRes, usersRes] = await Promise.all([
				axios.get("/api/products"),
				axios.get("/api/users"),
			]);
			setStats({
				totalProducts: productsRes.data.pagination?.totalProducts || 0,
				totalUsers: usersRes.data.length,
			});
		} catch (error) {
			console.error("Error fetching stats:", error);
		}
	};

	const formatPrice = (price, currency = "MKD") => {
		return new Intl.NumberFormat("mk-MK", {
			style: "currency",
			currency: currency,
		}).format(price);
	};

	const handleSearch = (e) => {
		e.preventDefault();
		if (searchQuery.trim()) {
			navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
			setSearchQuery("");
		}
	};

	return (
		<div className="home-container">
			{/* Search Bar */}
			<section className="search-section">
				<form className="search-form" onSubmit={handleSearch}>
					<div className="search-input-container">
						<input
							type="text"
							placeholder={t("nav.search.placeholder")}
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="search-input"
						/>
						<button type="submit" className="search-button">
							<svg
								width="20"
								height="20"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
							>
								<circle cx="11" cy="11" r="8"></circle>
								<path d="m21 21-4.35-4.35"></path>
							</svg>
						</button>
					</div>
				</form>
			</section>

			{/* Action Buttons */}
			<section className="action-buttons-section">
				<div className="action-buttons">
					<Link to="/products" className="btn btn-primary">
						{t("home.hero.browse")}
					</Link>
					<Link to="/create-product" className="btn btn-secondary">
						{t("home.hero.sell")}
					</Link>
				</div>
			</section>

			{/* Categories */}
			<section className="categories-section">
				<div className="category-nav">
					<Link
						to="/category/electronics"
						className="category-nav-item"
						title={t("home.categories.electronics")}
					>
						<div className="category-icon">
							<svg
								width="28"
								height="28"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
							>
								<rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
								<line x1="8" y1="21" x2="16" y2="21" />
								<line x1="12" y1="17" x2="12" y2="21" />
							</svg>
						</div>
						<span>{t("home.categories.electronics")}</span>
					</Link>
					<Link
						to="/category/cars"
						className="category-nav-item"
						title={t("home.categories.cars")}
					>
						<div className="category-icon">
							<svg
								width="28"
								height="28"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
							>
								<path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9L18.7 8.3c-.3-.8-1-1.3-1.9-1.3H7.2c-.9 0-1.6.5-1.9 1.3L3.5 11.1C2.7 11.3 2 12.1 2 13v3c0 .6.4 1 1 1h2" />
								<circle cx="7" cy="17" r="2" />
								<circle cx="17" cy="17" r="2" />
								<path d="M7 17H17" />
							</svg>
						</div>
						<span>{t("home.categories.cars")}</span>
					</Link>
					<Link
						to="/category/real-estate"
						className="category-nav-item"
						title={t("home.categories.realEstate")}
					>
						<div className="category-icon">
							<svg
								width="28"
								height="28"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
							>
								<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
								<polyline points="9,22 9,12 15,12 15,22" />
							</svg>
						</div>
						<span>{t("home.categories.realEstate")}</span>
					</Link>
					<Link
						to="/category/furniture"
						className="category-nav-item"
						title={t("home.categories.furniture")}
					>
						<div className="category-icon">
							<svg
								width="28"
								height="28"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
							>
								<rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
								<rect x="9" y="9" width="6" height="6" />
								<line x1="9" y1="1" x2="9" y2="4" />
								<line x1="15" y1="1" x2="15" y2="4" />
								<line x1="9" y1="20" x2="9" y2="23" />
								<line x1="15" y1="20" x2="15" y2="23" />
							</svg>
						</div>
						<span>{t("home.categories.furniture")}</span>
					</Link>
					<Link
						to="/category/services"
						className="category-nav-item"
						title={t("home.categories.services")}
					>
						<div className="category-icon">
							<svg
								width="28"
								height="28"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
							>
								<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
							</svg>
						</div>
						<span>{t("home.categories.services")}</span>
					</Link>
				</div>
			</section>

			{/* Exclusive Ads Carousel */}
			<section className="exclusive-section">
				<div className="section-header">
					<h2>{t("home.exclusive.title") || "Exclusive Ads"}</h2>
				</div>
				{exclusiveLoading ? (
					<div className="loading">{t("home.featured.loading")}</div>
				) : (
					<ExclusiveAdsCarousel products={exclusiveProducts} />
				)}
			</section>

			{/* All Products */}
			<section className="featured-section">
				<div className="section-header">
					<h2>{t("nav.products") || "All Ads"}</h2>
				</div>

				{loading ? (
					<div className="loading">{t("home.featured.loading")}</div>
				) : (
					<>
						<div className="products-grid">
							{allProducts.map((product) => (
								<Link
									key={product._id}
									to={`/products/${product._id}`}
									className="product-card"
								>
									<div className="product-image-wrapper">
										<ProductImageSlider
											images={product.images}
											title={product.title}
										/>
										<div className="favorite-btn-wrapper">
											<FavoriteButton productId={product._id} size="small" />
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
							))}
						</div>

						{/* Show More Button */}
						{((allProducts.length >= displayLimit &&
							pagination.totalProducts > allProducts.length) ||
							loadingMore) && (
							<div className="show-more-container">
								<button
									onClick={handleShowMore}
									className="show-more-btn"
									disabled={loadingMore}
								>
									{loadingMore ? (
										<span className="show-more-content">
											<span className="spinner-small"></span>
											<span>{t("common.loading") || "Loading..."}</span>
										</span>
									) : (
										t("products.showMore") || "Show More Ads"
									)}
								</button>
							</div>
						)}
					</>
				)}
			</section>

			{/* Footer */}
			<footer className="home-footer">
				<div className="footer-content">
					<div className="footer-brand">
						<img
							src={logosvg}
							alt="NaDlanka"
							// width={140}
							// height={70}
							// style={{ objectFit: "cover" }}
						/>
						<p>{t("home.footer.tagline") || "Your local marketplace"}</p>
					</div>
					<div className="footer-social">
						<h4>{t("home.footer.followUs") || "Follow Us"}</h4>
						<div className="social-links">
							<a
								href="https://www.facebook.com"
								target="_blank"
								rel="noopener noreferrer"
								className="social-link facebook"
								aria-label="Facebook"
								title="Facebook"
							>
								<svg
									width="24"
									height="24"
									viewBox="0 0 24 24"
									fill="currentColor"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
								</svg>
							</a>
							<a
								href="https://www.instagram.com"
								target="_blank"
								rel="noopener noreferrer"
								className="social-link instagram"
								aria-label="Instagram"
								title="Instagram"
							>
								<svg
									width="24"
									height="24"
									viewBox="0 0 24 24"
									fill="currentColor"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
								</svg>
							</a>
						</div>
					</div>
				</div>
				<div className="footer-bottom">
					<p>
						&copy; {new Date().getFullYear()} NaDlanka.{" "}
						{t("home.footer.rights") || "All rights reserved."}
					</p>
				</div>
			</footer>
		</div>
	);
};

export default Home;
