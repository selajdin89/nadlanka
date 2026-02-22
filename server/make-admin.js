// Script to make a user an admin
// Usage: node make-admin.js <email>

const mongoose = require("mongoose");
require("dotenv").config();

const User = require("./models/User");

const makeAdmin = async () => {
	try {
		// Get email from command line arguments
		const email = process.argv[2];

		if (!email) {
			console.error("❌ Please provide an email address");
			console.log("Usage: node make-admin.js <email>");
			console.log("Example: node make-admin.js user@example.com");
			process.exit(1);
		}

		// Connect to MongoDB
		let mongoUri = process.env.MONGODB_URI || "";

		if (!mongoUri) {
			console.error("❌ MONGODB_URI not found in environment variables");
			console.log(
				"Make sure you have a .env file in the server directory with MONGODB_URI"
			);
			process.exit(1);
		}

		// Ensure connection string starts with mongodb:// or mongodb+srv://
		if (
			!mongoUri.startsWith("mongodb://") &&
			!mongoUri.startsWith("mongodb+srv://")
		) {
			console.error("❌ Invalid MongoDB connection string format");
			process.exit(1);
		}

		// Fix database name if missing
		if (
			mongoUri.match(/\.mongodb\.net\/\?/) ||
			mongoUri.match(/\.mongodb\.net\?/)
		) {
			mongoUri = mongoUri.replace(/\.mongodb\.net\/\?/, ".mongodb.net/test?");
			mongoUri = mongoUri.replace(/\.mongodb\.net\?/, ".mongodb.net/test?");
		}

		console.log("🔌 Connecting to MongoDB...");
		const conn = await mongoose.connect(mongoUri, {
			dbName: "test",
		});
		console.log(`✅ Connected to MongoDB: ${conn.connection.host}`);
		console.log(`📦 Database: ${conn.connection.db.databaseName}`);

		// Find user by email
		const user = await User.findOne({ email: email.toLowerCase().trim() });

		if (!user) {
			console.error(`\n❌ User with email "${email}" not found`);
			console.log("\n📋 Available users in database:");
			const allUsers = await User.find().select("name email role").limit(20);
			if (allUsers.length === 0) {
				console.log("   No users found in database.");
			} else {
				allUsers.forEach((u) => {
					console.log(
						`   - ${u.email} (${u.name}) - Role: ${u.role || "user"}`
					);
				});
			}
			await mongoose.connection.close();
			process.exit(1);
		}

		// Check current role
		if (user.role === "admin") {
			console.log(`\n✅ User is already an admin!`);
			console.log(`   Email: ${user.email}`);
			console.log(`   Name: ${user.name}`);
			console.log(`   Role: ${user.role}`);
			await mongoose.connection.close();
			process.exit(0);
		}

		// Update user role to admin
		user.role = "admin";
		await user.save();

		console.log(`\n✅ Successfully updated user to admin!`);
		console.log(`   Email: ${user.email}`);
		console.log(`   Name: ${user.name}`);
		console.log(
			`   Previous Role: ${user.role === "admin" ? "user" : user.role}`
		);
		console.log(`   New Role: ${user.role}`);
		console.log(
			`\n🎉 You can now access the admin dashboard at http://localhost:3000/admin`
		);

		// Close connection
		await mongoose.connection.close();
		console.log("\n✅ Database connection closed");
		process.exit(0);
	} catch (error) {
		console.error("\n❌ Error:", error.message);
		if (error.stack) {
			console.error("\nStack trace:", error.stack);
		}
		process.exit(1);
	}
};

makeAdmin();
