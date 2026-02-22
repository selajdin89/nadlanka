import React, { useState, useEffect, useRef } from "react";
import { useLanguage } from "../contexts/LanguageContext";
import CustomSelect from "./CustomSelect";
import {
	getSubcategories,
	getNestedSubcategories,
	hasNestedSubcategories,
	hasSubcategories,
} from "../utils/categoryConfig";
import { getCategoryTranslationKey } from "../utils/productTranslations";
import axios from "axios";

const CategorySelector = ({
	value = null, // Current category value
	subcategoryValue = null, // Current subcategory value
	nestedValue = null, // Current nested subcategory value
	onChange, // (category, subcategory, nested) => void
	onCategoryChange = null, // Optional callback for category changes only
	placeholder = null,
	required = false, // Whether subcategory is required if category has subcategories
	showAllCategories = true, // Whether to show "All Categories" option
	className = "",
	error = false,
	disabled = false,
}) => {
	const { t } = useLanguage();
	const [categories, setCategories] = useState([]);
	const [selectedCategory, setSelectedCategory] = useState(value || null);
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

	// Sync with props
	useEffect(() => {
		if (value !== null && value !== undefined && value !== "") {
			setSelectedCategory(value);
			// If we have a category value, check if it has subcategories
			const subcategories = getSubcategories(value);
			if (subcategories.length > 0) {
				// Always set selectedCategoryForSubcategories when category has subcategories
				// This ensures dropdown opens directly to subcategories
				setSelectedCategoryForSubcategories(value);
				
				// If we also have a subcategory value, check for nested
				if (subcategoryValue) {
					// Check if subcategory has nested subcategories
					if (hasNestedSubcategories(subcategoryValue) && nestedValue) {
						setSelectedSubcategoryForNested(subcategoryValue);
					}
				}
			} else {
				// No subcategories, clear the state
				setSelectedCategoryForSubcategories(null);
				setSelectedSubcategoryForNested(null);
			}
		} else {
			// No category selected, clear everything
			setSelectedCategory(null);
			setSelectedCategoryForSubcategories(null);
			setSelectedSubcategoryForNested(null);
		}
	}, [value, subcategoryValue, nestedValue]);

	// Handle category/subcategory selection
	const handleCategoryChange = (selectedValue) => {
		// Handle "back to categories"
		if (selectedValue === "__back_to_categories__") {
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
		if (selectedSubcategoryForNested && selectedValue.startsWith("nested:")) {
			const nestedSubcatKey = selectedValue.replace("nested:", "");
			setSelectedSubcategoryForNested(null);
			setSelectedCategoryForSubcategories(null);
			
			if (onChange) {
				onChange(selectedCategory, selectedSubcategoryForNested, nestedSubcatKey);
			}
			return;
		}

		// Handle subcategory selection (check if it has nested subcategories)
		if (selectedCategoryForSubcategories && selectedValue.startsWith("subcategory:")) {
			const subcategoryKey = selectedValue.replace("subcategory:", "");

			// Check if this subcategory has nested subcategories
			if (hasNestedSubcategories(subcategoryKey)) {
				// Show nested subcategories instead of closing
				setCategorySlideDirection("forward");
				setSelectedSubcategoryForNested(subcategoryKey);
				setTimeout(() => setCategorySlideDirection(""), 300);
				return;
			}

			// No nested subcategories, final selection
			setSelectedCategoryForSubcategories(null);
			setSelectedSubcategoryForNested(null);
			
			if (onChange) {
				onChange(selectedCategoryForSubcategories, subcategoryKey, null);
			}
			if (onCategoryChange) {
				onCategoryChange(selectedCategoryForSubcategories, subcategoryKey);
			}
			return;
		}

		// Handle category selection
		if (selectedValue && selectedValue !== "") {
			const subcategories = getSubcategories(selectedValue);
			if (subcategories.length > 0) {
				// Show subcategories in dropdown but keep category selected
				setCategorySlideDirection("forward");
				setSelectedCategoryForSubcategories(selectedValue);
				setSelectedCategory(selectedValue);
				setTimeout(() => setCategorySlideDirection(""), 300);
			} else {
				// No subcategories, final selection
				setSelectedCategoryForSubcategories(null);
				setSelectedCategory(selectedValue);
				
				if (onChange) {
					onChange(selectedValue, null, null);
				}
				if (onCategoryChange) {
					onCategoryChange(selectedValue);
				}
			}
		} else {
			// "All Categories" selected (only if showAllCategories is true)
			setSelectedCategoryForSubcategories(null);
			setSelectedSubcategoryForNested(null);
			setSelectedCategory("");
			
			if (onChange) {
				onChange("", null, null);
			}
			if (onCategoryChange) {
				onCategoryChange("");
			}
		}
	};

	// Get category value for dropdown
	const getCategoryValue = () => {
		if (selectedSubcategoryForNested && nestedValue) {
			return `nested:${nestedValue}`;
		}
		if (selectedCategoryForSubcategories && subcategoryValue) {
			return `subcategory:${subcategoryValue}`;
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

		// Show all categories
		const categoryOptions = categories.map((cat) => {
			const translationKey = `categories.${getCategoryTranslationKey(cat.value)}`;
			return {
				value: cat.value,
				label: t(translationKey) || cat.label,
			};
		});

		if (showAllCategories) {
			return [
				{
					value: "",
					label: t("home.categories.allCategories") || "All Categories",
				},
				...categoryOptions,
			];
		}

		return categoryOptions;
	};

	return (
		<CustomSelect
			className={className}
			value={getCategoryValue()}
			keepOpenOnSelect={true}
			slideDirection={categorySlideDirection}
			error={error}
			disabled={disabled}
			onOpen={() => {
				// When opening dropdown:
				// - If category is already selected and has subcategories, show subcategories directly
				// - Otherwise, show categories
				if (selectedCategory && !selectedCategoryForSubcategories) {
					const subcategories = getSubcategories(selectedCategory);
					if (subcategories.length > 0) {
						// Category has subcategories but state wasn't set - set it now
						setSelectedCategoryForSubcategories(selectedCategory);
					}
				}
				// Don't reset if we're already showing subcategories - keep the current view
			}}
			onSelect={(option) => {
				// Return true to keep dropdown open if there are subcategories to show
				if (!option || !option.value || option.value === "__back_to_categories__") {
					return true;
				}

				// If it's a main category (not a subcategory), check if it has subcategories
				if (!option.value.startsWith("subcategory:") && !option.value.startsWith("nested:")) {
					const subcategories = getSubcategories(option.value);
					if (subcategories.length > 0) {
						// Has subcategories - keep dropdown open to show them
						return true;
					}
					// No subcategories - close dropdown
					return false;
				}

				// If it's a subcategory, check if it has nested subcategories
				if (option.value.startsWith("subcategory:")) {
					const subcatKey = option.value.replace("subcategory:", "");
					if (hasNestedSubcategories(subcatKey)) {
						// Has nested subcategories - keep dropdown open to show them
						return true;
					}
					// No nested subcategories - close dropdown
					return false;
				}

				// For nested subcategories (final level), close dropdown
				return false;
			}}
			onChange={(e) => handleCategoryChange(e.target.value)}
			searchable={true}
			placeholder={
				placeholder ||
				(selectedCategoryForSubcategories
					? t("category.selectSubcategory") || "Select Subcategory"
					: selectedCategory
					? ""
					: t("home.categories.allCategories") || "All Categories")
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
	);
};

export default CategorySelector;

