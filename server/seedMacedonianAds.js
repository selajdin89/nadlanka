const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const User = require("./models/User");
const Product = require("./models/Product");

// Realistic Macedonian users
const macedonianUsers = [
	{
		name: "Марко Петровски",
		email: "marko.petrovski@example.com",
		password: "password123",
		phone: "+389 70 234 567",
		location: "Скопје",
	},
	{
		name: "Ана Стојановска",
		email: "ana.stojanovska@example.com",
		password: "password123",
		phone: "+389 71 456 789",
		location: "Битола",
	},
	{
		name: "Стефан Димитриевски",
		email: "stefan.dimitrievski@example.com",
		password: "password123",
		phone: "+389 72 123 456",
		location: "Охрид",
	},
	{
		name: "Елена Трајковска",
		email: "elena.trajkovska@example.com",
		password: "password123",
		phone: "+389 73 234 567",
		location: "Прилеп",
	},
	{
		name: "Никола Стојанов",
		email: "nikola.stojanov@example.com",
		password: "password123",
		phone: "+389 74 345 678",
		location: "Куманово",
	},
	{
		name: "Марија Георгиевска",
		email: "marija.georgievska@example.com",
		password: "password123",
		phone: "+389 75 567 890",
		location: "Струмица",
	},
	{
		name: "Димитар Илиевски",
		email: "dimitar.ilievski@example.com",
		password: "password123",
		phone: "+389 76 678 901",
		location: "Тетово",
	},
	{
		name: "Софија Ристовска",
		email: "sofija.ristovska@example.com",
		password: "password123",
		phone: "+389 77 789 012",
		location: "Велес",
	},
];

// Realistic Macedonian products - 35 ads
const macedonianProducts = [
	// Cars (8 ads)
	{
		title: "Opel Astra 1.6 CDTI 2015",
		description:
			"Се продава Opel Astra 1.6 CDTI од 2015 година. Автомобилот е одлично одржан, редовно сервисиран. Поминати 145.000 км. Клима, навигација, зимски и летни гуми. Цената е фиксна.",
		price: 7500,
		currency: "EUR",
		category: "Vehicles",
		subcategory: "cars",
		condition: "Used",
		location: "Скопје",
		region: "Центар",
		brand: "Opel",
		model: "Astra",
		year: 2015,
		categorySpecific: {
			fuelType: "diesel",
			mileage: 145000,
			transmission: "manual",
			color: "Сива",
		},
		images: ["https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&h=600&fit=crop"],
		status: "active",
		isUrgent: false,
		tags: ["автомобил", "opel", "дизел", "2015"],
	},
	{
		title: "Renault Clio 1.5 dCi 2018",
		description:
			"Renault Clio од 2018 година, 1.5 dCi мотор. Автомобилот е како нов, од прв сопственик. Поминати само 68.000 км. Сите документи во ред, редовно сервисиран. Клима, Bluetooth, зимски гуми вклучени.",
		price: 9200,
		currency: "EUR",
		category: "Vehicles",
		subcategory: "cars",
		condition: "Used",
		location: "Битола",
		brand: "Renault",
		model: "Clio",
		year: 2018,
		categorySpecific: {
			fuelType: "diesel",
			mileage: 68000,
			transmission: "manual",
			color: "Бела",
		},
		images: ["https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&h=600&fit=crop"],
		status: "active",
		isUrgent: true,
		tags: ["renault", "clio", "2018", "дизел"],
	},
	{
		title: "VW Golf 7 1.4 TSI 2016",
		description:
			"Volkswagen Golf 7 од 2016 година. 1.4 TSI бензин мотор, автоматска менувачка. Автомобилот е одлично одржан, од прв сопственик. Поминати 112.000 км. Клима, навигација, парк сензори.",
		price: 11500,
		currency: "EUR",
		category: "Vehicles",
		subcategory: "cars",
		condition: "Used",
		location: "Скопје",
		region: "Карпош",
		brand: "Volkswagen",
		model: "Golf",
		year: 2016,
		categorySpecific: {
			fuelType: "petrol",
			mileage: 112000,
			transmission: "automatic",
			color: "Црна",
		},
		images: ["https://images.unsplash.com/photo-1544829099-b9a0c53000c9?w=800&h=600&fit=crop"],
		status: "active",
		isUrgent: false,
		tags: ["vw", "golf", "автомат", "2016"],
	},
	{
		title: "Peugeot 208 1.2 PureTech 2019",
		description:
			"Peugeot 208 од 2019 година, 1.2 PureTech бензин мотор. Автомобилот е како нов, од прв сопственик. Поминати 45.000 км. Клима, зимски гуми, сите документи во ред.",
		price: 10800,
		currency: "EUR",
		category: "Vehicles",
		subcategory: "cars",
		condition: "Used",
		location: "Охрид",
		brand: "Peugeot",
		model: "208",
		year: 2019,
		categorySpecific: {
			fuelType: "petrol",
			mileage: 45000,
			transmission: "manual",
			color: "Сива",
		},
		images: ["https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&h=600&fit=crop"],
		status: "active",
		isUrgent: false,
		tags: ["peugeot", "208", "2019", "бензин"],
	},
	{
		title: "Ford Focus 1.6 TDCi 2014",
		description:
			"Ford Focus од 2014 година, 1.6 TDCi дизел мотор. Автомобилот е одлично одржан. Поминати 165.000 км. Клима, зимски гуми, редовно сервисиран. Цената е фиксна.",
		price: 6800,
		currency: "EUR",
		category: "Vehicles",
		subcategory: "cars",
		condition: "Used",
		location: "Прилеп",
		brand: "Ford",
		model: "Focus",
		year: 2014,
		categorySpecific: {
			fuelType: "diesel",
			mileage: 165000,
			transmission: "manual",
			color: "Сива",
		},
		images: ["https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&h=600&fit=crop"],
		status: "active",
		isUrgent: false,
		tags: ["ford", "focus", "дизел", "2014"],
	},
	{
		title: "Škoda Octavia 1.6 TDI 2017",
		description:
			"Škoda Octavia од 2017 година, 1.6 TDI дизел мотор. Автомобилот е одлично одржан, од прв сопственик. Поминати 98.000 км. Клима, навигација, зимски и летни гуми вклучени.",
		price: 12500,
		currency: "EUR",
		category: "Vehicles",
		subcategory: "cars",
		condition: "Used",
		location: "Скопје",
		region: "Аеродром",
		brand: "Škoda",
		model: "Octavia",
		year: 2017,
		categorySpecific: {
			fuelType: "diesel",
			mileage: 98000,
			transmission: "manual",
			color: "Сива",
		},
		images: ["https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&h=600&fit=crop"],
		status: "active",
		isUrgent: true,
		tags: ["škoda", "octavia", "2017", "дизел"],
	},
	{
		title: "Fiat Punto 1.3 Multijet 2012",
		description:
			"Fiat Punto од 2012 година, 1.3 Multijet дизел мотор. Автомобилот е одличен за градска употреба. Поминати 180.000 км. Клима, зимски гуми. Цената е фиксна.",
		price: 4200,
		currency: "EUR",
		category: "Vehicles",
		subcategory: "cars",
		condition: "Used",
		location: "Куманово",
		brand: "Fiat",
		model: "Punto",
		year: 2012,
		categorySpecific: {
			fuelType: "diesel",
			mileage: 180000,
			transmission: "manual",
			color: "Црвена",
		},
		images: ["https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800&h=600&fit=crop"],
		status: "active",
		isUrgent: false,
		tags: ["fiat", "punto", "2012", "дизел"],
	},
	{
		title: "Hyundai i20 1.4 CRDi 2016",
		description:
			"Hyundai i20 од 2016 година, 1.4 CRDi дизел мотор. Автомобилот е одлично одржан. Поминати 125.000 км. Клима, зимски гуми, редовно сервисиран.",
		price: 7800,
		currency: "EUR",
		category: "Vehicles",
		subcategory: "cars",
		condition: "Used",
		location: "Струмица",
		brand: "Hyundai",
		model: "i20",
		year: 2016,
		categorySpecific: {
			fuelType: "diesel",
			mileage: 125000,
			transmission: "manual",
			color: "Бела",
		},
		images: ["https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800&h=600&fit=crop"],
		status: "active",
		isUrgent: false,
		tags: ["hyundai", "i20", "2016", "дизел"],
	},

	// Real Estate (6 ads)
	{
		title: "Стан во Центар - 2 соби, 65м²",
		description:
			"Се продава стан во центарот на Скопје, 2 соби, 65м². Станот е на трет кат, со балкон, паркинг место. Нова градба од 2018 година. Цената е фиксна.",
		price: 85000,
		currency: "EUR",
		category: "Real Estate",
		subcategory: "apartments",
		condition: "New",
		location: "Скопје",
		region: "Центар",
		categorySpecific: {
			propertyType: "apartment",
			area: 65,
			bedrooms: "2",
			bathrooms: "1",
			address: "ул. Македонија бр. 15",
		},
		images: ["https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop"],
		status: "active",
		isUrgent: true,
		tags: ["стан", "скопје", "център", "2 соби"],
	},
	{
		title: "Куќа со двор - 3 соби, 120м²",
		description:
			"Се продава куќа со двор во Битола, 3 соби, 120м². Дворот е 300м². Куќата е одлично одржана, со градина. Тивок кварт, близу до училиште.",
		price: 95000,
		currency: "EUR",
		category: "Real Estate",
		subcategory: "houses",
		condition: "Used",
		location: "Битола",
		categorySpecific: {
			propertyType: "house",
			area: 120,
			bedrooms: "3",
			bathrooms: "2",
			address: "ул. Партизанска бр. 42",
		},
		images: ["https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&h=600&fit=crop"],
		status: "active",
		isUrgent: false,
		tags: ["куќа", "битола", "двор", "3 соби"],
	},
	{
		title: "Стан во Карпош - 3 соби, 85м²",
		description:
			"Се продава стан во Карпош, 3 соби, 85м². Станот е на втори кат, со балкон, паркинг место. Нова градба. Цената е фиксна.",
		price: 105000,
		currency: "EUR",
		category: "Real Estate",
		subcategory: "apartments",
		condition: "New",
		location: "Скопје",
		region: "Карпош",
		categorySpecific: {
			propertyType: "apartment",
			area: 85,
			bedrooms: "3",
			bathrooms: "2",
			address: "ул. Бул. Партизански одреди бр. 88",
		},
		images: ["https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop"],
		status: "active",
		isUrgent: true,
		tags: ["стан", "скопје", "карпош", "3 соби"],
	},
	{
		title: "Вила на Охрид - 4 соби, 180м²",
		description:
			"Се продава вила на Охрид, 4 соби, 180м². Вилата е со прекрасен поглед кон езерото. Дворот е 500м². Одлично одржана, со градина.",
		price: 185000,
		currency: "EUR",
		category: "Real Estate",
		subcategory: "houses",
		condition: "Used",
		location: "Охрид",
		categorySpecific: {
			propertyType: "house",
			area: 180,
			bedrooms: "4",
			bathrooms: "3",
			address: "ул. Св. Климент бр. 25",
		},
		images: ["https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&h=600&fit=crop"],
		status: "active",
		isUrgent: false,
		tags: ["вила", "охрид", "езеро", "4 соби"],
	},
	{
		title: "Стан во Прилеп - 2 соби, 58м²",
		description:
			"Се продава стан во Прилеп, 2 соби, 58м². Станот е на прв кат, со балкон. Одлично одржан, со нови прозорци. Цената е фиксна.",
		price: 32000,
		currency: "EUR",
		category: "Real Estate",
		subcategory: "apartments",
		condition: "Used",
		location: "Прилеп",
		categorySpecific: {
			propertyType: "apartment",
			area: 58,
			bedrooms: "2",
			bathrooms: "1",
			address: "ул. Маршал Тито бр. 12",
		},
		images: ["https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop"],
		status: "active",
		isUrgent: false,
		tags: ["стан", "прилеп", "2 соби"],
	},
	{
		title: "Парцела за градба - 600м²",
		description:
			"Се продава парцела за градба во Куманово, 600м². Парцелата е со урбанизациска дозвола. Одлична локација, близу до центарот.",
		price: 45000,
		currency: "EUR",
		category: "Real Estate",
		subcategory: "land",
		condition: "New",
		location: "Куманово",
		categorySpecific: {
			propertyType: "land",
			area: 600,
			address: "ул. Гоце Делчев бр. 55",
		},
		images: ["https://images.unsplash.com/photo-1464207687429-7505649dae38?w=800&h=600&fit=crop"],
		status: "active",
		isUrgent: false,
		tags: ["парцела", "куманово", "градба"],
	},

	// Electronics (8 ads)
	{
		title: "iPhone 13 Pro 256GB - Како нов",
		description:
			"Се продава iPhone 13 Pro 256GB во одлична состојба. Телефонот е како нов, со оригинална кутија и полнач. Батеријата е на 92%. Цената е фиксна.",
		price: 750,
		currency: "EUR",
		category: "Electronics",
		subcategory: "smartphones",
		condition: "Used",
		location: "Скопје",
		region: "Центар",
		brand: "Apple",
		model: "iPhone 13 Pro",
		images: ["https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&h=600&fit=crop"],
		status: "active",
		isUrgent: true,
		tags: ["iphone", "13 pro", "256gb", "apple"],
	},
	{
		title: "Samsung Galaxy S21 128GB",
		description:
			"Се продава Samsung Galaxy S21 128GB. Телефонот е одлично одржан, со оригинална кутија и полнач. Батеријата е на 88%. Цената е фиксна.",
		price: 450,
		currency: "EUR",
		category: "Electronics",
		subcategory: "smartphones",
		condition: "Used",
		location: "Битола",
		brand: "Samsung",
		model: "Galaxy S21",
		images: ["https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&h=600&fit=crop"],
		status: "active",
		isUrgent: false,
		tags: ["samsung", "galaxy", "s21", "128gb"],
	},
	{
		title: "MacBook Air M1 256GB - 2020",
		description:
			"Се продава MacBook Air M1 256GB од 2020 година. Лаптопот е одлично одржан, со оригинална кутија. Перфектен за студенти и професионалци.",
		price: 850,
		currency: "EUR",
		category: "Electronics",
		subcategory: "laptops",
		condition: "Used",
		location: "Скопје",
		region: "Карпош",
		brand: "Apple",
		model: "MacBook Air M1",
		images: ["https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&h=600&fit=crop"],
		status: "active",
		isUrgent: false,
		tags: ["macbook", "air", "m1", "apple"],
	},
	{
		title: "Sony PlayStation 5 - Нова",
		description:
			"Се продава нова Sony PlayStation 5, неотпакувана. Со оригинална гаранција. Цената е фиксна.",
		price: 550,
		currency: "EUR",
		category: "Electronics",
		subcategory: "gaming",
		condition: "New",
		location: "Скопје",
		region: "Аеродром",
		brand: "Sony",
		model: "PlayStation 5",
		images: ["https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=800&h=600&fit=crop"],
		status: "active",
		isUrgent: true,
		tags: ["playstation", "ps5", "sony", "нова"],
	},
	{
		title: "Samsung 55\" Smart TV - 4K",
		description:
			"Се продава Samsung Smart TV 55 инчи, 4K резолуција. Телевизорот е одлично одржан, со оригинална кутија. Перфектен за гледање филмови.",
		price: 420,
		currency: "EUR",
		category: "Electronics",
		subcategory: "gaming",
		condition: "Used",
		location: "Охрид",
		brand: "Samsung",
		model: "55\" 4K Smart TV",
		images: ["https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800&h=600&fit=crop"],
		status: "active",
		isUrgent: false,
		tags: ["samsung", "tv", "4k", "smart"],
	},
	{
		title: "AirPods Pro 2 - Како нови",
		description:
			"Се продаваат AirPods Pro 2 во одлична состојба. Слушалките се како нови, со оригинална кутија и сите прилози. Цената е фиксна.",
		price: 220,
		currency: "EUR",
		category: "Electronics",
		subcategory: "headphones",
		condition: "Used",
		location: "Скопје",
		region: "Центар",
		brand: "Apple",
		model: "AirPods Pro 2",
		images: ["https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&h=600&fit=crop"],
		status: "active",
		isUrgent: false,
		tags: ["airpods", "pro", "apple", "слушалки"],
	},
	{
		title: "iPad Air 64GB - 2022",
		description:
			"Се продава iPad Air 64GB од 2022 година. Таблетот е одлично одржан, со оригинална кутија и полнач. Перфектен за работа и забава.",
		price: 520,
		currency: "EUR",
		category: "Electronics",
		subcategory: "tablets",
		condition: "Used",
		location: "Битола",
		brand: "Apple",
		model: "iPad Air",
		images: ["https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&h=600&fit=crop"],
		status: "active",
		isUrgent: false,
		tags: ["ipad", "air", "apple", "таблет"],
	},
	{
		title: "Xiaomi Redmi Note 12 128GB",
		description:
			"Се продава Xiaomi Redmi Note 12 128GB. Телефонот е како нов, со оригинална кутија и полнач. Батеријата е на 100%. Цената е фиксна.",
		price: 180,
		currency: "EUR",
		category: "Electronics",
		subcategory: "smartphones",
		condition: "New",
		location: "Прилеп",
		brand: "Xiaomi",
		model: "Redmi Note 12",
		images: ["https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&h=600&fit=crop"],
		status: "active",
		isUrgent: false,
		tags: ["xiaomi", "redmi", "note 12", "128gb"],
	},

	// Furniture (5 ads)
	{
		title: "Софа 3+2+1 - Кожа",
		description:
			"Се продава софа 3+2+1 од кожа, кафеава боја. Софата е одлично одржана, удобна за гледање ТВ. Сите делови се вклучени. Подигнување само.",
		price: 450,
		currency: "EUR",
		category: "Furniture",
		subcategory: "livingRoom",
		condition: "Used",
		location: "Скопје",
		region: "Карпош",
		images: ["https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&h=600&fit=crop"],
		status: "active",
		isUrgent: false,
		tags: ["софа", "кожа", "3+2+1", "мебел"],
	},
	{
		title: "Маса за јадење - Дрво, 6 лица",
		description:
			"Се продава маса за јадење од дрво за 6 лица. Масата е одлично одржана, со 6 столици. Перфектна за семејство. Подигнување само.",
		price: 280,
		currency: "EUR",
		category: "Furniture",
		subcategory: "kitchen",
		condition: "Used",
		location: "Битола",
		images: ["https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&h=600&fit=crop"],
		status: "active",
		isUrgent: false,
		tags: ["маса", "јадење", "дрво", "6 столици"],
	},
	{
		title: "Орман за спална - Бел",
		description:
			"Се продава орман за спална, бел. Орманот е одлично одржан, со 3 врати. Перфектен за чување облека. Подигнување само.",
		price: 150,
		currency: "EUR",
		category: "Furniture",
		subcategory: "bedroom",
		condition: "Used",
		location: "Охрид",
		images: ["https://images.unsplash.com/photo-1631889993951-fc49afd7a8d7?w=800&h=600&fit=crop"],
		status: "active",
		isUrgent: false,
		tags: ["орман", "спална", "бел", "мебел"],
	},
	{
		title: "Кревет со матрац - 160x200",
		description:
			"Се продава кревет со матрац, димензии 160x200. Креветот е одлично одржан, удобен. Матрацот е одличен. Подигнување само.",
		price: 200,
		currency: "EUR",
		category: "Furniture",
		subcategory: "bedroom",
		condition: "Used",
		location: "Скопје",
		region: "Аеродром",
		images: ["https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&h=600&fit=crop"],
		status: "active",
		isUrgent: false,
		tags: ["кревет", "матрац", "160x200", "спална"],
	},
	{
		title: "ТВ шанка - Модерна",
		description:
			"Се продава ТВ шанка, модерна. Шанката е одлично одржана, со места за чување. Перфектна за гостинска. Подигнување само.",
		price: 120,
		currency: "EUR",
		category: "Furniture",
		subcategory: "livingRoom",
		condition: "Used",
		location: "Прилеп",
		images: ["https://images.unsplash.com/photo-1519643381401-22c77e60520e?w=800&h=600&fit=crop"],
		status: "active",
		isUrgent: false,
		tags: ["тв шанка", "гостинска", "мебел"],
	},

	// Fashion (4 ads)
	{
		title: "Nike Air Max 90 - Големина 42",
		description:
			"Се продаваат Nike Air Max 90, големина 42. Патиките се одлично одржани, носени неколку пати. Црно-бела боја. Цената е фиксна.",
		price: 80,
		currency: "EUR",
		category: "Fashion",
		subcategory: "shoes",
		condition: "Used",
		location: "Скопје",
		region: "Центар",
		brand: "Nike",
		model: "Air Max 90",
		images: ["https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&h=600&fit=crop"],
		status: "active",
		isUrgent: false,
		tags: ["nike", "air max", "патики", "42"],
	},
	{
		title: "Adidas Superstar - Големина 43",
		description:
			"Се продаваат Adidas Superstar, големина 43. Патиките се како нови, носени само неколку пати. Класична бела боја. Цената е фиксна.",
		price: 65,
		currency: "EUR",
		category: "Fashion",
		subcategory: "shoes",
		condition: "Used",
		location: "Битола",
		brand: "Adidas",
		model: "Superstar",
		images: ["https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=800&h=600&fit=crop"],
		status: "active",
		isUrgent: false,
		tags: ["adidas", "superstar", "патики", "43"],
	},
	{
		title: "Зимски јакна - North Face",
		description:
			"Се продава зимска јакна North Face, големина L. Јакната е одлично одржана, топла за зима. Црна боја. Цената е фиксна.",
		price: 120,
		currency: "EUR",
		category: "Fashion",
		subcategory: "mens",
		condition: "Used",
		location: "Охрид",
		brand: "North Face",
		images: ["https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&h=600&fit=crop"],
		status: "active",
		isUrgent: false,
		tags: ["јакна", "north face", "зимска", "L"],
	},
	{
		title: "Чанта - Michael Kors",
		description:
			"Се продава чанта Michael Kors, кафеава боја. Чантата е одлично одржана, оригинална. Перфектна за секојдневна употреба.",
		price: 95,
		currency: "EUR",
		category: "Fashion",
		subcategory: "accessories",
		condition: "Used",
		location: "Скопје",
		region: "Карпош",
		brand: "Michael Kors",
		images: ["https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800&h=600&fit=crop"],
		status: "active",
		isUrgent: false,
		tags: ["чанта", "michael kors", "кафеава"],
	},

	// Home & Garden (4 ads)
	{
		title: "Переална машина - Samsung 8kg",
		description:
			"Се продава переална машина Samsung 8kg. Машината е одлично одржана, со сите функции. Перфектна за семејство. Подигнување само.",
		price: 280,
		currency: "EUR",
		category: "Home & Garden",
		subcategory: "appliances",
		condition: "Used",
		location: "Скопје",
		region: "Аеродром",
		brand: "Samsung",
		model: "8kg",
		images: ["https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop"],
		status: "active",
		isUrgent: false,
		tags: ["переална", "samsung", "8kg", "машина"],
	},
	{
		title: "Фрижидер - Beko, 250L",
		description:
			"Се продава фрижидер Beko 250L. Фрижидерот е одлично одржан, со сите функции. Перфектен за семејство. Подигнување само.",
		price: 200,
		currency: "EUR",
		category: "Home & Garden",
		subcategory: "appliances",
		condition: "Used",
		location: "Битола",
		brand: "Beko",
		model: "250L",
		images: ["https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop"],
		status: "active",
		isUrgent: false,
		tags: ["фрижидер", "beko", "250l"],
	},
	{
		title: "Алатки за градина - Комплет",
		description:
			"Се продава комплет алатки за градина. Во комплетот се вклучени: косачка, грабли, лопата, вила. Сите алатки се одлично одржани.",
		price: 85,
		currency: "EUR",
		category: "Home & Garden",
		subcategory: "gardenTools",
		condition: "Used",
		location: "Охрид",
		images: ["https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&h=600&fit=crop"],
		status: "active",
		isUrgent: false,
		tags: ["алатки", "градина", "комплет"],
	},
	{
		title: "Микробранова печка - LG",
		description:
			"Се продава микробранова печка LG. Печката е одлично одржана, со сите функции. Перфектна за кујна. Подигнување само.",
		price: 60,
		currency: "EUR",
		category: "Home & Garden",
		subcategory: "kitchen",
		condition: "Used",
		location: "Прилеп",
		brand: "LG",
		images: ["https://images.unsplash.com/photo-1556910096-6f5e72db6803?w=800&h=600&fit=crop"],
		status: "active",
		isUrgent: false,
		tags: ["микробранова", "lg", "печка"],
	},
];

async function seedMacedonianAds() {
	try {
		await mongoose.connect(process.env.MONGODB_URI);
		console.log("✅ Connected to MongoDB");

		// Clear all existing products
		const deleteResult = await Product.deleteMany({});
		console.log(`🗑️  Removed ${deleteResult.deletedCount} existing products`);

		// Create or get users
		const createdUsers = [];
		for (const userData of macedonianUsers) {
			const existingUser = await User.findOne({ email: userData.email });
			if (existingUser) {
				createdUsers.push(existingUser);
			} else {
				const hashedPassword = await bcrypt.hash(userData.password, 10);
				const user = new User({
					...userData,
					password: hashedPassword,
				});
				await user.save();
				createdUsers.push(user);
				console.log(`👤 Created user: ${user.name}`);
			}
		}

		// Create products
		const createdProducts = [];
		for (let i = 0; i < macedonianProducts.length; i++) {
			const productData = macedonianProducts[i];
			// Assign seller randomly from created users
			const randomUser = createdUsers[Math.floor(Math.random() * createdUsers.length)];
			
			const product = new Product({
				...productData,
				seller: randomUser._id,
				contactInfo: {
					phone: randomUser.phone,
					email: randomUser.email,
					preferredContact: "phone",
				},
			});

			await product.save();
			createdProducts.push(product);
			console.log(`📦 Created: ${product.title}`);
		}

		console.log("\n✅ Database seeded successfully!");
		console.log(`📊 Users: ${createdUsers.length}`);
		console.log(`📦 Products: ${createdProducts.length}`);
		console.log("\n📋 Categories breakdown:");
		
		const categories = [...new Set(createdProducts.map((p) => p.category))];
		categories.forEach((cat) => {
			const count = createdProducts.filter((p) => p.category === cat).length;
			console.log(`   ${cat}: ${count} products`);
		});
	} catch (error) {
		console.error("❌ Error seeding database:", error);
	} finally {
		await mongoose.disconnect();
		console.log("\n🔌 Disconnected from MongoDB");
	}
}

// Run the seeding function
if (require.main === module) {
	seedMacedonianAds();
}

module.exports = { seedMacedonianAds };

