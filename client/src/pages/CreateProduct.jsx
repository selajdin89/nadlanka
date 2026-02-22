import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useLanguage } from "../contexts/LanguageContext";
import { useAuth } from "../contexts/AuthContext";
import { getCategoryTranslationKey } from "../utils/productTranslations";
import { isValidMacedoniaPhone } from "../utils/phoneValidation";
import { macedonianCities } from "../utils/macedonianCities";
import { skopjeRegions } from "../utils/skopjeRegions";
import { Home, Car, Grid3x3, AlertCircle, ArrowRight, ArrowLeft } from "lucide-react";
import {
	carBrands,
	getModelsForBrand,
	getBrandOptions,
	getModelOptions,
	getFuelTypeOptions,
	getTransmissionOptions,
	getPowerKWOptions,
	generateYearOptions,
	generateMileageOptions,
} from "../utils/carProperties";
import {
	generateBedroomOptions,
	generateAreaOptions,
	generateFloorOptions,
	getFloorLabel,
	getHeatingTypeOptions,
	getApartmentTypeOptions,
	getEquipmentOptions,
	getApartmentConditionOptions,
	getHouseVillaConditionOptions,
} from "../utils/realEstateProperties";
import { getSubcategories } from "../utils/categoryConfig";
import CustomSelect from "../components/CustomSelect";
import CategorySelector from "../components/CategorySelector";
import "./CreateProduct.scss";

// Helper function to auto-detect subcategory from title
const detectSubcategoryFromTitle = (title, category, currentSubcategory) => {
	// Don't override if subcategory is already selected
	if (currentSubcategory) {
		return currentSubcategory;
	}

	// If no category or title, return empty
	if (!category || !title) {
		return "";
	}

	const titleLower = title.toLowerCase();
	const availableSubcategories = getSubcategories(category);

		// Mapping keywords to subcategory keys (Macedonian, Albanian, English)
		const keywordMappings = {
			"Real Estate": {
				"houses-villas": [
					// English
					"house", "home", "villa", "cottage", "mansion", "residence",
					// Macedonian
					"куќа", "дом", "вила", "колиба", "дворец", "резиденција", "куќи", "вили",
					// Albanian
					"shtëpi", "vila", "shtëpizë", "rezy", "shtëpi e madhe",
				],
				apartments: [
					// English
					"apartment", "flat", "condo", "condominium", "unit", "studio",
					// Macedonian
					"стан", "апартман", "блок", "студио", "станови",
					// Albanian
					"apartament", "banesë", "studjo", "njësi",
				],
				rooms: [
					// English
					"room", "bedroom", "single room",
					// Macedonian
					"соба", "соби", "единечна соба",
					// Albanian
					"dhomë", "dhoma", "dhomë e vetme",
				],
				"weekend-houses": [
					// English
					"weekend house", "weekend home", "cottage", "country house",
					// Macedonian
					"викенд куќа", "викенд куќи", "колиба", "летна викендица",
					// Albanian
					"shtëpi pushimi", "vilë pushimi", "shtëpizë",
				],
				shops: [
					// English
					"shop", "store", "retail",
					// Macedonian
					"дуќан", "дуќани", "продавница", "магазин",
					// Albanian
					"dyqan", "dyqane", "shitje me pakicë",
				],
				"business-space": [
					// English
					"business space", "office space", "commercial space", "office",
					// Macedonian
					"деловен простор", "канцеларија", "бизнис простор",
					// Albanian
					"hapësirë biznesi", "zyrë", "hapësirë komerciale",
				],
				"roommate-room": [
					// English
					"roommate", "room for rent", "shared room",
					// Macedonian
					"цимер", "цимерка", "соба за изнајмување",
					// Albanian
					"dhomë për qira", "dhomë e përbashkët",
				],
				garages: [
					// English
					"garage", "parking space", "car park",
					// Macedonian
					"гараж", "гаражи", "паркинг", "паркинг место",
					// Albanian
					"garazh", "parkim", "vend parkimi",
				],
				"plots-fields": [
					// English
					"plot", "field", "land", "acre", "parcel",
					// Macedonian
					"плац", "плацеви", "нива", "ниви", "земја", "парцела",
					// Albanian
					"parcelë", "fushë", "tokë", "sipërfaqe",
				],
				warehouses: [
					// English
					"warehouse", "storage", "depot",
					// Macedonian
					"магацин", "магацини", "складиште",
					// Albanian
					"magazinë", "depo", "ruajtje",
				],
				"barracks-kiosks-shops": [
					// English
					"barrack", "kiosk", "traffic", "small shop",
					// Macedonian
					"барака", "бараки", "киоск", "киосци", "трафика", "трафики",
					// Albanian
					"barakë", "kiosk", "dyqan i vogël",
				],
				"new-construction": [
					// English
					"new construction", "new build", "newly built",
					// Macedonian
					"новоградба", "нова градба", "ново изградено",
					// Albanian
					"ndërtim i ri", "i ndërtuar rishtas",
				],
				abroad: [
					// English
					"abroad", "foreign", "overseas",
					// Macedonian
					"во странство", "странство", "надвор",
					// Albanian
					"jashtë vendit", "i huaj", "jashtë",
				],
				other: [
					// English
					"other", "miscellaneous",
					// Macedonian
					"останато", "друго",
					// Albanian
					"tjetër", "të tjera",
				],
			},
		Vehicles: {
			cars: [
				// English
				"car", "sedan", "coupe", "suv", "hatchback", "vehicle", "auto",
				// Macedonian
				"автомобил", "кола", "авто", "возило",
				// Albanian
				"makinë", "automjet", "veturë",
			],
			motorcycles: [
				// English
				"motorcycle", "bike", "motorbike", "scooter",
				// Macedonian
				"мотор", "мотоцикл", "скутер",
				// Albanian
				"motoçikletë", "motor", "scooter",
			],
			trucks: [
				// English
				"truck", "pickup", "van", "lorry",
				// Macedonian
				"камион", "комбе", "ван",
				// Albanian
				"kamion", "van", "kamionetë",
			],
			parts: [
				// English
				"part", "spare", "component", "accessory", "tire", "wheel", "engine",
				// Macedonian
				"дел", "резервен", "компонента", "гума", "тркало", "мотор",
				// Albanian
				"pjesë", "rezervë", "komponent", "gomë", "rrotë", "motor",
			],
			accessories: [
				// English
				"accessory", "seat cover", "stereo", "alarm", "car audio",
				// Macedonian
				"аксесоари", "седиште", "стерео", "аларм", "автомобилски звук",
				// Albanian
				"aksesor", "mbulim", "stereo", "alarm", "audio për makinë",
			],
		},
		Electronics: {
			smartphones: [
				// English
				"phone", "smartphone", "iphone", "android", "mobile", "cell",
				// Macedonian
				"телефон", "смартфон", "мобилен", "ајфон",
				// Albanian
				"telefon", "smartphone", "celular", "ajfon",
			],
			laptops: [
				// English
				"laptop", "notebook", "macbook", "computer",
				// Macedonian
				"лаптоп", "ноутбук", "компјутер",
				// Albanian
				"laptop", "kompjuter", "portativ",
			],
			tablets: [
				// English
				"tablet", "ipad",
				// Macedonian
				"таблет", "таблет компјутер",
				// Albanian
				"tablet", "tablet kompjuteri",
			],
			headphones: [
				// English
				"headphone", "earphone", "earbud", "headset", "audio",
				// Macedonian
				"слушалки", "наушници", "аудио",
				// Albanian
				"kufje", "kufje në vesh", "audio",
			],
			gaming: [
				// English
				"gaming", "game", "console", "playstation", "xbox", "nintendo",
				// Macedonian
				"игри", "игрица", "конзола", "плејстејшн",
				// Albanian
				"lojëra", "konsolë", "playstation",
			],
		},
		Furniture: {
			livingRoom: [
				// English
				"sofa", "couch", "tv stand", "coffee table", "living room",
				// Macedonian
				"кауч", "софа", "тв шанка", "маса за дневна", "дневна соба",
				// Albanian
				"divan", "sofë", "tavolinë", "dhomë ndenjeje",
			],
			bedroom: [
				// English
				"bed", "mattress", "wardrobe", "dresser", "bedroom",
				// Macedonian
				"кревет", "душек", "орман", "спална",
				// Albanian
				"shtrat", "dyshek", "dollap", "dhomë gjumi",
			],
			kitchen: [
				// English
				"kitchen", "dining table", "chair", "cabinet",
				// Macedonian
				"кујна", "маса за јадење", "стол", "кабинет",
				// Albanian
				"kuzhinë", "tavolinë ngrënieje", "karrige", "kabinete",
			],
			office: [
				// English
				"desk", "office", "chair", "bookshelf",
				// Macedonian
				"биро", "канцеларија", "стол", "библиотека",
				// Albanian
				"tryezë", "zyrë", "karrige", "librari",
			],
			outdoor: [
				// English
				"outdoor", "garden", "patio", "deck",
				// Macedonian
				"надворешно", "градина", "тераса", "балакон",
				// Albanian
				"jashtë", "kopsht", "tarracë", "ballkon",
			],
		},
		Fashion: {
			mens: [
				// English
				"men", "male", "guy", "gentleman",
				// Macedonian
				"машки", "маж", "мажовски",
				// Albanian
				"burrash", "burrë", "për meshkuj",
			],
			womens: [
				// English
				"women", "female", "lady", "girl",
				// Macedonian
				"женски", "жена", "женска",
				// Albanian
				"grave", "femër", "për gra",
			],
			kids: [
				// English
				"kid", "children", "child", "baby", "toddler",
				// Macedonian
				"детски", "дете", "бебе", "малечко",
				// Albanian
				"fëmijë", "bebë", "foshnjë",
			],
			shoes: [
				// English
				"shoe", "boot", "sneaker", "sandal", "footwear",
				// Macedonian
				"чевли", "чевел", "патики", "сандали",
				// Albanian
				"këpucë", "çizme", "atlete", "sandale",
			],
			accessories: [
				// English
				"bag", "watch", "jewelry", "belt", "wallet",
				// Macedonian
				"торба", "часовник", "накит", "појас", "паричник",
				// Albanian
				"çantë", "orë", "bizhuteri", "rrip", "portofol",
			],
		},
		Books: {
			textbooks: [
				// English
				"textbook", "course", "study",
				// Macedonian
				"учебник", "курс", "студија",
				// Albanian
				"libër shkollor", "kurs", "studim",
			],
			novels: [
				// English
				"novel", "fiction", "story", "book",
				// Macedonian
				"роман", "фикција", "приказна", "книга",
				// Albanian
				"roman", "fikcion", "tregim", "libër",
			],
			childrens: [
				// English
				"children", "kids", "storybook",
				// Macedonian
				"детска", "за деца", "приказна",
				// Albanian
				"fëmijëve", "për fëmijë", "tregim",
			],
			academic: [
				// English
				"academic", "research", "thesis",
				// Macedonian
				"академски", "истражување", "теза",
				// Albanian
				"akademik", "kërkimi", "tezë",
			],
			language: [
				// English
				"language", "dictionary", "grammar",
				// Macedonian
				"јазик", "речник", "граматика",
				// Albanian
				"gjuhë", "fjalor", "gramatikë",
			],
		},
		Sports: {
			fitness: [
				// English
				"gym", "fitness", "dumbbell", "weight", "exercise",
				// Macedonian
				"теретана", "фитнес", "тегови", "вежбање",
				// Albanian
				"palester", "fitnes", "pesha", "stërvitje",
			],
			outdoor: [
				// English
				"camping", "hiking", "backpack",
				// Macedonian
				"кампирање", "пешачење", "ранчец",
				// Albanian
				"kampim", "ecje", "çantë shpine",
			],
			teamSports: [
				// English
				"football", "soccer", "basketball", "volleyball",
				// Macedonian
				"фудбал", "кошарка", "одбојка",
				// Albanian
				"futboll", "basketboll", "volejboll",
			],
			waterSports: [
				// English
				"swimming", "surfing", "diving",
				// Macedonian
				"пливање", "сурфање", "нурење",
				// Albanian
				"not", "surfim", "zhytje",
			],
			winterSports: [
				// English
				"ski", "snowboard", "winter",
				// Macedonian
				"скијање", "снегоборд", "зимски",
				// Albanian
				"ski", "snowboard", "dimëror",
			],
		},
		"Home & Garden": {
			appliances: [
				// English
				"appliance", "washing machine", "refrigerator", "oven", "microwave",
				// Macedonian
				"апарат", "переална машина", "фрижидер", "печка", "микрофална",
				// Albanian
				"aparate", "makinë larëse", "frigorifer", "furrë", "mikrovalë",
			],
			gardenTools: [
				// English
				"garden", "lawn", "mower", "tool",
				// Macedonian
				"градина", "ливада", "косачка", "алатка",
				// Albanian
				"kopsht", "barishte", "makinë prerëse", "mjet",
			],
			kitchen: [
				// English
				"kitchen", "cookware", "utensil",
				// Macedonian
				"кујна", "сосуди за готвење", "прибор",
				// Albanian
				"kuzhinë", "enë gatimi", "pajisje",
			],
			bathroom: [
				// English
				"bathroom", "shower", "bathtub",
				// Macedonian
				"бања", "туш", "када",
				// Albanian
				"banjo", "dush", "vaskë",
			],
			diy: [
				// English
				"tool", "drill", "hammer", "saw",
				// Macedonian
				"алатка", "дурло", "чекан", "трион",
				// Albanian
				"mjet", "borë", "çekiç", "sharrë",
			],
		},
	};

	// Support both "Vehicles" and "Cars" for backward compatibility
	const categoryKey = category === "Cars" ? "Vehicles" : category;
	const mappings = keywordMappings[categoryKey];
	if (!mappings) {
		return "";
	}

	// Check each subcategory mapping
	for (const [subcategoryKey, keywords] of Object.entries(mappings)) {
		// Check if subcategory exists in available subcategories
		const isValid = availableSubcategories.some(
			(sub) => sub.key === subcategoryKey
		);

		if (isValid) {
			// Check if any keyword matches the title
			for (const keyword of keywords) {
				if (titleLower.includes(keyword)) {
					return subcategoryKey;
				}
			}
		}
	}

	return "";
};

const CreateProduct = () => {
	const { t } = useLanguage();
	const navigate = useNavigate();
	const { isAuthenticated, loading: authLoading, user } = useAuth();
	
	// Category type selection step: whether to show category type selection
	const [showCategoryTypeSelection, setShowCategoryTypeSelection] = useState(true);
	const [selectedCategoryType, setSelectedCategoryType] = useState("");
	const [categories, setCategories] = useState([]);
	const [subcategories, setSubcategories] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [success, setSuccess] = useState(null);
	const [uploadingImages, setUploadingImages] = useState(false);
	const [validationErrors, setValidationErrors] = useState({});

	// Form data
	const [formData, setFormData] = useState({
		title: "",
		description: "",
		price: "",
		currency: "MKD",
		priceByAgreement: false,
		category: "",
		subcategory: "",
		categoryType: "",
		condition: "",
		status: "active",
		location: "",
		region: "",
		brand: "",
		model: "",
		contactInfo: {
			phone: "",
			email: "",
		},
		tags: "",
		images: [],
		categorySpecific: {
			propertyType: "",
			area: "",
			address: "",
			bedrooms: "",
			bathrooms: "",
			fuelType: "",
			mileage: "",
			powerKW: "",
			year: "",
			transmission: "",
			color: "",
		},
	});


	// Redirect to login if not authenticated
	useEffect(() => {
		if (!authLoading && !isAuthenticated) {
			navigate("/login", {
				state: {
					from: "/create-product",
					message: "Please log in to create an ad",
				},
			});
		}
	}, [isAuthenticated, authLoading, navigate]);

	useEffect(() => {
		if (isAuthenticated) {
			fetchCategories();
			// Auto-populate contact info from user profile
			if (user?.phone) {
				setFormData((prev) => ({
					...prev,
					contactInfo: { ...prev.contactInfo, phone: user.phone },
				}));
			}
			if (user?.email) {
				setFormData((prev) => ({
					...prev,
					contactInfo: { ...prev.contactInfo, email: user.email },
				}));
			}
			if (user?.location) {
				setFormData((prev) => ({ ...prev, location: user.location }));
			}
		}
	}, [isAuthenticated, user]);

	// Fetch subcategories when category is set
	useEffect(() => {
		if (formData.category && formData.categoryType) {
			fetchSubcategories(formData.category);
		} else if (!formData.category) {
			setSubcategories([]);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [formData.category, formData.categoryType]);

	const fetchCategories = async () => {
		try {
			const response = await axios.get("/api/categories");
			setCategories(response.data);
		} catch (error) {
			console.error("Error fetching categories:", error);
		}
	};

	const fetchSubcategories = async (category) => {
		if (!category) {
			setSubcategories([]);
			return;
		}
		try {
			const response = await axios.get(`/api/categories/${encodeURIComponent(category)}/subcategories`);
			setSubcategories(response.data || []);
		} catch (error) {
			console.error("Error fetching subcategories:", error);
			setSubcategories([]);
		}
	};

	const handleChange = (e) => {
		const { name, value } = e.target;
		
		if (name.includes(".")) {
			const [parent, child] = name.split(".");
			if (parent === "categorySpecific") {
				setFormData((prev) => ({
					...prev,
					categorySpecific: {
						...prev.categorySpecific,
						[child]: value,
					},
				}));
			} else if (parent === "contactInfo") {
				setFormData((prev) => ({
					...prev,
					contactInfo: {
						...prev.contactInfo,
						[child]: value,
					},
				}));
			}
		} else {
			// Note: Category is now handled by CategorySelector component directly
			// This handleChange for "category" is kept for backwards compatibility
			if (name === "category") {
				let categoryType = "general";
				if (value === "Real Estate") categoryType = "realEstate";
				else if (value === "Vehicles") categoryType = "vehicles";

				fetchSubcategories(value);
				setFormData((prev) => {
					// Re-detect subcategory from title when category changes
					const detectedSubcategory = detectSubcategoryFromTitle(
						prev.title,
						value,
						"" // Reset subcategory when category changes
					);
					return {
						...prev,
						category: value,
						subcategory: detectedSubcategory || "",
						categoryType: categoryType,
					};
				});
			} else if (name === "title") {
				// Auto-detect subcategory from title
				setFormData((prev) => {
					const detectedSubcategory = detectSubcategoryFromTitle(
						value,
						prev.category,
						prev.subcategory
					);
					return {
						...prev,
						title: value,
						subcategory: detectedSubcategory || prev.subcategory,
					};
				});
				setValidationErrors((prev) => ({ ...prev, title: "" }));
			} else if (name === "subcategory") {
				// When subcategory changes, clear car-specific fields if switching to parts/accessories
				setFormData((prev) => {
					const newData = { ...prev, [name]: value };
					if (prev.category === "Vehicles" && value && ["parts", "accessories"].includes(value)) {
						// Clear vehicle-specific fields for parts/accessories
						newData.categorySpecific = {
							...prev.categorySpecific,
							year: "",
							fuelType: "",
							mileage: "",
							powerKW: "",
							transmission: "",
						};
						// Clear related validation errors
						setValidationErrors((prevErrors) => ({
							...prevErrors,
							year: "",
							fuelType: "",
							transmission: "",
						}));
					}
					return newData;
				});
				setValidationErrors((prev) => ({ ...prev, [name]: "" }));
			} else {
				setFormData((prev) => ({ ...prev, [name]: value }));
				// Clear validation error for this field
				setValidationErrors((prev) => ({ ...prev, [name]: "" }));
			}
		}
	};

	const handleImageChange = async (e) => {
		const files = Array.from(e.target.files);
		if (files.length === 0) return;

		setUploadingImages(true);
		try {
			const formDataToUpload = new FormData();
			files.forEach((file) => {
				formDataToUpload.append("images", file);
			});

			const response = await axios.post("/api/upload", formDataToUpload, {
				headers: { "Content-Type": "multipart/form-data" },
			});

			setFormData((prev) => ({
				...prev,
				images: [...prev.images, ...response.data.imageUrls],
			}));
		} catch (error) {
			console.error("Error uploading images:", error);
			alert("Failed to upload images. Please try again.");
		} finally {
			setUploadingImages(false);
		}
	};

	const removeImage = (index) => {
		setFormData((prev) => ({
			...prev,
			images: prev.images.filter((_, i) => i !== index),
		}));
		setValidationErrors((prev) => ({ ...prev, images: "" }));
	};


	// Validation function - returns errors object
	const validateForm = () => {
		const errors = {};

		// Category validation
		if (!formData.category) {
			errors.category = t("createProduct.validation.categoryRequired") || "Please select a category";
		} else {
			// If category has subcategories, subcategory is required
			const subcategories = getSubcategories(formData.category);
			if (subcategories.length > 0 && !formData.subcategory) {
				errors.subcategory = t("createProduct.validation.subcategoryRequired") || "Please select a subcategory";
			}
		}

		// Title validation
		if (!formData.title || formData.title.trim().length < 3) {
			errors.title = t("createProduct.validation.titleRequired") || "Title must be at least 3 characters";
		}

		// Description validation
		if (!formData.description || formData.description.trim().length < 10) {
			errors.description = t("createProduct.validation.descriptionRequired") || "Description must be at least 10 characters";
		}

		// Price validation - only required if not "by agreement"
		if (!formData.priceByAgreement) {
			if (!formData.price || parseFloat(formData.price) <= 0) {
				errors.price = t("createProduct.validation.priceRequired") || "Please enter a valid price";
			}
		}

		// Condition validation
		if (!formData.condition) {
			errors.condition = t("createProduct.validation.conditionRequired") || "Please select a condition";
		}

		// Location validation
		if (!formData.location) {
			errors.location = t("createProduct.validation.locationRequired") || "Please select a location";
		}

		// Region validation - required when Скопје is selected
		if (formData.location === "Скопје" && !formData.region) {
			errors.region = t("createProduct.validation.regionRequired") || "Please select a region";
		}

		// Images validation
		// Images are now optional
		
		// Phone validation (if provided)
		if (formData.contactInfo.phone && !isValidMacedoniaPhone(formData.contactInfo.phone)) {
			errors.phone = t("createProduct.invalidPhone") || "Please enter a valid North Macedonia phone number";
		}

		// Email validation (if provided)
		if (formData.contactInfo.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactInfo.email)) {
			errors.email = t("createProduct.validation.emailInvalid") || "Please enter a valid email address";
		}

		// Category-specific validations
		if (formData.category === "Real Estate") {
			// For apartments, weekend-houses, houses-villas, and rooms subcategories, validate area and bedrooms
			if (formData.subcategory === "apartments" || formData.subcategory === "weekend-houses" || formData.subcategory === "houses-villas" || formData.subcategory === "rooms") {
				if (!formData.categorySpecific.area || parseFloat(formData.categorySpecific.area) <= 0) {
					errors.area = t("createProduct.validation.areaRequired") || "Please enter a valid area";
				}
				if (!formData.categorySpecific.bedrooms) {
					errors.bedrooms = t("createProduct.validation.bedroomsRequired") || "Please select number of bedrooms";
				}
			} else {
				// For other Real Estate subcategories, validate propertyType and area
				if (!formData.categorySpecific.propertyType) {
					errors.propertyType = t("createProduct.validation.propertyTypeRequired") || "Please select property type";
				}
				if (!formData.categorySpecific.area || parseFloat(formData.categorySpecific.area) <= 0) {
					errors.area = t("createProduct.validation.areaRequired") || "Please enter a valid area";
				}
			}
		}

		// Validate car-specific fields for Vehicles category, but not for parts/accessories subcategory
		if (formData.category === "Vehicles" && (!formData.subcategory || !["parts", "accessories"].includes(formData.subcategory))) {
			if (!formData.brand || formData.brand.trim() === "") {
				errors.brand = t("createProduct.validation.brandRequired") || "Please select brand";
			}
			if (!formData.model || formData.model.trim() === "") {
				errors.model = t("createProduct.validation.modelRequired") || "Please enter or select model";
			}
			if (!formData.categorySpecific.year || parseInt(formData.categorySpecific.year) < 1900) {
				errors.year = t("createProduct.validation.yearRequired") || "Please enter a valid year";
			}
			if (!formData.categorySpecific.fuelType) {
				errors.fuelType = t("createProduct.validation.fuelTypeRequired") || "Please select fuel type";
			}
			if (!formData.categorySpecific.transmission) {
				errors.transmission = t("createProduct.validation.transmissionRequired") || "Please select transmission type";
			}
		}

		return errors;
	};


	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError(null);
		setSuccess(null);
		setValidationErrors({});

		// Validate form
		const errors = validateForm();
		setValidationErrors(errors);
		
		if (Object.keys(errors).length > 0) {
			console.log("Validation errors:", errors);
			setLoading(false);
			// Scroll to first error after state update
			setTimeout(() => {
				const firstErrorField = Object.keys(errors)[0];
				if (firstErrorField) {
					// Try to find element by name or id
					let element = document.querySelector(`[name="${firstErrorField}"]`) || 
						document.querySelector(`#${firstErrorField}`);
					
					// If not found and field contains dot (nested field like categorySpecific.area)
					if (!element && firstErrorField.includes(".")) {
						const [parent, child] = firstErrorField.split(".");
						// Try with full name first
						element = document.querySelector(`[name="${parent}.${child}"]`);
						// If still not found, try just the child name
						if (!element) {
							element = document.querySelector(`[name="${child}"]`) || 
								document.querySelector(`#${child}`);
						}
					}
					
					// If still not found, try common field names
					if (!element) {
						// For area, bedrooms, etc., they might be in categorySpecific
						if (["area", "bedrooms", "floor", "heating", "apartmentType", "equipment"].includes(firstErrorField)) {
							element = document.querySelector(`[name="categorySpecific.${firstErrorField}"]`) ||
								document.querySelector(`#${firstErrorField}`);
						}
					}
					
					if (element) {
						element.scrollIntoView({ behavior: "smooth", block: "center" });
						element.focus();
					}
				}
			}, 100);
			return;
		}

		try {
			if (!user || !user._id) {
				setError(t("createProduct.authRequired") || "You must be logged in to create a product");
				setLoading(false);
				return;
			}

			// Final check: auto-detect subcategory from title if still not set
			let finalSubcategory = formData.subcategory;
			if (!finalSubcategory && formData.title && formData.category) {
				finalSubcategory = detectSubcategoryFromTitle(
					formData.title,
					formData.category,
					formData.subcategory
				);
			}

			const productData = {
				...formData,
				subcategory: finalSubcategory || undefined,
				price: formData.priceByAgreement ? null : parseFloat(formData.price),
				currency: formData.priceByAgreement ? undefined : formData.currency,
				brand: formData.brand || undefined,
				model: formData.model || undefined,
				tags: formData.tags
					.split(",")
					.map((tag) => tag.trim())
					.filter((tag) => tag),
				seller: user._id,
				categorySpecific: formData.categorySpecific,
			};

			const response = await axios.post("/api/products", productData);
			setSuccess(t("createProduct.success"));

			setTimeout(() => {
				navigate(`/products/${response.data._id}`);
			}, 2000);
		} catch (error) {
			console.error("Error creating product:", error);
			setError(error.response?.data?.error || t("createProduct.error"));
		} finally {
			setLoading(false);
		}
	};

	// Category Type Selection Screen
	if (showCategoryTypeSelection && !formData.categoryType) {
		return (
			<div className="create-product-container">
				<div className="category-type-selection">
					<h1>{t("createProduct.categoryType.title") || "Category Type"}</h1>
					<p className="selection-subtitle">
						{t("createProduct.categoryType.subtitle") || "Select the type of category for your ad"}
					</p>

					<div className="category-type-cards">
						<div
							className={`category-type-card ${selectedCategoryType === "general" ? "selected" : ""}`}
							onClick={() => setSelectedCategoryType("general")}
						>
							<div className="category-type-icon">
								<Grid3x3 size={24} />
							</div>
							<div className="category-type-content">
								<h3>{t("createProduct.categoryType.general") || "General / Other"}</h3>
								<p>{t("createProduct.categoryType.generalDesc") || "Standard form for all categories"}</p>
							</div>
						</div>

						<div
							className={`category-type-card ${selectedCategoryType === "realEstate" ? "selected" : ""}`}
							onClick={() => setSelectedCategoryType("realEstate")}
						>
							<div className="category-type-icon">
								<Home size={24} />
							</div>
							<div className="category-type-content">
								<h3>{t("createProduct.categoryType.realEstate") || "Real Estate"}</h3>
								<p>{t("createProduct.categoryType.realEstateDesc") || "Property details, area, address, bedrooms"}</p>
							</div>
						</div>

						<div
							className={`category-type-card ${selectedCategoryType === "vehicles" ? "selected" : ""}`}
							onClick={() => setSelectedCategoryType("vehicles")}
						>
							<div className="category-type-icon">
								<Car size={24} />
							</div>
							<div className="category-type-content">
								<h3>{t("createProduct.categoryType.vehicles") || "Vehicles"}</h3>
								<p>{t("createProduct.categoryType.vehiclesDesc") || "Year, mileage, fuel type, transmission"}</p>
							</div>
						</div>
					</div>

					{selectedCategoryType && (
						<div className="selection-actions">
							<button
								type="button"
								className="btn btn-primary"
								onClick={() => {
									setFormData((prev) => ({
										...prev,
										categoryType: selectedCategoryType,
										category: selectedCategoryType === "realEstate" ? "Real Estate" : selectedCategoryType === "vehicles" ? "Vehicles" : "",
									}));
									if (selectedCategoryType === "realEstate") {
										fetchSubcategories("Real Estate");
									} else if (selectedCategoryType === "vehicles") {
										fetchSubcategories("Vehicles");
									}
									setShowCategoryTypeSelection(false);
								}}
							>
								{t("common.next") || "Next"} <ArrowRight size={20} />
							</button>
						</div>
					)}
				</div>
			</div>
		);
	}

	return (
		<div className="create-product-container">
				<div className="create-product-header">
					<button
						type="button"
						className="back-button"
						onClick={() => {
							setShowCategoryTypeSelection(true);
							setSelectedCategoryType("");
							setFormData((prev) => ({ ...prev, categoryType: "" }));
						}}
					>
						← {t("common.back") || "Back"}
					</button>
					<h1>{t("createProduct.title") || "Create Ad"}</h1>
				</div>

			<form onSubmit={handleSubmit} className="create-product-form" noValidate>
				{error && <div className="error-message">{error}</div>}
				{success && <div className="success-message">{success}</div>}

				{/* Category Selection */}
				{formData.categoryType && (
					<div className="form-section">
						<div className="form-row">
							<div className="form-group category-selector-group">
								<label htmlFor="category">
									{t("createProduct.form.category")} *
									{validationErrors.category && (
										<span className="error-indicator">
											<AlertCircle size={14} />
										</span>
									)}
									{validationErrors.subcategory && (
										<span className="error-indicator">
											<AlertCircle size={14} />
										</span>
									)}
								</label>
								<CategorySelector
									value={formData.category}
									subcategoryValue={formData.subcategory}
									onChange={(category, subcategory, nested) => {
										// Update form data with category and subcategory
										let categoryType = formData.categoryType;
										if (!categoryType) {
											if (category === "Real Estate") categoryType = "realEstate";
											else if (category === "Vehicles") categoryType = "vehicles";
											else categoryType = "general";
										}
										
										setFormData((prev) => {
											const newData = {
												...prev,
												category: category || "",
												subcategory: subcategory || "",
												categoryType: categoryType,
											};
											
											// When subcategory changes, clear car-specific fields if switching to parts/accessories
											if (category === "Vehicles" && subcategory && ["parts", "accessories"].includes(subcategory)) {
												newData.categorySpecific = {
													...prev.categorySpecific,
													year: "",
													fuelType: "",
													mileage: "",
													powerKW: "",
													transmission: "",
												};
												// Clear related validation errors
												setValidationErrors((prevErrors) => ({
													...prevErrors,
													year: "",
													fuelType: "",
													transmission: "",
												}));
											}
											
											return newData;
										});
										
										// Clear validation errors
										setValidationErrors((prev) => ({
											...prev,
											category: "",
											subcategory: "",
										}));
									}}
									placeholder={t("createProduct.select.category") || "Select category"}
									required={true}
									showAllCategories={false}
									error={!!validationErrors.category || !!validationErrors.subcategory}
								/>
								{validationErrors.category && (
									<div className="field-error">
										<AlertCircle size={16} />
										{validationErrors.category}
									</div>
								)}
								{validationErrors.subcategory && (
									<div className="field-error">
										<AlertCircle size={16} />
										{validationErrors.subcategory}
									</div>
								)}
							</div>
						</div>
					</div>
				)}

				{/* Basic Information */}
				<div className="form-section">
					<h3>{t("createProduct.form.basicInfo")}</h3>

					<div className="form-group">
						<label htmlFor="title">
							{t("createProduct.form.title")} *
							{validationErrors.title && (
								<span className="error-indicator">
									<AlertCircle size={14} />
								</span>
							)}
						</label>
						<input
							type="text"
							id="title"
							name="title"
							value={formData.title}
							onChange={handleChange}
							className={validationErrors.title ? "error" : ""}
							placeholder={t("createProduct.form.title.placeholder")}
						/>
						{validationErrors.title && (
							<div className="field-error">
								<AlertCircle size={16} />
								{validationErrors.title}
							</div>
						)}
					</div>

					<div className="form-group">
						<label htmlFor="description">
							{t("createProduct.form.description")} *
							{validationErrors.description && (
								<span className="error-indicator">
									<AlertCircle size={14} />
								</span>
							)}
						</label>
						<textarea
							id="description"
							name="description"
							value={formData.description}
							onChange={handleChange}
							className={validationErrors.description ? "error" : ""}
							rows="6"
							placeholder={t("createProduct.form.description.placeholder")}
						/>
						{validationErrors.description && (
							<div className="field-error">
								<AlertCircle size={16} />
								{validationErrors.description}
							</div>
						)}
					</div>

					<div className="form-row form-row-three">
						<div className="form-group">
							<label className={`checkbox-label ${formData.priceByAgreement ? "checked" : ""}`}>
								<input
									type="checkbox"
									name="priceByAgreement"
									checked={formData.priceByAgreement}
									onChange={(e) => {
										setFormData((prev) => ({
											...prev,
											priceByAgreement: e.target.checked,
										}));
										setValidationErrors((prev) => ({ ...prev, price: "" }));
									}}
								/>
								<span>{t("createProduct.form.priceByAgreement") || "Price by agreement"}</span>
							</label>
						</div>

						<div className="form-group">
							<label htmlFor="price">
								{t("createProduct.form.price")} {!formData.priceByAgreement && "*"}
								{validationErrors.price && (
									<span className="error-indicator">
										<AlertCircle size={14} />
									</span>
								)}
							</label>
							<input
								type="number"
								id="price"
								name="price"
								value={formData.price}
								onChange={handleChange}
								min="0"
								step="0.01"
								disabled={formData.priceByAgreement}
								className={validationErrors.price ? "error" : ""}
							/>
							{validationErrors.price && (
								<div className="field-error">
									<AlertCircle size={16} />
									{validationErrors.price}
								</div>
							)}
						</div>

						<div className="form-group">
							<label htmlFor="currency">{t("createProduct.form.currency")}</label>
							<CustomSelect
								id="currency"
								name="currency"
								value={formData.currency}
								onChange={handleChange}
								disabled={formData.priceByAgreement}
								options={[
									{ value: "MKD", label: t("common.currency.mkd") || "MKD" },
									{ value: "EUR", label: t("common.currency.eur") || "EUR" },
									{ value: "USD", label: t("common.currency.usd") || "USD" },
								]}
							/>
						</div>
					</div>

					<div className="form-row">
						<div className="form-group">
							<label htmlFor="condition">
								{t("createProduct.form.condition")} *
								{validationErrors.condition && (
									<span className="error-indicator">
										<AlertCircle size={14} />
									</span>
								)}
							</label>
							<CustomSelect
								id="condition"
								name="condition"
								value={formData.condition}
								onChange={handleChange}
								error={!!validationErrors.condition}
								placeholder={t("createProduct.select.condition") || "Select condition"}
								options={
									formData.category === "Real Estate" && formData.subcategory === "houses-villas"
										? getHouseVillaConditionOptions(t)
										: formData.category === "Real Estate" && 
										  (formData.subcategory === "apartments" || formData.subcategory === "rooms")
										? getApartmentConditionOptions(t)
										: [
												{ value: "New", label: t("conditions.new") || "New" },
												{ value: "Used", label: t("conditions.used") || "Used" },
										  ]
								}
							/>
							{validationErrors.condition && (
								<div className="field-error">
									<AlertCircle size={16} />
									{validationErrors.condition}
								</div>
							)}
						</div>

						<div className="form-group">
							<label htmlFor="location">
								{t("createProduct.form.location")} *
								{validationErrors.location && (
									<span className="error-indicator">
										<AlertCircle size={14} />
									</span>
								)}
							</label>
							<CustomSelect
								id="location"
								name="location"
								value={formData.location}
								onChange={(e) => {
									handleChange(e);
									// Clear region when location changes
									if (e.target.value !== "Скопје") {
										setFormData((prev) => ({ ...prev, region: "" }));
									}
								}}
								error={!!validationErrors.location}
								placeholder={t("createProduct.form.location.placeholder") || "Select location"}
								searchable={true}
								options={macedonianCities.slice(1).map((city) => ({
									value: city.value,
									label: city.label,
								}))}
							/>
							{validationErrors.location && (
								<div className="field-error">
									<AlertCircle size={16} />
									{validationErrors.location}
								</div>
							)}
						</div>
					</div>

					{/* Region field - only shown when Скопје is selected */}
					{formData.location === "Скопје" && (
						<div className="form-group">
							<label htmlFor="region">
								{t("createProduct.form.region") || "Region"} *
								{validationErrors.region && (
									<span className="error-indicator">
										<AlertCircle size={14} />
									</span>
								)}
							</label>
							<CustomSelect
								id="region"
								name="region"
								value={formData.region}
								onChange={handleChange}
								error={!!validationErrors.region}
								placeholder={t("createProduct.form.region.placeholder") || "Select region"}
								searchable={true}
								options={skopjeRegions.map((region) => ({
									value: region.value,
									label: region.label,
								}))}
							/>
							{validationErrors.region && (
								<div className="field-error">
									<AlertCircle size={16} />
									{validationErrors.region}
								</div>
							)}
						</div>
					)}
				</div>

				{/* Category-Specific Fields */}
				{(formData.category === "Real Estate" && formData.subcategory === "apartments") && (
					<div className="form-section">
						<h3>{t("createProduct.realEstate.apartments.title") || "Apartment Details"}</h3>
						
						{/* Area and Bedrooms */}
						<div className="form-row">
							<div className="form-group">
								<label htmlFor="area">
									{t("createProduct.realEstate.area") || "Квадратура (m²)"} *
									{validationErrors.area && (
										<span className="error-indicator">
											<AlertCircle size={14} />
										</span>
									)}
								</label>
								<CustomSelect
									id="area"
									name="categorySpecific.area"
									value={formData.categorySpecific.area || ""}
									onChange={(e) => {
										handleChange(e);
										setValidationErrors((prev) => ({ ...prev, area: "" }));
									}}
									error={!!validationErrors.area}
									placeholder={t("createProduct.select.area") || "Select area"}
									searchable
									options={[
										{ value: "", label: t("createProduct.select.area") || "Select area" },
										...generateAreaOptions(),
									]}
								/>
								{validationErrors.area && (
									<div className="field-error">
										<AlertCircle size={16} />
										{validationErrors.area}
									</div>
								)}
							</div>
							<div className="form-group">
								<label htmlFor="bedrooms">
									{t("createProduct.realEstate.bedrooms") || "Број на соби"} *
									{validationErrors.bedrooms && (
										<span className="error-indicator">
											<AlertCircle size={14} />
										</span>
									)}
								</label>
								<CustomSelect
									id="bedrooms"
									name="categorySpecific.bedrooms"
									value={formData.categorySpecific.bedrooms || ""}
									onChange={(e) => {
										handleChange(e);
										setValidationErrors((prev) => ({ ...prev, bedrooms: "" }));
									}}
									error={!!validationErrors.bedrooms}
									placeholder={t("createProduct.select.bedrooms") || "Select bedrooms"}
									options={[
										{ value: "", label: t("createProduct.select.bedrooms") || "Select bedrooms" },
										...generateBedroomOptions().map((bedrooms) => ({
											value: bedrooms.toString(),
											label: bedrooms.toString(),
										})),
									]}
								/>
								{validationErrors.bedrooms && (
									<div className="field-error">
										<AlertCircle size={16} />
										{validationErrors.bedrooms}
									</div>
								)}
							</div>
						</div>

						{/* Floor and Apartment Type */}
						<div className="form-row">
							<div className="form-group">
								<label htmlFor="floor">
									{t("createProduct.realEstate.floor") || "Спрат"}
									{validationErrors.floor && (
										<span className="error-indicator">
											<AlertCircle size={14} />
										</span>
									)}
								</label>
								<CustomSelect
									id="floor"
									name="categorySpecific.floor"
									value={formData.categorySpecific.floor || ""}
									onChange={(e) => {
										handleChange(e);
										setValidationErrors((prev) => ({ ...prev, floor: "" }));
									}}
									error={!!validationErrors.floor}
									placeholder={t("createProduct.select.floor") || "Select floor"}
									options={[
										{ value: "", label: t("createProduct.select.floor") || "Select floor" },
										...generateFloorOptions().map((floor) => ({
											value: floor.toString(),
											label: getFloorLabel(floor, t),
										})),
									]}
								/>
								{validationErrors.floor && (
									<div className="field-error">
										<AlertCircle size={16} />
										{validationErrors.floor}
									</div>
								)}
							</div>
							<div className="form-group">
								<label htmlFor="apartmentType">
									{t("createProduct.realEstate.apartmentType") || "Тип на станот"}
									{validationErrors.apartmentType && (
										<span className="error-indicator">
											<AlertCircle size={14} />
										</span>
									)}
								</label>
								<CustomSelect
									id="apartmentType"
									name="categorySpecific.apartmentType"
									value={formData.categorySpecific.apartmentType || ""}
									onChange={(e) => {
										handleChange(e);
										setValidationErrors((prev) => ({ ...prev, apartmentType: "" }));
									}}
									error={!!validationErrors.apartmentType}
									placeholder={t("createProduct.select.apartmentType") || "Select type"}
									options={[
										{ value: "", label: t("createProduct.select.apartmentType") || "Select type" },
										...getApartmentTypeOptions(t),
									]}
								/>
								{validationErrors.apartmentType && (
									<div className="field-error">
										<AlertCircle size={16} />
										{validationErrors.apartmentType}
									</div>
								)}
							</div>
						</div>

						{/* Heating and Equipment */}
						<div className="form-row">
							<div className="form-group">
								<label htmlFor="heating">
									{t("createProduct.realEstate.heating") || "Греење"}
									{validationErrors.heating && (
										<span className="error-indicator">
											<AlertCircle size={14} />
										</span>
									)}
								</label>
								<CustomSelect
									id="heating"
									name="categorySpecific.heating"
									value={formData.categorySpecific.heating || ""}
									onChange={(e) => {
										handleChange(e);
										setValidationErrors((prev) => ({ ...prev, heating: "" }));
									}}
									error={!!validationErrors.heating}
									placeholder={t("createProduct.select.heating") || "Select heating"}
									options={[
										{ value: "", label: t("createProduct.select.heating") || "Select heating" },
										...getHeatingTypeOptions(t),
									]}
								/>
								{validationErrors.heating && (
									<div className="field-error">
										<AlertCircle size={16} />
										{validationErrors.heating}
									</div>
								)}
							</div>
							<div className="form-group">
								<label htmlFor="equipment">
									{t("createProduct.realEstate.equipment") || "Опрема"}
									{validationErrors.equipment && (
										<span className="error-indicator">
											<AlertCircle size={14} />
										</span>
									)}
								</label>
								<CustomSelect
									id="equipment"
									name="categorySpecific.equipment"
									value={formData.categorySpecific.equipment || ""}
									onChange={(e) => {
										handleChange(e);
										setValidationErrors((prev) => ({ ...prev, equipment: "" }));
									}}
									error={!!validationErrors.equipment}
									placeholder={t("createProduct.select.equipment") || "Select equipment"}
									options={[
										{ value: "", label: t("createProduct.select.equipment") || "Select equipment" },
										...getEquipmentOptions(t),
									]}
								/>
								{validationErrors.equipment && (
									<div className="field-error">
										<AlertCircle size={16} />
										{validationErrors.equipment}
									</div>
								)}
							</div>
						</div>
					</div>
				)}

				{/* Houses/Villas Details - No floor, no apartmentType, feminine condition forms */}
				{formData.category === "Real Estate" && formData.subcategory === "houses-villas" && (
					<div className="form-section">
						<h3>{t("createProduct.realEstate.housesVillas.title") || "Куќа / Вила - Детали"}</h3>
						
						{/* Area and Bedrooms */}
						<div className="form-row">
							<div className="form-group">
								<label htmlFor="area">
									{t("createProduct.realEstate.area") || "Квадратура (m²)"} *
									{validationErrors.area && (
										<span className="error-indicator">
											<AlertCircle size={14} />
										</span>
									)}
								</label>
								<CustomSelect
									id="area"
									name="categorySpecific.area"
									value={formData.categorySpecific.area || ""}
									onChange={(e) => {
										handleChange(e);
										setValidationErrors((prev) => ({ ...prev, area: "" }));
									}}
									error={!!validationErrors.area}
									placeholder={t("createProduct.select.area") || "Select area"}
									searchable
									options={[
										{ value: "", label: t("createProduct.select.area") || "Select area" },
										...generateAreaOptions(),
									]}
								/>
								{validationErrors.area && (
									<div className="field-error">
										<AlertCircle size={16} />
										{validationErrors.area}
									</div>
								)}
							</div>
							<div className="form-group">
								<label htmlFor="bedrooms">
									{t("createProduct.realEstate.bedrooms") || "Број на соби"} *
									{validationErrors.bedrooms && (
										<span className="error-indicator">
											<AlertCircle size={14} />
										</span>
									)}
								</label>
								<CustomSelect
									id="bedrooms"
									name="categorySpecific.bedrooms"
									value={formData.categorySpecific.bedrooms || ""}
									onChange={(e) => {
										handleChange(e);
										setValidationErrors((prev) => ({ ...prev, bedrooms: "" }));
									}}
									error={!!validationErrors.bedrooms}
									placeholder={t("createProduct.select.bedrooms") || "Select bedrooms"}
									options={[
										{ value: "", label: t("createProduct.select.bedrooms") || "Select bedrooms" },
										...generateBedroomOptions().map((bedrooms) => ({
											value: bedrooms.toString(),
											label: bedrooms.toString(),
										})),
									]}
								/>
								{validationErrors.bedrooms && (
									<div className="field-error">
										<AlertCircle size={16} />
										{validationErrors.bedrooms}
									</div>
								)}
							</div>
						</div>

						{/* Heating and Equipment */}
						<div className="form-row">
							<div className="form-group">
								<label htmlFor="heating">
									{t("createProduct.realEstate.heating") || "Греење"}
									{validationErrors.heating && (
										<span className="error-indicator">
											<AlertCircle size={14} />
										</span>
									)}
								</label>
								<CustomSelect
									id="heating"
									name="categorySpecific.heating"
									value={formData.categorySpecific.heating || ""}
									onChange={(e) => {
										handleChange(e);
										setValidationErrors((prev) => ({ ...prev, heating: "" }));
									}}
									error={!!validationErrors.heating}
									placeholder={t("createProduct.select.heating") || "Select heating"}
									options={[
										{ value: "", label: t("createProduct.select.heating") || "Select heating" },
										...getHeatingTypeOptions(t),
									]}
								/>
								{validationErrors.heating && (
									<div className="field-error">
										<AlertCircle size={16} />
										{validationErrors.heating}
									</div>
								)}
							</div>
							<div className="form-group">
								<label htmlFor="equipment">
									{t("createProduct.realEstate.equipment") || "Опрема"}
									{validationErrors.equipment && (
										<span className="error-indicator">
											<AlertCircle size={14} />
										</span>
									)}
								</label>
								<CustomSelect
									id="equipment"
									name="categorySpecific.equipment"
									value={formData.categorySpecific.equipment || ""}
									onChange={(e) => {
										handleChange(e);
										setValidationErrors((prev) => ({ ...prev, equipment: "" }));
									}}
									error={!!validationErrors.equipment}
									placeholder={t("createProduct.select.equipment") || "Select equipment"}
									options={[
										{ value: "", label: t("createProduct.select.equipment") || "Select equipment" },
										...getEquipmentOptions(t),
									]}
								/>
								{validationErrors.equipment && (
									<div className="field-error">
										<AlertCircle size={16} />
										{validationErrors.equipment}
									</div>
								)}
							</div>
						</div>
					</div>
				)}

				{/* Weekend House Details - Simplified fields (Area, Bedrooms, Heating, Equipment) */}
				{formData.category === "Real Estate" && formData.subcategory === "weekend-houses" && (
					<div className="form-section">
						<h3>{t("createProduct.realEstate.weekendHouses.title") || "Викенд куќа - Детали"}</h3>
						
						{/* Area and Bedrooms */}
						<div className="form-row">
							<div className="form-group">
								<label htmlFor="area">
									{t("createProduct.realEstate.area") || "Квадратура (m²)"} *
									{validationErrors.area && (
										<span className="error-indicator">
											<AlertCircle size={14} />
										</span>
									)}
								</label>
								<CustomSelect
									id="area"
									name="categorySpecific.area"
									value={formData.categorySpecific.area || ""}
									onChange={(e) => {
										handleChange(e);
										setValidationErrors((prev) => ({ ...prev, area: "" }));
									}}
									error={!!validationErrors.area}
									placeholder={t("createProduct.select.area") || "Select area"}
									searchable
									options={[
										{ value: "", label: t("createProduct.select.area") || "Select area" },
										...generateAreaOptions(),
									]}
								/>
								{validationErrors.area && (
									<div className="field-error">
										<AlertCircle size={16} />
										{validationErrors.area}
									</div>
								)}
							</div>
							<div className="form-group">
								<label htmlFor="bedrooms">
									{t("createProduct.realEstate.bedrooms") || "Број на соби"} *
									{validationErrors.bedrooms && (
										<span className="error-indicator">
											<AlertCircle size={14} />
										</span>
									)}
								</label>
								<CustomSelect
									id="bedrooms"
									name="categorySpecific.bedrooms"
									value={formData.categorySpecific.bedrooms || ""}
									onChange={(e) => {
										handleChange(e);
										setValidationErrors((prev) => ({ ...prev, bedrooms: "" }));
									}}
									error={!!validationErrors.bedrooms}
									placeholder={t("createProduct.select.bedrooms") || "Select bedrooms"}
									options={[
										{ value: "", label: t("createProduct.select.bedrooms") || "Select bedrooms" },
										...generateBedroomOptions().map((bedrooms) => ({
											value: bedrooms.toString(),
											label: bedrooms.toString(),
										})),
									]}
								/>
								{validationErrors.bedrooms && (
									<div className="field-error">
										<AlertCircle size={16} />
										{validationErrors.bedrooms}
									</div>
								)}
							</div>
						</div>

						{/* Heating and Equipment */}
						<div className="form-row">
							<div className="form-group">
								<label htmlFor="heating">
									{t("createProduct.realEstate.heating") || "Греење"}
									{validationErrors.heating && (
										<span className="error-indicator">
											<AlertCircle size={14} />
										</span>
									)}
								</label>
								<CustomSelect
									id="heating"
									name="categorySpecific.heating"
									value={formData.categorySpecific.heating || ""}
									onChange={(e) => {
										handleChange(e);
										setValidationErrors((prev) => ({ ...prev, heating: "" }));
									}}
									error={!!validationErrors.heating}
									placeholder={t("createProduct.select.heating") || "Select heating"}
									options={[
										{ value: "", label: t("createProduct.select.heating") || "Select heating" },
										...getHeatingTypeOptions(t),
									]}
								/>
								{validationErrors.heating && (
									<div className="field-error">
										<AlertCircle size={16} />
										{validationErrors.heating}
									</div>
								)}
							</div>
							<div className="form-group">
								<label htmlFor="equipment">
									{t("createProduct.realEstate.equipment") || "Опрема"}
									{validationErrors.equipment && (
										<span className="error-indicator">
											<AlertCircle size={14} />
										</span>
									)}
								</label>
								<CustomSelect
									id="equipment"
									name="categorySpecific.equipment"
									value={formData.categorySpecific.equipment || ""}
									onChange={(e) => {
										handleChange(e);
										setValidationErrors((prev) => ({ ...prev, equipment: "" }));
									}}
									error={!!validationErrors.equipment}
									placeholder={t("createProduct.select.equipment") || "Select equipment"}
									options={[
										{ value: "", label: t("createProduct.select.equipment") || "Select equipment" },
										...getEquipmentOptions(t),
									]}
								/>
								{validationErrors.equipment && (
									<div className="field-error">
										<AlertCircle size={16} />
										{validationErrors.equipment}
									</div>
								)}
							</div>
						</div>
					</div>
				)}

				{/* Show vehicle-specific fields for Vehicles category, but hide for parts/accessories subcategory */}
				{formData.category === "Vehicles" && 
				 (!formData.subcategory || !["parts", "accessories"].includes(formData.subcategory)) && (
					<div className="form-section">
						<h3>{t("createProduct.cars.title")}</h3>
						{/* Brand and Model */}
						<div className="form-row">
							<div className="form-group">
								<label htmlFor="brand">
									{t("createProduct.cars.brand")} *
									{validationErrors.brand && (
										<span className="error-indicator">
											<AlertCircle size={14} />
										</span>
									)}
								</label>
								<CustomSelect
									id="brand"
									name="brand"
									value={formData.brand}
									onChange={(e) => {
										handleChange(e);
										// Clear model when brand changes
										setFormData((prev) => ({ ...prev, model: "" }));
										setValidationErrors((prev) => ({ ...prev, brand: "", model: "" }));
									}}
									placeholder={t("createProduct.select.brand") || "Select brand"}
									className={validationErrors.brand ? "error" : ""}
									required
									searchable
									options={getBrandOptions(t, false)}
								/>
								{validationErrors.brand && (
									<div className="field-error">
										<AlertCircle size={16} />
										{validationErrors.brand}
									</div>
								)}
							</div>
							<div className="form-group">
								<label htmlFor="model">
									{t("createProduct.cars.model")} *
									{validationErrors.model && (
										<span className="error-indicator">
											<AlertCircle size={14} />
										</span>
									)}
								</label>
								{formData.brand ? (
									<>
										<input
											type="text"
											id="model"
											name="model"
											list={`model-list-${formData.brand}`}
											value={formData.model}
											onChange={(e) => {
												handleChange(e);
												setValidationErrors((prev) => ({ ...prev, model: "" }));
											}}
											placeholder={t("createProduct.cars.model.placeholder") || "Enter or select model"}
											className={validationErrors.model ? "error" : ""}
											autoComplete="off"
										/>
										{getModelsForBrand(formData.brand).length > 0 && (
											<datalist id={`model-list-${formData.brand}`}>
												{getModelsForBrand(formData.brand).map((model, index) => (
													<option key={index} value={model} />
												))}
											</datalist>
										)}
									</>
								) : (
									<input
										type="text"
										id="model"
										name="model"
										value={formData.model}
										onChange={(e) => {
											handleChange(e);
											setValidationErrors((prev) => ({ ...prev, model: "" }));
										}}
										placeholder={t("createProduct.cars.model.placeholderSelectBrand") || "Select brand first"}
										className={validationErrors.model ? "error" : ""}
										disabled
									/>
								)}
								{validationErrors.model && (
									<div className="field-error">
										<AlertCircle size={16} />
										{validationErrors.model}
									</div>
								)}
							</div>
						</div>
						<div className="form-row">
							<div className="form-group">
								<label htmlFor="year">
									{t("createProduct.cars.year")} *
									{validationErrors.year && (
										<span className="error-indicator">
											<AlertCircle size={14} />
										</span>
									)}
								</label>
								<CustomSelect
									id="year"
									name="categorySpecific.year"
									value={formData.categorySpecific.year}
									onChange={(e) => {
										handleChange(e);
										setValidationErrors((prev) => ({ ...prev, year: "" }));
									}}
									error={!!validationErrors.year}
									placeholder={t("createProduct.select.year") || "Select year"}
									options={[
										{ value: "", label: t("createProduct.select.year") || "Select year" },
										...generateYearOptions().map((year) => ({
											value: year.toString(),
											label: year.toString(),
										})),
									]}
								/>
								{validationErrors.year && (
									<div className="field-error">
										<AlertCircle size={16} />
										{validationErrors.year}
									</div>
								)}
							</div>
							<div className="form-group">
								<label htmlFor="categorySpecific.fuelType">
									{t("createProduct.cars.fuelType")} *
									{validationErrors.fuelType && (
										<span className="error-indicator">
											<AlertCircle size={14} />
										</span>
									)}
								</label>
								<CustomSelect
									id="categorySpecific.fuelType"
									name="categorySpecific.fuelType"
									value={formData.categorySpecific.fuelType || ""}
									onChange={(e) => {
										handleChange(e);
										setValidationErrors((prev) => ({ ...prev, fuelType: "" }));
									}}
									className={validationErrors.fuelType ? "error" : ""}
									placeholder={t("createProduct.select.fuelType") || "Select fuel type"}
									options={getFuelTypeOptions(t)}
								/>
								{validationErrors.fuelType && (
									<div className="field-error">
										<AlertCircle size={16} />
										{validationErrors.fuelType}
									</div>
								)}
							</div>
						</div>
						<div className="form-row">
							<div className="form-group">
								<label htmlFor="mileage">
									{t("createProduct.cars.mileage")}
									{validationErrors.mileage && (
										<span className="error-indicator">
											<AlertCircle size={14} />
										</span>
									)}
								</label>
								<CustomSelect
									id="mileage"
									name="categorySpecific.mileage"
									value={formData.categorySpecific.mileage}
									onChange={(e) => {
										handleChange(e);
										setValidationErrors((prev) => ({ ...prev, mileage: "" }));
									}}
									error={!!validationErrors.mileage}
									placeholder={t("createProduct.select.mileage") || "Select mileage"}
									searchable
									options={[
										{ value: "", label: t("createProduct.select.mileage") || "Select mileage" },
										...generateMileageOptions(),
									]}
								/>
								{validationErrors.mileage && (
									<div className="field-error">
										<AlertCircle size={16} />
										{validationErrors.mileage}
									</div>
								)}
							</div>
							<div className="form-group">
								<label htmlFor="powerKW">
									{t("createProduct.cars.powerKW")}
									{validationErrors.powerKW && (
										<span className="error-indicator">
											<AlertCircle size={14} />
										</span>
									)}
								</label>
								<CustomSelect
									id="powerKW"
									name="categorySpecific.powerKW"
									value={formData.categorySpecific.powerKW}
									onChange={(e) => {
										handleChange(e);
										setValidationErrors((prev) => ({ ...prev, powerKW: "" }));
									}}
									error={!!validationErrors.powerKW}
									placeholder={t("createProduct.select.powerKW") || "Select power (kW)"}
									options={[
										{ value: "", label: t("createProduct.select.powerKW") || "Select power (kW)" },
										...getPowerKWOptions(),
									]}
								/>
								{validationErrors.powerKW && (
									<div className="field-error">
										<AlertCircle size={16} />
										{validationErrors.powerKW}
									</div>
								)}
							</div>
						</div>
						<div className="form-row">
							<div className="form-group">
								<label htmlFor="categorySpecific.transmission">
									{t("createProduct.cars.transmission")} *
									{validationErrors.transmission && (
										<span className="error-indicator">
											<AlertCircle size={14} />
										</span>
									)}
								</label>
								<CustomSelect
									id="categorySpecific.transmission"
									name="categorySpecific.transmission"
									value={formData.categorySpecific.transmission || ""}
									onChange={(e) => {
										handleChange(e);
										setValidationErrors((prev) => ({ ...prev, transmission: "" }));
									}}
									className={validationErrors.transmission ? "error" : ""}
									placeholder={t("createProduct.select.transmission") || "Select transmission"}
									options={getTransmissionOptions(t)}
								/>
								{validationErrors.transmission && (
									<div className="field-error">
										<AlertCircle size={16} />
										{validationErrors.transmission}
									</div>
								)}
							</div>
						</div>
					</div>
				)}

				{/* Images */}
				<div className="form-section">
					<h3>
						{t("createProduct.form.images")} *
						{validationErrors.images && (
							<span className="error-indicator">
								<AlertCircle size={14} />
							</span>
						)}
					</h3>
					<div className="form-group">
						<input
							type="file"
							id="images"
							multiple
							accept="image/*"
							onChange={handleImageChange}
							disabled={uploadingImages}
							className={validationErrors.images ? "error" : ""}
						/>
						{uploadingImages && (
							<p className="form-help">{t("common.loading") || "Uploading..."}</p>
						)}
						{validationErrors.images && (
							<div className="field-error">
								<AlertCircle size={16} />
								{validationErrors.images}
							</div>
						)}
					</div>

					{formData.images.length > 0 && (
						<div className="image-preview">
							{formData.images.map((image, index) => (
								<div key={index} className="image-item">
									<img src={image} alt={`Preview ${index + 1}`} />
									<button
										type="button"
										onClick={() => removeImage(index)}
										className="remove-image"
									>
										×
									</button>
								</div>
							))}
						</div>
					)}
				</div>

				{/* Contact Info */}
				<div className="form-section">
					<h3>{t("createProduct.form.contactInfo")}</h3>
					<div className="form-row">
						<div className="form-group">
							<label htmlFor="phone">
								{t("common.phone")}
								{validationErrors.phone && (
									<span className="error-indicator">
										<AlertCircle size={14} />
									</span>
								)}
							</label>
							<input
								type="tel"
								id="phone"
								name="contactInfo.phone"
								value={formData.contactInfo.phone}
								onChange={handleChange}
								className={validationErrors.phone ? "error" : ""}
								placeholder="+389 XX XXX XXX"
							/>
							{validationErrors.phone && (
								<div className="field-error">
									<AlertCircle size={16} />
									{validationErrors.phone}
								</div>
							)}
						</div>
						<div className="form-group">
							<label htmlFor="email">
								{t("common.email")}
								{validationErrors.email && (
									<span className="error-indicator">
										<AlertCircle size={14} />
									</span>
								)}
							</label>
							<input
								type="email"
								id="email"
								name="contactInfo.email"
								value={formData.contactInfo.email}
								onChange={handleChange}
								className={validationErrors.email ? "error" : ""}
								placeholder="example@email.com"
							/>
							{validationErrors.email && (
								<div className="field-error">
									<AlertCircle size={16} />
									{validationErrors.email}
								</div>
							)}
						</div>
					</div>
				</div>

				{/* Submit */}
				<div className="form-actions">
					<button
						type="button"
						onClick={() => navigate("/products")}
						className="btn btn-secondary"
					>
						{t("createProduct.form.cancel")}
					</button>
					<button type="submit" disabled={loading} className="btn btn-primary">
						{loading ? t("common.loading") : t("createProduct.form.submit")}
					</button>
				</div>
			</form>
		</div>
	);
};

export default CreateProduct;
