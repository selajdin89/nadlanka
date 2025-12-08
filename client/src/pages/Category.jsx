import React, { useState, useEffect } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";
import axios from "axios";
import {
	translateCategory,
	translateCondition,
} from "../utils/productTranslations";
import ProductImageSlider from "../components/ProductImageSlider";
import FavoriteButton from "../components/FavoriteButton";
import {
	Smartphone,
	Car,
	Home,
	Armchair,
	Shirt,
	Wrench,
	Gamepad2,
	BookOpen,
	TreePine,
	Package,
} from "lucide-react";
import "./Category.scss";

const Category = () => {
	const { categorySlug } = useParams();
	const { t } = useLanguage();
	const [searchParams] = useSearchParams();
	const [products, setProducts] = useState([]);
	const [loading, setLoading] = useState(true);
	const [pagination, setPagination] = useState({});
	const [filters, setFilters] = useState({
		condition: searchParams.get("condition") || "",
		minPrice: searchParams.get("minPrice") || "",
		maxPrice: searchParams.get("maxPrice") || "",
		location: searchParams.get("location") || "",
		sortBy: searchParams.get("sortBy") || "createdAt",
		sortOrder: searchParams.get("sortOrder") || "desc",
		page: searchParams.get("page") || "1",
	});

	// Category configurations with professional icons
	const categoryConfig = {
		electronics: {
			title: t("category.electronics.title"),
			description: t("category.electronics.description"),
			icon: Smartphone,
			subcategories: [
				{
					key: "smartphones",
					name: t("category.electronics.subcategories.smartphones"),
				},
				{
					key: "laptops",
					name: t("category.electronics.subcategories.laptops"),
				},
				{
					key: "tablets",
					name: t("category.electronics.subcategories.tablets"),
				},
				{
					key: "headphones",
					name: t("category.electronics.subcategories.headphones"),
				},
				{ key: "gaming", name: t("category.electronics.subcategories.gaming") },
			],
			popularSearches: ["iPhone", "Samsung", "MacBook", "iPad", "AirPods"],
		},
		cars: {
			title: t("category.cars.title"),
			description: t("category.cars.description"),
			icon: Car,
			subcategories: [
				{ key: "cars", name: t("category.cars.subcategories.cars") },
				{
					key: "motorcycles",
					name: t("category.cars.subcategories.motorcycles"),
				},
				{ key: "trucks", name: t("category.cars.subcategories.trucks") },
				{ key: "parts", name: t("category.cars.subcategories.parts") },
				{
					key: "accessories",
					name: t("category.cars.subcategories.accessories"),
				},
			],
			popularSearches: ["BMW", "Mercedes", "Toyota", "Honda", "Audi"],
		},
		"real-estate": {
			title: t("category.realEstate.title"),
			description: t("category.realEstate.description"),
			icon: Home,
			subcategories: [
				{
					key: "apartments",
					name: t("category.realEstate.subcategories.apartments"),
				},
				{ key: "houses", name: t("category.realEstate.subcategories.houses") },
				{
					key: "commercial",
					name: t("category.realEstate.subcategories.commercial"),
				},
				{ key: "land", name: t("category.realEstate.subcategories.land") },
				{
					key: "rentals",
					name: t("category.realEstate.subcategories.rentals"),
				},
			],
			popularSearches: ["Apartment", "House", "Studio", "2-bedroom", "Center"],
		},
		furniture: {
			title: t("category.furniture.title"),
			description: t("category.furniture.description"),
			icon: Armchair,
			subcategories: [
				{
					key: "livingRoom",
					name: t("category.furniture.subcategories.livingRoom"),
				},
				{ key: "bedroom", name: t("category.furniture.subcategories.bedroom") },
				{ key: "kitchen", name: t("category.furniture.subcategories.kitchen") },
				{ key: "office", name: t("category.furniture.subcategories.office") },
				{ key: "outdoor", name: t("category.furniture.subcategories.outdoor") },
			],
			popularSearches: ["Sofa", "Bed", "Table", "Chair", "Wardrobe"],
		},
		fashion: {
			title: t("category.fashion.title"),
			description: t("category.fashion.description"),
			icon: Shirt,
			subcategories: [
				{ key: "mens", name: t("category.fashion.subcategories.mens") },
				{ key: "womens", name: t("category.fashion.subcategories.womens") },
				{ key: "kids", name: t("category.fashion.subcategories.kids") },
				{ key: "shoes", name: t("category.fashion.subcategories.shoes") },
				{
					key: "accessories",
					name: t("category.fashion.subcategories.accessories"),
				},
			],
			popularSearches: ["Nike", "Adidas", "Jacket", "Dress", "Sneakers"],
		},
		services: {
			title: t("category.services.title"),
			description: t("category.services.description"),
			icon: Wrench,
			subcategories: [
				{
					key: "photography",
					name: t("category.services.subcategories.photography"),
				},
				{
					key: "tutoring",
					name: t("category.services.subcategories.tutoring"),
				},
				{
					key: "cleaning",
					name: t("category.services.subcategories.cleaning"),
				},
				{ key: "repair", name: t("category.services.subcategories.repair") },
				{
					key: "delivery",
					name: t("category.services.subcategories.delivery"),
				},
			],
			popularSearches: [
				"Photography",
				"Tutoring",
				"Cleaning",
				"Repair",
				"Delivery",
			],
		},
		sports: {
			title: t("category.sports.title"),
			description: t("category.sports.description"),
			icon: Gamepad2,
			subcategories: [
				{ key: "fitness", name: t("category.sports.subcategories.fitness") },
				{ key: "outdoor", name: t("category.sports.subcategories.outdoor") },
				{
					key: "teamSports",
					name: t("category.sports.subcategories.teamSports"),
				},
				{
					key: "waterSports",
					name: t("category.sports.subcategories.waterSports"),
				},
				{
					key: "winterSports",
					name: t("category.sports.subcategories.winterSports"),
				},
			],
			popularSearches: ["Bike", "Gym", "Football", "Tennis", "Swimming"],
		},
		books: {
			title: t("category.books.title"),
			description: t("category.books.description"),
			icon: BookOpen,
			subcategories: [
				{ key: "textbooks", name: t("category.books.subcategories.textbooks") },
				{ key: "novels", name: t("category.books.subcategories.novels") },
				{ key: "childrens", name: t("category.books.subcategories.childrens") },
				{ key: "academic", name: t("category.books.subcategories.academic") },
				{ key: "language", name: t("category.books.subcategories.language") },
			],
			popularSearches: ["Textbook", "Novel", "English", "Math", "Science"],
		},
		"home-garden": {
			title: t("category.homeGarden.title"),
			description: t("category.homeGarden.description"),
			icon: TreePine,
			subcategories: [
				{
					key: "appliances",
					name: t("category.homeGarden.subcategories.appliances"),
				},
				{
					key: "gardenTools",
					name: t("category.homeGarden.subcategories.gardenTools"),
				},
				{
					key: "kitchen",
					name: t("category.homeGarden.subcategories.kitchen"),
				},
				{
					key: "bathroom",
					name: t("category.homeGarden.subcategories.bathroom"),
				},
				{ key: "diy", name: t("category.homeGarden.subcategories.diy") },
			],
			popularSearches: [
				"Refrigerator",
				"Washing Machine",
				"Garden",
				"Tools",
				"Kitchen",
			],
		},
	};

	const currentCategory = categoryConfig[categorySlug] || {
		title:
			categorySlug?.charAt(0).toUpperCase() + categorySlug?.slice(1) ||
			t("common.category"),
		description: `Browse ${categorySlug} products and listings`,
		icon: Smartphone, // Default icon for unknown categories
		subcategories: [],
		popularSearches: [],
	};

	useEffect(() => {
		fetchProducts();
	}, [categorySlug, searchParams]);

	const fetchProducts = async () => {
		try {
			setLoading(true);
			const params = new URLSearchParams();

			// Map URL slug to database category value
			const slugToCategoryMap = {
				electronics: "Electronics",
				furniture: "Furniture",
				cars: "Cars",
				"real-estate": "Real Estate",
				fashion: "Fashion",
				books: "Books",
				sports: "Sports",
				"home-garden": "Home & Garden",
				services: "Services",
				other: "Other",
			};

			// Set category filter
			const categoryValue = slugToCategoryMap[categorySlug] || categorySlug;
			params.append("category", categoryValue);

			// Add other filters
			Object.entries(filters).forEach(([key, value]) => {
				if (value) params.append(key, value);
			});

			const response = await axios.get(`/api/products?${params.toString()}`);
			setProducts(response.data.products);
			setPagination(response.data.pagination);
		} catch (error) {
			console.error("Error fetching products:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleFilterChange = (key, value) => {
		const newFilters = { ...filters, [key]: value, page: "1" };
		setFilters(newFilters);

		// Update URL parameters
		const newParams = new URLSearchParams();
		Object.entries(newFilters).forEach(([k, v]) => {
			if (v) newParams.set(k, v);
		});
		window.history.replaceState({}, "", `?${newParams.toString()}`);
	};

	const handlePageChange = (newPage) => {
		const newFilters = { ...filters, page: newPage.toString() };
		setFilters(newFilters);

		const newParams = new URLSearchParams();
		Object.entries(newFilters).forEach(([k, v]) => {
			if (v) newParams.set(k, v);
		});
		window.history.replaceState({}, "", `?${newParams.toString()}`);
	};

	const formatPrice = (price, currency = "MKD") => {
		return new Intl.NumberFormat("mk-MK", {
			style: "currency",
			currency: currency,
		}).format(price);
	};

	const clearFilters = () => {
		setFilters({
			condition: "",
			minPrice: "",
			maxPrice: "",
			location: "",
			sortBy: "createdAt",
			sortOrder: "desc",
			page: "1",
		});
		window.history.replaceState({}, "", window.location.pathname);
	};

	if (loading) {
		return (
			<div className="category-container">
				<div className="loading">
					<div className="spinner"></div>
					<p>{t("common.loading") || "Loading..."}</p>
				</div>
			</div>
		);
	}

	return (
		<div className="category-container">
			{/* Hero Section */}
			<div className="category-hero">
				<div className="hero-content">
					<div className="category-icon">
						<currentCategory.icon size={48} />
					</div>
					<h1>{currentCategory.title}</h1>
					<p>{currentCategory.description}</p>
					<div className="category-stats">
						<span className="stat">
							{products.length}{" "}
							{products.length === 1
								? t("category.itemAvailable")
								: t("category.itemsAvailable")}
						</span>
					</div>
				</div>
			</div>

			<div className="category-layout">
				{/* Sidebar */}
				<aside className="category-sidebar">
					<div className="sidebar-section">
						<h3>{t("category.subcategories")}</h3>
						<div className="subcategories">
							{currentCategory.subcategories.map((subcat) => (
								<Link
									key={subcat.key}
									to={`/products?category=${categorySlug}&subcategory=${subcat.key}`}
									className="subcategory-link"
								>
									{subcat.name}
								</Link>
							))}
						</div>
					</div>

					<div className="sidebar-section">
						<h3>{t("category.popularSearches")}</h3>
						<div className="popular-searches">
							{currentCategory.popularSearches.map((search) => (
								<Link
									key={search}
									to={`/products?category=${categorySlug}&search=${search}`}
									className="search-link"
								>
									{search}
								</Link>
							))}
						</div>
					</div>

					<div className="sidebar-section">
						<h3>{t("category.filters")}</h3>
						<div className="filter-group">
							<label>{t("category.condition")}</label>
							<select
								value={filters.condition}
								onChange={(e) =>
									handleFilterChange("condition", e.target.value)
								}
							>
								<option value="">{t("category.allConditions")}</option>
								<option value="new">{t("category.new")}</option>
								<option value="like_new">{t("category.likeNew")}</option>
								<option value="good">{t("category.good")}</option>
								<option value="fair">{t("category.fair")}</option>
							</select>
						</div>

						<div className="filter-group">
							<label>{t("category.priceRange")}</label>
							<div className="price-inputs">
								<input
									type="number"
									placeholder={t("category.minPrice")}
									value={filters.minPrice}
									onChange={(e) =>
										handleFilterChange("minPrice", e.target.value)
									}
								/>
								<span>-</span>
								<input
									type="number"
									placeholder={t("category.maxPrice")}
									value={filters.maxPrice}
									onChange={(e) =>
										handleFilterChange("maxPrice", e.target.value)
									}
								/>
							</div>
						</div>

						<div className="filter-group">
							<label>{t("category.location")}</label>
							<input
								type="text"
								placeholder={t("category.enterLocation")}
								value={filters.location}
								onChange={(e) => handleFilterChange("location", e.target.value)}
							/>
						</div>

						<div className="filter-group">
							<label>{t("category.sortBy")}</label>
							<select
								value={`${filters.sortBy}-${filters.sortOrder}`}
								onChange={(e) => {
									const [sortBy, sortOrder] = e.target.value.split("-");
									handleFilterChange("sortBy", sortBy);
									handleFilterChange("sortOrder", sortOrder);
								}}
							>
								<option value="createdAt-desc">
									{t("category.newestFirst")}
								</option>
								<option value="createdAt-asc">
									{t("category.oldestFirst")}
								</option>
								<option value="price-asc">
									{t("category.priceLowToHigh")}
								</option>
								<option value="price-desc">
									{t("category.priceHighToLow")}
								</option>
								<option value="views-desc">{t("category.mostPopular")}</option>
							</select>
						</div>

						<button onClick={clearFilters} className="clear-filters-btn">
							{t("category.clearFilters")}
						</button>
					</div>
				</aside>

				{/* Main Content */}
				<main className="category-main">
					{products.length === 0 ? (
						<div className="empty-state">
							<div className="empty-icon">
								<Package size={64} />
							</div>
							<h3>{t("category.noProductsFound")}</h3>
							<p>
								{t("category.noProductsDesc")}{" "}
								<Link to="/create-product">{t("category.createListing")}</Link>
							</p>
						</div>
					) : (
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
												e.target.src = "/placeholder-image.jpg";
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
											<span
												className={`condition condition-${product.condition}`}
											>
												{translateCondition(product.condition, t)}
											</span>
											<span className="views">
												👁 {product.views} {t("common.views")}
											</span>
										</div>
									</div>
								</Link>
							))}
						</div>
					)}

					{/* Pagination */}
					{pagination.totalPages > 1 && (
						<div className="pagination">
							<button
								onClick={() => handlePageChange(pagination.currentPage - 1)}
								disabled={pagination.currentPage === 1}
								className="pagination-btn"
							>
								{t("category.previous")}
							</button>
							<span className="pagination-info">
								{t("category.page")} {pagination.currentPage} {t("category.of")}{" "}
								{pagination.totalPages}
							</span>
							<button
								onClick={() => handlePageChange(pagination.currentPage + 1)}
								disabled={pagination.currentPage === pagination.totalPages}
								className="pagination-btn"
							>
								{t("category.next")}
							</button>
						</div>
					)}
				</main>
			</div>

			{/* Call to Action */}
			<div className="category-cta">
				<div className="cta-content">
					<h2>
						{t("category.wantToSell")} {currentCategory.title}?
					</h2>
					<p>{t("category.joinSellers")}</p>
					<Link to="/create-product" className="cta-btn">
						{t("category.startSelling")}
					</Link>
				</div>
			</div>
		</div>
	);
};

export default Category;
