const mongoose = require("mongoose");
require("dotenv").config();
const Product = require("./models/Product");

async function clearDummyProducts() {
	try {
		await mongoose.connect(process.env.MONGODB_URI);
		// console.log("Connected to MongoDB");

		// List of dummy product titles to remove
		const dummyProductTitles = [
			"iPhone 14 Pro Max 256GB",
			"Samsung Galaxy S23 Ultra",
			"MacBook Pro 13-inch M2",
			"Sony WH-1000XM4 Headphones",
			"Modern Wooden Dining Table",
			"Leather Sofa Set (3+2+1)",
			"IKEA Wardrobe - White",
			"Volkswagen Golf 2018",
			"BMW 320i 2016",
			"Toyota Corolla 2015",
			"2-Bedroom Apartment in Center",
			"Family House with Garden",
			"Professional Photography Services",
			"Tutoring - Math & Physics",
			"Designer Leather Jacket",
			"Nike Air Max Sneakers",
			"University Textbooks - Computer Science",
			"English Learning Books",
			"Mountain Bike - Trek",
			"Golf Set Complete",
			"Kitchen Appliances Set",
			"Garden Tools & Equipment",
		];

		// Count existing dummy products
		const existingDummyProducts = await Product.find({
			title: { $in: dummyProductTitles },
		});

		// console.log(
		// 	`Found ${existingDummyProducts.length} dummy products to remove`
		// );

		if (existingDummyProducts.length > 0) {
			// Remove dummy products
			const result = await Product.deleteMany({
				title: { $in: dummyProductTitles },
			});

			console.log(`✅ Removed ${result.deletedCount} dummy products`);
		} else {
			console.log("ℹ️  No dummy products found to remove");
		}

		// Show remaining products
		const remainingProducts = await Product.find();
		// console.log(`\n📊 Remaining products: ${remainingProducts.length}`);

		if (remainingProducts.length > 0) {
			console.log("Remaining products:");
			remainingProducts.forEach((product) => {
				console.log(
					`  - ${product.title} (${product.category}) - €${product.price}`
				);
			});
		}

		console.log(
			"\n✅ You can now add your real products through the frontend or API"
		);
		console.log("💡 The dummy users are still available for testing");
	} catch (error) {
		console.error("Error clearing dummy products:", error);
	} finally {
		await mongoose.disconnect();
		console.log("\n🔌 Disconnected from MongoDB");
	}
}

// Run the function
if (require.main === module) {
	clearDummyProducts();
}

module.exports = { clearDummyProducts };
