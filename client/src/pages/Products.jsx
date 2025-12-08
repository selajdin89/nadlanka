import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import axios from "axios";
import { useLanguage } from "../contexts/LanguageContext";
import {
	translateCategory,
	translateCondition,
	getCategoryTranslationKey,
} from "../utils/productTranslations";
import ProductImageSlider from "../components/ProductImageSlider";
import FavoriteButton from "../components/FavoriteButton";

const Products = () => {
	const { t, currentLanguage } = useLanguage();

	// Debug: Log current language
	// console.log("Current language:", currentLanguage);
	const [searchParams, setSearchParams] = useSearchParams();
	const [products, setProducts] = useState([]);
	const [loading, setLoading] = useState(true);
	const [loadingMore, setLoadingMore] = useState(false);
	const [pagination, setPagination] = useState({});
	const [categories, setCategories] = useState([]);
	const [displayLimit, setDisplayLimit] = useState(12); // Minimum 3 rows (4 columns x 3 rows)
	const [currentPage, setCurrentPage] = useState(1);
	const [filters, setFilters] = useState({
		search: searchParams.get("search") || "",
		category: searchParams.get("category") || "",
		condition: searchParams.get("condition") || "",
		minPrice: searchParams.get("minPrice") || "",
		maxPrice: searchParams.get("maxPrice") || "",
		location: searchParams.get("location") || "",
		seller: searchParams.get("seller") || "",
		sortBy: searchParams.get("sortBy") || "createdAt",
		sortOrder: searchParams.get("sortOrder") || "desc",
		page: searchParams.get("page") || "1",
	});

	useEffect(() => {
		const params = Object.fromEntries(searchParams.entries());
		const newFilters = {
			search: params.search || "",
			category: params.category || "",
			condition: params.condition || "",
			minPrice: params.minPrice || "",
			maxPrice: params.maxPrice || "",
			location: params.location || "",
			seller: params.seller || "",
			sortBy: params.sortBy || "createdAt",
			sortOrder: params.sortOrder || "desc",
			page: params.page || "1",
		};
		setFilters(newFilters);
		const initialLimit = 12; // Minimum 3 rows
		setDisplayLimit(initialLimit);
		setCurrentPage(1);
		fetchProducts(newFilters, initialLimit, 1, false);
	}, [searchParams]);

	useEffect(() => {
		fetchCategories();
	}, []);

	// Debug: Log translation status
	useEffect(() => {
		// console.log("Products component - Current language:", currentLanguage);
		// console.log("Sample translations:", {
		// 	electronics: t("categories.electronics"),
		// 	like_new: t("conditions.like_new"),
		// 	likeNew: t("conditions.like_new"),
		// });
	}, [currentLanguage, t]);

	const fetchProducts = async (
		appliedFilters = filters,
		limit = displayLimit,
		page = 1,
		append = false
	) => {
		try {
			if (append) {
				// Loading more products
				setLoadingMore(true);
			} else {
				// Initial load or filter change
				setLoading(true);
			}
			const params = new URLSearchParams();

			// Add all filter parameters (excluding page, sortBy, sortOrder which we handle separately)
			Object.entries(appliedFilters).forEach(([key, value]) => {
				if (
					value &&
					key !== "page" &&
					key !== "sortBy" &&
					key !== "sortOrder"
				) {
					params.append(key, value);
				}
			});

			// Always add pagination and sorting parameters (only once)
			params.append("limit", limit.toString());
			params.append("page", page.toString());
			params.append("sortBy", appliedFilters.sortBy || "createdAt");
			params.append("sortOrder", appliedFilters.sortOrder || "desc");

			const response = await axios.get(`/api/products?${params.toString()}`);

			if (append) {
				// Append new products to existing ones, filtering out duplicates
				setProducts((prev) => {
					const existingIds = new Set(prev.map((p) => p._id));
					const newProducts = response.data.products.filter(
						(p) => !existingIds.has(p._id)
					);
					return [...prev, ...newProducts];
				});
				// Update current page after successful append
				setCurrentPage(page);
			} else {
				// Replace products (initial load or filter change)
				setProducts(response.data.products);
				setCurrentPage(page);
			}
			// Always update pagination with the latest response
			setPagination(response.data.pagination || {});
		} catch (error) {
			console.error("Error fetching products:", error);
		} finally {
			setLoading(false);
			setLoadingMore(false);
		}
	};

	const fetchCategories = async () => {
		try {
			const response = await axios.get("/api/categories");
			setCategories(response.data);
		} catch (error) {
			console.error("Error fetching categories:", error);
		}
	};

	const updateFilters = (updatedFilters) => {
		setFilters(updatedFilters);
		const newParams = new URLSearchParams();
		Object.entries(updatedFilters).forEach(([k, v]) => {
			if (v) newParams.set(k, v);
		});
		setSearchParams(newParams);
	};

	const handleFilterChange = (key, value) => {
		const newFilters = { ...filters, [key]: value, page: "1" };
		updateFilters(newFilters);
	};

	const handleSortChange = (combinedValue) => {
		const [sortBy, sortOrder] = combinedValue.split("-");
		const newFilters = {
			...filters,
			sortBy,
			sortOrder,
			page: "1",
		};
		updateFilters(newFilters);
	};

	const handlePageChange = (newPage) => {
		const newFilters = { ...filters, page: newPage.toString() };
		updateFilters(newFilters);
	};

	const formatPrice = (price, currency = "MKD") => {
		return new Intl.NumberFormat("mk-MK", {
			style: "currency",
			currency: currency,
		}).format(price);
	};

	const clearFilters = () => {
		setFilters({
			search: "",
			category: "",
			condition: "",
			minPrice: "",
			maxPrice: "",
			location: "",
			seller: "",
			sortBy: "createdAt",
			sortOrder: "desc",
			page: "1",
		});
		setDisplayLimit(12);
		setCurrentPage(1);
		setSearchParams({});
	};

	const handleShowMore = async () => {
		const limit = 12;
		const nextPage = currentPage + 1;
		setDisplayLimit(displayLimit + limit);
		setCurrentPage(nextPage);
		// Fetch only new products using page to maintain scroll position
		await fetchProducts(filters, limit, nextPage, true);
	};

	return (
		<div className="products-container">
			<div className="products-header">
				<h1>{t("products.title")}</h1>
				<p>{t("products.search.placeholder")}</p>
				{filters.seller && (
					<div className="seller-filter-indicator">
						<span className="filter-badge">
							🔍 Showing products from specific seller
							<button
								onClick={() => handleFilterChange("seller", "")}
								className="remove-filter"
							>
								✕
							</button>
						</span>
					</div>
				)}
			</div>

			<div className="products-layout">
				{/* Filters Sidebar */}
				<aside className="filters-sidebar">
					<div className="filters-header">
						<h3>Filters</h3>
						<button onClick={clearFilters} className="clear-filters">
							{t("products.filter.clear")}
						</button>
					</div>

					<div className="filter-group">
						<label>{t("products.search.placeholder")}</label>
						<input
							type="text"
							placeholder={t("products.search.placeholder")}
							value={filters.search}
							onChange={(e) => handleFilterChange("search", e.target.value)}
						/>
					</div>

					<div className="filter-group">
						<label>{t("products.filter.category")}</label>
						<select
							value={filters.category}
							onChange={(e) => handleFilterChange("category", e.target.value)}
						>
							<option value="">{t("categories.all")}</option>
							{categories.map((cat) => {
								const translationKey = `categories.${getCategoryTranslationKey(
									cat.value
								)}`;
								return (
									<option key={cat.value} value={cat.value}>
										{t(translationKey) || cat.label}
									</option>
								);
							})}
						</select>
					</div>

					<div className="filter-group">
						<label>{t("products.filter.condition")}</label>
						<select
							value={filters.condition}
							onChange={(e) => handleFilterChange("condition", e.target.value)}
						>
							<option value="">{t("conditions.all")}</option>
							<option value="new">{t("conditions.new")}</option>
							<option value="like_new">{t("conditions.like_new")}</option>
							<option value="good">{t("conditions.good")}</option>
							<option value="fair">{t("conditions.fair")}</option>
							<option value="poor">{t("conditions.poor")}</option>
						</select>
					</div>

					<div className="filter-group">
						<label>{t("products.filter.priceRange")}</label>
						<div className="price-inputs">
							<input
								type="number"
								placeholder={t("form.min")}
								value={filters.minPrice}
								onChange={(e) => handleFilterChange("minPrice", e.target.value)}
							/>
							<input
								type="number"
								placeholder={t("form.max")}
								value={filters.maxPrice}
								onChange={(e) => handleFilterChange("maxPrice", e.target.value)}
							/>
						</div>
					</div>

					<div className="filter-group">
						<label>{t("products.filter.location")}</label>
						<input
							type="text"
							placeholder={t("form.enterLocation")}
							value={filters.location}
							onChange={(e) => handleFilterChange("location", e.target.value)}
						/>
					</div>
				</aside>

				{/* Products Grid */}
				<main className="products-main">
					<div className="products-toolbar">
						<div className="results-count">
							{pagination.totalProducts} {t("form.productsFound")}
						</div>
						<div className="sort-controls">
							<select
								value={`${filters.sortBy}-${filters.sortOrder}`}
								onChange={(e) => handleSortChange(e.target.value)}
							>
								<option value="createdAt-desc">
									{t("products.filter.sortBy.newest")}
								</option>
								<option value="createdAt-asc">
									{t("products.filter.sortBy.oldest")}
								</option>
								<option value="price-asc">
									{t("products.filter.sortBy.priceLow")}
								</option>
								<option value="price-desc">
									{t("products.filter.sortBy.priceHigh")}
								</option>
								<option value="views-desc">
									{t("products.filter.sortBy.views")}
								</option>
								<option value="title-asc">{t("form.nameAZ")}</option>
							</select>
						</div>
					</div>

					{loading ? (
						<div className="loading">{t("products.loading")}</div>
					) : (
						<>
							<div className="products-grid">
								{products.map((product) => (
									<Link
										key={product._id}
										to={`/products/${product._id}`}
										className="product-card"
									>
										<div className="product-image-wrapper">
											<ProductImageSlider
												images={product.images}
												title={product.title}
												onError={(e) => {
													// ProductImageSlider handles its own error states
													console.warn("Image failed to load:", e.target.src);
												}}
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
											<div className="product-seller">
												{t("form.by")} {product.seller?.name}
											</div>
										</div>
									</Link>
								))}
							</div>

							{/* Show More Button */}
							{pagination.totalProducts > products.length && (
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
				</main>
			</div>
		</div>
	);
};

export default Products;
