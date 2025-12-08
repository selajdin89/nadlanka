const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

// Import your models (adjust paths as needed)
const User = require("./models/User");
const Product = require("./models/Product");

// Sample users data - North Macedonia
const sampleUsers = [
	{
		name: "Ana Stojanovska",
		email: "ana.stojanovska@example.com",
		password: "password123",
		phone: "+389 70 234 567",
		location: "Skopje, North Macedonia",
	},
	{
		name: "Marija Petrovska",
		email: "marija.petrovska@example.com",
		password: "password123",
		phone: "+389 71 456 789",
		location: "Bitola, North Macedonia",
	},
	{
		name: "Stefan Dimitrievski",
		email: "stefan.dimitrievski@example.com",
		password: "password123",
		phone: "+389 72 123 456",
		location: "Ohrid, North Macedonia",
	},
	{
		name: "Elena Trajkovska",
		email: "elena.trajkovska@example.com",
		password: "password123",
		phone: "+389 73 234 567",
		location: "Prilep, North Macedonia",
	},
	{
		name: "Nikola Stojanov",
		email: "nikola.stojanov@example.com",
		password: "password123",
		phone: "+389 74 345 678",
		location: "Kumanovo, North Macedonia",
	},
];

// Sample products data
const sampleProducts = [
	// Electronics
	{
		title: "iPhone 14 Pro Max 256GB",
		description:
			"Brand new iPhone 14 Pro Max in Space Black. Still under warranty, comes with original box and charger. Perfect condition, no scratches.",
		price: 850,
		category: "Electronics",
		condition: "New",
		location: "Skopje, North Macedonia",
		images: [
			"https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500",
		],
		seller: null, // Will be set to user ID
		status: "active",
		isUrgent: true,
	},
	{
		title: "Samsung Galaxy S23 Ultra",
		description:
			"Excellent condition Samsung Galaxy S23 Ultra 512GB. Used for 3 months, comes with all accessories and original packaging.",
		price: 720,
		category: "Electronics",
		condition: "Like New",
		location: "Skopje, North Macedonia",
		images: [
			"https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500",
		],
		seller: null,
		status: "active",
		isUrgent: true,
	},
	{
		title: "MacBook Pro 13-inch M2",
		description:
			"2022 MacBook Pro with M2 chip, 16GB RAM, 512GB SSD. Perfect for students and professionals. Lightly used.",
		price: 1200,
		category: "Electronics",
		condition: "Like New",
		location: "Skopje, North Macedonia",
		images: [
			"https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500",
		],
		seller: null,
		status: "active",
		isUrgent: true,
	},
	{
		title: "Sony WH-1000XM4 Headphones",
		description:
			"Premium noise-canceling headphones. Excellent sound quality and comfort. Used for 6 months, still under warranty.",
		price: 180,
		category: "Electronics",
		condition: "Good",
		location: "Bitola, North Macedonia",
		images: [
			"https://images.unsplash.com/photo-1484704849700-f032a568e944?w=500",
		],
		seller: null,
		status: "active",
		isUrgent: true,
	},

	// Furniture
	{
		title: "Modern Wooden Dining Table",
		description:
			"Beautiful oak dining table for 6 people. Perfect for family gatherings. Some minor wear but excellent condition overall.",
		price: 280,
		category: "Furniture",
		condition: "Good",
		location: "Ohrid, North Macedonia",
		images: [
			"https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500",
		],
		seller: null,
		status: "active",
		isUrgent: true,
	},
	{
		title: "Leather Sofa Set (3+2+1)",
		description:
			"Comfortable brown leather sofa set. Great for living room. All pieces included. Pickup only due to size.",
		price: 450,
		category: "Furniture",
		condition: "Good",
		location: "Bitola, North Macedonia",
		images: [
			"https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500",
		],
		seller: null,
		status: "active",
		isUrgent: true,
	},
	{
		title: "IKEA Wardrobe - White",
		description:
			"Large white wardrobe from IKEA. Perfect condition, easy assembly. Great storage solution for bedroom.",
		price: 120,
		category: "Furniture",
		condition: "Like New",
		location: "Skopje, North Macedonia",
		images: [
			"https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500",
		],
		seller: null,
		status: "active",
		isUrgent: true,
	},

	// Cars
	{
		title: "Volkswagen Golf 2018",
		description:
			"Well-maintained VW Golf, 1.6 TDI engine, 85,000 km. Regular service history, new tires. Great fuel economy.",
		price: 8500,
		category: "Cars",
		condition: "Good",
		location: "Skopje, North Macedonia",
		images: ["https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=500"],
		seller: null,
	},
	{
		title: "BMW 320i 2016",
		description:
			"Luxury sedan in excellent condition. 2.0L turbo engine, automatic transmission, leather seats, navigation system.",
		price: 18500,
		category: "Cars",
		condition: "Very Good",
		location: "Skopje, North Macedonia",
		images: ["https://images.unsplash.com/photo-1555215695-3004980ad54e?w=500"],
		seller: null,
	},
	{
		title: "Toyota Corolla 2015",
		description:
			"Reliable and economical car. 1.4L engine, manual transmission, 95,000 km. Perfect for daily commuting.",
		price: 7200,
		category: "Cars",
		condition: "Good",
		location: "Bitola, North Macedonia",
		images: [
			"https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=500",
		],
		seller: null,
		status: "active",
	},

	// Real Estate
	{
		title: "2-Bedroom Apartment in Center",
		description:
			"Modern apartment in city center. 2 bedrooms, 1 bathroom, fully furnished. Close to shops and transport.",
		price: 85000,
		category: "Real Estate",
		condition: "New",
		location: "Skopje, North Macedonia",
		images: ["https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=500"],
		seller: null,
	},
	{
		title: "Family House with Garden",
		description:
			"3-bedroom house with large garden. Perfect for families. Quiet neighborhood, good schools nearby.",
		price: 125000,
		category: "Real Estate",
		condition: "Good",
		location: "Ohrid, North Macedonia",
		images: [
			"https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=500",
		],
		seller: null,
		status: "active",
		isUrgent: true,
	},

	// Services
	{
		title: "Professional Photography Services",
		description:
			"Wedding, portrait, and event photography. 5 years experience, professional equipment. Portfolio available.",
		price: 200,
		category: "Services",
		condition: "New",
		location: "Skopje, North Macedonia",
		images: [
			"https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=500",
		],
		seller: null,
		status: "active",
	},
	{
		title: "Tutoring - Math & Physics",
		description:
			"Experienced tutor offering math and physics lessons for high school students. Flexible schedule, online or in-person.",
		price: 15,
		category: "Services",
		condition: "New",
		location: "Skopje, North Macedonia",
		images: [
			"https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=500",
		],
		seller: null,
		status: "active",
	},

	// Clothing & Fashion
	{
		title: "Designer Leather Jacket",
		description:
			"Genuine leather jacket, size M. Worn only a few times, perfect condition. Italian design.",
		price: 120,
		category: "Fashion",
		condition: "Like New",
		location: "Bitola, North Macedonia",
		images: ["https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500"],
		seller: null,
	},
	{
		title: "Nike Air Max Sneakers",
		description:
			"Nike Air Max 90, size 42. White and black colorway. Worn for 2 months, good condition.",
		price: 80,
		category: "Fashion",
		condition: "Good",
		location: "Bitola, North Macedonia",
		images: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500"],
		seller: null,
	},

	// Books & Education
	{
		title: "University Textbooks - Computer Science",
		description:
			"Complete set of computer science textbooks from 2nd year. All in good condition, some highlighting.",
		price: 45,
		category: "Books",
		condition: "Good",
		location: "Skopje, North Macedonia",
		images: [
			"https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=500",
		],
		seller: null,
		status: "active",
		isUrgent: true,
	},
	{
		title: "English Learning Books",
		description:
			"Collection of English learning books for beginners. Perfect for self-study or teaching.",
		price: 25,
		category: "Books",
		condition: "Good",
		location: "Skopje, North Macedonia",
		images: [
			"https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=500",
		],
		seller: null,
		status: "active",
	},

	// Sports & Recreation
	{
		title: "Mountain Bike - Trek",
		description:
			"Trek mountain bike, 21-speed, aluminum frame. Great for trails and city riding. Well maintained.",
		price: 320,
		category: "Sports",
		condition: "Good",
		location: "Ohrid, North Macedonia",
		images: ["https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=500"],
		seller: null,
	},
	{
		title: "Golf Set Complete",
		description:
			"Complete golf set with bag, clubs, and accessories. Perfect for beginners. Used only a few times.",
		price: 180,
		category: "Sports",
		condition: "Like New",
		location: "Bitola, North Macedonia",
		images: [
			"https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=500",
		],
		seller: null,
		status: "active",
		isUrgent: true,
	},

	// Home & Garden
	{
		title: "Kitchen Appliances Set",
		description:
			"Complete kitchen set: blender, toaster, coffee maker. All in excellent working condition.",
		price: 85,
		category: "Home & Garden",
		condition: "Good",
		location: "Bitola, North Macedonia",
		images: ["https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500"],
		seller: null,
	},
	{
		title: "Garden Tools & Equipment",
		description:
			"Professional garden tools: lawn mower, hedge trimmer, gardening tools. All well maintained.",
		price: 150,
		category: "Home & Garden",
		condition: "Good",
		location: "Skopje, North Macedonia",
		images: [
			"https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=500",
		],
		seller: null,
		status: "active",
	},
];

async function seedDatabase() {
	try {
		// Connect to MongoDB
		await mongoose.connect(process.env.MONGODB_URI);
		console.log("Connected to MongoDB");

		// Clear existing data
		await User.deleteMany({});
		await Product.deleteMany({});
		console.log("Cleared existing data");

		// Create users
		const createdUsers = [];
		for (const userData of sampleUsers) {
			const hashedPassword = await bcrypt.hash(userData.password, 10);
			const user = new User({
				...userData,
				password: hashedPassword,
			});
			await user.save();
			createdUsers.push(user);
			console.log(`Created user: ${user.name}`);
		}

		// Create products and assign to random users
		const createdProducts = [];
		for (const productData of sampleProducts) {
			const randomUser =
				createdUsers[Math.floor(Math.random() * createdUsers.length)];
			const product = new Product({
				...productData,
				seller: randomUser._id,
			});
			await product.save();
			createdProducts.push(product);
			console.log(`Created product: ${product.title}`);
		}

		console.log("\n✅ Database seeded successfully!");
		console.log(`📊 Created ${createdUsers.length} users`);
		console.log(`📦 Created ${createdProducts.length} products`);
		console.log("\nCategories included:");

		const categories = [...new Set(createdProducts.map((p) => p.category))];
		categories.forEach((cat) => {
			const count = createdProducts.filter((p) => p.category === cat).length;
			console.log(`  - ${cat}: ${count} products`);
		});
	} catch (error) {
		console.error("Error seeding database:", error);
	} finally {
		await mongoose.disconnect();
		console.log("\n🔌 Disconnected from MongoDB");
	}
}

// Run the seeding function
if (require.main === module) {
	seedDatabase();
}

module.exports = { seedDatabase };
