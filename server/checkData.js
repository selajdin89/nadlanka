const mongoose = require("mongoose");
require("dotenv").config();
const Product = require("./models/Product");
const User = require("./models/User");

async function checkData() {
	try {
		await mongoose.connect(process.env.MONGODB_URI);
		console.log("Connected to MongoDB");

		const users = await User.find();
		const products = await Product.find();

		// console.log("\n📊 Current Database Contents:");
		// console.log(`Users: ${users.length}`);
		users.forEach((user) => {
			// console.log(`  - ${user.name} (${user.email})`);
		});

		// console.log(`\nProducts: ${products.length}`);
		products.forEach((product) => {
			// console.log(
			// 	`  - ${product.title} (${product.category}) - €${product.price}`
			// );
		});

		await mongoose.disconnect();
	} catch (error) {
		console.error("Error:", error);
	}
}

checkData();
