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
	const [uploadingImages, setUploadingImages] = useState(false);

	// Form state
	const [formData, setFormData] = useState({
		title: "",
		description: "",
		price: "",
		category: "",
		categoryType: "", // general, realEstate, cars
		condition: "",
		location: "",
		status: "active",
		images: [],
		tags: "",
		categorySpecific: {
			// Real Estate fields
			propertyType: "",
			area: "",
			address: "",
			bedrooms: "",
			bathrooms: "",
			// Car fields
			fuelType: "",
			mileage: "",
			year: "",
			transmission: "",
			color: "",
		},
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

			// Determine category type
			let categoryType = "general";
			if (productData.category === "Real Estate") {
				categoryType = "realEstate";
			} else if (productData.category === "Cars") {
				categoryType = "cars";
			}

			const newFormData = {
				title: productData.title || "",
				description: productData.description || "",
				price: productData.price || "",
				category: convertCategory(productData.category) || "",
				categoryType: categoryType,
				condition: convertCondition(productData.condition) || "",
				location: productData.location || "",
				status: productData.status || "active",
				images: productData.images || [],
				tags: productData.tags ? productData.tags.join(", ") : "",
				categorySpecific: productData.categorySpecific || {
					propertyType: "",
					area: "",
					address: "",
					bedrooms: "",
					bathrooms: "",
					fuelType: "",
					mileage: "",
					year: "",
					transmission: "",
					color: "",
				},
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
		
		// Handle nested properties (categorySpecific, contactInfo)
		if (name.includes(".")) {
			const [parent, child] = name.split(".");
			if (parent === "categorySpecific") {
				setFormData((prev) => ({
					...prev,
					categorySpecific: {
						...prev.categorySpecific,
						[child]: value,
					},
				}));
			} else {
				setFormData((prev) => ({
					...prev,
					[parent]: {
						...prev[parent],
						[child]: value,
					},
				}));
			}
		} else {
			// Handle category dropdown selection
			if (name === "category") {
				let categoryType = "general";
				if (value === "Real Estate") {
					categoryType = "realEstate";
				} else if (value === "Cars") {
					categoryType = "cars";
				}

				setFormData((prev) => ({
					...prev,
					category: value,
					categoryType: categoryType,
				}));
			} else {
				setFormData((prev) => ({
					...prev,
					[name]: value,
				}));
			}
		}
	};

	const handleImageChange = async (e) => {
		const files = Array.from(e.target.files);
		if (files.length === 0) return;

		setUploadingImages(true);
		try {
			const formDataUpload = new FormData();
			files.forEach((file) => {
				formDataUpload.append("images", file);
			});

			const response = await axios.post("/api/upload", formDataUpload, {
				headers: {
					"Content-Type": "multipart/form-data",
				},
			});

			setFormData((prev) => ({
				...prev,
				images: [...prev.images, ...response.data.imageUrls],
			}));
		} catch (error) {
			console.error("Error uploading images:", error);
			alert("Failed to upload images. Please try again.");
		} finally {
			setUploadingImages(false);
			// Reset file input
			e.target.value = "";
		}
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
				categorySpecific: formData.categorySpecific,
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
					</div>

					{/* Real Estate Specific Fields */}
					{formData.categoryType === "realEstate" && (
						<div className="form-section">
							<h2>{t("createProduct.realEstate.title") || "Property Details"}</h2>

							<div className="form-row">
								<div className="form-group">
									<label htmlFor="categorySpecific.propertyType">
										{t("createProduct.realEstate.propertyType") || "Property Type"} *
									</label>
									<select
										id="categorySpecific.propertyType"
										name="categorySpecific.propertyType"
										value={formData.categorySpecific.propertyType}
										onChange={handleInputChange}
										required
									>
										<option value="">
											{t("createProduct.select.propertyType") || "Select Property Type"}
										</option>
										<option value="apartment">
											{t("createProduct.realEstate.propertyType.apartment") || "Apartment"}
										</option>
										<option value="house">
											{t("createProduct.realEstate.propertyType.house") || "House"}
										</option>
										<option value="land">
											{t("createProduct.realEstate.propertyType.land") || "Land"}
										</option>
										<option value="commercial">
											{t("createProduct.realEstate.propertyType.commercial") || "Commercial"}
										</option>
									</select>
								</div>

								<div className="form-group">
									<label htmlFor="categorySpecific.area">
										{t("createProduct.realEstate.area") || "Area"} * (m²)
									</label>
									<input
										type="number"
										id="categorySpecific.area"
										name="categorySpecific.area"
										value={formData.categorySpecific.area}
										onChange={handleInputChange}
										required
										min="1"
										placeholder={t("createProduct.realEstate.area.placeholder") || "Enter area"}
									/>
								</div>
							</div>

							<div className="form-group">
								<label htmlFor="categorySpecific.address">
									{t("createProduct.realEstate.address") || "Address"} *
								</label>
								<input
									type="text"
									id="categorySpecific.address"
									name="categorySpecific.address"
									value={formData.categorySpecific.address}
									onChange={handleInputChange}
									required
									placeholder={t("createProduct.realEstate.address.placeholder") || "Enter address"}
								/>
							</div>

							{(formData.categorySpecific.propertyType === "apartment" ||
								formData.categorySpecific.propertyType === "house") && (
								<div className="form-row">
									<div className="form-group">
										<label htmlFor="categorySpecific.bedrooms">
											{t("createProduct.realEstate.bedrooms") || "Bedrooms"}
										</label>
										<select
											id="categorySpecific.bedrooms"
											name="categorySpecific.bedrooms"
											value={formData.categorySpecific.bedrooms}
											onChange={handleInputChange}
										>
											<option value="">
												{t("createProduct.select.bedrooms") || "Select"}
											</option>
											<option value="1">1</option>
											<option value="2">2</option>
											<option value="3">3</option>
											<option value="4">4</option>
											<option value="5+">5+</option>
										</select>
									</div>

									<div className="form-group">
										<label htmlFor="categorySpecific.bathrooms">
											{t("createProduct.realEstate.bathrooms") || "Bathrooms"}
										</label>
										<select
											id="categorySpecific.bathrooms"
											name="categorySpecific.bathrooms"
											value={formData.categorySpecific.bathrooms}
											onChange={handleInputChange}
										>
											<option value="">
												{t("createProduct.select.bathrooms") || "Select"}
											</option>
											<option value="1">1</option>
											<option value="2">2</option>
											<option value="3">3</option>
											<option value="4+">4+</option>
										</select>
									</div>
								</div>
							)}
						</div>
					)}

					{/* Cars Specific Fields */}
					{formData.categoryType === "cars" && (
						<div className="form-section">
							<h2>{t("createProduct.cars.title") || "Vehicle Details"}</h2>

							<div className="form-row">
								<div className="form-group">
									<label htmlFor="categorySpecific.year">
										{t("createProduct.cars.year") || "Year"} *
									</label>
									<input
										type="number"
										id="categorySpecific.year"
										name="categorySpecific.year"
										value={formData.categorySpecific.year}
										onChange={handleInputChange}
										required
										min="1900"
										max={new Date().getFullYear() + 1}
										placeholder={t("createProduct.cars.year.placeholder") || "Enter year"}
									/>
								</div>

								<div className="form-group">
									<label htmlFor="categorySpecific.mileage">
										{t("createProduct.cars.mileage") || "Mileage"} (km)
									</label>
									<input
										type="number"
										id="categorySpecific.mileage"
										name="categorySpecific.mileage"
										value={formData.categorySpecific.mileage}
										onChange={handleInputChange}
										min="0"
										placeholder={t("createProduct.cars.mileage.placeholder") || "Enter mileage"}
									/>
								</div>
							</div>

							<div className="form-row">
								<div className="form-group">
									<label htmlFor="categorySpecific.fuelType">
										{t("createProduct.cars.fuelType") || "Fuel Type"} *
									</label>
									<select
										id="categorySpecific.fuelType"
										name="categorySpecific.fuelType"
										value={formData.categorySpecific.fuelType}
										onChange={handleInputChange}
										required
									>
										<option value="">{t("createProduct.select.fuelType") || "Select Fuel Type"}</option>
										<option value="petrol">
											{t("createProduct.cars.fuelType.petrol") || "Petrol"}
										</option>
										<option value="diesel">
											{t("createProduct.cars.fuelType.diesel") || "Diesel"}
										</option>
										<option value="electric">
											{t("createProduct.cars.fuelType.electric") || "Electric"}
										</option>
										<option value="hybrid">
											{t("createProduct.cars.fuelType.hybrid") || "Hybrid"}
										</option>
									</select>
								</div>

								<div className="form-group">
									<label htmlFor="categorySpecific.transmission">
										{t("createProduct.cars.transmission") || "Transmission"} *
									</label>
									<select
										id="categorySpecific.transmission"
										name="categorySpecific.transmission"
										value={formData.categorySpecific.transmission}
										onChange={handleInputChange}
										required
									>
										<option value="">
											{t("createProduct.select.transmission") || "Select Transmission"}
										</option>
										<option value="manual">
											{t("createProduct.cars.transmission.manual") || "Manual"}
										</option>
										<option value="automatic">
											{t("createProduct.cars.transmission.automatic") || "Automatic"}
										</option>
									</select>
								</div>
							</div>

							<div className="form-group">
								<label htmlFor="categorySpecific.color">
									{t("createProduct.cars.color") || "Color"}
								</label>
								<input
									type="text"
									id="categorySpecific.color"
									name="categorySpecific.color"
									value={formData.categorySpecific.color}
									onChange={handleInputChange}
									placeholder={t("createProduct.cars.color.placeholder") || "Enter color"}
								/>
							</div>
						</div>
					)}

					{/* Images Section */}
					<div className="form-section">
						<h2>{t("product.images") || "Images"}</h2>

						<div className="form-group">
							<label htmlFor="images">
								{t("product.uploadImages") || "Upload Images"}
							</label>
							<input
								type="file"
								id="images"
								multiple
								accept="image/*"
								onChange={handleImageChange}
								disabled={uploadingImages}
							/>
							<small>
								{uploadingImages
									? t("product.uploading") || "Uploading images..."
									: t("product.uploadHelp") || "You can upload multiple images"}
							</small>
						</div>

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
