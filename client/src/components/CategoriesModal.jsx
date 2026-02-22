import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { X, ArrowLeft } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { getCategoryTranslationKey } from "../utils/productTranslations";
import {
	getCategoryIcon,
	getSubcategoryIcon,
	getSubcategories,
	categoryToSlug,
} from "../utils/categoryConfig";
import axios from "axios";
import "./CategoriesModal.scss";

const CategoriesModal = ({ isOpen, onClose }) => {
	const { t } = useLanguage();
	const navigate = useNavigate();
	const [categories, setCategories] = useState([]);
	const [loading, setLoading] = useState(true);
	const [selectedCategory, setSelectedCategory] = useState(null);

	useEffect(() => {
		if (isOpen) {
			fetchCategories();
			setSelectedCategory(null); // Reset to categories view when modal opens
		}
	}, [isOpen]);

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
			onClose();
		}
	};

	const handleSubcategoryClick = (categoryValue, subcategoryKey) => {
		const categorySlug = categoryToSlug(categoryValue);
		navigate(`/category/${categorySlug}?subcategory=${subcategoryKey}`);
		onClose();
	};

	const handleBackToCategories = () => {
		setSelectedCategory(null);
	};

	if (!isOpen) return null;

	return (
		<div className="categories-modal-overlay" onClick={onClose}>
			<div className="categories-modal" onClick={(e) => e.stopPropagation()}>
				<div className="categories-modal-header">
					{selectedCategory ? (
						<button
							className="back-btn"
							onClick={handleBackToCategories}
							title={t("common.back") || "Back"}
						>
							<ArrowLeft size={20} />
						</button>
					) : null}
					<h3>
						{selectedCategory
							? t(`categories.${getCategoryTranslationKey(selectedCategory)}`) ||
							  selectedCategory
							: t("home.categories.allCategories") || "All Categories"}
					</h3>
					<button className="close-btn" onClick={onClose}>
						<X size={20} />
					</button>
				</div>

				<div className="categories-modal-content">
					{loading ? (
						<div className="loading-categories">
							{t("common.loading") || "Loading categories..."}
						</div>
					) : selectedCategory ? (
						<div className="categories-grid">
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
										<SubcategoryIcon size={20} className="category-item-icon" />
										<span className="category-name">
											{t(translationKey) || subcategory.label}
										</span>
									</button>
								);
							})}
						</div>
					) : (
						<div className="categories-grid">
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
										<CategoryIcon size={20} className="category-item-icon" />
										<span className="category-name">
											{t(translationKey) || category.label}
										</span>
										{hasSubcategories && (
											<span className="category-arrow">→</span>
										)}
									</button>
								);
							})}
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default CategoriesModal;

