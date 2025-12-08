import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import axios from "axios";
import { ArrowLeft, Save, Upload, X } from "lucide-react";
import "./EditProduct.scss";

const EditProduct = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const { user, isAuthenticated } = useAuth();
	const { t } = useLanguage();
	const [product, setProduct] = useState(null);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState(null);

	// Form state
	const [formData, setFormData] = useState({
		title: "",
		description: "",
		price: "",
		category: "",
		condition: "",
		location: "",
		status: "active",
		images: [],
		tags: "",
	});

	useEffect(() => {
		if (!isAuthenticated) {
			navigate("/login");
			return;
		}
		if (user) {
			fetchProduct();
		}
	}, [id, isAuthenticated, navigate, user]);

	const fetchProduct = async () => {
		try {
			const response = await axios.get(`/api/products/${id}`);
			const productData = response.data;

			// Check if user owns this product
			if (productData.seller?._id !== user._id) {
				navigate("/profile", {
					state: { error: "You can only edit your own products" },
				});
				return;
			}

			// Convert database values to match form options
			const convertCategory = (dbCategory) => {
				// Return the database category as-is since the form expects the same format
				return dbCategory;
			};

			const convertCondition = (dbCondition) => {
				// Return the database condition as-is since the form expects the same format
				return dbCondition;
			};

			const newFormData = {
				title: productData.title || "",
				description: productData.description || "",
				price: productData.price || "",
				category: convertCategory(productData.category) || "",
				condition: convertCondition(productData.condition) || "",
				location: productData.location || "",
				status: productData.status || "active",
				images: productData.images || [],
				tags: productData.tags ? productData.tags.join(", ") : "",
			};

			setProduct(productData);
			setFormData(newFormData);
		} catch (error) {
			console.error("Error fetching product:", error);
			setError("Product not found");
		} finally {
			setLoading(false);
		}
	};

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleImageRemove = (index) => {
		setFormData((prev) => ({
			...prev,
			images: prev.images.filter((_, i) => i !== index),
		}));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setSaving(true);

		try {
			// Convert form values back to database format
			const convertCategoryToDb = (formCategory) => {
				// Return the form category as-is since the database expects the same format
				return formCategory;
			};

			const convertConditionToDb = (formCondition) => {
				// Return the form condition as-is since the database expects the same format
				return formCondition;
			};

			const submitData = {
				...formData,
				category: convertCategoryToDb(formData.category),
				condition: convertConditionToDb(formData.condition),
				tags: formData.tags
					.split(",")
					.map((tag) => tag.trim())
					.filter((tag) => tag),
			};

			await axios.put(`/api/products/${id}`, submitData);
			navigate(`/products/${id}`, {
				state: {
					message:
						t("product.updatedSuccess") || "Product updated successfully",
				},
			});
		} catch (error) {
			console.error("Error updating product:", error);
			setError(
				t("product.updateError") ||
					"Failed to update product. Please try again."
			);
		} finally {
			setSaving(false);
		}
	};

	// Get translated categories and conditions
	const getTranslatedCategories = () => [
		{ value: "Electronics", label: t("categories.electronics") },
		{ value: "Furniture", label: t("categories.furniture") },
		{ value: "Cars", label: t("categories.cars") },
		{ value: "Real Estate", label: t("categories.realEstate") },
		{ value: "Fashion", label: t("categories.fashion") },
		{ value: "Books", label: t("categories.books") },
		{ value: "Sports", label: t("categories.sports") },
		{ value: "Home & Garden", label: t("categories.homeGarden") },
		{ value: "Services", label: t("categories.services") },
		{ value: "Other", label: t("categories.other") },
	];

	const getTranslatedConditions = () => [
		{ value: "New", label: t("conditions.new") },
		{ value: "Like New", label: t("conditions.like_new") },
		{ value: "Very Good", label: t("conditions.very_good") },
		{ value: "Good", label: t("conditions.good") },
		{ value: "Fair", label: t("conditions.fair") },
		{ value: "Poor", label: t("conditions.poor") },
	];

	if (loading) {
		return (
			<div className="edit-product-container">
				<div className="loading">
					{t("common.loading") || "Loading product..."}
				</div>
			</div>
		);
	}

	if (error || !product) {
		return (
			<div className="edit-product-container">
				<div className="error-container">
					<h2>{error || "Product Not Found"}</h2>
					<p>
						The product you're trying to edit doesn't exist or you don't have
						permission to edit it.
					</p>
					<Link to="/profile" className="btn btn-primary">
						{t("product.backToProfile") || "Back to Profile"}
					</Link>
				</div>
			</div>
		);
	}

	// Only render form when we have product data and formData is properly set
	if (!product || !formData.category) {
		return (
			<div className="edit-product-container">
				<div className="loading">
					{t("common.loading") || "Loading product data..."}
				</div>
			</div>
		);
	}

	return (
		<div className="edit-product-container">
			<div className="edit-product-header">
				<Link to={`/products/${id}`} className="back-btn">
					<ArrowLeft size={20} />
					{t("product.backToProduct") || "Back to Product"}
				</Link>
				<h1>{t("product.editProduct") || "Edit Product"}</h1>
			</div>

			<form
				onSubmit={handleSubmit}
				className="edit-product-form"
				key={product?._id}
			>
				<div className="form-grid">
					{/* Basic Information */}
					<div className="form-section">
						<h2>{t("product.basicInfo") || "Basic Information"}</h2>

						<div className="form-group">
							<label htmlFor="title">{t("product.title") || "Title"} *</label>
							<input
								type="text"
								id="title"
								name="title"
								value={formData.title}
								onChange={handleInputChange}
								required
								placeholder={
									t("product.titlePlaceholder") || "Enter product title"
								}
							/>
						</div>

						<div className="form-group">
							<label htmlFor="description">
								{t("product.description") || "Description"} *
							</label>
							<textarea
								id="description"
								name="description"
								value={formData.description}
								onChange={handleInputChange}
								required
								rows={4}
								placeholder={
									t("product.descriptionPlaceholder") || "Describe your product"
								}
							/>
						</div>

						<div className="form-row">
							<div className="form-group">
								<label htmlFor="price">{t("product.price") || "Price"} *</label>
								<input
									type="number"
									id="price"
									name="price"
									value={formData.price}
									onChange={handleInputChange}
									required
									min="0"
									step="0.01"
									placeholder="0.00"
								/>
							</div>

							<div className="form-group">
								<label htmlFor="category">
									{t("product.category") || "Category"} *
								</label>
								<select
									id="category"
									name="category"
									value={formData.category}
									onChange={handleInputChange}
									required
								>
									<option value="">
										{t("product.selectCategory") || "Select Category"}
									</option>
									{getTranslatedCategories().map((category) => (
										<option key={category.value} value={category.value}>
											{category.label}
										</option>
									))}
								</select>
							</div>
						</div>

						<div className="form-row">
							<div className="form-group">
								<label htmlFor="condition">
									{t("product.condition") || "Condition"} *
								</label>
								<select
									id="condition"
									name="condition"
									value={formData.condition}
									onChange={handleInputChange}
									required
								>
									<option value="">
										{t("product.selectCondition") || "Select Condition"}
									</option>
									{getTranslatedConditions().map((condition) => (
										<option key={condition.value} value={condition.value}>
											{condition.label}
										</option>
									))}
								</select>
							</div>

							<div className="form-group">
								<label htmlFor="status">
									{t("product.status") || "Status"}
								</label>
								<select
									id="status"
									name="status"
									value={formData.status}
									onChange={handleInputChange}
								>
									<option value="active">
										{t("product.status.active") || "Active"}
									</option>
									<option value="inactive">
										{t("product.status.inactive") || "Inactive"}
									</option>
									<option value="sold">
										{t("product.status.sold") || "Sold"}
									</option>
								</select>
							</div>
						</div>
					</div>

					{/* Location & Tags */}
					<div className="form-section">
						<h2>{t("product.additionalInfo") || "Additional Information"}</h2>

						<div className="form-group">
							<label htmlFor="location">
								{t("product.location") || "Location"} *
							</label>
							<input
								type="text"
								id="location"
								name="location"
								value={formData.location}
								onChange={handleInputChange}
								required
								placeholder={
									t("product.locationPlaceholder") || "Enter location"
								}
							/>
						</div>

						<div className="form-group">
							<label htmlFor="tags">{t("product.tags") || "Tags"}</label>
							<input
								type="text"
								id="tags"
								name="tags"
								value={formData.tags}
								onChange={handleInputChange}
								placeholder={
									t("product.tagsPlaceholder") ||
									"Enter tags separated by commas"
								}
							/>
							<small>
								{t("product.tagsHelp") ||
									"Separate tags with commas (e.g., vintage, electronics, gaming)"}
							</small>
						</div>

						{/* Current Images */}
						{formData.images.length > 0 && (
							<div className="form-group">
								<label>{t("product.currentImages") || "Current Images"}</label>
								<div className="current-images">
									{formData.images.map((image, index) => (
										<div key={index} className="image-item">
											<img src={image} alt={`Product ${index + 1}`} />
											<button
												type="button"
												onClick={() => handleImageRemove(index)}
												className="remove-image-btn"
											>
												<X size={16} />
											</button>
										</div>
									))}
								</div>
							</div>
						)}
					</div>
				</div>

				{error && <div className="error-message">{error}</div>}

				<div className="form-actions">
					<Link to={`/products/${id}`} className="btn btn-secondary">
						{t("common.cancel") || "Cancel"}
					</Link>
					<button type="submit" disabled={saving} className="btn btn-primary">
						<Save size={16} />
						{saving
							? t("common.saving") || "Saving..."
							: t("common.save") || "Save Changes"}
					</button>
				</div>
			</form>
		</div>
	);
};

export default EditProduct;
