const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
	{
		title: {
			type: String,
			required: true,
			trim: true,
			maxlength: 200,
		},
		description: {
			type: String,
			required: true,
			maxlength: 2000,
		},
		price: {
			type: Number,
			required: true,
			min: 0,
			max: 1000000,
		},
		currency: {
			type: String,
			default: "EUR",
			enum: ["EUR", "USD", "ALL", "MKD"],
		},
		category: {
			type: String,
			required: true,
			enum: [
				"Electronics",
				"Furniture",
				"Cars",
				"Real Estate",
				"Fashion",
				"Books",
				"Sports",
				"Home & Garden",
				"Services",
				"Other",
			],
		},
		subcategory: {
			type: String,
			trim: true,
			maxlength: 100,
		},
		condition: {
			type: String,
			required: true,
			enum: ["New", "Like New", "Very Good", "Good", "Fair", "Poor"],
		},
		brand: {
			type: String,
			trim: true,
			maxlength: 100,
		},
		model: {
			type: String,
			trim: true,
			maxlength: 100,
		},
		year: {
			type: Number,
			min: 1900,
			max: new Date().getFullYear() + 1,
		},
		location: {
			type: String,
			required: true,
			trim: true,
			maxlength: 200,
		},
		coordinates: {
			latitude: {
				type: Number,
				min: -90,
				max: 90,
			},
			longitude: {
				type: Number,
				min: -180,
				max: 180,
			},
		},
		images: [
			{
				type: String,
				required: true,
			},
		],
		seller: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		status: {
			type: String,
			enum: ["active", "sold", "reserved", "inactive"],
			default: "active",
		},
		isFeatured: {
			type: Boolean,
			default: false,
		},
		isUrgent: {
			type: Boolean,
			default: false,
		},
		views: {
			type: Number,
			default: 0,
		},
		likes: {
			type: Number,
			default: 0,
		},
		contactInfo: {
			phone: String,
			email: String,
			preferredContact: {
				type: String,
				enum: ["phone", "email", "both"],
				default: "phone",
			},
		},
		specifications: {
			type: Map,
			of: String,
		},
		// Category-specific fields
		categorySpecific: {
			// Real Estate fields
			propertyType: {
				type: String,
				enum: ["apartment", "house", "land", "commercial"],
			},
			area: {
				type: Number,
				min: 0,
			},
			address: {
				type: String,
				trim: true,
				maxlength: 300,
			},
			bedrooms: {
				type: String,
				enum: ["1", "2", "3", "4", "5+"],
			},
			bathrooms: {
				type: String,
				enum: ["1", "2", "3", "4+"],
			},
			// Car fields
			fuelType: {
				type: String,
				enum: ["petrol", "diesel", "electric", "hybrid"],
			},
			mileage: {
				type: Number,
				min: 0,
			},
			transmission: {
				type: String,
				enum: ["manual", "automatic"],
			},
			color: {
				type: String,
				trim: true,
				maxlength: 50,
			},
		},
		tags: [
			{
				type: String,
				trim: true,
				maxlength: 50,
			},
		],
		availability: {
			startDate: Date,
			endDate: Date,
			isAvailable: {
				type: Boolean,
				default: true,
			},
		},
		shipping: {
			available: {
				type: Boolean,
				default: false,
			},
			cost: {
				type: Number,
				min: 0,
			},
			methods: [
				{
					type: String,
					enum: ["pickup", "delivery", "shipping"],
				},
			],
			regions: [String],
		},
		negotiations: {
			allowed: {
				type: Boolean,
				default: true,
			},
			minPrice: {
				type: Number,
				min: 0,
			},
		},
	},
	{
		timestamps: true,
	}
);

// Indexes for better performance
productSchema.index({ title: "text", description: "text", tags: "text" });
productSchema.index({ category: 1, subcategory: 1 });
productSchema.index({ location: "text" });
productSchema.index({ price: 1 });
productSchema.index({ status: 1, isActive: 1 });
productSchema.index({ seller: 1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ views: -1 });
productSchema.index({ isFeatured: -1, createdAt: -1 });

// Virtual for formatted price
productSchema.virtual("formattedPrice").get(function () {
	return `${this.price.toLocaleString()} ${this.currency}`;
});

// Virtual for time since creation
productSchema.virtual("timeAgo").get(function () {
	const now = new Date();
	const diffInSeconds = Math.floor((now - this.createdAt) / 1000);

	if (diffInSeconds < 60) return "Just now";
	if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
	if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
	if (diffInSeconds < 2592000)
		return `${Math.floor(diffInSeconds / 86400)}d ago`;
	if (diffInSeconds < 31536000)
		return `${Math.floor(diffInSeconds / 2592000)}mo ago`;
	return `${Math.floor(diffInSeconds / 31536000)}y ago`;
});

// Method to increment views
productSchema.methods.incrementViews = function () {
	this.views += 1;
	return this.save();
};

// Method to toggle like
productSchema.methods.toggleLike = function () {
	this.likes += 1;
	return this.save();
};

// Method to mark as sold
productSchema.methods.markAsSold = function () {
	this.status = "sold";
	return this.save();
};

// Method to get public data (without sensitive seller info)
productSchema.methods.getPublicData = function () {
	const productObject = this.toObject();
	delete productObject.__v;
	return productObject;
};

// Static method to get featured products
productSchema.statics.getFeatured = function (limit = 10) {
	return this.find({
		status: "active",
		isFeatured: true,
	})
		.populate("seller", "name location stats.rating")
		.sort({ createdAt: -1 })
		.limit(limit);
};

// Static method to get popular products
productSchema.statics.getPopular = function (limit = 10) {
	return this.find({ status: "active" })
		.populate("seller", "name location stats.rating")
		.sort({ views: -1, likes: -1 })
		.limit(limit);
};

// Static method to get recent products
productSchema.statics.getRecent = function (limit = 20) {
	return this.find({ status: "active" })
		.populate("seller", "name location stats.rating")
		.sort({ createdAt: -1 })
		.limit(limit);
};

// Pre-save middleware to set coordinates if location is provided
productSchema.pre("save", function (next) {
	if (this.isModified("location") && this.location) {
		// This is a simplified version - in production you'd use a geocoding service
		// For now, we'll just store the location text
		next();
	} else {
		next();
	}
});

module.exports = mongoose.model("Product", productSchema);
