const { seedDatabase } = require("./seedData");
const { seedBlogData } = require("./seedBlogData");

async function seedAll() {
	console.log("🌱 Starting comprehensive database seeding...\n");

	try {
		// First seed the main data (users and products)
		console.log("📊 Seeding users and products...");
		await seedDatabase();

		console.log("\n📝 Seeding blog posts...");
		await seedBlogData();

		console.log("\n🎉 All seeding completed successfully!");
		console.log("\nYour NaDlanka marketplace now has:");
		console.log("✅ Sample users with realistic profiles");
		console.log("✅ Diverse product listings across categories");
		console.log("✅ Educational blog content for SEO");
		console.log("✅ Content to attract and engage users");

		console.log("\nNext steps:");
		console.log("1. Start your server: npm run dev");
		console.log("2. Visit your marketplace to see the seeded data");
		console.log("3. Consider adding more content based on user feedback");
	} catch (error) {
		console.error("❌ Error during seeding:", error);
	}
}

// Run if called directly
if (require.main === module) {
	seedAll();
}

module.exports = { seedAll };
