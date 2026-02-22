// Utility functions for translating product properties

// Map category display values to translation keys
export const getCategoryTranslationKey = (categoryValue) => {
	const categoryKeyMap = {
		Electronics: "electronics",
		Furniture: "furniture",
		Vehicles: "vehicles",
		"Real Estate": "realEstate",
		Fashion: "fashion",
		Books: "books",
		Sports: "sports",
		"Home & Garden": "homeGarden",
		Services: "services",
		Other: "other",
		// Backward compatibility
		Cars: "vehicles",
	};

	return categoryKeyMap[categoryValue] || categoryValue?.toLowerCase();
};

export const translateCategory = (category, t) => {
	if (!category) return "";

	const categoryMap = {
		electronics: "categories.electronics",
		furniture: "categories.furniture",
		vehicles: "categories.vehicles",
		cars: "categories.vehicles", // Backward compatibility - map old Cars to Vehicles
		"real estate": "categories.realEstate",
		fashion: "categories.fashion",
		books: "categories.books",
		sports: "categories.sports",
		"home & garden": "categories.homeGarden",
		services: "categories.services",
		other: "categories.other",
		// Add more variations that might exist in the database
		"cars & vehicles": "categories.vehicles",
		"home and garden": "categories.homeGarden",
	};

	const translationKey = categoryMap[category?.toLowerCase()];
	const result = translationKey ? t(translationKey) : category;

	return result;
};

export const translateCondition = (condition, t) => {
	if (!condition) return "";

	const conditionMap = {
		new: "conditions.new",
		used: "conditions.used",
		// Keep old mappings for backward compatibility with existing data
		like_new: "conditions.like_new",
		"like new": "conditions.like_new",
		very_good: "conditions.very_good",
		"very good": "conditions.very_good",
		good: "conditions.good",
		fair: "conditions.fair",
		poor: "conditions.poor",
		by_agreement: "conditions.by_agreement",
		"by agreement": "conditions.by_agreement",
	};

	const translationKey = conditionMap[condition?.toLowerCase()];
	const result = translationKey ? t(translationKey) : condition;

	// Debug logging

	return result;
};
