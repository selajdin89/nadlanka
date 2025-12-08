// Utility functions for translating product properties

// Map category display values to translation keys
export const getCategoryTranslationKey = (categoryValue) => {
	const categoryKeyMap = {
		Electronics: "electronics",
		Furniture: "furniture",
		Cars: "cars",
		"Real Estate": "realEstate",
		Fashion: "fashion",
		Books: "books",
		Sports: "sports",
		"Home & Garden": "homeGarden",
		Services: "services",
		Other: "other",
	};

	return categoryKeyMap[categoryValue] || categoryValue?.toLowerCase();
};

export const translateCategory = (category, t) => {
	if (!category) return "";

	const categoryMap = {
		electronics: "categories.electronics",
		furniture: "categories.furniture",
		cars: "categories.cars",
		"real estate": "categories.realEstate",
		fashion: "categories.fashion",
		books: "categories.books",
		sports: "categories.sports",
		"home & garden": "categories.homeGarden",
		services: "categories.services",
		other: "categories.other",
		// Add more variations that might exist in the database
		vehicles: "categories.cars", // Map vehicles to cars
		"cars & vehicles": "categories.cars",
		"home & garden": "categories.homeGarden",
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
		like_new: "conditions.like_new",
		"like new": "conditions.like_new", // Handle space-separated version
		very_good: "conditions.very_good",
		"very good": "conditions.very_good", // Handle space-separated version
		good: "conditions.good",
		fair: "conditions.fair",
		poor: "conditions.poor",
	};

	const translationKey = conditionMap[condition?.toLowerCase()];
	const result = translationKey ? t(translationKey) : condition;

	// Debug logging

	return result;
};
