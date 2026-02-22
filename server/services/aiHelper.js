/**
 * AI Helper Service
 * Generates complete products from minimal input
 */

/**
 * Generate complete product data from minimal input (category, title, price, condition)
 */
const generateCompleteProduct = (minimalData) => {
	const { category, title, price, condition } = minimalData;

	// Generate description based on category and title
	let description = "";

	if (category === "Vehicles" || category === "Real Estate" || category === "Cars") { // Backward compatibility: Cars
		description = `${title} for sale. This ${category.toLowerCase()} is in ${condition ? condition.toLowerCase() : "excellent"} condition. `;
		
		if (category === "Vehicles" || category === "Cars") { // Backward compatibility: Cars
			description += "Well maintained and ready for inspection. Contact for more details or to schedule a viewing.";
		} else {
			description += "Perfect opportunity for buyers. Contact me for more information or to schedule a viewing.";
		}
	} else {
		description = `${title} for sale. This item is in ${condition ? condition.toLowerCase() : "excellent"} condition. `;
		description += "Great value for money. Contact me for more information or to arrange pickup/viewing.";
	}

	// Format price
	const formattedPrice = new Intl.NumberFormat("mk-MK", {
		style: "currency",
		currency: "MKD",
	}).format(price);

	description += ` Price: ${formattedPrice}.`;

	// Build complete product data
	const productData = {
		title: title.trim(),
		description: description.trim(),
		price: parseFloat(price),
		currency: "MKD",
		category: category,
		subcategory: "", // Can be filled later if needed
		condition: condition,
		status: "active",
		location: "", // Will be filled from user profile
		brand: "",
		model: "",
		contactInfo: {
			phone: "",
			email: "",
		},
		tags: [],
		images: [],
		categorySpecific: {},
	};

	return {
		success: true,
		productData: productData,
	};
};

/**
 * Generate a product title based on form data (for backward compatibility)
 */
const generateTitle = (formData) => {
	const {
		category,
		subcategory,
		brand,
		model,
		year,
		condition,
		categorySpecific,
	} = formData;

	let title = "";

	if (category === "Cars") {
		const parts = [];
		if (year) parts.push(year);
		if (brand) parts.push(brand);
		if (model) parts.push(model);
		if (categorySpecific?.fuelType) {
			parts.push(categorySpecific.fuelType.charAt(0).toUpperCase() + categorySpecific.fuelType.slice(1));
		}
		if (condition) parts.push(`(${condition})`);
		title = parts.filter(Boolean).join(" ");
	} else if (category === "Real Estate") {
		const parts = [];
		if (categorySpecific?.propertyType) {
			parts.push(categorySpecific.propertyType.charAt(0).toUpperCase() + categorySpecific.propertyType.slice(1));
		}
		if (categorySpecific?.area) {
			parts.push(`${categorySpecific.area}m²`);
		}
		if (categorySpecific?.bedrooms) {
			parts.push(`${categorySpecific.bedrooms} bedrooms`);
		}
		title = parts.filter(Boolean).join(" - ");
	} else {
		const parts = [];
		if (brand) parts.push(brand);
		if (model) parts.push(model);
		if (subcategory) {
			const subcatLabel = subcategory
				.replace(/([A-Z])/g, " $1")
				.replace(/^./, (str) => str.toUpperCase())
				.trim();
			parts.push(subcatLabel);
		} else if (category) {
			parts.push(category);
		}
		if (condition) parts.push(`(${condition})`);
		title = parts.filter(Boolean).join(" ");
	}

	if (!title.trim()) {
		title = category || "Product";
	}

	return title.length > 200 ? title.substring(0, 197) + "..." : title;
};

/**
 * Generate a product description based on form data (for backward compatibility)
 */
const generateDescription = (formData) => {
	const {
		category,
		subcategory,
		brand,
		model,
		year,
		condition,
		categorySpecific,
		price,
		currency,
		location,
	} = formData;

	const descriptionParts = [];

	if (category === "Cars") {
		descriptionParts.push(
			`${year || ""} ${brand || ""} ${model || ""}`.trim() +
				" for sale. " +
				"This vehicle is in " +
				(condition ? condition.toLowerCase() : "excellent") +
				" condition."
		);
		if (categorySpecific?.mileage) {
			descriptionParts.push(`Mileage: ${categorySpecific.mileage.toLocaleString()} km.`);
		}
		if (categorySpecific?.fuelType) {
			descriptionParts.push(`Fuel type: ${categorySpecific.fuelType}.`);
		}
		if (categorySpecific?.transmission) {
			descriptionParts.push(`Transmission: ${categorySpecific.transmission}.`);
		}
		if (categorySpecific?.color) {
			descriptionParts.push(`Color: ${categorySpecific.color}.`);
		}
	} else if (category === "Real Estate") {
		const propertyType = categorySpecific?.propertyType
			? categorySpecific.propertyType.charAt(0).toUpperCase() + categorySpecific.propertyType.slice(1)
			: "Property";
		descriptionParts.push(`${propertyType} available for sale.`);
		if (categorySpecific?.area) {
			descriptionParts.push(`Total area: ${categorySpecific.area} m².`);
		}
		if (categorySpecific?.bedrooms) {
			descriptionParts.push(`Bedrooms: ${categorySpecific.bedrooms}.`);
		}
		if (categorySpecific?.bathrooms) {
			descriptionParts.push(`Bathrooms: ${categorySpecific.bathrooms}.`);
		}
		if (categorySpecific?.address) {
			descriptionParts.push(`Location: ${categorySpecific.address}.`);
		}
		descriptionParts.push(`Property is in ${condition ? condition.toLowerCase() : "excellent"} condition.`);
	} else {
		const productName = [brand, model, subcategory, category].filter(Boolean).join(" ");
		descriptionParts.push(
			`${productName || "Product"} for sale.` +
				` This item is in ${condition ? condition.toLowerCase() : "excellent"} condition.`
		);
		if (brand) {
			descriptionParts.push(`Brand: ${brand}.`);
		}
		if (model) {
			descriptionParts.push(`Model: ${model}.`);
		}
	}

	if (location) {
		descriptionParts.push(`Located in ${location}.`);
	}

	if (price) {
		const formattedPrice = new Intl.NumberFormat("mk-MK", {
			style: "currency",
			currency: currency || "MKD",
		}).format(price);
		descriptionParts.push(`Price: ${formattedPrice}.`);
	}

	descriptionParts.push("Contact me for more information or to schedule a viewing.");

	const description = descriptionParts.join(" ");
	return description.length > 2000 ? description.substring(0, 1997) + "..." : description;
};

/**
 * Detect language of text (Macedonian, Albanian, or English)
 */
const detectLanguage = (text) => {
	if (!text || text.trim().length === 0) return "en";
	
	const textLower = text.toLowerCase();
	
	// Check for Macedonian Cyrillic characters (Macedonian Cyrillic alphabet)
	// Macedonian uses: а б в г д ѓ е ж з ѕ и ј к л љ м н њ о п р с т ќ у ф х ц ч џ ш
	const macedonianCyrillic = /[а-яёѓќѕџ]/;
	if (macedonianCyrillic.test(text)) {
		return "mk";
	}
	
	// Check for Albanian-specific characters (ë and ç)
	const albanianChars = /[ëç]/;
	if (albanianChars.test(textLower)) {
		return "sq";
	}
	
	// Check for common Macedonian words/phrases (Latin script)
	const macedonianWords = [
		"se prodava", "vo odlična", "sostojba", "cena", "lokacija", "kontakt",
		"poveke", "informacii", "odlična", "prodava", "cenata", "denari",
		"denar", "skopje", "bitola", "ohrid", "prilep"
	];
	for (const word of macedonianWords) {
		if (textLower.includes(word)) {
			return "mk";
		}
	}
	
	// Check for common Albanian words
	const albanianWords = [
		"shitje", "gjendje", "çmim", "lokacion", "kontakt", "më shumë",
		"informacion", "për shitje", "tiranë", "prishtinë", "durrës"
	];
	for (const word of albanianWords) {
		if (textLower.includes(word)) {
			return "sq";
		}
	}
	
	// Default to English
	return "en";
};

/**
 * Generate additional text in the detected language
 */
const generateAdditionalText = (formData, language) => {
	const parts = [];
	const lang = language || "en";
	
	// Translations for common phrases
	const translations = {
		mk: {
			price: "Цена",
			located: "Локација",
			contact: "Контактирајте ме за повеќе информации или за да закажете преглед.",
			mileage: "Поминати",
			fuelType: "Тип на гориво",
			transmission: "Менувачка",
			area: "Површина",
			bedrooms: "Соби",
			bathrooms: "Бањи",
		},
		sq: {
			price: "Çmim",
			located: "Vendndodhje",
			contact: "Më kontaktoni për më shumë informacion ose për të programuar një pamje.",
			mileage: "Kilometrazh",
			fuelType: "Lloji i karburantit",
			transmission: "Transmetim",
			area: "Sipërfaqja",
			bedrooms: "Dhoma gjumi",
			bathrooms: "Banjo",
		},
		en: {
			price: "Price",
			located: "Located in",
			contact: "Contact me for more information or to schedule a viewing.",
			mileage: "Mileage",
			fuelType: "Fuel type",
			transmission: "Transmission",
			area: "Total area",
			bedrooms: "Bedrooms",
			bathrooms: "Bathrooms",
		},
	};
	
	const t = translations[lang] || translations.en;
	const userTextLower = (formData.existingDescription || "").toLowerCase();
	
	// Add category-specific details
	if (formData.category === "Vehicles" || formData.category === "Cars") { // Backward compatibility: Cars
		if (formData.categorySpecific?.mileage) {
			const mileageStr = formData.categorySpecific.mileage.toLocaleString();
			if (lang === "mk" && !userTextLower.includes("поминати") && !userTextLower.includes("км")) {
				parts.push(`${t.mileage}: ${mileageStr} км.`);
			} else if (lang === "sq" && !userTextLower.includes("kilometrazh") && !userTextLower.includes("km")) {
				parts.push(`${t.mileage}: ${mileageStr} km.`);
			} else if (lang === "en" && !userTextLower.includes("mileage") && !userTextLower.includes("km")) {
				parts.push(`${t.mileage}: ${mileageStr} km.`);
			}
		}
		if (formData.categorySpecific?.fuelType) {
			const fuelType = formData.categorySpecific.fuelType;
			if (!userTextLower.includes(fuelType)) {
				parts.push(`${t.fuelType}: ${fuelType}.`);
			}
		}
		if (formData.categorySpecific?.transmission) {
			const transmission = formData.categorySpecific.transmission;
			if (!userTextLower.includes(transmission)) {
				parts.push(`${t.transmission}: ${transmission}.`);
			}
		}
	} else if (formData.category === "Real Estate") {
		if (formData.categorySpecific?.area) {
			if (lang === "mk" && !userTextLower.includes("м²") && !userTextLower.includes("површина")) {
				parts.push(`${t.area}: ${formData.categorySpecific.area} м².`);
			} else if (lang === "sq" && !userTextLower.includes("m²") && !userTextLower.includes("sipërfaqja")) {
				parts.push(`${t.area}: ${formData.categorySpecific.area} m².`);
			} else if (lang === "en" && !userTextLower.includes("m²") && !userTextLower.includes("area")) {
				parts.push(`${t.area}: ${formData.categorySpecific.area} m².`);
			}
		}
		if (formData.categorySpecific?.bedrooms) {
			if (!userTextLower.includes("соби") && !userTextLower.includes("bedroom") && !userTextLower.includes("dhoma")) {
				parts.push(`${t.bedrooms}: ${formData.categorySpecific.bedrooms}.`);
			}
		}
		if (formData.categorySpecific?.bathrooms) {
			if (!userTextLower.includes("бањи") && !userTextLower.includes("bathroom") && !userTextLower.includes("banjo")) {
				parts.push(`${t.bathrooms}: ${formData.categorySpecific.bathrooms}.`);
			}
		}
	}
	
	// Add price if not mentioned
	if (formData.price && !formData.priceByAgreement) {
		const formattedPrice = new Intl.NumberFormat(lang === "mk" ? "mk-MK" : lang === "sq" ? "sq-AL" : "en-US", {
			style: "currency",
			currency: formData.currency || "MKD",
		}).format(formData.price);
		
		if (lang === "mk" && !userTextLower.includes("цена") && !userTextLower.includes("денар")) {
			parts.push(`${t.price}: ${formattedPrice}.`);
		} else if (lang === "sq" && !userTextLower.includes("çmim")) {
			parts.push(`${t.price}: ${formattedPrice}.`);
		} else if (lang === "en" && !userTextLower.includes("price")) {
			parts.push(`${t.price}: ${formattedPrice}.`);
		}
	}
	
	// Add location if not mentioned
	if (formData.location) {
		const locationLower = formData.location.toLowerCase();
		if (!userTextLower.includes(locationLower)) {
			if (lang === "mk") {
				parts.push(`${t.located} ${formData.location}.`);
			} else {
				parts.push(`${t.located} ${formData.location}.`);
			}
		}
	}
	
	// Add closing statement if not present
	const hasContact = userTextLower.includes("контакт") || userTextLower.includes("contact") || 
	                   userTextLower.includes("kontakt") || userTextLower.includes("информаци") ||
	                   userTextLower.includes("informacion") || userTextLower.includes("information");
	
	if (!hasContact) {
		parts.push(t.contact);
	}
	
	return parts;
};

/**
 * Improve text quality - fix grammar, spelling, and improve structure
 */
const improveTextQuality = (text, language) => {
	if (!text || text.trim().length === 0) return text;
	
	let improved = text.trim();
	const lang = language || "en";
	
	// Common grammar and spelling fixes for Macedonian
	if (lang === "mk") {
		// Fix common spelling mistakes
		improved = improved.replace(/гребатинка/gi, "гребаници");
		improved = improved.replace(/многу сочуван/gi, "многу добро сочуван");
		
		// Fix spacing issues
		improved = improved.replace(/\s+/g, " "); // Multiple spaces to single
		improved = improved.replace(/\s+([,.!?])/g, "$1"); // Remove space before punctuation
		improved = improved.replace(/([,.!?])([^\s])/g, "$1 $2"); // Add space after punctuation
		
		// Capitalize first letter
		if (improved.length > 0) {
			improved = improved.charAt(0).toUpperCase() + improved.slice(1);
		}
		
		// Ensure proper sentence ending
		if (!/[.!?]$/.test(improved.trim())) {
			improved = improved.trim() + ".";
		}
		
		// Fix common word combinations and brand names
		improved = improved.replace(/\bI phone\b/gi, "iPhone");
		improved = improved.replace(/\bi phone\b/gi, "iPhone");
		
		// Improve structure: "Продавам X" -> "Се продава X" (more formal)
		if (/^продавам\s+/i.test(improved)) {
			improved = improved.replace(/^продавам\s+/i, "Се продава ");
		}
	}
	
	// Common grammar fixes for Albanian
	else if (lang === "sq") {
		improved = improved.replace(/\s+/g, " ");
		improved = improved.replace(/\s+([,.!?])/g, "$1");
		improved = improved.replace(/([,.!?])([^\s])/g, "$1 $2");
		
		if (improved.length > 0) {
			improved = improved.charAt(0).toUpperCase() + improved.slice(1);
		}
		
		if (!/[.!?]$/.test(improved.trim())) {
			improved = improved.trim() + ".";
		}
	}
	
	// Common grammar fixes for English
	else {
		improved = improved.replace(/\s+/g, " ");
		improved = improved.replace(/\s+([,.!?])/g, "$1");
		improved = improved.replace(/([,.!?])([^\s])/g, "$1 $2");
		
		if (improved.length > 0) {
			improved = improved.charAt(0).toUpperCase() + improved.slice(1);
		}
		
		if (!/[.!?]$/.test(improved.trim())) {
			improved = improved.trim() + ".";
		}
	}
	
	return improved.trim();
};

/**
 * Improve existing description - fix grammar and improve text quality
 */
const improveDescription = (existingDescription, formData) => {
	if (!existingDescription || existingDescription.trim().length < 10) {
		return existingDescription; // Return as-is if too short
	}

	// Detect language from user's text
	const language = detectLanguage(existingDescription);
	
	// Improve the text quality (grammar, spelling, structure) - keep same content
	const improved = improveTextQuality(existingDescription, language);
	
	return improved.length > 2000 ? improved.substring(0, 1997) + "..." : improved;
};

/**
 * Generate title and description (for backward compatibility)
 */
const generateProductContent = (formData) => {
	try {
		// Check if we're improving an existing description
		if (formData.improveDescription && formData.existingDescription) {
			const improvedDescription = improveDescription(formData.existingDescription, formData);
			return {
				title: generateTitle(formData).trim(),
				description: improvedDescription.trim(),
				success: true,
			};
		}
		
		const title = generateTitle(formData);
		const description = generateDescription(formData);

		return {
			title: title.trim(),
			description: description.trim(),
			success: true,
		};
	} catch (error) {
		console.error("Error generating product content:", error);
		return {
			title: "",
			description: "",
			success: false,
			error: "Failed to generate content",
		};
	}
};

module.exports = {
	generateCompleteProduct,
	generateTitle,
	generateDescription,
	generateProductContent,
};
