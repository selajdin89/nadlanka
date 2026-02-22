import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import "./CustomSelect.scss";

// Normalize text to handle both Latin and Cyrillic characters
const normalizeText = (text) => {
	if (!text) return "";

	// Create a mapping for Latin to Cyrillic and vice versa
	const charMap = {
		// Latin to Cyrillic
		A: "А",
		B: "В",
		C: "С",
		E: "Е",
		H: "Н",
		K: "К",
		M: "М",
		O: "О",
		P: "Р",
		T: "Т",
		X: "Х",
		Y: "У",
		a: "а",
		c: "с",
		e: "е",
		o: "о",
		p: "р",
		x: "х",
		y: "у",
		// Cyrillic to Latin
		А: "A",
		В: "B",
		С: "C",
		Е: "E",
		Н: "H",
		К: "K",
		М: "M",
		О: "O",
		Р: "P",
		Т: "T",
		Х: "X",
		У: "Y",
		а: "a",
		с: "c",
		е: "e",
		о: "o",
		р: "p",
		х: "x",
		у: "y",
	};

	// Convert to lowercase for case-insensitive comparison
	text = text.toLowerCase();

	// Replace both Latin and Cyrillic characters with a common representation
	let normalized = text;
	for (const [lat, cyr] of Object.entries(charMap)) {
		const latLower = lat.toLowerCase();
		const cyrLower = cyr.toLowerCase();
		// Replace both variants with a unified character (using Latin as base)
		normalized = normalized.replace(new RegExp(latLower, "g"), latLower);
		normalized = normalized.replace(new RegExp(cyrLower, "g"), latLower);
	}

	return normalized;
};

const CustomSelect = ({
	options = [],
	value = "",
	onChange,
	placeholder = "Select an option",
	className = "",
	disabled = false,
	required = false,
	name = "",
	id = "",
	error = false,
	searchable = false,
	keepOpenOnSelect = false,
	onSelect = null,
	slideDirection = "",
	onOpen = null,
	hasSubcategories = null, // Function to check if option has subcategories: (option) => boolean
}) => {
	const { t } = useLanguage();
	const [isOpen, setIsOpen] = useState(false);
	const [selectedOption, setSelectedOption] = useState(null);
	const [searchTerm, setSearchTerm] = useState("");
	const [animationKey, setAnimationKey] = useState(0);
	const selectRef = useRef(null);
	const dropdownRef = useRef(null);
	const searchInputRef = useRef(null);

	// Force animation retrigger when slideDirection changes
	useEffect(() => {
		if (slideDirection) {
			setAnimationKey((prev) => prev + 1);
		}
	}, [slideDirection]);

	// Track if we should maintain open state across option changes
	const shouldStayOpenRef = useRef(false);

	// Find selected option based on value
	useEffect(() => {
		const option = options.find((opt) => opt.value === value);
		setSelectedOption(option || null);
	}, [value, options]);

	// Ensure dropdown stays open when transitioning between category levels
	useEffect(() => {
		// If we should stay open (due to keepOpenOnSelect), ensure dropdown stays open
		// This is important when transitioning between category levels after options change
		if (shouldStayOpenRef.current && keepOpenOnSelect) {
			// Use a small delay to ensure this runs after any parent state updates
			const timeoutId = setTimeout(() => {
				if (shouldStayOpenRef.current && !isOpen) {
					setIsOpen(true);
				}
			}, 10);
			return () => clearTimeout(timeoutId);
		}
	}, [options, keepOpenOnSelect, isOpen]);

	// Close dropdown when clicking outside
	useEffect(() => {
		const handleClickOutside = (event) => {
			// Don't close if we should stay open (transitioning between category levels)
			if (shouldStayOpenRef.current) {
				return;
			}

			if (
				selectRef.current &&
				!selectRef.current.contains(event.target) &&
				dropdownRef.current &&
				!dropdownRef.current.contains(event.target)
			) {
				setIsOpen(false);
				setSearchTerm("");
				shouldStayOpenRef.current = false;
			}
		};

		if (isOpen) {
			document.addEventListener("mousedown", handleClickOutside);
			// Focus search input when dropdown opens (if searchable)
			if (searchable && searchInputRef.current) {
				setTimeout(() => {
					searchInputRef.current?.focus();
				}, 100);
			}
			return () => {
				document.removeEventListener("mousedown", handleClickOutside);
			};
		} else {
			// Clear search when dropdown closes
			setSearchTerm("");
			// Reset the stay open flag when dropdown closes
			shouldStayOpenRef.current = false;
		}
	}, [isOpen, searchable]);

	const handleToggle = () => {
		if (!disabled) {
			const newIsOpen = !isOpen;
			setIsOpen(newIsOpen);
			// Reset the stay open flag when user manually toggles
			if (!newIsOpen) {
				shouldStayOpenRef.current = false;
			}
			// Call onOpen callback when opening
			if (newIsOpen && onOpen) {
				onOpen();
			}
		}
	};

	const handleSelect = (option) => {
		setSelectedOption(option);

		// Check if we should keep dropdown open BEFORE calling onChange
		// This allows the parent to update state before we decide to close
		// If onSelect callback is provided, use its return value (it can override keepOpenOnSelect)
		// Otherwise, use keepOpenOnSelect prop
		let shouldKeepOpen;
		if (onSelect) {
			// onSelect callback has priority - it can explicitly return false to close
			const onSelectResult = onSelect(option);
			shouldKeepOpen = onSelectResult !== false; // Only close if explicitly false
		} else {
			// No callback, use the prop
			shouldKeepOpen = keepOpenOnSelect;
		}

		// Track that we should stay open across re-renders IMMEDIATELY
		shouldStayOpenRef.current = shouldKeepOpen;

		// Keep dropdown open BEFORE calling onChange to prevent any closing
		if (shouldKeepOpen) {
			setIsOpen(true);
		}

		onChange({
			target: {
				name: name,
				value: option.value,
			},
		});

		// After onChange, ensure dropdown state is correct
		// Use setTimeout to ensure this runs after parent state updates complete
		setTimeout(() => {
			if (!shouldKeepOpen) {
				setIsOpen(false);
				setSearchTerm("");
				shouldStayOpenRef.current = false;
			} else {
				// Force it to stay open - this is crucial for category navigation
				setIsOpen(true);
				setSearchTerm("");
				// Double-check after a tiny delay to ensure it stays open
				setTimeout(() => {
					if (shouldStayOpenRef.current && !isOpen) {
						setIsOpen(true);
					}
				}, 50);
			}
		}, 0);
		// If shouldKeepOpen is true, the dropdown stays open and options will update via props
	};

	const handleSearchChange = (e) => {
		setSearchTerm(e.target.value);
	};

	// Normalize text to handle both Latin and Cyrillic characters
	// Converts Cyrillic to Latin equivalents for unified searching
	const normalizeForSearch = (text) => {
		if (!text) return "";

		// Convert to lowercase first
		let normalized = text.toLowerCase();

		// Map Cyrillic characters to their Latin equivalents (Macedonian alphabet)
		// Process in order to handle multi-character mappings first (џ, ќ, ч, ж, ш)
		normalized = normalized
			.replace(/џ/g, "dz")
			.replace(/ќ/g, "kj")
			.replace(/ч/g, "ch")
			.replace(/ж/g, "zh")
			.replace(/ш/g, "sh")
			.replace(/а/g, "a")
			.replace(/б/g, "b")
			.replace(/в/g, "v")
			.replace(/г/g, "g")
			.replace(/д/g, "d")
			.replace(/е/g, "e")
			.replace(/з/g, "z")
			.replace(/и/g, "i")
			.replace(/ј/g, "j")
			.replace(/к/g, "k")
			.replace(/л/g, "l")
			.replace(/м/g, "m")
			.replace(/н/g, "n")
			.replace(/о/g, "o")
			.replace(/п/g, "p")
			.replace(/р/g, "r")
			.replace(/с/g, "s")
			.replace(/т/g, "t")
			.replace(/у/g, "u")
			.replace(/ф/g, "f")
			.replace(/х/g, "h")
			.replace(/ц/g, "c");

		return normalized;
	};

	// Filter options based on search term (handling both Latin and Cyrillic)
	const filteredOptions =
		searchable && searchTerm
			? options.filter((option) => {
					const normalizedSearch = normalizeForSearch(searchTerm);
					const normalizedLabel = normalizeForSearch(option.label);
					return normalizedLabel.includes(normalizedSearch);
			  })
			: options;

	const displayValue = selectedOption ? selectedOption.label : placeholder;
	const hasValue = selectedOption !== null;

	return (
		<div
			className={`custom-select ${className} ${error ? "error" : ""} ${
				disabled ? "disabled" : ""
			} ${isOpen ? "open" : ""}`}
			ref={selectRef}
		>
			<div
				className="custom-select-trigger"
				onClick={handleToggle}
				role="button"
				tabIndex={disabled ? -1 : 0}
				onKeyDown={(e) => {
					if (e.key === "Enter" || e.key === " ") {
						e.preventDefault();
						handleToggle();
					}
				}}
			>
				<span
					className={`custom-select-value ${!hasValue ? "placeholder" : ""}`}
				>
					{displayValue}
				</span>
				<ChevronDown
					className={`custom-select-arrow ${isOpen ? "open" : ""}`}
					size={20}
				/>
			</div>
			{isOpen && (
				<div
					className="custom-select-dropdown"
					ref={dropdownRef}
					onClick={(e) => e.stopPropagation()}
					onMouseDown={(e) => e.stopPropagation()}
				>
					{searchable && (
						<div className="custom-select-search">
							<input
								ref={searchInputRef}
								type="text"
								placeholder={t("common.search.placeholder") || "Search..."}
								value={searchTerm}
								onChange={handleSearchChange}
								onClick={(e) => e.stopPropagation()}
								className="custom-select-search-input"
							/>
						</div>
					)}
					<div
						key={animationKey}
						className={`custom-select-options-list ${
							slideDirection ? `slide-${slideDirection}` : ""
						}`}
					>
						{filteredOptions.length > 0 ? (
							filteredOptions.map((option) => {
								const hasSubs = hasSubcategories && hasSubcategories(option);
								return (
									<div
										key={option.value}
										className={`custom-select-option ${
											selectedOption?.value === option.value ? "selected" : ""
										} ${option.disabled ? "disabled" : ""} ${
											hasSubs ? "has-subcategories" : ""
										}`}
										onClick={(e) => {
											e.stopPropagation();
											e.preventDefault();
											if (!option.disabled) {
												handleSelect(option);
											}
										}}
										role="option"
										aria-selected={selectedOption?.value === option.value}
									>
										<span className="custom-select-option-label">
											{option.label}
										</span>
										{hasSubs && (
											<ChevronRight
												size={16}
												className="custom-select-option-arrow"
											/>
										)}
									</div>
								);
							})
						) : (
							<div className="custom-select-option disabled">
								{searchTerm
									? t("common.search.noResults") || "No results found"
									: t("common.select.noOptions") || "No options available"}
							</div>
						)}
					</div>
				</div>
			)}
			{required && (
				<input
					type="hidden"
					name={name}
					value={value || ""}
					required={required}
				/>
			)}
		</div>
	);
};

export default CustomSelect;
