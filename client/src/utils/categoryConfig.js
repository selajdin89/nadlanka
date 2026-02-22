import {
	Smartphone,
	Car,
	Home,
	Shirt,
	BookOpen,
	Gamepad2,
	TreePine,
	Wrench,
	Grid3x3,
	Armchair,
	Laptop,
	Tablet,
	Headphones,
	Joystick,
	Bike,
	Truck,
	CarFront,
	Sofa,
	Bed,
	ChefHat,
	Briefcase,
	Flower2,
	Baby,
	Footprints,
	Watch,
	Palette,
	GraduationCap,
	Sparkles,
	Hammer,
	Dumbbell,
	Tent,
	Users,
	Waves,
	Snowflake,
	FileText,
	School,
	Languages,
	Microwave,
	Droplet,
} from "lucide-react";

// Category icons mapping
export const categoryIcons = {
	Electronics: Smartphone,
	Furniture: Armchair,
	Vehicles: Car,
	"Real Estate": Home,
	Fashion: Shirt,
	Books: BookOpen,
	Sports: Gamepad2,
	"Home & Garden": TreePine,
	Services: Wrench,
	Other: Grid3x3,
};

// Subcategory icons mapping
export const subcategoryIcons = {
	// Electronics
	smartphones: Smartphone,
	laptops: Laptop,
	tablets: Tablet,
	headphones: Headphones,
	gaming: Joystick,

	// Cars
	cars: CarFront,
	motorcycles: Bike,
	trucks: Truck,
	parts: Wrench,
	accessories: CarFront,

	// Real Estate
	"houses-villas": Home,
	apartments: Home,
	rooms: Home,
	"weekend-houses": Home,
	shops: Briefcase,
	"business-space": Briefcase,
	"roommate-room": Home,
	garages: CarFront,
	"plots-fields": TreePine,
	warehouses: Briefcase,
	"barracks-kiosks-shops": Briefcase,
	"new-construction": Home,
	abroad: Home,
	other: Grid3x3,

	// Furniture
	livingRoom: Sofa,
	bedroom: Bed,
	kitchen: ChefHat,
	office: Briefcase,
	outdoor: Flower2,

	// Fashion
	mens: Shirt,
	womens: Shirt,
	kids: Baby,
	shoes: Footprints,
	accessories: Watch,

	// Services
	photography: Palette,
	tutoring: GraduationCap,
	cleaning: Sparkles,
	repair: Hammer,
	delivery: Truck,

	// Sports
	fitness: Dumbbell,
	outdoor: Tent,
	teamSports: Users,
	waterSports: Waves,
	winterSports: Snowflake,

	// Books
	textbooks: GraduationCap,
	novels: FileText,
	childrens: Baby,
	academic: School,
	language: Languages,

	// Home & Garden
	appliances: Microwave,
	gardenTools: Wrench,
	kitchen: ChefHat,
	bathroom: Droplet,
	diy: Hammer,
};

// Nested subcategories mapping (subcategory key -> nested subcategories)
export const nestedSubcategories = {
	"agricultural-vehicles": [
		{ key: "all-agricultural", label: "All Agricultural Vehicles" },
		{ key: "tractors", label: "Tractors" },
		{ key: "attached-machines", label: "Attached Machines" },
		{ key: "combines", label: "Combines" },
		{ key: "forestry-machines", label: "Forestry Machines" },
		{ key: "spare-parts", label: "Spare Parts" },
		{ key: "other-agricultural", label: "Other" },
	],
	"business-space": [
		{ key: "industry-workshop", label: "Индустрија и Работилница" },
		{ key: "office", label: "Канцеларија" },
		{ key: "warehouses", label: "Магацини" },
		{ key: "other-business", label: "Останато" },
	],
};

// Check if a category has subcategories
export const hasSubcategories = (categoryValue) => {
	return getSubcategories(categoryValue).length > 0;
};

// Get nested subcategories for a subcategory
export const getNestedSubcategories = (subcategoryKey) => {
	return nestedSubcategories[subcategoryKey] || [];
};

// Check if a subcategory has nested subcategories
export const hasNestedSubcategories = (subcategoryKey) => {
	return nestedSubcategories[subcategoryKey]?.length > 0;
};

// Category to subcategories mapping
export const categorySubcategories = {
	Electronics: [
		{ key: "smartphones", label: "Smartphones" },
		{ key: "laptops", label: "Laptops" },
		{ key: "tablets", label: "Tablets" },
		{ key: "headphones", label: "Headphones" },
		{ key: "gaming", label: "Gaming" },
	],
	Furniture: [
		{ key: "livingRoom", label: "Living Room" },
		{ key: "bedroom", label: "Bedroom" },
		{ key: "kitchen", label: "Kitchen" },
		{ key: "office", label: "Office" },
		{ key: "outdoor", label: "Outdoor" },
	],
	Vehicles: [
		{ key: "cars", label: "Cars" },
		{ key: "motorcycles", label: "Motorcycles" },
		{ key: "trucks", label: "Trucks" },
		{ key: "agricultural-vehicles", label: "Agricultural Vehicles" },
		{ key: "parts", label: "Parts" },
		{ key: "accessories", label: "Accessories" },
	],
	"Real Estate": [
		{ key: "houses-villas", label: "Куќи / Вили" },
		{ key: "apartments", label: "Станови" },
		{ key: "rooms", label: "Соби" },
		{ key: "weekend-houses", label: "Викенд куќи" },
		{ key: "shops", label: "Дуќани" },
		{ key: "business-space", label: "Деловен простор" },
		{ key: "roommate-room", label: "Цимер / ка" },
		{ key: "garages", label: "Гаражи" },
		{ key: "plots-fields", label: "Плацеви и Ниви" },
		{ key: "warehouses", label: "Магацини" },
		{ key: "barracks-kiosks-shops", label: "Бараки, киосци, трафики" },
		{ key: "new-construction", label: "Новоградба" },
		{ key: "abroad", label: "Во странство" },
		{ key: "other", label: "Останато" },
	],
	Fashion: [
		{ key: "mens", label: "Men's" },
		{ key: "womens", label: "Women's" },
		{ key: "kids", label: "Kids" },
		{ key: "shoes", label: "Shoes" },
		{ key: "accessories", label: "Accessories" },
	],
	Books: [
		{ key: "textbooks", label: "Textbooks" },
		{ key: "novels", label: "Novels" },
		{ key: "childrens", label: "Children's" },
		{ key: "academic", label: "Academic" },
		{ key: "language", label: "Language" },
	],
	Sports: [
		{ key: "fitness", label: "Fitness" },
		{ key: "outdoor", label: "Outdoor" },
		{ key: "teamSports", label: "Team Sports" },
		{ key: "waterSports", label: "Water Sports" },
		{ key: "winterSports", label: "Winter Sports" },
	],
	"Home & Garden": [
		{ key: "appliances", label: "Appliances" },
		{ key: "gardenTools", label: "Garden Tools" },
		{ key: "kitchen", label: "Kitchen" },
		{ key: "bathroom", label: "Bathroom" },
		{ key: "diy", label: "DIY" },
	],
	Services: [
		{ key: "photography", label: "Photography" },
		{ key: "tutoring", label: "Tutoring" },
		{ key: "cleaning", label: "Cleaning" },
		{ key: "repair", label: "Repair" },
		{ key: "delivery", label: "Delivery" },
	],
	Other: [],
};

// Get icon for category
export const getCategoryIcon = (categoryValue) => {
	return categoryIcons[categoryValue] || Grid3x3;
};

// Get icon for subcategory
export const getSubcategoryIcon = (subcategoryKey) => {
	return subcategoryIcons[subcategoryKey] || Grid3x3;
};

// Get subcategories for a category
export const getSubcategories = (categoryValue) => {
	return categorySubcategories[categoryValue] || [];
};

// Convert category value to slug for URL
export const categoryToSlug = (categoryValue) => {
	const slugMap = {
		Electronics: "electronics",
		Furniture: "furniture",
		Vehicles: "vehicles",
		Cars: "vehicles", // Backward compatibility - map old Cars to vehicles slug
		"Real Estate": "real-estate",
		Fashion: "fashion",
		Books: "books",
		Sports: "sports",
		"Home & Garden": "home-garden",
		Services: "services",
		Other: "other",
	};
	return slugMap[categoryValue] || categoryValue.toLowerCase().replace(/\s+/g, "-");
};

