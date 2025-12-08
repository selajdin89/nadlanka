const mongoose = require("mongoose");

const favoriteSchema = new mongoose.Schema(
	{
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		product: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Product",
			required: true,
		},
	},
	{
		timestamps: true,
	}
);

// Compound index to ensure a user can only favorite a product once
favoriteSchema.index({ user: 1, product: 1 }, { unique: true });

// Index for querying user's favorites
favoriteSchema.index({ user: 1, createdAt: -1 });

// Index for counting product favorites
favoriteSchema.index({ product: 1 });

module.exports = mongoose.model("Favorite", favoriteSchema);
