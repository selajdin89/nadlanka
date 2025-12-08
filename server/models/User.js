const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
			trim: true,
			maxlength: 100,
		},
		email: {
			type: String,
			required: true,
			unique: true,
			lowercase: true,
			trim: true,
			match: [
				/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
				"Please enter a valid email",
			],
		},
		password: {
			type: String,
			required: function () {
				return !this.googleId; // Password required only if not using Google OAuth
			},
			minlength: 6,
		},
		googleId: {
			type: String,
			unique: true,
			sparse: true, // Allows null values while maintaining uniqueness
		},
		phone: {
			type: String,
			trim: true,
			maxlength: 20,
		},
		location: {
			type: String,
			trim: true,
			maxlength: 100,
		},
		avatar: {
			type: String,
			default: "",
		},
		bio: {
			type: String,
			maxlength: 500,
			default: "",
		},
		isVerified: {
			type: Boolean,
			default: false,
		},
		isActive: {
			type: Boolean,
			default: true,
		},
		joinedDate: {
			type: Date,
			default: Date.now,
		},
		lastLogin: {
			type: Date,
		},
		preferences: {
			notifications: {
				email: {
					type: Boolean,
					default: true,
				},
				sms: {
					type: Boolean,
					default: false,
				},
				push: {
					type: Boolean,
					default: true,
				},
			},
			language: {
				type: String,
				default: "en",
				enum: ["en", "al", "mk"],
			},
		},
		stats: {
			totalListings: {
				type: Number,
				default: 0,
			},
			activeListings: {
				type: Number,
				default: 0,
			},
			totalViews: {
				type: Number,
				default: 0,
			},
			totalSales: {
				type: Number,
				default: 0,
			},
			rating: {
				average: {
					type: Number,
					default: 0,
					min: 0,
					max: 5,
				},
				count: {
					type: Number,
					default: 0,
				},
			},
		},
	},
	{
		timestamps: true,
	}
);

// Hash password before saving (only if password exists and is modified)
userSchema.pre("save", async function (next) {
	if (!this.isModified("password") || !this.password) return next();

	try {
		const salt = await bcrypt.genSalt(10);
		this.password = await bcrypt.hash(this.password, salt);
		next();
	} catch (error) {
		next(error);
	}
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
	if (!this.password) return false; // For Google OAuth users without password
	return bcrypt.compare(candidatePassword, this.password);
};

// Generate JWT token
userSchema.methods.generateAuthToken = function () {
	const jwt = require("jsonwebtoken");
	return jwt.sign(
		{
			userId: this._id,
			email: this.email,
		},
		process.env.JWT_SECRET || "nadlanka_secret_key",
		{ expiresIn: "7d" }
	);
};

// Update last login
userSchema.methods.updateLastLogin = function () {
	this.lastLogin = new Date();
	return this.save();
};

// Get public profile (without sensitive data)
userSchema.methods.getPublicProfile = function () {
	const userObject = this.toObject();
	delete userObject.password;
	delete userObject.__v;
	return userObject;
};

// Update user stats
userSchema.methods.updateStats = function (field, increment = 1) {
	if (this.stats[field] !== undefined) {
		this.stats[field] += increment;
	}
	return this.save();
};

// Index for better performance (email and googleId indexes already created by unique: true)
userSchema.index({ name: "text", bio: "text" });
userSchema.index({ location: 1 });
userSchema.index({ "stats.rating.average": -1 });
userSchema.index({ isActive: 1 });
userSchema.index({ joinDate: -1 });
userSchema.index({ lastLogin: -1 });

module.exports = mongoose.model("User", userSchema);
