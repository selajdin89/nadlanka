// Reusable car properties - Single source of truth for all car-related data
// Used in both CreateProduct and Category filters to ensure consistency

import { carBrands, getModelsForBrand as getModelsForBrandUtil } from "./carBrands";
import { powerKWOptions, powerKWFilterOptions } from "./powerKWOptions";

// Export brands - same source as carBrands.js
export { carBrands, getModelsForBrandUtil as getModelsForBrand };

// Fuel type options - MUST match backend enum
export const FUEL_TYPES = [
	{ value: "petrol", labelKey: "createProduct.cars.fuelType.petrol", defaultLabel: "Petrol" },
	{ value: "diesel", labelKey: "createProduct.cars.fuelType.diesel", defaultLabel: "Diesel" },
	{ value: "electric", labelKey: "createProduct.cars.fuelType.electric", defaultLabel: "Electric" },
	{ value: "hybrid", labelKey: "createProduct.cars.fuelType.hybrid", defaultLabel: "Hybrid" },
];

// Get fuel type options with translations
export const getFuelTypeOptions = (t) => {
	return FUEL_TYPES.map((fuel) => ({
		value: fuel.value,
		label: t(fuel.labelKey) || fuel.defaultLabel,
	}));
};

// Transmission type options - MUST match backend enum
export const TRANSMISSION_TYPES = [
	{ value: "manual", labelKey: "createProduct.cars.transmission.manual", defaultLabel: "Manual" },
	{ value: "automatic", labelKey: "createProduct.cars.transmission.automatic", defaultLabel: "Automatic" },
];

// Get transmission options with translations
export const getTransmissionOptions = (t) => {
	return TRANSMISSION_TYPES.map((transmission) => ({
		value: transmission.value,
		label: t(transmission.labelKey) || transmission.defaultLabel,
	}));
};

// Year options generator (1980 to current year)
export const generateYearOptions = () => {
	const currentYear = new Date().getFullYear();
	return Array.from({ length: currentYear - 1979 }, (_, i) => currentYear - i);
};

// Mileage options generator (0 to 500000 km in increments of 5000)
export const generateMileageOptions = () => {
	const options = [];
	for (let i = 0; i <= 500000; i += 5000) {
		options.push({
			value: i.toString(),
			label: i.toLocaleString() + " km",
		});
	}
	return options;
};

// Get power KW options for create/edit forms (exact values)
export const getPowerKWOptions = () => {
	return powerKWOptions.map((kw) => ({
		value: kw.toString(),
		label: kw.toString() + " kW",
	}));
};

// Get power KW filter options (range values)
export const getPowerKWFilterOptions = () => {
	return powerKWFilterOptions.map((kw) => ({
		value: kw.toString(),
		label: kw.toString() + " kW",
	}));
};

// Export for direct access if needed
export { powerKWFilterOptions };

// Brand options with "All Brands" option for filters
export const getBrandOptions = (t, includeAll = false) => {
	const options = carBrands.map((brand) => ({
		value: brand,
		label: brand,
	}));
	
	if (includeAll) {
		return [
			{ value: "", label: t("category.vehicles.allBrands") || "All Brands" },
			...options,
		];
	}
	
	return options;
};

// Model options for a specific brand
export const getModelOptions = (brand, t, includeAll = false) => {
	if (!brand) {
		return includeAll 
			? [{ value: "", label: t("category.vehicles.selectBrandFirst") || "Select brand first" }]
			: [];
	}
	
	const models = getModelsForBrandUtil(brand);
	const options = models.map((model) => ({
		value: model,
		label: model,
	}));
	
	if (includeAll) {
		return [
			{ value: "", label: t("category.vehicles.allModels") || "All Models" },
			...options,
		];
	}
	
	return options;
};

// Validate that a fuel type is valid
export const isValidFuelType = (fuelType) => {
	return FUEL_TYPES.some((f) => f.value === fuelType);
};

// Validate that a transmission type is valid
export const isValidTransmissionType = (transmission) => {
	return TRANSMISSION_TYPES.some((t) => t.value === transmission);
};

