/**
 * Validates if a phone number is from North Macedonia
 * Supports formats:
 * - +389XXXXXXXXX (international with +)
 * - 389XXXXXXXXX (international without +)
 * - 0XX XXXXXXX (local format)
 */
export const isValidMacedoniaPhone = (phone) => {
	if (!phone) return false;

	// Remove all spaces, dashes, and parentheses
	const cleaned = phone.replace(/[\s\-\(\)]/g, "");

	// Check for North Macedonia formats:
	// +389XXXXXXXXX (international with +)
	// 389XXXXXXXXX (international without +)
	// 0XX XXXXXXX (local format - starts with 0, then area code 2-7, then 7 digits)
	if (cleaned.startsWith("+389")) {
		// International format: +389 followed by 8-9 digits
		return /^\+389[2-7]\d{7,8}$/.test(cleaned);
	} else if (cleaned.startsWith("389")) {
		// International format without +: 389 followed by 8-9 digits
		return /^389[2-7]\d{7,8}$/.test(cleaned);
	} else if (cleaned.startsWith("0")) {
		// Local format: 0 followed by area code (2-7) and 7 digits
		return /^0[2-7]\d{7}$/.test(cleaned);
	}

	return false;
};

/**
 * Formats phone number for WhatsApp (removes + and spaces, ensures 389 prefix)
 */
export const formatPhoneForWhatsApp = (phone) => {
	if (!phone) return "";
	const cleaned = phone.replace(/[\s\-\(\)]/g, "");

	// If starts with 0, replace with 389
	if (cleaned.startsWith("0")) {
		return "389" + cleaned.substring(1);
	}
	// If starts with +389, remove +
	if (cleaned.startsWith("+389")) {
		return cleaned.substring(1);
	}
	// If already starts with 389, return as is
	if (cleaned.startsWith("389")) {
		return cleaned;
	}
	return cleaned;
};

/**
 * Formats phone number for display
 */
export const formatPhoneForDisplay = (phone) => {
	if (!phone) return "";
	const cleaned = phone.replace(/[\s\-\(\)]/g, "");

	// If it's a local format (starts with 0), format as 0XX XXX XXX
	if (cleaned.startsWith("0") && cleaned.length === 9) {
		return `${cleaned.substring(0, 3)} ${cleaned.substring(
			3,
			6
		)} ${cleaned.substring(6)}`;
	}

	// If it's international format, format as +389 XX XXX XXX
	if (cleaned.startsWith("389") && cleaned.length >= 11) {
		return `+389 ${cleaned.substring(3, 5)} ${cleaned.substring(
			5,
			8
		)} ${cleaned.substring(8)}`;
	}

	return phone; // Return original if can't format
};
