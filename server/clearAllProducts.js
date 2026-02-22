const mongoose = require("mongoose");
require("dotenv").config();
const Product = require("./models/Product");

async function clearAllProducts() {
	try {
		await mongoose.connect(process.env.MONGODB_URI);
		console.log("Connected to MongoDB");

		// Delete ALL products
		const result = await Product.deleteMany({});
		console.log(`✅ Removed ${result.deletedCount} products`);

		console.log("\n✅ All products have been removed");
		console.log("💡 You can now seed new products");
	} catch (error) {
		console.error("Error clearing products:", error);
	} finally {
		await mongoose.disconnect();
		console.log("\n🔌 Disconnected from MongoDB");
	}
}

// Run the function
if (require.main === module) {
	clearAllProducts();
}

module.exports = { clearAllProducts };

