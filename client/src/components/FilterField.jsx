import React from "react";
import CustomSelect from "./CustomSelect";
import { useLanguage } from "../contexts/LanguageContext";
import "./FilterField.scss";

/**
 * Reusable FilterField component for category filters
 * Supports both single select and range (min/max) filters
 * Automatically formats placeholders with labels (e.g., "Area From", "Price From")
 */
const FilterField = ({
	type = "single", // "single" or "range"
	label, // Main label (e.g., "Area", "Price", "Brand")
	value, // For single select
	minValue, // For range select
	maxValue, // For range select
	options = [], // Array of {value, label} objects
	onChange, // For single select: (e) => void
	onMinChange, // For range select: (e) => void
	onMaxChange, // For range select: (e) => void
	placeholder, // Optional custom placeholder (overrides default)
	searchable = false,
	disabled = false,
	// Additional props to pass to CustomSelect
	...customSelectProps
}) => {
	const { t } = useLanguage();

	// Generate placeholders with labels
	const getPlaceholder = (suffix) => {
		if (placeholder) return placeholder;
		if (suffix) {
			// For range fields: "Area From", "Price From", etc.
			// suffix will be "Од" (From) or "До" (To)
			return `${label} ${suffix}`;
		}
		// For single fields: just the label
		return label;
	};

	// Get "From" and "To" translations
	const fromText = t("category.realEstate.from") || "Од";
	const toText = t("category.realEstate.to") || "До";

	if (type === "range") {
		// Range filter: two CustomSelects side by side
		const minPlaceholder = getPlaceholder(fromText);
		const maxPlaceholder = getPlaceholder(toText);
		
		return (
			<div className="filter-field filter-field-range">
				<div className="range-selects">
					<CustomSelect
						value={minValue || ""}
						onChange={onMinChange}
						placeholder={minPlaceholder}
						options={[
							{
								value: "",
								label: minPlaceholder,
							},
							...options,
						]}
						searchable={searchable}
						disabled={disabled}
						{...customSelectProps}
					/>
					<CustomSelect
						value={maxValue || ""}
						onChange={onMaxChange}
						placeholder={maxPlaceholder}
						options={[
							{
								value: "",
								label: maxPlaceholder,
							},
							...options,
						]}
						searchable={searchable}
						disabled={disabled}
						{...customSelectProps}
					/>
				</div>
			</div>
		);
	}

	// Single select filter
	return (
		<div className="filter-field filter-field-single">
			<CustomSelect
				value={value || ""}
				onChange={onChange}
				placeholder={getPlaceholder()}
				options={[
					{
						value: "",
						label: getPlaceholder(),
					},
					...options,
				]}
				searchable={searchable}
				disabled={disabled}
				{...customSelectProps}
			/>
		</div>
	);
};

export default FilterField;

