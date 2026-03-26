import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { useLanguage } from "../contexts/LanguageContext";
import {
	translateCategory,
	translateCondition,
	getCategoryTranslationKey,
} from "../utils/productTranslations";
import ProductImageSlider from "../components/ProductImageSlider";
import FavoriteButton from "../components/FavoriteButton";
import ExclusiveAdsCarousel from "../components/ExclusiveAdsCarousel";
import CategoriesModal from "../components/CategoriesModal";
import CategoriesSidebar from "../components/CategoriesSidebar";
import { macedonianCities } from "../utils/macedonianCities";
import {
	MapPin,
	LayoutGrid,
	Menu,
	MonitorSmartphone,
	CarFront,
	Building2,
} from "lucide-react";

const categoryIconProps = { size: 26, strokeWidth: 1.85 };
import CustomSelect from "../components/CustomSelect";
import SearchBar from "../components/SearchBar";
import logo1 from "../assets/logomk.png";
import logo2 from "../assets/logo-without-text.png";
import logosvg from "../assets/logo-nadlanka-full-dark.svg";

const Home = () => {
	const { t } = useLanguage();
	const navigate = useNavigate();
	const routerLocation = useLocation();
	const [selectedLocation, setSelectedLocation] = useState(""); // Empty string = Entire Macedonia
	const [allProducts, setAllProducts] = useState([]);
	const [exclusiveProducts, setExclusiveProducts] = useState([]);
	const [loading, setLoading] = useState(true);
	const [loadingMore, setLoadingMore] = useState(false);
	const [exclusiveLoading, setExclusiveLoading] = useState(true);
	const [displayLimit, setDisplayLimit] = useState(15); // 3 rows x 5 columns initially
	const [pagination, setPagination] = useState({});
	const [sortBy, setSortBy] = useState("createdAt");
	const [sortOrder, setSortOrder] = useState("desc");
	const [stats, setStats] = useState({
		totalProducts: 0,
		totalUsers: 0,
	});
	const [isInitialMount, setIsInitialMount] = useState(true);
	const [isCategoriesModalOpen, setIsCategoriesModalOpen] = useState(false);
	const [isCategoriesSidebarOpen, setIsCategoriesSidebarOpen] = useState(false);
	const [selectedCategory, setSelectedCategory] = useState(null);
	const [
		selectedCategoryForSubcategories,
		setSelectedCategoryForSubcategories,
	] = useState(null);
	const [categories, setCategories] = useState([]);
	const [categorySlideDirection, setCategorySlideDirection] = useState("");

	// Reset function to clear all filters and state
	const resetToHome = () => {
		setSelectedLocation("");
		setSortBy("createdAt");
		setSortOrder("desc");
		setDisplayLimit(15);
		setIsInitialMount(true);
		setSelectedCategory(null);
		setSelectedCategoryForSubcategories(null);
		setCategorySlideDirection("");
		// Clear URL params
		window.history.replaceState({}, "", "/");
		// Refetch fresh data
		fetchExclusiveProducts();
		fetchAllProducts(15, 1, false);
		fetchStats();
		setIsInitialMount(false);
	};

	// Listen for reset event from logo click
	useEffect(() => {
		const handleReset = () => {
			resetToHome();
		};
		window.addEventListener("resetToHome", handleReset);
		return () => {
			window.removeEventListener("resetToHome", handleReset);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// Reset when navigating to home without search params
	useEffect(() => {
		if (routerLocation.pathname === "/" && !routerLocation.search) {
			// If we're on home page with no params, ensure clean state
			if (selectedLocation || sortBy !== "createdAt" || sortOrder !== "desc") {
				resetToHome();
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [routerLocation.pathname, routerLocation.search]);

	useEffect(() => {
		fetchExclusiveProducts();
		fetchAllProducts(15); // Initial load: 15 products (3 rows x 5 columns)
		fetchStats();
		setIsInitialMount(false);
	}, []);

	// Refetch products when location or sort changes (but not on initial mount)
	useEffect(() => {
		if (!isInitialMount) {
			fetchAllProducts(15, 1, false);
			setDisplayLimit(15); // Reset display limit when location or sort changes
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectedLocation, sortBy, sortOrder]);

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
			const params = new URLSearchParams({
				limit: limit.toString(),
				page: page.toString(),
				sortBy: sortBy || "createdAt",
				sortOrder: sortOrder || "desc",
			});

			// Add location filter if selected
			if (selectedLocation) {
				params.append("location", selectedLocation);
			}

			const response = await axios.get(`/api/products?${params.toString()}`);
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
				// Replace products (initial load or sort change)
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
		const limit = 15; // Load 15 more products (3 more rows x 5 columns)
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
		if (!price || price === null) {
			return t("createProduct.form.priceByAgreement") || "По договор";
		}
		return new Intl.NumberFormat("mk-MK", {
			style: "currency",
			currency: currency,
		}).format(price);
	};

	const handleSearch = (e) => {
		e.preventDefault();
		if (searchQuery.trim()) {
			// Include location in search if selected
			const params = new URLSearchParams();
			params.append("search", searchQuery.trim());
			if (selectedLocation) {
				params.append("location", selectedLocation);
			}
			navigate(`/products?${params.toString()}`);
			setSearchQuery("");
		}
	};

	const handleLocationChange = (e) => {
		const location = e.target.value;
		setSelectedLocation(location);

		// If user has typed something in search, navigate to products with both search and location
		const currentSearch =
			searchInputRef.current?.value?.trim() || searchQuery.trim();
		if (currentSearch) {
			const params = new URLSearchParams();
			params.append("search", currentSearch);
			if (location) {
				params.append("location", location);
			}
			navigate(`/products?${params.toString()}`);
			setSearchQuery("");
		}
		// If no search query, just update location state (for home page filtering)
	};

	return (
		<div className="home-container">
			<div className="home-layout">
				{/* Categories Sidebar */}
				{isCategoriesSidebarOpen && (
					<CategoriesSidebar
						onClose={() => setIsCategoriesSidebarOpen(false)}
					/>
				)}

				<div className="home-main-content">
					{/* Search Bar and Location Filter */}
					<SearchBar
						onSearch={(query, location) => {
							if (query.trim()) {
								const params = new URLSearchParams();
								params.append("search", query.trim());
								if (location) {
									params.append("location", location);
								}
								navigate(`/products?${params.toString()}`);
							}
						}}
						onLocationChange={(location, currentSearch) => {
							setSelectedLocation(location);
							if (currentSearch) {
								const params = new URLSearchParams();
								params.append("search", currentSearch);
								if (location) {
									params.append("location", location);
								}
								navigate(`/products?${params.toString()}`);
							} else {
								// Refetch products when location changes
								fetchAllProducts(15, 1, false);
								setDisplayLimit(15);
							}
						}}
					/>

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
								<div className="category-icon category-icon--electronics">
									<MonitorSmartphone {...categoryIconProps} />
								</div>
								<span>{t("home.categories.electronics")}</span>
							</Link>
							<Link
								to="/category/vehicles"
								className="category-nav-item"
								title={t("home.categories.cars")}
							>
								<div className="category-icon category-icon--vehicles">
									<CarFront {...categoryIconProps} />
								</div>
								<span>{t("home.categories.cars")}</span>
							</Link>
							<Link
								to="/category/real-estate"
								className="category-nav-item"
								title={t("home.categories.realEstate")}
							>
								<div className="category-icon category-icon--realestate">
									<Building2 {...categoryIconProps} />
								</div>
								<span>{t("home.categories.realEstate")}</span>
							</Link>
							<button
								onClick={() => setIsCategoriesModalOpen(true)}
								className="category-nav-item"
								title={t("home.categories.allCategories") || "All Categories"}
							>
								<div className="category-icon category-icon--all">
									<LayoutGrid {...categoryIconProps} />
								</div>
								<span>
									{t("home.categories.allCategories") || "Categories"}
								</span>
							</button>
						</div>
					</section>

					{/* All Products */}
					<section className="featured-section">
						<div className="section-header">
							<h2>{t("nav.products") || "All Ads"}</h2>
							<div className="sort-controls">
								<CustomSelect
									value={`${sortBy}-${sortOrder}`}
									onChange={(e) => {
										const [newSortBy, newSortOrder] = e.target.value.split("-");
										setSortBy(newSortBy);
										setSortOrder(newSortOrder);
										// Reset to first page when sort changes
										setDisplayLimit(15);
										setIsInitialMount(false);
									}}
									options={[
										{
											value: "createdAt-desc",
											label: t("products.filter.sortBy.newest") || "Newest",
										},
										{
											value: "createdAt-asc",
											label: t("products.filter.sortBy.oldest") || "Oldest",
										},
										{
											value: "price-asc",
											label:
												t("products.filter.sortBy.priceLow") ||
												"Price: Low to High",
										},
										{
											value: "price-desc",
											label:
												t("products.filter.sortBy.priceHigh") ||
												"Price: High to Low",
										},
										{
											value: "views-desc",
											label: t("products.filter.sortBy.views") || "Most Viewed",
										},
										{
											value: "title-asc",
											label: t("form.nameAZ") || "Name: A-Z",
										},
									]}
								/>
							</div>
						</div>

						{loading ? (
							<div className="loading-container">
								<div className="loading-spinner"></div>
								<p>{t("common.loading") || "Loading..."}</p>
							</div>
						) : allProducts.length === 0 ? (
							<div className="no-products">
								<p>{t("home.noProducts") || "No products found"}</p>
							</div>
						) : (
							<>
								<div className="products-grid">
									{allProducts.slice(0, displayLimit).map((product) => (
										<div key={product._id} className="product-card">
											<Link to={`/products/${product._id}`}>
												<ProductImageSlider
													images={product.images || []}
													productId={product._id}
												/>
												<div className="product-info">
													<h3 className="product-title">{product.title}</h3>
													<p className="product-price">
														{formatPrice(product.price, product.currency)}
													</p>
													<p className="product-location">
														{product.location || t("common.unknown")}
													</p>
												</div>
											</Link>
											<FavoriteButton
												productId={product._id}
												isFavorite={product.isFavorite || false}
											/>
										</div>
									))}
								</div>
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
				</div>
			</div>

			{/* Footer */}
			<footer className="home-footer">
				<div className="footer-content">
					<div className="footer-brand">
						<img src={logosvg} alt="NaDlanka" />
						<p>{t("home.footer.tagline") || "Your local marketplace"}</p>
					</div>
					<div className="footer-social">
						<h4>{t("home.footer.followUs") || "Follow Us"}</h4>
						<div className="social-links">
							<a
								href="https://www.facebook.com/profile.php?id=61580939143690"
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

			{/* Categories Modal (for mobile) */}
			<CategoriesModal
				isOpen={isCategoriesModalOpen}
				onClose={() => setIsCategoriesModalOpen(false)}
			/>
		</div>
	);
};

export default Home;
