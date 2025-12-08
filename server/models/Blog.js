const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema(
	{
		title: {
			type: String,
			required: true,
			trim: true,
			maxlength: 200,
		},
		slug: {
			type: String,
			required: false, // Will be generated automatically
			unique: true,
			lowercase: true,
			trim: true,
		},
		excerpt: {
			type: String,
			required: true,
			maxlength: 300,
		},
		content: {
			type: String,
			required: true,
		},
		featuredImage: {
			type: String,
			default: "",
		},
		author: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		category: {
			type: String,
			required: true,
			enum: [
				"Tips & Guides",
				"Market News",
				"Success Stories",
				"Safety & Security",
				"Local News",
				"How To",
				"Reviews",
				"General",
			],
		},
		tags: [
			{
				type: String,
				trim: true,
				maxlength: 50,
			},
		],
		status: {
			type: String,
			enum: ["draft", "published", "archived"],
			default: "draft",
		},
		publishedAt: {
			type: Date,
		},
		views: {
			type: Number,
			default: 0,
		},
		likes: {
			type: Number,
			default: 0,
		},
		shares: {
			type: Number,
			default: 0,
		},
		isFeatured: {
			type: Boolean,
			default: false,
		},
		isPinned: {
			type: Boolean,
			default: false,
		},
		seo: {
			metaTitle: String,
			metaDescription: String,
			keywords: [String],
		},
		readingTime: {
			type: Number, // in minutes
			default: 1,
		},
	},
	{
		timestamps: true,
	}
);

// Indexes (slug index already created by unique: true)
blogSchema.index({ title: "text", content: "text", tags: "text" });
blogSchema.index({ category: 1, status: 1 });
blogSchema.index({ publishedAt: -1 });
blogSchema.index({ isFeatured: -1, publishedAt: -1 });
blogSchema.index({ author: 1 });

// Generate slug from title
blogSchema.pre("save", function (next) {
	// Always generate slug if it doesn't exist or title changed
	if (!this.slug || this.isModified("title")) {
		if (this.title) {
			this.slug = this.title
				.toLowerCase()
				.replace(/[^a-z0-9 -]/g, "")
				.replace(/\s+/g, "-")
				.replace(/-+/g, "-")
				.trim("-");
		}

		// Ensure slug is not empty
		if (!this.slug) {
			this.slug = "blog-post-" + Date.now();
		}
	}

	// Set publishedAt when status changes to published
	if (
		this.isModified("status") &&
		this.status === "published" &&
		!this.publishedAt
	) {
		this.publishedAt = new Date();
	}

	// Calculate reading time (rough estimate: 200 words per minute)
	if (this.isModified("content")) {
		const wordCount = this.content.split(/\s+/).length;
		this.readingTime = Math.max(1, Math.ceil(wordCount / 200));
	}

	next();
});

// Virtual for formatted published date
blogSchema.virtual("formattedDate").get(function () {
	if (!this.publishedAt) return "";
	return this.publishedAt.toLocaleDateString("en-US", {
		year: "numeric",
		month: "long",
		day: "numeric",
	});
});

// Method to increment views
blogSchema.methods.incrementViews = function () {
	this.views += 1;
	return this.save();
};

// Method to toggle like
blogSchema.methods.toggleLike = function () {
	this.likes += 1;
	return this.save();
};

// Method to increment shares
blogSchema.methods.incrementShares = function () {
	this.shares += 1;
	return this.save();
};

// Static method to get published posts
blogSchema.statics.getPublished = function (limit = 10, skip = 0) {
	return this.find({
		status: "published",
	})
		.populate("author", "name avatar")
		.sort({ publishedAt: -1 })
		.skip(skip)
		.limit(limit);
};

// Static method to get featured posts
blogSchema.statics.getFeatured = function (limit = 5) {
	return this.find({
		status: "published",
		isFeatured: true,
	})
		.populate("author", "name avatar")
		.sort({ publishedAt: -1 })
		.limit(limit);
};

// Static method to get posts by category
blogSchema.statics.getByCategory = function (category, limit = 10) {
	return this.find({
		status: "published",
		category: category,
	})
		.populate("author", "name avatar")
		.sort({ publishedAt: -1 })
		.limit(limit);
};

// Static method to get related posts
blogSchema.statics.getRelated = function (
	currentPostId,
	category,
	tags,
	limit = 3
) {
	return this.find({
		_id: { $ne: currentPostId },
		status: "published",
		$or: [{ category: category }, { tags: { $in: tags } }],
	})
		.populate("author", "name avatar")
		.sort({ publishedAt: -1 })
		.limit(limit);
};

module.exports = mongoose.model("Blog", blogSchema);
