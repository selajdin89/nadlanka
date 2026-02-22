import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronRight, X } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { getCategoryTranslationKey } from "../utils/productTranslations";
import {
	getCategoryIcon,
	getSubcategoryIcon,
	getSubcategories,
	categoryToSlug,
} from "../utils/categoryConfig";
import axios from "axios";
import "./CategoriesSidebar.scss";

const CategoriesSidebar = ({ onClose }) => {
	const { t } = useLanguage();
	const navigate = useNavigate();
	const [categories, setCategories] = useState([]);
	const [loading, setLoading] = useState(true);
	const [selectedCategory, setSelectedCategory] = useState(null);

	useEffect(() => {
		fetchCategories();
	}, []);

	const fetchCategories = async () => {
		try {
			setLoading(true);
			const response = await axios.get("/api/categories");
			setCategories(response.data);
		} catch (error) {
			console.error("Error fetching categories:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleCategoryClick = (categoryValue, e) => {
		e.preventDefault();
		const subcategories = getSubcategories(categoryValue);
		if (subcategories.length > 0) {
			setSelectedCategory(categoryValue);
		} else {
			// Navigate directly if no subcategories
			navigate(`/category/${categoryToSlug(categoryValue)}`);
		}
	};

	const handleSubcategoryClick = (categoryValue, subcategoryKey) => {
		const categorySlug = categoryToSlug(categoryValue);
		navigate(`/category/${categorySlug}?subcategory=${subcategoryKey}`);
	};

	const handleBackToCategories = () => {
		setSelectedCategory(null);
	};

	return (
		<>
			{/* Overlay */}
			{onClose && <div className="categories-sidebar-overlay" onClick={onClose} />}
			
			<aside className="categories-sidebar">
				<div className="categories-sidebar-header">
					{selectedCategory ? (
						<button
							className="back-btn"
							onClick={handleBackToCategories}
							title={t("common.back") || "Back"}
						>
							<ArrowLeft size={18} />
						</button>
					) : null}
					<h3>
						{selectedCategory
							? t(`categories.${getCategoryTranslationKey(selectedCategory)}`) ||
							  selectedCategory
							: t("home.categories.allCategories") || "All Categories"}
					</h3>
					{onClose && (
						<button className="close-btn" onClick={onClose}>
							<X size={18} />
						</button>
					)}
				</div>

			<div className="categories-sidebar-content">
				{loading ? (
					<div className="loading-categories">
						{t("common.loading") || "Loading categories..."}
					</div>
				) : selectedCategory ? (
					<div className="categories-list">
						{getSubcategories(selectedCategory).map((subcategory) => {
							const SubcategoryIcon = getSubcategoryIcon(subcategory.key);
							const translationKey = `category.${getCategoryTranslationKey(
								selectedCategory
							)}.subcategories.${subcategory.key}`;
							return (
								<button
									key={subcategory.key}
									className="category-item subcategory-item"
									onClick={() => handleSubcategoryClick(selectedCategory, subcategory.key)}
								>
									<SubcategoryIcon size={18} className="category-item-icon" />
									<span className="category-name">
										{t(translationKey) || subcategory.label}
									</span>
								</button>
							);
						})}
					</div>
				) : (
					<div className="categories-list">
						{categories.map((category) => {
							const CategoryIcon = getCategoryIcon(category.value);
							const translationKey = `categories.${getCategoryTranslationKey(
								category.value
							)}`;
							const hasSubcategories = getSubcategories(category.value).length > 0;
							return (
								<button
									key={category.value}
									className="category-item"
									onClick={(e) => handleCategoryClick(category.value, e)}
								>
									<CategoryIcon size={18} className="category-item-icon" />
									<span className="category-name">
										{t(translationKey) || category.label}
									</span>
									{hasSubcategories && (
										<ChevronRight size={16} className="category-arrow" />
									)}
								</button>
							);
						})}
					</div>
				)}
			</div>
		</aside>
		</>
	);
};

export default CategoriesSidebar;

