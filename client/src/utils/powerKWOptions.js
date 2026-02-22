// Valid power KW options for vehicles
// Comprehensive list covering all valid engine power outputs
// From 10 kW (small electric vehicles) to 500 kW (high-performance vehicles)
// Use this for CREATE/EDIT forms where users need to select exact values
export const powerKWOptions = (() => {
	const options = [];
	
	// 10-200 kW: Increments of 1 kW (covers ALL values including 103, 105, 107, etc.)
	// This range covers the vast majority of passenger vehicles with complete precision
	for (let i = 10; i <= 200; i += 1) {
		options.push(i);
	}
	
	// 210-500 kW: Increments of 10 kW (high-performance and luxury vehicles)
	// Fewer variations needed in this range
	for (let i = 210; i <= 500; i += 10) {
		options.push(i);
	}
	
	return options;
})();

// Simplified power KW options for FILTERS (range selection)
// Use this for filter pages where users select "from" and "to" ranges
// Larger increments make it easier to select ranges
export const powerKWFilterOptions = (() => {
	const options = [];
	
	// 10-200 kW: Increments of 5 kW (simplified for range filtering)
	// This provides reasonable steps for filtering while keeping the list manageable
	for (let i = 10; i <= 200; i += 5) {
		options.push(i);
	}
	
	// 210-500 kW: Increments of 10 kW (high-performance range)
	for (let i = 210; i <= 500; i += 10) {
		options.push(i);
	}
	
	return options;
})();

// Convert options to format suitable for CustomSelect component
export const getPowerKWSelectOptions = (t) => {
	return powerKWOptions.map((kw) => ({
		value: kw.toString(),
		label: kw.toString() + " kW",
	}));
};

