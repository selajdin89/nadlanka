import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { useLanguage } from "../contexts/LanguageContext";
import { useAuth } from "../contexts/AuthContext";
import { getCategoryTranslationKey } from "../utils/productTranslations";
import { isValidMacedoniaPhone } from "../utils/phoneValidation";

const CreateProduct = () => {
	const { t } = useLanguage();
	const navigate = useNavigate();
	const location = useLocation();
	const { isAuthenticated, loading: authLoading, user } = useAuth();
	const [categories, setCategories] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [success, setSuccess] = useState(null);
	const [formData, setFormData] = useState({
		title: "",
		description: "",
		price: "",
		currency: "MKD",
		category: "",
		categoryType: "", // general, realEstate, cars
		condition: "",
		status: "active",
		location: "",
		contactInfo: {
			phone: "",
			email: "",
		},
		tags: "",
		images: [],
		// Category-specific fields
		categorySpecific: {
			// Real Estate fields
			propertyType: "", // apartment, house, land, commercial
			area: "", // in m²
			address: "",
			bedrooms: "",
			bathrooms: "",
			// Car fields
			fuelType: "", // petrol, diesel, electric, hybrid
			mileage: "", // in km
			year: "",
			transmission: "", // manual, automatic
			color: "",
		},
	});
	const [uploadingImages, setUploadingImages] = useState(false);

	// Redirect to login if not authenticated
	useEffect(() => {
		if (!authLoading && !isAuthenticated) {
			navigate("/login", {
				state: {
					from: "/create-product",
					message: "Please log in to create an ad",
				},
			});
		}
	}, [isAuthenticated, authLoading, navigate]);

	useEffect(() => {
		if (isAuthenticated) {
			fetchCategories();
			// Auto-populate phone and email from user profile
			if (user?.phone) {
				setFormData((prev) => ({
					...prev,
					contactInfo: {
						...prev.contactInfo,
						phone: user.phone,
					},
				}));
			}
			if (user?.email) {
				setFormData((prev) => ({
					...prev,
					contactInfo: {
						...prev.contactInfo,
						email: user.email,
					},
				}));
			}
		}
	}, [isAuthenticated, user]);

	const fetchCategories = async () => {
		try {
			const response = await axios.get("/api/categories");
			setCategories(response.data);
		} catch (error) {
			console.error("Error fetching categories:", error);
		}
	};

	const handleChange = (e) => {
		const { name, value } = e.target;
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
					categorySpecific:
						categoryType === "general"
							? {
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
							  }
							: {
									...prev.categorySpecific,
									// Clear fields from other category types
									...(categoryType === "realEstate" && {
										fuelType: "",
										mileage: "",
										year: "",
										transmission: "",
										color: "",
									}),
									...(categoryType === "cars" && {
										propertyType: "",
										area: "",
										address: "",
										bedrooms: "",
										bathrooms: "",
									}),
							  },
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
			const formData = new FormData();
			files.forEach((file) => {
				formData.append("images", file);
			});

			const response = await axios.post("/api/upload", formData, {
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
		}
	};

	const removeImage = (index) => {
		setFormData((prev) => ({
			...prev,
			images: prev.images.filter((_, i) => i !== index),
		}));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError(null);
		setSuccess(null);

		try {
			if (!user || !user._id) {
				setError(
					t("createProduct.authRequired") ||
						"You must be logged in to create a product"
				);
				setLoading(false);
				return;
			}

			// Validate phone number if provided
			if (
				formData.contactInfo.phone &&
				!isValidMacedoniaPhone(formData.contactInfo.phone)
			) {
				setError(
					t("createProduct.invalidPhone") ||
						"Please enter a valid North Macedonia phone number (e.g., +389 XX XXX XXX or 0XX XXX XXX)"
				);
				setLoading(false);
				return;
			}

			const productData = {
				...formData,
				price: parseFloat(formData.price),
				tags: formData.tags
					.split(",")
					.map((tag) => tag.trim())
					.filter((tag) => tag),
				seller: user._id,
				categorySpecific: formData.categorySpecific,
			};

			const response = await axios.post("/api/products", productData);
			setSuccess(t("createProduct.success"));

			// Redirect to the product detail page
			setTimeout(() => {
				navigate(`/products/${response.data._id}`);
			}, 2000);
		} catch (error) {
			console.error("Error creating product:", error);
			setError(error.response?.data?.error || t("createProduct.error"));
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="create-product-container">
			<div className="create-product-header">
				<h1>{t("createProduct.title")}</h1>
				<p>{t("createProduct.form.description.placeholder")}</p>
			</div>

			<form onSubmit={handleSubmit} className="create-product-form">
				{error && <div className="error-message">{error}</div>}
				{success && <div className="success-message">{success}</div>}

				{/* Category Type Selection - Moved to Top */}
				<div className="form-section">
					<h3>{t("createProduct.categoryType.title")}</h3>
					<p className="form-help">
						{t("createProduct.categoryType.description")}
					</p>

					<div className="category-type-selection">
						<div className="radio-group">
							<label className="radio-option">
								<input
									type="radio"
									name="categoryType"
									value="general"
									checked={formData.categoryType === "general"}
									onChange={() => {
										setFormData((prev) => ({
											...prev,
											categoryType: "general",
											categorySpecific: {
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
										}));
									}}
								/>
								<span className="radio-label">
									<div className="radio-title">
										{t("createProduct.categoryType.general")}
									</div>
									<div className="radio-description">
										{t("createProduct.categoryType.generalDesc")}
									</div>
								</span>
							</label>
						</div>

						<div className="radio-group">
							<label className="radio-option">
								<input
									type="radio"
									name="categoryType"
									value="realEstate"
									checked={formData.categoryType === "realEstate"}
									onChange={() => {
										setFormData((prev) => ({
											...prev,
											categoryType: "realEstate",
											category: "Real Estate",
											categorySpecific: {
												...prev.categorySpecific,
												fuelType: "",
												mileage: "",
												year: "",
												transmission: "",
												color: "",
											},
										}));
									}}
								/>
								<span className="radio-label">
									<div className="radio-title">
										🏠 {t("createProduct.categoryType.realEstate")}
									</div>
									<div className="radio-description">
										{t("createProduct.categoryType.realEstateDesc")}
									</div>
								</span>
							</label>
						</div>

						<div className="radio-group">
							<label className="radio-option">
								<input
									type="radio"
									name="categoryType"
									value="cars"
									checked={formData.categoryType === "cars"}
									onChange={() => {
										setFormData((prev) => ({
											...prev,
											categoryType: "cars",
											category: "Cars",
											categorySpecific: {
												...prev.categorySpecific,
												propertyType: "",
												area: "",
												address: "",
												bedrooms: "",
												bathrooms: "",
											},
										}));
									}}
								/>
								<span className="radio-label">
									<div className="radio-title">
										🚗 {t("createProduct.categoryType.cars")}
									</div>
									<div className="radio-description">
										{t("createProduct.categoryType.carsDesc")}
									</div>
								</span>
							</label>
						</div>
					</div>
				</div>

				<div className="form-section">
					<h3>{t("createProduct.form.basicInfo")}</h3>

					<div className="form-group">
						<label htmlFor="title">{t("createProduct.form.title")} *</label>
						<input
							type="text"
							id="title"
							name="title"
							value={formData.title}
							onChange={handleChange}
							required
							placeholder={t("createProduct.form.title.placeholder")}
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
							onChange={handleChange}
							required
							rows="4"
							placeholder={t("createProduct.form.description.placeholder")}
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
								onChange={handleChange}
								required
								min="0"
								step="0.01"
								placeholder="0.00"
							/>
						</div>

						<div className="form-group">
							<label htmlFor="currency">
								{t("createProduct.form.currency")}
							</label>
							<select
								id="currency"
								name="currency"
								value={formData.currency}
								onChange={handleChange}
							>
								<option value="MKD">{t("common.currency.mkd")}</option>
								<option value="EUR">{t("common.currency.eur")}</option>
								<option value="USD">{t("common.currency.usd")}</option>
							</select>
						</div>
					</div>

					<div className="form-row">
						<div className="form-group">
							<label htmlFor="category">
								{t("createProduct.form.category")} *
							</label>
							<select
								id="category"
								name="category"
								value={formData.category}
								onChange={handleChange}
								required
								disabled={
									formData.categoryType === "realEstate" ||
									formData.categoryType === "cars"
								}
							>
								<option value="">
									{t("createProduct.select.category") ||
										t("product.selectCategory") ||
										"Select category"}
								</option>
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

						<div className="form-group">
							<label htmlFor="condition">
								{t("createProduct.form.condition")} *
							</label>
							<select
								id="condition"
								name="condition"
								value={formData.condition}
								onChange={handleChange}
								required
							>
								<option value="">
									{t("createProduct.select.condition") || "Select condition"}
								</option>
								<option value="New">{t("conditions.new")}</option>
								<option value="Like New">{t("conditions.like_new")}</option>
								<option value="Very Good">{t("conditions.very_good")}</option>
								<option value="Good">{t("conditions.good")}</option>
								<option value="Fair">{t("conditions.fair")}</option>
								<option value="Poor">{t("conditions.poor")}</option>
							</select>
						</div>
					</div>

					<div className="form-group">
						<label htmlFor="location">
							{t("createProduct.form.location")} *
						</label>
						<input
							type="text"
							id="location"
							name="location"
							value={formData.location}
							onChange={handleChange}
							required
							placeholder={t("createProduct.form.location.placeholder")}
						/>
					</div>
				</div>

				{/* Real Estate Specific Fields */}
				{formData.categoryType === "realEstate" && (
					<div className="form-section">
						<h3>{t("createProduct.realEstate.title")}</h3>

						<div className="form-row">
							<div className="form-group">
								<label htmlFor="categorySpecific.propertyType">
									{t("createProduct.realEstate.propertyType")} *
								</label>
								<select
									id="categorySpecific.propertyType"
									name="categorySpecific.propertyType"
									value={formData.categorySpecific.propertyType}
									onChange={handleChange}
									required
								>
									<option value="">
										{t("createProduct.select.propertyType")}
									</option>
									<option value="apartment">
										{t("createProduct.realEstate.propertyType.apartment")}
									</option>
									<option value="house">
										{t("createProduct.realEstate.propertyType.house")}
									</option>
									<option value="land">
										{t("createProduct.realEstate.propertyType.land")}
									</option>
									<option value="commercial">
										{t("createProduct.realEstate.propertyType.commercial")}
									</option>
								</select>
							</div>

							<div className="form-group">
								<label htmlFor="categorySpecific.area">
									{t("createProduct.realEstate.area")} *
								</label>
								<input
									type="number"
									id="categorySpecific.area"
									name="categorySpecific.area"
									value={formData.categorySpecific.area}
									onChange={handleChange}
									required
									min="1"
									placeholder={t("createProduct.realEstate.area.placeholder")}
								/>
							</div>
						</div>

						<div className="form-group">
							<label htmlFor="categorySpecific.address">
								{t("createProduct.realEstate.address")} *
							</label>
							<input
								type="text"
								id="categorySpecific.address"
								name="categorySpecific.address"
								value={formData.categorySpecific.address}
								onChange={handleChange}
								required
								placeholder={t("createProduct.realEstate.address.placeholder")}
							/>
						</div>

						{(formData.categorySpecific.propertyType === "apartment" ||
							formData.categorySpecific.propertyType === "house") && (
							<div className="form-row">
								<div className="form-group">
									<label htmlFor="categorySpecific.bedrooms">
										{t("createProduct.realEstate.bedrooms")}
									</label>
									<select
										id="categorySpecific.bedrooms"
										name="categorySpecific.bedrooms"
										value={formData.categorySpecific.bedrooms}
										onChange={handleChange}
									>
										<option value="">
											{t("createProduct.select.bedrooms")}
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
										{t("createProduct.realEstate.bathrooms")}
									</label>
									<select
										id="categorySpecific.bathrooms"
										name="categorySpecific.bathrooms"
										value={formData.categorySpecific.bathrooms}
										onChange={handleChange}
									>
										<option value="">
											{t("createProduct.select.bathrooms")}
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
						<h3>{t("createProduct.cars.title")}</h3>

						<div className="form-row">
							<div className="form-group">
								<label htmlFor="categorySpecific.year">
									{t("createProduct.cars.year")} *
								</label>
								<input
									type="number"
									id="categorySpecific.year"
									name="categorySpecific.year"
									value={formData.categorySpecific.year}
									onChange={handleChange}
									required
									min="1900"
									max={new Date().getFullYear() + 1}
									placeholder={t("createProduct.cars.year.placeholder")}
								/>
							</div>

							<div className="form-group">
								<label htmlFor="categorySpecific.mileage">
									{t("createProduct.cars.mileage")}
								</label>
								<input
									type="number"
									id="categorySpecific.mileage"
									name="categorySpecific.mileage"
									value={formData.categorySpecific.mileage}
									onChange={handleChange}
									min="0"
									placeholder={t("createProduct.cars.mileage.placeholder")}
								/>
							</div>
						</div>

						<div className="form-row">
							<div className="form-group">
								<label htmlFor="categorySpecific.fuelType">
									{t("createProduct.cars.fuelType")} *
								</label>
								<select
									id="categorySpecific.fuelType"
									name="categorySpecific.fuelType"
									value={formData.categorySpecific.fuelType}
									onChange={handleChange}
									required
								>
									<option value="">{t("createProduct.select.fuelType")}</option>
									<option value="petrol">
										{t("createProduct.cars.fuelType.petrol")}
									</option>
									<option value="diesel">
										{t("createProduct.cars.fuelType.diesel")}
									</option>
									<option value="electric">
										{t("createProduct.cars.fuelType.electric")}
									</option>
									<option value="hybrid">
										{t("createProduct.cars.fuelType.hybrid")}
									</option>
								</select>
							</div>

							<div className="form-group">
								<label htmlFor="categorySpecific.transmission">
									{t("createProduct.cars.transmission")} *
								</label>
								<select
									id="categorySpecific.transmission"
									name="categorySpecific.transmission"
									value={formData.categorySpecific.transmission}
									onChange={handleChange}
									required
								>
									<option value="">
										{t("createProduct.select.transmission")}
									</option>
									<option value="manual">
										{t("createProduct.cars.transmission.manual")}
									</option>
									<option value="automatic">
										{t("createProduct.cars.transmission.automatic")}
									</option>
								</select>
							</div>
						</div>

						<div className="form-group">
							<label htmlFor="categorySpecific.color">
								{t("createProduct.cars.color")}
							</label>
							<input
								type="text"
								id="categorySpecific.color"
								name="categorySpecific.color"
								value={formData.categorySpecific.color}
								onChange={handleChange}
								placeholder={t("createProduct.cars.color.placeholder")}
							/>
						</div>
					</div>
				)}

				<div className="form-section">
					<h3>{t("createProduct.form.images")}</h3>
					<div className="form-group">
						<label htmlFor="images">
							{t("createProduct.form.images.upload")}
						</label>
						<input
							type="file"
							id="images"
							multiple
							accept="image/*"
							onChange={handleImageChange}
							disabled={uploadingImages}
						/>
						<p className="form-help">
							{uploadingImages
								? "Uploading images..."
								: "You can upload multiple images"}
						</p>
					</div>

					{formData.images.length > 0 && (
						<div className="image-preview">
							{formData.images.map((image, index) => (
								<div key={index} className="image-item">
									<img src={image} alt={`Preview ${index + 1}`} />
									<button
										type="button"
										onClick={() => removeImage(index)}
										className="remove-image"
									>
										×
									</button>
								</div>
							))}
						</div>
					)}
				</div>

				<div className="form-section">
					<h3>{t("createProduct.form.contactInfo")}</h3>
					<div className="form-row">
						<div className="form-group">
							<label htmlFor="contactInfo.phone">{t("common.phone")}</label>
							<input
								type="tel"
								id="contactInfo.phone"
								name="contactInfo.phone"
								value={formData.contactInfo.phone}
								onChange={handleChange}
								placeholder="+389 XX XXX XXX or 0XX XXX XXX"
							/>
							{formData.contactInfo.phone &&
								!isValidMacedoniaPhone(formData.contactInfo.phone) && (
									<small className="field-error">
										{t("createProduct.invalidPhoneFormat") ||
											"Please enter a valid North Macedonia phone number"}
									</small>
								)}
						</div>

						<div className="form-group">
							<label htmlFor="contactInfo.email">{t("common.email")}</label>
							<input
								type="email"
								id="contactInfo.email"
								name="contactInfo.email"
								value={formData.contactInfo.email}
								onChange={handleChange}
								placeholder="your@email.com"
							/>
						</div>
					</div>
				</div>

				<div className="form-section">
					<h3>{t("createProduct.form.tags")}</h3>
					<div className="form-group">
						<label htmlFor="tags">
							{t("createProduct.form.tags")} (comma-separated)
						</label>
						<input
							type="text"
							id="tags"
							name="tags"
							value={formData.tags}
							onChange={handleChange}
							placeholder={t("createProduct.form.tags.placeholder")}
						/>
						<p className="form-help">
							Add tags to help people find your product
						</p>
					</div>
				</div>

				<div className="form-actions">
					<button
						type="button"
						onClick={() => navigate("/products")}
						className="btn btn-secondary"
					>
						{t("createProduct.form.cancel")}
					</button>
					<button type="submit" disabled={loading} className="btn btn-primary">
						{loading ? t("common.loading") : t("createProduct.form.submit")}
					</button>
				</div>
			</form>
		</div>
	);
};

export default CreateProduct;
