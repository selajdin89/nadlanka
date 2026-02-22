import React, { useState, useEffect, useRef } from "react";
import {
	Link,
	useParams,
	useSearchParams,
	useNavigate,
} from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";
import axios from "axios";
import {
	translateCategory,
	translateCondition,
	getCategoryTranslationKey,
} from "../utils/productTranslations";
import {
	categoryToSlug,
	getSubcategories,
	getNestedSubcategories,
	hasNestedSubcategories,
	hasSubcategories,
} from "../utils/categoryConfig";
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
	Menu,
	MapPin,
} from "lucide-react";
import CustomSelect from "../components/CustomSelect";
import FilterField from "../components/FilterField";
import SearchBar from "../components/SearchBar";
import { macedonianCities } from "../utils/macedonianCities";
import {
	carBrands,
	getModelsForBrand,
	getBrandOptions,
	getModelOptions,
	getFuelTypeOptions,
	getTransmissionOptions,
	getPowerKWFilterOptions,
	generateYearOptions,
	generateMileageOptions,
} from "../utils/carProperties";
import {
	generateBedroomOptions,
	generateAreaFilterOptions,
	generateFloorOptions,
	getFloorLabel,
	getHeatingTypeOptions,
	getApartmentTypeOptions,
	getEquipmentOptions,
	getApartmentConditionOptions,
	getHouseVillaConditionOptions,
} from "../utils/realEstateProperties";
import "./Category.scss";
import "../pages/Home.scss";

const Category = () => {
	const { categorySlug } = useParams();
	const { t } = useLanguage();
	const navigate = useNavigate();
	const [searchParams, setSearchParams] = useSearchParams();
	const [products, setProducts] = useState([]);
	const [loading, setLoading] = useState(true);
	const [pagination, setPagination] = useState({});
	// Initialize searchQuery from URL params or empty string
	const [searchQuery, setSearchQuery] = useState(
		searchParams.get("search") || ""
	);
	const searchInputRef = useRef(null); // Ref to access input value directly
	const [selectedCategory, setSelectedCategory] = useState(null);
	const [
		selectedCategoryForSubcategories,
		setSelectedCategoryForSubcategories,
	] = useState(null);
	const [selectedSubcategoryForNested, setSelectedSubcategoryForNested] =
		useState(null);
	const [categorySlideDirection, setCategorySlideDirection] = useState("");
	const [selectedLocation, setSelectedLocation] = useState(
		searchParams.get("location") || ""
	);
	const isLocationFromUserRef = useRef(false);
	const [categories, setCategories] = useState([]);
	const [filters, setFilters] = useState({
		condition: searchParams.get("condition") || "",
		minPrice: searchParams.get("minPrice") || "",
		maxPrice: searchParams.get("maxPrice") || "",
		location: searchParams.get("location") || "",
		sortBy: searchParams.get("sortBy") || "createdAt",
		sortOrder: searchParams.get("sortOrder") || "desc",
		page: searchParams.get("page") || "1",
		// Vehicle-specific filters
		brand: searchParams.get("brand") || "",
		model: searchParams.get("model") || "",
		fuelType: searchParams.get("fuelType") || "",
		transmission: searchParams.get("transmission") || "",
		minYear: searchParams.get("minYear") || "",
		maxYear: searchParams.get("maxYear") || "",
		minPowerKW: searchParams.get("minPowerKW") || "",
		maxPowerKW: searchParams.get("maxPowerKW") || "",
		minMileage: searchParams.get("minMileage") || "",
		maxMileage: searchParams.get("maxMileage") || "",
		// Real Estate apartment-specific filters
		minBedrooms: searchParams.get("minBedrooms") || "",
		maxBedrooms: searchParams.get("maxBedrooms") || "",
		minArea: searchParams.get("minArea") || "",
		maxArea: searchParams.get("maxArea") || "",
		minFloor: searchParams.get("minFloor") || "",
		maxFloor: searchParams.get("maxFloor") || "",
		heating: searchParams.get("heating") || "",
		apartmentType: searchParams.get("apartmentType") || "",
		equipment: searchParams.get("equipment") || "",
	});

	const [tempFilters, setTempFilters] = useState(filters);

	// Use shared utilities for year and mileage options
	const yearOptions = generateYearOptions();
	const mileageOptionsForFilters = generateMileageOptions();
	const mileageOptions = mileageOptionsForFilters.map((opt) =>
		Number(opt.value)
	);

	// Use shared utilities for real estate options
	const bedroomOptions = generateBedroomOptions();
	const areaFilterOptions = generateAreaFilterOptions();
	const floorOptions = generateFloorOptions();

	// Generate price options (reasonable range in EUR)
	const priceOptions = [
		0, 500, 1000, 2000, 3000, 5000, 7000, 10000, 15000, 20000, 25000, 30000,
		40000, 50000, 75000, 100000, 150000, 200000, 300000, 500000,
	];

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
			title: t("category.vehicles.title") || t("category.cars.title"),
			description:
				t("category.vehicles.description") || t("category.cars.description"),
			icon: Car,
			subcategories: [
				{
					key: "cars",
					name:
						t("category.vehicles.subcategories.cars") ||
						t("category.cars.subcategories.cars"),
				},
				{
					key: "motorcycles",
					name:
						t("category.vehicles.subcategories.motorcycles") ||
						t("category.cars.subcategories.motorcycles"),
				},
				{
					key: "trucks",
					name:
						t("category.vehicles.subcategories.trucks") ||
						t("category.cars.subcategories.trucks"),
				},
				{
					key: "agricultural-vehicles",
					name:
						t("category.vehicles.subcategories.agriculturalVehicles") ||
						"Agricultural Vehicles",
				},
				{
					key: "parts",
					name:
						t("category.vehicles.subcategories.parts") ||
						t("category.cars.subcategories.parts"),
				},
				{
					key: "accessories",
					name:
						t("category.vehicles.subcategories.accessories") ||
						t("category.cars.subcategories.accessories"),
				},
			],
			popularSearches: ["BMW", "Mercedes", "Toyota", "Honda", "Audi"],
		},
		vehicles: {
			title: t("category.vehicles.title") || t("category.cars.title"),
			description:
				t("category.vehicles.description") || t("category.cars.description"),
			icon: Car,
			subcategories: [
				{
					key: "cars",
					name:
						t("category.vehicles.subcategories.cars") ||
						t("category.cars.subcategories.cars"),
				},
				{
					key: "motorcycles",
					name:
						t("category.vehicles.subcategories.motorcycles") ||
						t("category.cars.subcategories.motorcycles"),
				},
				{
					key: "trucks",
					name:
						t("category.vehicles.subcategories.trucks") ||
						t("category.cars.subcategories.trucks"),
				},
				{
					key: "agricultural-vehicles",
					name:
						t("category.vehicles.subcategories.agriculturalVehicles") ||
						"Agricultural Vehicles",
				},
				{
					key: "parts",
					name:
						t("category.vehicles.subcategories.parts") ||
						t("category.cars.subcategories.parts"),
				},
				{
					key: "accessories",
					name:
						t("category.vehicles.subcategories.accessories") ||
						t("category.cars.subcategories.accessories"),
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
					key: "houses-villas",
					name:
						t("category.realEstate.subcategories.housesVillas") ||
						"Куќи / Вили",
				},
				{
					key: "apartments",
					name: t("category.realEstate.subcategories.apartments") || "Станови",
				},
				{
					key: "rooms",
					name: t("category.realEstate.subcategories.rooms") || "Соби",
				},
				{
					key: "weekend-houses",
					name:
						t("category.realEstate.subcategories.weekendHouses") ||
						"Викенд куќи",
				},
				{
					key: "shops",
					name: t("category.realEstate.subcategories.shops") || "Дуќани",
				},
				{
					key: "business-space",
					name:
						t("category.realEstate.subcategories.businessSpace") ||
						"Деловен простор",
				},
				{
					key: "roommate-room",
					name:
						t("category.realEstate.subcategories.roommateRoom") || "Цимер / ка",
				},
				{
					key: "garages",
					name: t("category.realEstate.subcategories.garages") || "Гаражи",
				},
				{
					key: "plots-fields",
					name:
						t("category.realEstate.subcategories.plotsFields") ||
						"Плацеви и Ниви",
				},
				{
					key: "warehouses",
					name: t("category.realEstate.subcategories.warehouses") || "Магацини",
				},
				{
					key: "barracks-kiosks-shops",
					name:
						t("category.realEstate.subcategories.barracksKiosksShops") ||
						"Бараки, киосци, трафики",
				},
				{
					key: "new-construction",
					name:
						t("category.realEstate.subcategories.newConstruction") ||
						"Новоградба",
				},
				{
					key: "abroad",
					name: t("category.realEstate.subcategories.abroad") || "Во странство",
				},
				{
					key: "other",
					name: t("category.realEstate.subcategories.other") || "Останато",
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

	// Check if current category is Vehicles
	const isVehiclesCategory =
		categorySlug === "vehicles" || categorySlug === "cars";

	// Check if current category is Real Estate
	const isRealEstateCategory = categorySlug === "real-estate";

	// Get current subcategory from URL
	const currentSubcategory = searchParams.get("subcategory");

	// Show filters only for "cars" subcategory
	const showCarFilters = isVehiclesCategory && currentSubcategory === "cars";

	// Show filters only for "apartments" subcategory
	const showApartmentFilters =
		isRealEstateCategory && currentSubcategory === "apartments";

	// Show filters only for "weekend-houses" subcategory
	const showWeekendHouseFilters =
		isRealEstateCategory && currentSubcategory === "weekend-houses";

	// Show filters for "houses-villas" subcategory (same as apartments)
	const showHousesVillasFilters =
		isRealEstateCategory && currentSubcategory === "houses-villas";

	// Show filters for "rooms" subcategory (same as apartments)
	const showRoomsFilters =
		isRealEstateCategory && currentSubcategory === "rooms";

	// Show basic filters (area and price) for other Real Estate subcategories
	const showBasicRealEstateFilters =
		isRealEstateCategory &&
		!showApartmentFilters &&
		!showWeekendHouseFilters &&
		!showHousesVillasFilters &&
		!showRoomsFilters &&
		currentSubcategory &&
		currentSubcategory !== "all-real-estate";

	// Fetch categories on mount
	useEffect(() => {
		const fetchCategories = async () => {
			try {
				const response = await axios.get("/api/categories");
				setCategories(response.data);
			} catch (error) {
				console.error("Error fetching categories:", error);
			}
		};
		fetchCategories();
	}, []);

	// Set selected category based on current category slug
	useEffect(() => {
		const slugToCategoryMap = {
			electronics: "Electronics",
			furniture: "Furniture",
			cars: "Vehicles",
			vehicles: "Vehicles",
			"real-estate": "Real Estate",
			fashion: "Fashion",
			books: "Books",
			sports: "Sports",
			"home-garden": "Home & Garden",
			services: "Services",
			other: "Other",
		};
		const categoryValue = slugToCategoryMap[categorySlug] || categorySlug;

		// Always set the selected category so it displays in the dropdown
		if (categoryValue) {
			setSelectedCategory(categoryValue);

			// When on a subcategory page, don't auto-show subcategories view
			// User can click the dropdown to see subcategories
			setSelectedCategoryForSubcategories(null);
		} else {
			setSelectedCategory(null);
			setSelectedCategoryForSubcategories(null);
		}
	}, [categorySlug, currentSubcategory]);

	// Handle search - update URL params
	const handleSearch = (e) => {
		if (e) e.preventDefault();
		const query = searchQuery.trim();

		if (query) {
			// Update URL with search query and location
			const newParams = new URLSearchParams(searchParams);
			newParams.set("search", query);
			if (selectedLocation) {
				newParams.set("location", selectedLocation);
			}
			newParams.set("page", "1");
			setSearchParams(newParams);
		}

		// Update filters
		setFilters((prev) => ({ ...prev, location: selectedLocation, page: "1" }));
	};

	// Handle location change - update URL params and trigger fetch
	const handleLocationChange = (e) => {
		const location = e.target.value;
		setSelectedLocation(location);

		// Get current search query - prefer input ref (always current) over state
		const inputValue = searchInputRef.current?.value?.trim() || "";
		const currentSearch = inputValue || searchQuery.trim();
		const newParams = new URLSearchParams(searchParams);

		// Update location in URL
		if (location) {
			newParams.set("location", location);
		} else {
			newParams.delete("location");
		}

		// Preserve search query if it exists (from input field)
		if (currentSearch) {
			newParams.set("search", currentSearch);
		}

		// Update page to 1 when location changes
		newParams.set("page", "1");

		// Update URL which will trigger the sync useEffect and fetch
		setSearchParams(newParams);

		// Also update filters for immediate use
		setFilters((prev) => ({ ...prev, location: location, page: "1" }));
	};

	const fetchProducts = async () => {
		try {
			setLoading(true);
			const params = new URLSearchParams();

			// Map URL slug to database category value
			const slugToCategoryMap = {
				electronics: "Electronics",
				furniture: "Furniture",
				cars: "Vehicles", // Backward compatibility - map old "cars" slug to Vehicles
				vehicles: "Vehicles",
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

			// Add subcategory filter if present in URL
			const subcategory = searchParams.get("subcategory");
			if (subcategory) {
				params.append("subcategory", subcategory);
			}

			// Get search query from URL params (source of truth)
			const searchFromUrl = searchParams.get("search") || "";
			if (searchFromUrl) {
				params.append("search", searchFromUrl);
			}

			// Add other filters - filters.location is already updated by handleLocationChange
			// Note: location comes from filters.location which is updated in handleLocationChange
			Object.entries(filters).forEach(([key, value]) => {
				if (value) params.append(key, value);
			});

			// Debug logging
			console.log("[DEBUG Category] Filters object:", filters);
			console.log("[DEBUG Category] Brand filter value:", filters.brand);
			console.log(
				"[DEBUG Category] API request URL:",
				`/api/products?${params.toString()}`
			);

			const response = await axios.get(`/api/products?${params.toString()}`);
			console.log(
				"[DEBUG Category] Response products count:",
				response.data.products.length
			);
			if (response.data.products.length > 0) {
				console.log(
					"[DEBUG Category] First product brand:",
					response.data.products[0].brand
				);
			}
			setProducts(response.data.products);
			setPagination(response.data.pagination);
		} catch (error) {
			console.error("Error fetching products:", error);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchProducts();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [
		categorySlug,
		searchParams.toString(),
		filters.condition,
		filters.minPrice,
		filters.maxPrice,
		filters.sortBy,
		filters.sortOrder,
		filters.page,
		filters.brand,
		filters.model,
		filters.fuelType,
		filters.transmission,
		filters.minYear,
		filters.maxYear,
		filters.minPowerKW,
		filters.maxPowerKW,
		filters.minMileage,
		filters.maxMileage,
		filters.location, // Location changes trigger fetch
		// Real Estate apartment filters
		filters.minBedrooms,
		filters.maxBedrooms,
		filters.minArea,
		filters.maxArea,
		filters.minFloor,
		filters.maxFloor,
		filters.heating,
		filters.apartmentType,
		filters.equipment,
		// Note: search query comes from URL params via searchParams.toString(), so it's already included in deps
	]);

	const handleFilterChange = (key, value) => {
		const newTempFilters = { ...tempFilters, [key]: value };
		setTempFilters(newTempFilters);
	};

	const applyFilters = () => {
		const newFilters = { ...tempFilters, page: "1" };
		setFilters(newFilters);

		// Update URL parameters
		const newParams = new URLSearchParams();
		Object.entries(newFilters).forEach(([k, v]) => {
			if (v && k !== "page") newParams.set(k, v);
		});
		if (newFilters.page !== "1") newParams.set("page", newFilters.page);
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
		const clearedFilters = {
			condition: "",
			minPrice: "",
			maxPrice: "",
			location: "",
			sortBy: "createdAt",
			sortOrder: "desc",
			page: "1",
			// Vehicle-specific filters
			brand: "",
			model: "",
			fuelType: "",
			transmission: "",
			minYear: "",
			maxYear: "",
			minPowerKW: "",
			maxPowerKW: "",
			minMileage: "",
			maxMileage: "",
			// Real Estate apartment filters
			minBedrooms: "",
			maxBedrooms: "",
			minArea: "",
			maxArea: "",
			minFloor: "",
			maxFloor: "",
			heating: "",
			apartmentType: "",
			equipment: "",
		};
		setTempFilters(clearedFilters);
		setFilters(clearedFilters);
		window.history.replaceState({}, "", window.location.pathname);
	};

	// Sync tempFilters with URL params when component mounts or URL changes
	useEffect(() => {
		const urlFilters = {
			condition: searchParams.get("condition") || "",
			minPrice: searchParams.get("minPrice") || "",
			maxPrice: searchParams.get("maxPrice") || "",
			location: searchParams.get("location") || "",
			sortBy: searchParams.get("sortBy") || "createdAt",
			sortOrder: searchParams.get("sortOrder") || "desc",
			page: searchParams.get("page") || "1",
			brand: searchParams.get("brand") || "",
			model: searchParams.get("model") || "",
			fuelType: searchParams.get("fuelType") || "",
			transmission: searchParams.get("transmission") || "",
			minYear: searchParams.get("minYear") || "",
			maxYear: searchParams.get("maxYear") || "",
			minPowerKW: searchParams.get("minPowerKW") || "",
			maxPowerKW: searchParams.get("maxPowerKW") || "",
			minMileage: searchParams.get("minMileage") || "",
			maxMileage: searchParams.get("maxMileage") || "",
			// Real Estate apartment filters
			minBedrooms: searchParams.get("minBedrooms") || "",
			maxBedrooms: searchParams.get("maxBedrooms") || "",
			minArea: searchParams.get("minArea") || "",
			maxArea: searchParams.get("maxArea") || "",
			minFloor: searchParams.get("minFloor") || "",
			maxFloor: searchParams.get("maxFloor") || "",
			heating: searchParams.get("heating") || "",
			apartmentType: searchParams.get("apartmentType") || "",
			equipment: searchParams.get("equipment") || "",
		};

		setFilters(urlFilters);
		setTempFilters(urlFilters);
		setSelectedLocation(urlFilters.location);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [searchParams.toString()]);

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
			{/* Breadcrumb Navigation */}
			<nav className="breadcrumb-nav">
				<Link to="/" className="breadcrumb-item">
					{t("nav.home") || "Home"}
				</Link>
				<span className="breadcrumb-separator">/</span>
				<Link
					to={`/category/${categorySlug}`}
					className={`breadcrumb-item ${!currentSubcategory ? "active" : ""}`}
				>
					{currentCategory.title}
				</Link>
				{currentSubcategory && (
					<>
						<span className="breadcrumb-separator">/</span>
						<span className="breadcrumb-item active">
							{currentCategory.subcategories.find(
								(subcat) => subcat.key === currentSubcategory
							)?.name || currentSubcategory}
						</span>
					</>
				)}
			</nav>

			{/* Search Bar and Location Filter */}
			<SearchBar
				currentCategory={selectedCategory}
				currentSubcategory={currentSubcategory}
				onCategoryChange={(category, subcategory, nested) => {
					// This callback is for external use if needed
				}}
				onSearch={(query, location) => {
					handleSearch(null); // Use the existing handleSearch
				}}
				onLocationChange={(location, currentSearch) => {
					handleLocationChange({ target: { value: location } });
				}}
			/>

			{/* Filters Section - Top Grid Layout */}
			{showCarFilters && (
				<div className="category-filters-section">
					<div className="filters-grid">
						{/* Left Column */}
						<div className="filters-column">
							<div className="filter-item">
								<FilterField
									type="single"
									label={t("category.vehicles.brand") || "Марка"}
									value={tempFilters.brand}
									onChange={(e) => {
										const newTempFilters = {
											...tempFilters,
											brand: e.target.value,
											model: "",
										};
										setTempFilters(newTempFilters);
									}}
									options={getBrandOptions(t, true)}
									searchable
								/>
							</div>

							<div className="filter-item">
								<FilterField
									type="single"
									label={
										tempFilters.brand
											? t("category.vehicles.model") || "Модел"
											: t("category.vehicles.selectBrandFirst") ||
											  "Изберете марка прво"
									}
									value={tempFilters.model}
									onChange={(e) => handleFilterChange("model", e.target.value)}
									options={getModelOptions(tempFilters.brand, t, true)}
									searchable
									disabled={!tempFilters.brand}
								/>
							</div>

							<div className="filter-item">
								<FilterField
									type="single"
									label={t("category.vehicles.fuelType") || "Тип на Гориво"}
									value={tempFilters.fuelType}
									onChange={(e) =>
										handleFilterChange("fuelType", e.target.value)
									}
									options={getFuelTypeOptions(t)}
								/>
							</div>
						</div>

						{/* Middle Column */}
						<div className="filters-column">
							<div className="filter-item">
								<FilterField
									type="single"
									label={t("category.vehicles.transmission") || "Менувач"}
									value={tempFilters.transmission}
									onChange={(e) =>
										handleFilterChange("transmission", e.target.value)
									}
									options={getTransmissionOptions(t)}
								/>
							</div>
							<div className="filter-item">
								<FilterField
									type="range"
									label={t("category.priceRange") || "Цена (€)"}
									minValue={tempFilters.minPrice || ""}
									maxValue={tempFilters.maxPrice || ""}
									onMinChange={(e) =>
										handleFilterChange("minPrice", e.target.value)
									}
									onMaxChange={(e) =>
										handleFilterChange("maxPrice", e.target.value)
									}
									options={priceOptions.map((price) => ({
										value: price.toString(),
										label: price.toLocaleString() + " €",
									}))}
								/>
							</div>

							<div className="filter-item">
								<FilterField
									type="range"
									label={t("category.vehicles.yearRange") || "Година"}
									minValue={tempFilters.minYear || ""}
									maxValue={tempFilters.maxYear || ""}
									onMinChange={(e) =>
										handleFilterChange("minYear", e.target.value)
									}
									onMaxChange={(e) =>
										handleFilterChange("maxYear", e.target.value)
									}
									options={yearOptions.map((year) => ({
										value: year.toString(),
										label: year.toString(),
									}))}
								/>
							</div>
						</div>

						{/* Right Column */}
						<div className="filters-column">
							<div className="filter-item">
								<FilterField
									type="range"
									label={
										t("category.vehicles.mileageRange") || "Километража (km)"
									}
									minValue={tempFilters.minMileage || ""}
									maxValue={tempFilters.maxMileage || ""}
									onMinChange={(e) =>
										handleFilterChange("minMileage", e.target.value)
									}
									onMaxChange={(e) =>
										handleFilterChange("maxMileage", e.target.value)
									}
									options={mileageOptionsForFilters}
								/>
							</div>
							<div className="filter-item">
								<FilterField
									type="range"
									label={t("category.vehicles.powerRange") || "Моќност (kW)"}
									minValue={tempFilters.minPowerKW || ""}
									maxValue={tempFilters.maxPowerKW || ""}
									onMinChange={(e) =>
										handleFilterChange("minPowerKW", e.target.value)
									}
									onMaxChange={(e) =>
										handleFilterChange("maxPowerKW", e.target.value)
									}
									options={getPowerKWFilterOptions()}
									searchable
								/>
							</div>

							<div className="filter-item">
								<FilterField
									type="single"
									label={t("category.condition") || "Состојба"}
									value={tempFilters.condition}
									onChange={(e) =>
										handleFilterChange("condition", e.target.value)
									}
									options={[
										{ value: "New", label: t("conditions.new") || "New" },
										{ value: "Used", label: t("conditions.used") || "Used" },
									]}
								/>
							</div>
						</div>
					</div>
					<div className="filters-actions">
						<button onClick={clearFilters} className="filter-btn clear-btn">
							{t("category.clearFilters")}
						</button>
						<button onClick={applyFilters} className="filter-btn apply-btn">
							{t("category.applyFilters") || "Apply Filters"}
						</button>
					</div>
				</div>
			)}

			{/* Apartment Filters */}
			{showApartmentFilters && (
				<div className="category-filters-section">
					<div className="filters-grid filters-grid-horizontal">
						{/* Row 1: Range filters */}
						<div className="filter-item">
							<FilterField
								type="range"
								label={t("category.realEstate.bedrooms") || "Број на соби"}
								minValue={tempFilters.minBedrooms || ""}
								maxValue={tempFilters.maxBedrooms || ""}
								onMinChange={(e) =>
									handleFilterChange("minBedrooms", e.target.value)
								}
								onMaxChange={(e) =>
									handleFilterChange("maxBedrooms", e.target.value)
								}
								options={bedroomOptions.map((bedrooms) => ({
									value: bedrooms.toString(),
									label: bedrooms.toString(),
								}))}
							/>
						</div>
						<div className="filter-item">
							<FilterField
								type="range"
								label={t("category.realEstate.floor") || "Спрат"}
								minValue={tempFilters.minFloor || ""}
								maxValue={tempFilters.maxFloor || ""}
								onMinChange={(e) =>
									handleFilterChange("minFloor", e.target.value)
								}
								onMaxChange={(e) =>
									handleFilterChange("maxFloor", e.target.value)
								}
								options={floorOptions.map((floor) => ({
									value: floor.toString(),
									label: getFloorLabel(floor, t),
								}))}
							/>
						</div>
						<div className="filter-item">
							<FilterField
								type="range"
								label={t("category.realEstate.area") || "Квадратура (m²)"}
								minValue={tempFilters.minArea || ""}
								maxValue={tempFilters.maxArea || ""}
								onMinChange={(e) =>
									handleFilterChange("minArea", e.target.value)
								}
								onMaxChange={(e) =>
									handleFilterChange("maxArea", e.target.value)
								}
								options={areaFilterOptions}
							/>
						</div>
						<div className="filter-item">
							<FilterField
								type="range"
								label={t("category.priceRange") || "Цена (€)"}
								minValue={tempFilters.minPrice || ""}
								maxValue={tempFilters.maxPrice || ""}
								onMinChange={(e) =>
									handleFilterChange("minPrice", e.target.value)
								}
								onMaxChange={(e) =>
									handleFilterChange("maxPrice", e.target.value)
								}
								options={priceOptions.map((price) => ({
									value: price.toString(),
									label: price.toLocaleString() + " €",
								}))}
							/>
						</div>
						<div className="filter-item">
							<FilterField
								type="single"
								label={t("category.condition") || "Состојба"}
								value={tempFilters.condition}
								onChange={(e) =>
									handleFilterChange("condition", e.target.value)
								}
								options={getApartmentConditionOptions(t)}
							/>
						</div>

						{/* Row 2: Single select filters */}
						<div className="filter-item">
							<FilterField
								type="single"
								label={t("category.realEstate.equipment") || "Опрема"}
								value={tempFilters.equipment}
								onChange={(e) =>
									handleFilterChange("equipment", e.target.value)
								}
								options={getEquipmentOptions(t)}
							/>
						</div>
						<div className="filter-item">
							<FilterField
								type="single"
								label={t("category.realEstate.heating") || "Начин на греење"}
								value={tempFilters.heating}
								onChange={(e) => handleFilterChange("heating", e.target.value)}
								options={getHeatingTypeOptions(t)}
							/>
						</div>
						<div className="filter-item">
							<FilterField
								type="single"
								label={
									t("category.realEstate.apartmentType") || "Тип на станот"
								}
								value={tempFilters.apartmentType}
								onChange={(e) =>
									handleFilterChange("apartmentType", e.target.value)
								}
								options={getApartmentTypeOptions(t)}
							/>
						</div>
					</div>
					<div className="filters-actions">
						<button onClick={clearFilters} className="filter-btn clear-btn">
							{t("category.clearFilters")}
						</button>
						<button onClick={applyFilters} className="filter-btn apply-btn">
							{t("category.applyFilters") || "Apply Filters"}
						</button>
					</div>
				</div>
			)}

			{/* Houses/Villas Filters - No floor, no apartmentType, feminine condition forms */}
			{showHousesVillasFilters && (
				<div className="category-filters-section">
					<div className="filters-grid filters-grid-horizontal">
						{/* Row 1: Range filters */}
						<div className="filter-item">
							<FilterField
								type="range"
								label={t("category.realEstate.bedrooms") || "Број на соби"}
								minValue={tempFilters.minBedrooms || ""}
								maxValue={tempFilters.maxBedrooms || ""}
								onMinChange={(e) =>
									handleFilterChange("minBedrooms", e.target.value)
								}
								onMaxChange={(e) =>
									handleFilterChange("maxBedrooms", e.target.value)
								}
								options={bedroomOptions.map((bedrooms) => ({
									value: bedrooms.toString(),
									label: bedrooms.toString(),
								}))}
							/>
						</div>
						<div className="filter-item">
							<FilterField
								type="range"
								label={t("category.realEstate.area") || "Квадратура (m²)"}
								minValue={tempFilters.minArea || ""}
								maxValue={tempFilters.maxArea || ""}
								onMinChange={(e) =>
									handleFilterChange("minArea", e.target.value)
								}
								onMaxChange={(e) =>
									handleFilterChange("maxArea", e.target.value)
								}
								options={areaFilterOptions}
							/>
						</div>
						<div className="filter-item">
							<FilterField
								type="range"
								label={t("category.priceRange") || "Цена (€)"}
								minValue={tempFilters.minPrice || ""}
								maxValue={tempFilters.maxPrice || ""}
								onMinChange={(e) =>
									handleFilterChange("minPrice", e.target.value)
								}
								onMaxChange={(e) =>
									handleFilterChange("maxPrice", e.target.value)
								}
								options={priceOptions.map((price) => ({
									value: price.toString(),
									label: price.toLocaleString() + " €",
								}))}
							/>
						</div>
						<div className="filter-item">
							<FilterField
								type="single"
								label={t("category.condition") || "Состојба"}
								value={tempFilters.condition}
								onChange={(e) =>
									handleFilterChange("condition", e.target.value)
								}
								options={getHouseVillaConditionOptions(t)}
							/>
						</div>

						{/* Row 2: Single select filters */}
						<div className="filter-item">
							<FilterField
								type="single"
								label={t("category.realEstate.equipment") || "Опрема"}
								value={tempFilters.equipment}
								onChange={(e) =>
									handleFilterChange("equipment", e.target.value)
								}
								options={getEquipmentOptions(t)}
							/>
						</div>
						<div className="filter-item">
							<FilterField
								type="single"
								label={t("category.realEstate.heating") || "Начин на греење"}
								value={tempFilters.heating}
								onChange={(e) => handleFilterChange("heating", e.target.value)}
								options={getHeatingTypeOptions(t)}
							/>
						</div>
					</div>
					<div className="filters-actions">
						<button onClick={clearFilters} className="filter-btn clear-btn">
							{t("category.clearFilters")}
						</button>
						<button onClick={applyFilters} className="filter-btn apply-btn">
							{t("category.applyFilters") || "Apply Filters"}
						</button>
					</div>
				</div>
			)}

			{/* Rooms Filters - Same as apartments */}
			{showRoomsFilters && (
				<div className="category-filters-section">
					<div className="filters-grid filters-grid-horizontal">
						{/* Row 1: Range filters */}
						<div className="filter-item">
							<FilterField
								type="range"
								label={t("category.realEstate.bedrooms") || "Број на соби"}
								minValue={tempFilters.minBedrooms || ""}
								maxValue={tempFilters.maxBedrooms || ""}
								onMinChange={(e) =>
									handleFilterChange("minBedrooms", e.target.value)
								}
								onMaxChange={(e) =>
									handleFilterChange("maxBedrooms", e.target.value)
								}
								options={bedroomOptions.map((bedrooms) => ({
									value: bedrooms.toString(),
									label: bedrooms.toString(),
								}))}
							/>
						</div>
						<div className="filter-item">
							<FilterField
								type="range"
								label={t("category.realEstate.floor") || "Спрат"}
								minValue={tempFilters.minFloor || ""}
								maxValue={tempFilters.maxFloor || ""}
								onMinChange={(e) =>
									handleFilterChange("minFloor", e.target.value)
								}
								onMaxChange={(e) =>
									handleFilterChange("maxFloor", e.target.value)
								}
								options={floorOptions.map((floor) => ({
									value: floor.toString(),
									label: getFloorLabel(floor, t),
								}))}
							/>
						</div>
						<div className="filter-item">
							<FilterField
								type="range"
								label={t("category.realEstate.area") || "Квадратура (m²)"}
								minValue={tempFilters.minArea || ""}
								maxValue={tempFilters.maxArea || ""}
								onMinChange={(e) =>
									handleFilterChange("minArea", e.target.value)
								}
								onMaxChange={(e) =>
									handleFilterChange("maxArea", e.target.value)
								}
								options={areaFilterOptions}
							/>
						</div>
						<div className="filter-item">
							<FilterField
								type="range"
								label={t("category.priceRange") || "Цена (€)"}
								minValue={tempFilters.minPrice || ""}
								maxValue={tempFilters.maxPrice || ""}
								onMinChange={(e) =>
									handleFilterChange("minPrice", e.target.value)
								}
								onMaxChange={(e) =>
									handleFilterChange("maxPrice", e.target.value)
								}
								options={priceOptions.map((price) => ({
									value: price.toString(),
									label: price.toLocaleString() + " €",
								}))}
							/>
						</div>
						<div className="filter-item">
							<FilterField
								type="single"
								label={t("category.condition") || "Состојба"}
								value={tempFilters.condition}
								onChange={(e) =>
									handleFilterChange("condition", e.target.value)
								}
								options={getApartmentConditionOptions(t)}
							/>
						</div>

						{/* Row 2: Single select filters */}
						<div className="filter-item">
							<FilterField
								type="single"
								label={t("category.realEstate.equipment") || "Опрема"}
								value={tempFilters.equipment}
								onChange={(e) =>
									handleFilterChange("equipment", e.target.value)
								}
								options={getEquipmentOptions(t)}
							/>
						</div>
						<div className="filter-item">
							<FilterField
								type="single"
								label={t("category.realEstate.heating") || "Начин на греење"}
								value={tempFilters.heating}
								onChange={(e) => handleFilterChange("heating", e.target.value)}
								options={getHeatingTypeOptions(t)}
							/>
						</div>
						<div className="filter-item">
							<FilterField
								type="single"
								label={
									t("category.realEstate.apartmentType") || "Тип на станот"
								}
								value={tempFilters.apartmentType}
								onChange={(e) =>
									handleFilterChange("apartmentType", e.target.value)
								}
								options={getApartmentTypeOptions(t)}
							/>
						</div>
					</div>
					<div className="filters-actions">
						<button onClick={clearFilters} className="filter-btn clear-btn">
							{t("category.clearFilters")}
						</button>
						<button onClick={applyFilters} className="filter-btn apply-btn">
							{t("category.applyFilters") || "Apply Filters"}
						</button>
					</div>
				</div>
			)}

			{/* Weekend Houses Filters - Simplified (Area, Bedrooms, Price, Heating, Equipment) */}
			{showWeekendHouseFilters && (
				<div className="category-filters-section">
					<div className="filters-grid filters-grid-horizontal">
						<div className="filter-item">
							<FilterField
								type="range"
								label={t("category.realEstate.area") || "Квадратура (m²)"}
								minValue={tempFilters.minArea || ""}
								maxValue={tempFilters.maxArea || ""}
								onMinChange={(e) =>
									handleFilterChange("minArea", e.target.value)
								}
								onMaxChange={(e) =>
									handleFilterChange("maxArea", e.target.value)
								}
								options={areaFilterOptions}
							/>
						</div>
						<div className="filter-item">
							<FilterField
								type="range"
								label={t("category.realEstate.bedrooms") || "Број на соби"}
								minValue={tempFilters.minBedrooms || ""}
								maxValue={tempFilters.maxBedrooms || ""}
								onMinChange={(e) =>
									handleFilterChange("minBedrooms", e.target.value)
								}
								onMaxChange={(e) =>
									handleFilterChange("maxBedrooms", e.target.value)
								}
								options={bedroomOptions.map((bedrooms) => ({
									value: bedrooms.toString(),
									label: bedrooms.toString(),
								}))}
							/>
						</div>
						<div className="filter-item">
							<FilterField
								type="range"
								label={t("category.priceRange") || "Цена (€)"}
								minValue={tempFilters.minPrice || ""}
								maxValue={tempFilters.maxPrice || ""}
								onMinChange={(e) =>
									handleFilterChange("minPrice", e.target.value)
								}
								onMaxChange={(e) =>
									handleFilterChange("maxPrice", e.target.value)
								}
								options={priceOptions.map((price) => ({
									value: price.toString(),
									label: price.toLocaleString() + " €",
								}))}
							/>
						</div>
						<div className="filter-item">
							<FilterField
								type="single"
								label={t("category.realEstate.heating") || "Начин на греење"}
								value={tempFilters.heating}
								onChange={(e) => handleFilterChange("heating", e.target.value)}
								options={getHeatingTypeOptions(t)}
							/>
						</div>
						<div className="filter-item">
							<FilterField
								type="single"
								label={t("category.realEstate.equipment") || "Опрема"}
								value={tempFilters.equipment}
								onChange={(e) =>
									handleFilterChange("equipment", e.target.value)
								}
								options={getEquipmentOptions(t)}
							/>
						</div>
					</div>
					<div className="filters-actions">
						<button onClick={clearFilters} className="filter-btn clear-btn">
							{t("category.clearFilters")}
						</button>
						<button onClick={applyFilters} className="filter-btn apply-btn">
							{t("category.applyFilters") || "Apply Filters"}
						</button>
					</div>
				</div>
			)}

			{/* Basic Real Estate Filters (Area and Price) for other subcategories */}
			{showBasicRealEstateFilters && (
				<div className="category-filters-section">
					<div className="filters-grid filters-grid-horizontal">
						<div className="filter-item">
							<FilterField
								type="range"
								label={t("category.realEstate.area") || "Квадратура (m²)"}
								minValue={tempFilters.minArea || ""}
								maxValue={tempFilters.maxArea || ""}
								onMinChange={(e) =>
									handleFilterChange("minArea", e.target.value)
								}
								onMaxChange={(e) =>
									handleFilterChange("maxArea", e.target.value)
								}
								options={areaFilterOptions}
							/>
						</div>
						<div className="filter-item">
							<FilterField
								type="range"
								label={t("category.priceRange") || "Цена (€)"}
								minValue={tempFilters.minPrice || ""}
								maxValue={tempFilters.maxPrice || ""}
								onMinChange={(e) =>
									handleFilterChange("minPrice", e.target.value)
								}
								onMaxChange={(e) =>
									handleFilterChange("maxPrice", e.target.value)
								}
								options={priceOptions.map((price) => ({
									value: price.toString(),
									label: price.toLocaleString() + " €",
								}))}
							/>
						</div>
					</div>
					<div className="filters-actions">
						<button onClick={clearFilters} className="filter-btn clear-btn">
							{t("category.clearFilters")}
						</button>
						<button onClick={applyFilters} className="filter-btn apply-btn">
							{t("category.applyFilters") || "Apply Filters"}
						</button>
					</div>
				</div>
			)}

			<div className="category-layout">
				{/* Main Content - Full Width */}
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
										<p className="product-location">
											{product.region
												? `${product.location}, ${product.region}`
												: product.location}
										</p>
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
