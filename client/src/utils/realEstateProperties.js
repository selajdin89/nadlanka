// Reusable Real Estate properties - Single source of truth for all real estate-related data
// Used in both CreateProduct and Category filters to ensure consistency

// Number of rooms options (bedrooms)
export const generateBedroomOptions = () => {
	return Array.from({ length: 10 }, (_, i) => i + 1); // 1 to 10 rooms
};

// Area options (square meters) - for filters (ranges) - matching reklama5.mk
export const generateAreaFilterOptions = () => {
	// reklama5.mk uses: 40, 60, 80, 100, 150, 300, 500
	const specificValues = [40, 60, 80, 100, 150, 300, 500];
	return specificValues.map((value) => ({
		value: value.toString(),
		label: value.toString() + " m²",
	}));
};

// Area options for form input (exact values or ranges)
export const generateAreaOptions = () => {
	const options = [];
	// More detailed options for form: 10-200 in increments of 5, then larger increments
	for (let i = 10; i <= 200; i += 5) {
		options.push({
			value: i.toString(),
			label: i.toString() + " m²",
		});
	}
	for (let i = 220; i <= 500; i += 20) {
		options.push({
			value: i.toString(),
			label: i.toString() + " m²",
		});
	}
	for (let i = 550; i <= 1000; i += 50) {
		options.push({
			value: i.toString(),
			label: i.toString() + " m²",
		});
	}
	return options;
};

// Floor options - matching reklama5.mk format
// reklama5.mk uses: Приземје, 1 кат, 2 кат, 3 кат, ... 14 кат, >15 кат
export const generateFloorOptions = () => {
	const options = [];
	// Ground floor (Приземје) = 0
	options.push(0);
	// Floors 1-14
	for (let i = 1; i <= 14; i++) {
		options.push(i);
	}
	// >15 кат = 15 (we'll use 15+ as a special value)
	options.push(15);
	return options;
};

// Get floor label with translation
export const getFloorLabel = (floor, t) => {
	if (floor === 0) {
		return t("realEstate.floor.ground") || "Приземје";
	}
	if (floor === 15) {
		return t("realEstate.floor.above15") || ">15 кат";
	}
	return `${floor} ${t("realEstate.floor.level") || "кат"}`;
};

// Heating type options for apartments - MUST match backend enum
export const HEATING_TYPES = [
	{ value: "none", labelKey: "realEstate.heating.none", defaultLabel: "Нема" },
	{
		value: "central",
		labelKey: "realEstate.heating.central",
		defaultLabel: "Централно",
	},
	{
		value: "electric",
		labelKey: "realEstate.heating.electric",
		defaultLabel: "Струја",
	},
	{ value: "wood", labelKey: "realEstate.heating.wood", defaultLabel: "Дрва" },
	{
		value: "solar",
		labelKey: "realEstate.heating.solar",
		defaultLabel: "Соларна енергија",
	},
	{
		value: "other",
		labelKey: "realEstate.heating.other",
		defaultLabel: "Друго",
	},
];

// Get heating type options with translations
export const getHeatingTypeOptions = (t) => {
	return HEATING_TYPES.map((heating) => ({
		value: heating.value,
		label: t(heating.labelKey) || heating.defaultLabel,
	}));
};

// Apartment type options - MUST match backend enum
export const APARTMENT_TYPES = [
	{
		value: "inBuilding",
		labelKey: "realEstate.apartmentType.inBuilding",
		defaultLabel: "Во Зграда",
	},
	{
		value: "inHouse",
		labelKey: "realEstate.apartmentType.inHouse",
		defaultLabel: "Во куќа",
	},
];

// Get apartment type options with translations
export const getApartmentTypeOptions = (t) => {
	return APARTMENT_TYPES.map((type) => ({
		value: type.value,
		label: t(type.labelKey) || type.defaultLabel,
	}));
};

// Equipment options for apartments - MUST match backend enum
export const EQUIPMENT_OPTIONS = [
	{
		value: "furnished",
		labelKey: "realEstate.equipment.furnished",
		defaultLabel: "Наместен",
	},
	{
		value: "semiFurnished",
		labelKey: "realEstate.equipment.semiFurnished",
		defaultLabel: "Полу наместен",
	},
	{
		value: "unfurnished",
		labelKey: "realEstate.equipment.unfurnished",
		defaultLabel: "Празен",
	},
	{
		value: "luxurious",
		labelKey: "realEstate.equipment.luxurious",
		defaultLabel: "Луксузен",
	},
];

// Get equipment options with translations
export const getEquipmentOptions = (t) => {
	return EQUIPMENT_OPTIONS.map((equipment) => ({
		value: equipment.value,
		label: t(equipment.labelKey) || equipment.defaultLabel,
	}));
};

// Validate that a heating type is valid
export const isValidHeatingType = (heatingType) => {
	return HEATING_TYPES.some((h) => h.value === heatingType);
};

// Validate that an apartment type is valid
export const isValidApartmentType = (apartmentType) => {
	return APARTMENT_TYPES.some((t) => t.value === apartmentType);
};

// Validate that equipment is valid
export const isValidEquipment = (equipment) => {
	return EQUIPMENT_OPTIONS.some((e) => e.value === equipment);
};

// Apartment-specific condition options - different from general product conditions
export const APARTMENT_CONDITION_OPTIONS = [
	{ value: "new", labelKey: "realEstate.condition.new", defaultLabel: "Нов" },
	{ value: "old", labelKey: "realEstate.condition.old", defaultLabel: "Стар" },
	{
		value: "renovated",
		labelKey: "realEstate.condition.renovated",
		defaultLabel: "Реновиран",
	},
	{
		value: "underConstruction",
		labelKey: "realEstate.condition.underConstruction",
		defaultLabel: "Во градба",
	},
];

// Get apartment condition options with translations
export const getApartmentConditionOptions = (t) => {
	return APARTMENT_CONDITION_OPTIONS.map((condition) => ({
		value: condition.value,
		label: t(condition.labelKey) || condition.defaultLabel,
	}));
};

// House/Villa-specific condition options - using feminine forms (Нова, Стара, Реновирана, Во градба)
export const HOUSE_VILLA_CONDITION_OPTIONS = [
	{
		value: "new",
		labelKey: "realEstate.condition.newFeminine",
		defaultLabel: "Нова",
	},
	{
		value: "old",
		labelKey: "realEstate.condition.oldFeminine",
		defaultLabel: "Стара",
	},
	{
		value: "renovated",
		labelKey: "realEstate.condition.renovatedFeminine",
		defaultLabel: "Реновирана",
	},
	{
		value: "underConstruction",
		labelKey: "realEstate.condition.underConstruction",
		defaultLabel: "Во градба",
	},
];

// Get house/villa condition options with translations (feminine forms)
export const getHouseVillaConditionOptions = (t) => {
	return HOUSE_VILLA_CONDITION_OPTIONS.map((condition) => ({
		value: condition.value,
		label: t(condition.labelKey) || condition.defaultLabel,
	}));
};
