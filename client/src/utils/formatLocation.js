// Helper function to format location display
// Returns "city, region" if region exists, otherwise just "city"
export const formatLocation = (location, region) => {
	if (!location) return "";
	if (region) {
		return `${location}, ${region}`;
	}
	return location;
};

