import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";
import { Menu, MapPin } from "lucide-react";
import CustomSelect from "./CustomSelect";
import { macedonianCities } from "../utils/macedonianCities";
import {
	categoryToSlug,
	getSubcategories,
	getNestedSubcategories,
	hasNestedSubcategories,
	hasSubcategories,
} from "../utils/categoryConfig";
import { getCategoryTranslationKey } from "../utils/productTranslations";
import axios from "axios";
import "../pages/Home.scss";

const SearchBar = ({
	currentCategory = null,
	currentSubcategory = null,
	onCategoryChange = null,
	onSearch = null,
	onLocationChange = null,
}) => {
	const { t } = useLanguage();
	const navigate = useNavigate();
	const location = useLocation();
	const [searchParams] = useSearchParams();

	const [searchQuery, setSearchQuery] = useState(
		searchParams.get("search") || ""
	);
	const [selectedLocation, setSelectedLocation] = useState(
		searchParams.get("location") || ""
	);
	const searchInputRef = useRef(null);

	// Reset SearchBar when resetToHome event is dispatched
	useEffect(() => {
		const handleReset = () => {
			setSearchQuery("");
			setSelectedLocation("");
			setSelectedCategory(null);
			setSelectedCategoryForSubcategories(null);
			setSelectedSubcategoryForNested(null);
			setCategorySlideDirection("");
		};
		window.addEventListener("resetToHome", handleReset);
		return () => {
			window.removeEventListener("resetToHome", handleReset);
		};
	}, []);

	// Reset when navigating to home without search params
	useEffect(() => {
		const urlParams = new URLSearchParams(location.search || "");
		if (location.pathname === "/" && urlParams.toString() === "") {
			// Clear search and location if on clean home page
			if (searchQuery || selectedLocation) {
				setSearchQuery("");
				setSelectedLocation("");
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [location.pathname, location.search]);

	const [categories, setCategories] = useState([]);
	const [selectedCategory, setSelectedCategory] = useState(currentCategory);
	const [selectedCategoryForSubcategories, setSelectedCategoryForSubcategories] =
		useState(null);
	const [selectedSubcategoryForNested, setSelectedSubcategoryForNested] =
		useState(null);
	const [categorySlideDirection, setCategorySlideDirection] = useState("");
	const categorySelectRef = useRef(null);

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

	// Sync with props if provided
	useEffect(() => {
		if (currentCategory !== undefined) {
			setSelectedCategory(currentCategory);
		}
	}, [currentCategory]);

	// Handle search
	const handleSearch = (e) => {
		if (e) e.preventDefault();
		const query = searchQuery.trim();

		if (onSearch) {
			onSearch(query, selectedLocation);
		} else {
			// Default behavior: navigate to products with search params
			const params = new URLSearchParams();
			if (query) {
				params.set("search", query);
			}
			if (selectedLocation) {
				params.set("location", selectedLocation);
			}
			navigate(`/products?${params.toString()}`);
		}
	};

	// Handle location change
	const handleLocationChange = (e) => {
		const location = e.target.value;
		setSelectedLocation(location);

		if (onLocationChange) {
			const currentSearch = searchInputRef.current?.value?.trim() || searchQuery.trim();
			onLocationChange(location, currentSearch);
		} else {
			// Default behavior: navigate to products with search params
			const currentSearch = searchInputRef.current?.value?.trim() || searchQuery.trim();
			const params = new URLSearchParams();
			if (currentSearch) {
				params.set("search", currentSearch);
			}
			if (location) {
				params.set("location", location);
			}
			navigate(`/products?${params.toString()}`);
		}
	};

	// Handle category/subcategory selection
	const handleCategoryChange = (value) => {
		// Handle "back to categories"
		if (value === "__back_to_categories__") {
			if (selectedSubcategoryForNested) {
				// Go back from nested to subcategories
				setCategorySlideDirection("back");
				setSelectedSubcategoryForNested(null);
				setTimeout(() => setCategorySlideDirection(""), 300);
			} else {
				// Go back from subcategories to categories
				setCategorySlideDirection("back");
				setSelectedCategoryForSubcategories(null);
				setTimeout(() => setCategorySlideDirection(""), 300);
			}
			return;
		}

		// Handle nested subcategory selection (3rd level)
		if (selectedSubcategoryForNested && value.startsWith("nested:")) {
			const nestedSubcatKey = value.replace("nested:", "");
			const categorySlug = categoryToSlug(selectedCategoryForSubcategories);
			navigate(
				`/category/${categorySlug}?subcategory=${selectedSubcategoryForNested}&nested=${nestedSubcatKey}`
			);
			setSelectedSubcategoryForNested(null);
			setSelectedCategoryForSubcategories(null);
			if (onCategoryChange) {
				onCategoryChange(selectedCategoryForSubcategories, selectedSubcategoryForNested, nestedSubcatKey);
			}
			return;
		}

		// Handle subcategory selection (check if it has nested subcategories)
		if (selectedCategoryForSubcategories && value.startsWith("subcategory:")) {
			const subcategoryKey = value.replace("subcategory:", "");

			// Check if this subcategory has nested subcategories
			if (hasNestedSubcategories(subcategoryKey)) {
				// Show nested subcategories instead of navigating
				setCategorySlideDirection("forward");
				setSelectedSubcategoryForNested(subcategoryKey);
				setTimeout(() => setCategorySlideDirection(""), 300);
				return;
			}

			// No nested subcategories, navigate to subcategory page
			const categorySlug = categoryToSlug(selectedCategoryForSubcategories);
			navigate(`/category/${categorySlug}?subcategory=${subcategoryKey}`);
			setSelectedCategoryForSubcategories(null);
			if (onCategoryChange) {
				onCategoryChange(selectedCategoryForSubcategories, subcategoryKey);
			}
			return;
		}

		// Handle category selection
		if (value && value !== "") {
			const subcategories = getSubcategories(value);
			if (subcategories.length > 0) {
				// Show subcategories in dropdown but keep category selected
				setCategorySlideDirection("forward");
				setSelectedCategoryForSubcategories(value);
				setSelectedCategory(value);
				setTimeout(() => setCategorySlideDirection(""), 300);
			} else {
				// No subcategories, navigate directly
				const categorySlug = categoryToSlug(value);
				navigate(`/category/${categorySlug}`);
				setSelectedCategoryForSubcategories(null);
				setSelectedCategory(value);
				if (onCategoryChange) {
					onCategoryChange(value);
				}
			}
		} else {
			// "All Categories" selected - navigate to products page
			setSelectedCategoryForSubcategories(null);
			setSelectedSubcategoryForNested(null);
			setSelectedCategory("");
			navigate("/products");
			if (onCategoryChange) {
				onCategoryChange("");
			}
		}
	};

	// Get category value for dropdown
	const getCategoryValue = () => {
		if (currentSubcategory && !selectedCategoryForSubcategories) {
			return `subcategory:${currentSubcategory}`;
		}
		if (selectedCategoryForSubcategories && currentSubcategory) {
			return `subcategory:${currentSubcategory}`;
		}
		return selectedCategory || "";
	};

	// Get category options
	const getCategoryOptions = () => {
		if (selectedSubcategoryForNested) {
			// Show nested subcategories (3rd level)
			return [
				{
					value: "__back_to_categories__",
					label: "← " + (t("common.back") || "Back"),
				},
				...getNestedSubcategories(selectedSubcategoryForNested).map((nestedSubcat) => {
					const categoryKey = getCategoryTranslationKey(
						selectedCategoryForSubcategories
					);
					const translationKeys = [
						`category.${categoryKey}.nestedSubcategories.${selectedSubcategoryForNested}.${nestedSubcat.key}`,
						`category.vehicles.nestedSubcategories.${selectedSubcategoryForNested}.${nestedSubcat.key}`,
					];
					let label = nestedSubcat.label;
					for (const key of translationKeys) {
						const translated = t(key);
						if (translated && translated !== key) {
							label = translated;
							break;
						}
					}
					return {
						value: `nested:${nestedSubcat.key}`,
						label: label,
					};
				}),
			];
		}

		if (selectedCategoryForSubcategories) {
			// Show subcategories (2nd level)
			return [
				{
					value: "__back_to_categories__",
					label: "← " + (t("common.back") || "Back"),
				},
				...getSubcategories(selectedCategoryForSubcategories).map((subcat) => {
					const categoryKey = getCategoryTranslationKey(
						selectedCategoryForSubcategories
					);
					// Convert hyphenated key to camelCase for translation
					const camelCaseKey = subcat.key.replace(/-([a-z])/g, (g) =>
						g[1].toUpperCase()
					);
					const translationKeys = [
						`category.${categoryKey}.subcategories.${camelCaseKey}`,
						`category.${categoryKey}.subcategories.${subcat.key}`,
						`subcategories.${subcat.key}`,
					];
					let label = subcat.label;
					for (const key of translationKeys) {
						const translated = t(key);
						if (translated && translated !== key) {
							label = translated;
							break;
						}
					}
					return {
						value: `subcategory:${subcat.key}`,
						label: label,
					};
				}),
			];
		}

		// Show main categories, but if on a subcategory page, prepend current subcategory
		if (currentSubcategory && selectedCategory) {
			const subcategories = getSubcategories(selectedCategory);
			const currentSubcat = subcategories.find(
				(subcat) => subcat.key === currentSubcategory
			);
			const categoryKey = getCategoryTranslationKey(selectedCategory);
			const translationKeys = currentSubcat
				? [
						`category.${categoryKey}.subcategories.${currentSubcategory}`,
						`subcategories.${currentSubcategory}`,
				  ]
				: [];
			let subcatLabel = currentSubcat?.label || currentSubcategory;
			for (const key of translationKeys) {
				const translated = t(key);
				if (translated && translated !== key) {
					subcatLabel = translated;
					break;
				}
			}
			return [
				{
					value: `subcategory:${currentSubcategory}`,
					label: subcatLabel,
				},
				{
					value: "",
					label: t("home.categories.allCategories") || "All Categories",
				},
				...categories.map((cat) => {
					const translationKey = `categories.${getCategoryTranslationKey(cat.value)}`;
					return {
						value: cat.value,
						label: t(translationKey) || cat.label,
					};
				}),
			];
		}

		// Show all categories
		return [
			{
				value: "",
				label: t("home.categories.allCategories") || "All Categories",
			},
			...categories.map((cat) => {
				const translationKey = `categories.${getCategoryTranslationKey(cat.value)}`;
				return {
					value: cat.value,
					label: t(translationKey) || cat.label,
				};
			}),
		];
	};

	return (
		<section className="search-section">
			<div className="search-filters-container">
				{/* Category Filter Dropdown */}
				<div
					className="category-filter-container"
					ref={categorySelectRef}
					onClick={(e) => {
						// If clicking on the container or icon (not on the CustomSelect trigger itself), trigger the dropdown
						const clickedOnTrigger = e.target.closest(".custom-select-trigger");
						if (!clickedOnTrigger) {
							const trigger = categorySelectRef.current?.querySelector(
								".custom-select-trigger"
							);
							if (trigger) {
								trigger.click();
							}
						}
					}}
				>
					<Menu size={18} className="category-filter-icon" />
					<CustomSelect
						className="category-select"
						value={getCategoryValue()}
						keepOpenOnSelect={true}
						slideDirection={categorySlideDirection}
						onOpen={() => {
							// Only reset if we're not already showing subcategories
							// This prevents resetting when the dropdown reopens after a selection
							if (!selectedCategoryForSubcategories && !selectedSubcategoryForNested) {
								setSelectedCategoryForSubcategories(null);
								setSelectedSubcategoryForNested(null);
							}
						}}
						onSelect={(option) => {
							// Check if we should keep dropdown open based on the option value
							// This is called before onChange, so we check the option directly, not state
							// Return true to keep dropdown open if there are subcategories to show
							if (!option || !option.value || option.value === "__back_to_categories__") {
								// For back button, keep open (handled in onChange)
								return true;
							}

							// If it's a main category (not a subcategory), check if it has subcategories
							if (!option.value.startsWith("subcategory:") && !option.value.startsWith("nested:")) {
								const subcategories = getSubcategories(option.value);
								if (subcategories.length > 0) {
									// Has subcategories - keep dropdown open to show them
									return true;
								}
								// No subcategories - close dropdown (will navigate)
								return false;
							}

							// If it's a subcategory, check if it has nested subcategories
							if (option.value.startsWith("subcategory:")) {
								const subcatKey = option.value.replace("subcategory:", "");
								if (hasNestedSubcategories(subcatKey)) {
									// Has nested subcategories - keep dropdown open to show them
									return true;
								}
								// No nested subcategories - close dropdown (will navigate)
								return false;
							}

							// For nested subcategories (final level), close dropdown (will navigate)
							return false;
						}}
						onChange={(e) => handleCategoryChange(e.target.value)}
						searchable={true}
						placeholder={
							selectedCategoryForSubcategories
								? t("category.selectSubcategory") || "Select Subcategory"
								: selectedCategory
								? ""
								: t("home.categories.allCategories") || "All Categories"
						}
						options={getCategoryOptions()}
						hasSubcategories={(option) => {
							if (!option.value || option.value === "__back_to_categories__") {
								return false;
							}
							if (!option.value.startsWith("subcategory:")) {
								return hasSubcategories(option.value);
							}
							if (option.value.startsWith("subcategory:")) {
								const subcatKey = option.value.replace("subcategory:", "");
								return hasNestedSubcategories(subcatKey);
							}
							return false;
						}}
					/>
				</div>

				{/* Search Input */}
				<form className="search-form" onSubmit={handleSearch}>
					<input
						ref={searchInputRef}
						type="text"
						placeholder={
							t("home.search.placeholder") ||
							"BMW, Iphone, Samsung, Оглас број"
						}
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="search-input"
					/>
				</form>

				{/* Location Filter */}
				<div className="location-filter-container">
					<MapPin size={18} className="location-icon" />
					<CustomSelect
						className="location-select"
						value={selectedLocation}
						onChange={handleLocationChange}
						searchable={true}
						options={macedonianCities.map((city) => ({
							value: city.value,
							label: city.label,
						}))}
					/>
				</div>

				{/* Search Button */}
				<button
					type="button"
					className="search-button-main"
					onClick={handleSearch}
				>
					<svg
						width="20"
						height="20"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2.5"
						strokeLinecap="round"
						strokeLinejoin="round"
					>
						<circle cx="11" cy="11" r="8"></circle>
						<path d="m21 21-4.35-4.35"></path>
					</svg>
				</button>
			</div>
		</section>
	);
};

export default SearchBar;

