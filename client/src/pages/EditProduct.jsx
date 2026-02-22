import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import axios from "axios";
import { ArrowLeft, Save, Upload, X } from "lucide-react";
import CustomSelect from "../components/CustomSelect";
import { macedonianCities } from "../utils/macedonianCities";
import { skopjeRegions } from "../utils/skopjeRegions";
import {
	carBrands,
	getModelsForBrand,
	getBrandOptions,
	getModelOptions,
	getFuelTypeOptions,
	getTransmissionOptions,
	getPowerKWOptions,
	generateYearOptions,
	generateMileageOptions,
} from "../utils/carProperties";
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
		categoryType: "", // general, realEstate, vehicles
		condition: "",
		location: "",
		region: "",
		status: "active",
		images: [],
		tags: "",
		brand: "",
		model: "",
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
			powerKW: "",
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
			} else if (productData.category === "Vehicles") {
				categoryType = "vehicles";
			}

			const newFormData = {
				title: productData.title || "",
				description: productData.description || "",
				price: productData.price || "",
				category: convertCategory(productData.category) || "",
				categoryType: categoryType,
				condition: convertCondition(productData.condition) || "",
				location: productData.location || "",
				region: productData.region || "",
				status: productData.status || "active",
				images: productData.images || [],
				tags: productData.tags ? productData.tags.join(", ") : "",
				brand: productData.brand || "",
				model: productData.model || "",
				categorySpecific: productData.categorySpecific || {
					propertyType: "",
					area: "",
					address: "",
					bedrooms: "",
					bathrooms: "",
					fuelType: "",
					mileage: "",
					powerKW: "",
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
				} else if (value === "Vehicles") {
					categoryType = "vehicles";
				}

				setFormData((prev) => ({
					...prev,
					category: value,
					categoryType: categoryType,
				}));
			} else if (name === "brand") {
				// Clear model when brand changes
				setFormData((prev) => ({
					...prev,
					brand: value,
					model: "",
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
		{ value: "Vehicles", label: t("categories.vehicles") || t("categories.cars") },
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
		{ value: "Used", label: t("conditions.used") },
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
						<h2>{t("createProduct.form.basicInfo") || "Basic Information"}</h2>

						<div className="form-group">
							<label htmlFor="title">{t("createProduct.form.title")} *</label>
							<input
								type="text"
								id="title"
								name="title"
								value={formData.title}
								onChange={handleInputChange}
								required
								placeholder={t("createProduct.form.title.placeholder") || "Enter product title"}
							/>
						</div>

						<div className="form-group">
							<label htmlFor="description">
								{t("createProduct.form.description")} *
							</label>
							<textarea
								id="description"
								name="description"
								value={formData.description}
								onChange={handleInputChange}
								required
								rows={4}
								placeholder={t("createProduct.form.description.placeholder") || "Describe your product"}
							/>
						</div>

						<div className="form-row">
							<div className="form-group">
								<label htmlFor="price">{t("createProduct.form.price")} *</label>
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
									{t("createProduct.form.category")} *
								</label>
								<CustomSelect
									id="category"
									name="category"
									value={formData.category}
									onChange={handleInputChange}
									required
									placeholder={t("createProduct.select.category") || "Select Category"}
									options={getTranslatedCategories()}
								/>
							</div>
						</div>

						<div className="form-row">
							<div className="form-group">
								<label htmlFor="condition">
									{t("createProduct.form.condition")} *
								</label>
								<CustomSelect
									id="condition"
									name="condition"
									value={formData.condition}
									onChange={handleInputChange}
									required
									placeholder={t("createProduct.select.condition") || "Select Condition"}
									options={getTranslatedConditions()}
								/>
							</div>

							<div className="form-group">
								<label htmlFor="status">
									{t("createProduct.form.status") || "Status"}
								</label>
								<CustomSelect
									id="status"
									name="status"
									value={formData.status}
									onChange={handleInputChange}
									options={[
										{ value: "active", label: t("product.status.active") || "Active" },
										{ value: "inactive", label: t("product.status.inactive") || "Inactive" },
										{ value: "sold", label: t("product.status.sold") || "Sold" },
									]}
								/>
							</div>
						</div>
					</div>

					{/* Location & Tags */}
					<div className="form-section">
						<h2>{t("product.additionalInfo") || "Additional Information"}</h2>

						<div className="form-group">
							<label htmlFor="location">
								{t("createProduct.form.location") || "Location"} *
							</label>
							<CustomSelect
								id="location"
								name="location"
								value={formData.location}
								onChange={(e) => {
									handleInputChange(e);
									// Clear region when location changes
									if (e.target.value !== "Скопје") {
										setFormData((prev) => ({ ...prev, region: "" }));
									}
								}}
								required
								searchable={true}
								placeholder={t("createProduct.form.location.placeholder") || "Select location"}
								options={macedonianCities.slice(1).map((city) => ({
									value: city.value,
									label: city.label,
								}))}
							/>
						</div>

						{/* Region field - only shown when Скопје is selected */}
						{formData.location === "Скопје" && (
							<div className="form-group">
								<label htmlFor="region">
									{t("createProduct.form.region") || "Region"} *
								</label>
								<CustomSelect
									id="region"
									name="region"
									value={formData.region}
									onChange={handleInputChange}
									required
									searchable={true}
									placeholder={t("createProduct.form.region.placeholder") || "Select region"}
									options={skopjeRegions.map((region) => ({
										value: region.value,
										label: region.label,
									}))}
								/>
							</div>
						)}

						<div className="form-group">
							<label htmlFor="tags">{t("createProduct.form.tags") || "Tags"}</label>
							<input
								type="text"
								id="tags"
								name="tags"
								value={formData.tags}
								onChange={handleInputChange}
								placeholder={t("createProduct.form.tags.placeholder") || "Enter tags separated by commas"}
							/>
							<small>
								{t("createProduct.form.tags.help") ||
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
									<CustomSelect
										id="categorySpecific.propertyType"
										name="categorySpecific.propertyType"
										value={formData.categorySpecific.propertyType}
										onChange={handleInputChange}
										required
										placeholder={t("createProduct.select.propertyType") || "Select Property Type"}
										options={[
											{ value: "apartment", label: t("createProduct.realEstate.propertyType.apartment") || "Apartment" },
											{ value: "house", label: t("createProduct.realEstate.propertyType.house") || "House" },
											{ value: "land", label: t("createProduct.realEstate.propertyType.land") || "Land" },
											{ value: "commercial", label: t("createProduct.realEstate.propertyType.commercial") || "Commercial" },
										]}
									/>
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
										<CustomSelect
											id="categorySpecific.bedrooms"
											name="categorySpecific.bedrooms"
											value={formData.categorySpecific.bedrooms}
											onChange={handleInputChange}
											placeholder={t("createProduct.select.bedrooms") || "Select"}
											options={[
												{ value: "1", label: "1" },
												{ value: "2", label: "2" },
												{ value: "3", label: "3" },
												{ value: "4", label: "4" },
												{ value: "5+", label: "5+" },
											]}
										/>
									</div>

									<div className="form-group">
										<label htmlFor="categorySpecific.bathrooms">
											{t("createProduct.realEstate.bathrooms") || "Bathrooms"}
										</label>
										<CustomSelect
											id="categorySpecific.bathrooms"
											name="categorySpecific.bathrooms"
											value={formData.categorySpecific.bathrooms}
											onChange={handleInputChange}
											placeholder={t("createProduct.select.bathrooms") || "Select"}
											options={[
												{ value: "1", label: "1" },
												{ value: "2", label: "2" },
												{ value: "3", label: "3" },
												{ value: "4+", label: "4+" },
											]}
										/>
									</div>
								</div>
							)}
						</div>
					)}

					{/* Vehicles Specific Fields - Show for Vehicles category, but hide for parts/accessories subcategory */}
					{formData.categoryType === "vehicles" && 
					 (!formData.subcategory || !["parts", "accessories"].includes(formData.subcategory)) && (
						<div className="form-section">
							<h2>{t("createProduct.cars.title") || "Vehicle Details"}</h2>

							{/* Brand and Model */}
							<div className="form-row">
								<div className="form-group">
									<label htmlFor="brand">
										{t("createProduct.cars.brand") || "Brand"} *
									</label>
									<CustomSelect
										id="brand"
										name="brand"
										value={formData.brand || ""}
										onChange={handleInputChange}
										placeholder={t("createProduct.select.brand") || "Select brand"}
										searchable
										options={getBrandOptions(t, false)}
									/>
								</div>
								<div className="form-group">
									<label htmlFor="model">
										{t("createProduct.cars.model") || "Model"} *
									</label>
									{formData.brand ? (
										<>
											<input
												type="text"
												id="model"
												name="model"
												list={`model-list-edit-${formData.brand}`}
												value={formData.model || ""}
												onChange={handleInputChange}
												placeholder={t("createProduct.cars.model.placeholder") || "Enter or select model"}
												autoComplete="off"
											/>
											{getModelsForBrand(formData.brand).length > 0 && (
												<datalist id={`model-list-edit-${formData.brand}`}>
													{getModelsForBrand(formData.brand).map((model, index) => (
														<option key={index} value={model} />
													))}
												</datalist>
											)}
										</>
									) : (
										<input
											type="text"
											id="model"
											name="model"
											value={formData.model || ""}
											onChange={handleInputChange}
											placeholder={t("createProduct.cars.model.placeholderSelectBrand") || "Select brand first"}
											disabled
										/>
									)}
								</div>
							</div>

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
								<label htmlFor="categorySpecific.powerKW">
									{t("createProduct.cars.powerKW") || "Power (kW)"}
								</label>
								<CustomSelect
									id="categorySpecific.powerKW"
									name="categorySpecific.powerKW"
									value={formData.categorySpecific.powerKW}
									onChange={handleInputChange}
									placeholder={t("createProduct.select.powerKW") || "Select Power (kW)"}
									searchable
									options={[
										{ value: "", label: t("createProduct.select.powerKW") || "Select Power (kW)" },
										...getPowerKWOptions(),
									]}
								/>
							</div>

								<div className="form-group">
									<label htmlFor="categorySpecific.fuelType">
										{t("createProduct.cars.fuelType") || "Fuel Type"} *
									</label>
									<CustomSelect
										id="categorySpecific.fuelType"
										name="categorySpecific.fuelType"
										value={formData.categorySpecific.fuelType}
										onChange={handleInputChange}
										required
										placeholder={t("createProduct.select.fuelType") || "Select Fuel Type"}
										options={getFuelTypeOptions(t)}
									/>
								</div>

								<div className="form-group">
									<label htmlFor="categorySpecific.transmission">
										{t("createProduct.cars.transmission") || "Transmission"} *
									</label>
									<CustomSelect
										id="categorySpecific.transmission"
										name="categorySpecific.transmission"
										value={formData.categorySpecific.transmission}
										onChange={handleInputChange}
										required
										placeholder={t("createProduct.select.transmission") || "Select Transmission"}
										options={getTransmissionOptions(t)}
									/>
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
						<h2>{t("createProduct.form.images") || "Images"}</h2>

						<div className="form-group">
							<label htmlFor="images">
								{t("createProduct.form.images.upload") || "Upload Images"}
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
									? "Uploading images..."
									: "You can upload multiple images"}
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
