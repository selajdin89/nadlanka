const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require("path");
const mongoose = require("mongoose");
const multer = require("multer");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();
const passport = require("./config/googleAuth");

// Environment variables loaded successfully

// Import models
const User = require("./models/User");
const Message = require("./models/Message");
const Chat = require("./models/Chat");
const ChatMessage = require("./models/ChatMessage");
const Favorite = require("./models/Favorite");

// Import services
const {
	sendMessageNotificationEmail,
	sendMessageConfirmationEmail,
} = require("./services/emailService");

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

// Socket.IO setup
const io = new Server(server, {
	cors: {
		origin: process.env.CLIENT_URL || "http://localhost:3000",
		methods: ["GET", "POST"],
		credentials: true,
	},
});

// MongoDB Connection
const connectDB = async () => {
	try {
		const conn = await mongoose.connect(process.env.MONGODB_URI);
		console.log(`🍃 MongoDB Connected: ${conn.connection.host}`);
	} catch (error) {
		console.error("❌ MongoDB connection error:", error.message);
		process.exit(1);
	}
};

// Connect to MongoDB
connectDB();

// Multer configuration for file uploads
const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, "uploads/");
	},
	filename: (req, file, cb) => {
		const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
		cb(
			null,
			file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
		);
	},
});

const upload = multer({
	storage: storage,
	limits: {
		fileSize: 5 * 1024 * 1024, // 5MB limit
	},
	fileFilter: (req, file, cb) => {
		if (file.mimetype.startsWith("image/")) {
			cb(null, true);
		} else {
			cb(new Error("Only image files are allowed"), false);
		}
	},
});

// User Schema (removed - using import from models/User.js)
/*
const userSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
			trim: true,
		},
		email: {
			type: String,
			required: true,
			unique: true,
			lowercase: true,
			trim: true,
		},
		password: {
			type: String,
			required: true,
			minlength: 6,
		},
		role: {
			type: String,
			enum: ["user", "admin", "moderator"],
			default: "user",
		},
		phone: {
			type: String,
			trim: true,
		},
		location: {
			type: String,
			trim: true,
		},
		avatar: {
			type: String,
		},
	},
	{
		timestamps: true,
	}
);
*/

// User schema methods (moved to models/User.js)
/*
userSchema.pre("save", async function (next) {
	if (!this.isModified("password")) return next();

	try {
		const salt = await bcrypt.genSalt(10);
		this.password = await bcrypt.hash(this.password, salt);
		next();
	} catch (error) {
		next(error);
	}
});

userSchema.methods.comparePassword = async function (candidatePassword) {
	return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.generateAuthToken = function () {
	return jwt.sign(
		{
			userId: this._id,
			email: this.email,
			role: this.role,
		},
		process.env.JWT_SECRET || "nadlanka_secret_key",
		{ expiresIn: "7d" }
	);
};
*/

// Product Schema - Using imported Product model from ./models/Product.js

// Models imported from ./models/
const Product = require("./models/Product");

// Authentication Middleware
const authenticateToken = (req, res, next) => {
	const authHeader = req.headers["authorization"];
	const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

	if (!token) {
		return res.status(401).json({ error: "Access token required" });
	}

	jwt.verify(
		token,
		process.env.JWT_SECRET || "nadlanka_secret_key",
		(err, user) => {
			if (err) {
				return res.status(403).json({ error: "Invalid or expired token" });
			}
			req.user = user;
			next();
		}
	);
};

// Optional authentication middleware (doesn't fail if no token)
const optionalAuth = (req, res, next) => {
	const authHeader = req.headers["authorization"];
	const token = authHeader && authHeader.split(" ")[1];

	if (!token) {
		req.user = null;
		return next();
	}

	jwt.verify(
		token,
		process.env.JWT_SECRET || "nadlanka_secret_key",
		(err, user) => {
			req.user = err ? null : user;
			next();
		}
	);
};

// Middleware
app.use(
	helmet({
		contentSecurityPolicy: false, // Disable CSP for image serving
		crossOriginEmbedderPolicy: false,
		crossOriginResourcePolicy: { policy: "cross-origin" },
	})
);
app.use(
	cors({
		origin: true, // Allow all origins for development
		credentials: true,
		methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
		allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
	})
);
app.use(morgan("combined"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration for Google OAuth
// Extract database name from MONGODB_URI for MongoStore
const mongoUri = process.env.MONGODB_URI || "";
let sessionStore;

if (mongoUri) {
	try {
		// Parse MongoDB URI to get connection options
		const uriParts = new URL(mongoUri);
		// Get database name from path, remove leading slash and ensure it's not empty
		let dbName = uriParts.pathname?.replace(/^\//, "").replace(/\/.*$/, "") || "test";
		// Remove any query parameters from dbName if accidentally included
		dbName = dbName.split("?")[0];
		
		// Remove database name from URI to avoid conflicts, MongoStore will use dbName option
		const baseUri = mongoUri.split("/").slice(0, 3).join("/");
		const queryString = uriParts.search || "?retryWrites=true&w=majority";
		
		sessionStore = MongoStore.create({
			mongoUrl: `${baseUri}/${dbName}${queryString}`,
			dbName: dbName, // Explicitly set database name
			collectionName: "sessions",
			ttl: 24 * 60 * 60, // 24 hours in seconds
		});
		console.log(`Session store configured for database: ${dbName}`);
	} catch (error) {
		console.error("Error setting up session store:", error);
		console.log("Falling back to MemoryStore (not recommended for production)");
		sessionStore = undefined; // Fallback to MemoryStore if error
	}
}

app.use(
	session({
		secret: process.env.SESSION_SECRET || "your-secret-key",
		resave: false,
		saveUninitialized: false,
		store: sessionStore, // Will be undefined if setup failed, falls back to MemoryStore
		cookie: {
			secure: process.env.NODE_ENV === "production", // Use secure cookies in production (HTTPS)
			maxAge: 24 * 60 * 60 * 1000, // 24 hours
		},
	})
);

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Serve static files from uploads directory with CORS headers
app.use(
	"/uploads",
	(req, res, next) => {
		res.header("Access-Control-Allow-Origin", "*");
		res.header("Access-Control-Allow-Methods", "GET, OPTIONS");
		res.header(
			"Access-Control-Allow-Headers",
			"Origin, X-Requested-With, Content-Type, Accept, Authorization"
		);
		res.header("Access-Control-Allow-Credentials", "true");
		res.header("Cross-Origin-Resource-Policy", "cross-origin");

		if (req.method === "OPTIONS") {
			res.sendStatus(200);
			return;
		}
		next();
	},
	express.static(path.join(__dirname, "uploads"))
);

// API Routes
app.get("/api/health", (req, res) => {
	res.json({
		message: "Server is running!",
		timestamp: new Date().toISOString(),
		status: "healthy",
	});
});

// Test database connection
app.get("/api/test-db", async (req, res) => {
	try {
		const productCount = await Product.countDocuments();
		const userCount = await User.countDocuments();
		res.json({
			message: "Database connection successful",
			productCount,
			userCount,
			database: mongoose.connection.db.databaseName,
		});
	} catch (error) {
		console.error("Database test error:", error);
		res.status(500).json({
			error: "Database test failed",
			message: error.message,
		});
	}
});

// ===== AUTHENTICATION ROUTES =====

// Google OAuth Routes (only if credentials are available)
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
	app.get(
		"/api/auth/google",
		passport.authenticate("google", { scope: ["profile", "email"] })
	);

	app.get(
		"/api/auth/google/callback",
		passport.authenticate("google", { failureRedirect: "/login" }),
		(req, res) => {
			// Generate JWT token for the authenticated user
			const token = jwt.sign(
				{ userId: req.user._id, email: req.user.email },
				process.env.JWT_SECRET || "your-jwt-secret",
				{ expiresIn: "7d" }
			);

			// Redirect to frontend with token
			res.redirect(
				`${process.env.CLIENT_URL || "http://localhost:3000"}?token=${token}`
			);
		}
	);
} else {
	// Fallback routes when Google OAuth is not configured
	app.get("/api/auth/google", (req, res) => {
		res.status(501).json({
			error: "Google OAuth not configured",
			message:
				"Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables",
		});
	});

	app.get("/api/auth/google/callback", (req, res) => {
		res.status(501).json({
			error: "Google OAuth not configured",
			message:
				"Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables",
		});
	});
}

// User Registration
app.post("/api/auth/register", async (req, res) => {
	try {
		const { name, email, password, phone, location } = req.body;

		// Validation
		if (!name || !email || !password) {
			return res.status(400).json({
				error: "Name, email, and password are required",
			});
		}

		if (password.length < 6) {
			return res.status(400).json({
				error: "Password must be at least 6 characters long",
			});
		}

		// Check if user already exists
		const existingUser = await User.findOne({ email });
		if (existingUser) {
			return res.status(400).json({
				error: "User with this email already exists",
			});
		}

		// Create new user
		const user = new User({
			name,
			email,
			password,
			phone,
			location,
		});

		await user.save();

		// Generate token
		const token = user.generateAuthToken();

		// Return user data (without password) and token
		res.status(201).json({
			message: "User registered successfully",
			user: {
				_id: user._id,
				name: user.name,
				email: user.email,
				role: user.role,
				phone: user.phone,
				location: user.location,
				avatar: user.avatar,
			},
			token,
		});
	} catch (error) {
		console.error("Registration error:", error);
		res.status(500).json({ error: "Failed to register user" });
	}
});

// User Login
app.post("/api/auth/login", async (req, res) => {
	try {
		const { email, password } = req.body;

		// Validation
		if (!email || !password) {
			return res.status(400).json({
				error: "Email and password are required",
			});
		}

		// Find user
		const user = await User.findOne({ email });
		if (!user) {
			return res.status(401).json({
				error: "Invalid email or password",
			});
		}

		// Check password
		const isPasswordValid = await user.comparePassword(password);
		if (!isPasswordValid) {
			return res.status(401).json({
				error: "Invalid email or password",
			});
		}

		// Generate token
		const token = user.generateAuthToken();

		// Return user data (without password) and token
		res.json({
			message: "Login successful",
			user: {
				_id: user._id,
				name: user.name,
				email: user.email,
				role: user.role,
				phone: user.phone,
				location: user.location,
				avatar: user.avatar,
			},
			token,
		});
	} catch (error) {
		console.error("Login error:", error);
		res.status(500).json({ error: "Failed to login" });
	}
});

// Get current user profile
app.get("/api/auth/me", authenticateToken, async (req, res) => {
	try {
		const user = await User.findById(req.user.userId).select("-password");
		if (!user) {
			return res.status(404).json({ error: "User not found" });
		}
		res.json(user);
	} catch (error) {
		console.error("Get profile error:", error);
		res.status(500).json({ error: "Failed to get user profile" });
	}
});

// Update user profile
app.put("/api/auth/profile", authenticateToken, async (req, res) => {
	try {
		const { name, phone, location, avatar } = req.body;
		const userId = req.user.userId;

		const updatedUser = await User.findByIdAndUpdate(
			userId,
			{ name, phone, location, avatar },
			{ new: true, select: "-password" }
		);

		if (!updatedUser) {
			return res.status(404).json({ error: "User not found" });
		}

		res.json({
			message: "Profile updated successfully",
			user: updatedUser,
		});
	} catch (error) {
		console.error("Update profile error:", error);
		res.status(500).json({ error: "Failed to update profile" });
	}
});

// Change password
app.put("/api/auth/change-password", authenticateToken, async (req, res) => {
	try {
		const { currentPassword, newPassword } = req.body;
		const userId = req.user.userId;

		if (!currentPassword || !newPassword) {
			return res.status(400).json({
				error: "Current password and new password are required",
			});
		}

		if (newPassword.length < 6) {
			return res.status(400).json({
				error: "New password must be at least 6 characters long",
			});
		}

		const user = await User.findById(userId);
		if (!user) {
			return res.status(404).json({ error: "User not found" });
		}

		// Verify current password
		const isCurrentPasswordValid = await user.comparePassword(currentPassword);
		if (!isCurrentPasswordValid) {
			return res.status(401).json({
				error: "Current password is incorrect",
			});
		}

		// Update password
		user.password = newPassword;
		await user.save();

		res.json({ message: "Password changed successfully" });
	} catch (error) {
		console.error("Change password error:", error);
		res.status(500).json({ error: "Failed to change password" });
	}
});

// Image upload endpoint
app.post("/api/upload", upload.array("images", 10), (req, res) => {
	try {
		if (!req.files || req.files.length === 0) {
			return res.status(400).json({ error: "No images uploaded" });
		}

		const imageUrls = req.files.map(
			(file) => `${req.protocol}://${req.get("host")}/uploads/${file.filename}`
		);

		res.json({
			message: "Images uploaded successfully",
			imageUrls: imageUrls,
		});
	} catch (error) {
		console.error("Image upload error:", error);
		res.status(500).json({ error: "Failed to upload images" });
	}
});

// ===== PRODUCT ROUTES =====

// Get all products with search and filter
app.get("/api/products", async (req, res) => {
	try {
		const {
			search,
			category,
			condition,
			minPrice,
			maxPrice,
			location,
			seller,
			isUrgent,
			isFeatured,
			sortBy = "createdAt",
			sortOrder = "desc",
			page = 1,
			limit = 12,
		} = req.query;

		// Include products that are active OR have no status (for backward compatibility)
		let query = {
			$or: [{ status: "active" }, { status: { $exists: false } }],
		};

		// Build additional filters
		const additionalFilters = {};

		// Search functionality
		if (search) {
			additionalFilters.$or = [
				{ title: { $regex: search, $options: "i" } },
				{ description: { $regex: search, $options: "i" } },
				{ tags: { $in: [new RegExp(search, "i")] } },
			];
		}

		// Filter by category (case-insensitive)
		if (category) {
			additionalFilters.category = { $regex: new RegExp(`^${category}$`, "i") };
		}

		// Filter by condition
		if (condition) {
			additionalFilters.condition = condition;
		}

		// Filter by price range
		if (minPrice || maxPrice) {
			additionalFilters.price = {};
			if (minPrice) additionalFilters.price.$gte = Number(minPrice);
			if (maxPrice) additionalFilters.price.$lte = Number(maxPrice);
		}

		// Filter by location
		if (location) {
			additionalFilters.location = { $regex: location, $options: "i" };
		}

		// Filter by seller
		if (seller) {
			additionalFilters.seller = seller;
		}

		// Filter by isUrgent
		if (isUrgent !== undefined) {
			additionalFilters.isUrgent = isUrgent === "true";
		}

		// Filter by isFeatured
		if (isFeatured !== undefined) {
			additionalFilters.isFeatured = isFeatured === "true";
		}

		// Combine all filters
		query = { ...query, ...additionalFilters };

		// Sorting
		const sortOptions = {};
		sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;

		// Pagination
		const skip = (Number(page) - 1) * Number(limit);

		const products = await Product.find(query)
			.populate("seller", "name email phone location")
			.sort(sortOptions)
			.skip(skip)
			.limit(Number(limit));

		const total = await Product.countDocuments(query);

		res.json({
			products,
			pagination: {
				currentPage: Number(page),
				totalPages: Math.ceil(total / Number(limit)),
				totalProducts: total,
				hasNext: skip + products.length < total,
				hasPrev: Number(page) > 1,
			},
		});
	} catch (error) {
		console.error("Error fetching products:", error);
		console.error("Error stack:", error.stack);
		res.status(500).json({ 
			error: "Failed to fetch products",
			message: process.env.NODE_ENV === "development" ? error.message : undefined
		});
	}
});

// Get a single product by ID
app.get("/api/products/:id", async (req, res) => {
	try {
		const product = await Product.findById(req.params.id).populate(
			"seller",
			"name email phone location"
		);
		if (!product) {
			return res.status(404).json({ error: "Product not found" });
		}

		// Increment view count
		await Product.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });

		res.json(product);
	} catch (error) {
		console.error("Error fetching product:", error);
		res.status(500).json({ error: "Failed to fetch product" });
	}
});

// Create a new product
app.post("/api/products", authenticateToken, async (req, res) => {
	try {
		const {
			title,
			description,
			price,
			currency,
			category,
			condition,
			images,
			location,
			contactInfo,
			seller,
			tags,
		} = req.body;

		if (
			!title ||
			!description ||
			!price ||
			!category ||
			!condition ||
			!location
		) {
			return res.status(400).json({
				error:
					"Title, description, price, category, condition, and location are required",
			});
		}

		const newProduct = new Product({
			title,
			description,
			price,
			currency: currency || "MKD",
			category,
			condition,
			images: images || [],
			location,
			contactInfo: contactInfo || {},
			seller: req.user.userId, // Use authenticated user as seller
			tags: tags || [],
		});

		const savedProduct = await newProduct.save();
		const populatedProduct = await Product.findById(savedProduct._id).populate(
			"seller",
			"name email phone location"
		);

		res.status(201).json(populatedProduct);
	} catch (error) {
		console.error("Error creating product:", error);
		res.status(500).json({ error: "Failed to create product" });
	}
});

// Update a product
app.put("/api/products/:id", authenticateToken, async (req, res) => {
	try {
		const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
			new: true,
			runValidators: true,
		}).populate("seller", "name email phone location");

		if (!product) {
			return res.status(404).json({ error: "Product not found" });
		}

		res.json(product);
	} catch (error) {
		console.error("Error updating product:", error);
		res.status(500).json({ error: "Failed to update product" });
	}
});

// Delete a product
app.delete("/api/products/:id", authenticateToken, async (req, res) => {
	try {
		const product = await Product.findByIdAndDelete(req.params.id);
		if (!product) {
			return res.status(404).json({ error: "Product not found" });
		}
		res.json({ message: "Product deleted successfully" });
	} catch (error) {
		console.error("Error deleting product:", error);
		res.status(500).json({ error: "Failed to delete product" });
	}
});

// Get products by seller
app.get("/api/products/seller/:sellerId", async (req, res) => {
	try {
		const products = await Product.find({ seller: req.params.sellerId })
			.populate("seller", "name email phone location")
			.sort({ createdAt: -1 });
		res.json(products);
	} catch (error) {
		console.error("Error fetching seller products:", error);
		res.status(500).json({ error: "Failed to fetch seller products" });
	}
});

// Get categories
app.get("/api/categories", (req, res) => {
	const categories = [
		{ value: "Electronics", label: "Electronics" },
		{ value: "Furniture", label: "Furniture" },
		{ value: "Cars", label: "Cars" },
		{ value: "Real Estate", label: "Real Estate" },
		{ value: "Fashion", label: "Fashion" },
		{ value: "Books", label: "Books" },
		{ value: "Sports", label: "Sports" },
		{ value: "Home & Garden", label: "Home & Garden" },
		{ value: "Services", label: "Services" },
		{ value: "Other", label: "Other" },
	];
	res.json(categories);
});

// ===== FAVORITES ROUTES =====
// NOTE: Specific routes (with literal path segments) must come BEFORE parameterized routes

// Check if a product is favorited by user (requires authentication)
app.get(
	"/api/favorites/check/:productId",
	authenticateToken,
	async (req, res) => {
		try {
			const { productId } = req.params;
			const userId = req.user.userId;

			const favorite = await Favorite.findOne({
				user: userId,
				product: productId,
			});

			res.json({ isFavorite: !!favorite });
		} catch (error) {
			console.error("Error checking favorite status:", error);
			res.status(500).json({ error: "Failed to check favorite status" });
		}
	}
);

// Get favorite count for a product (public)
app.get("/api/favorites/count/:productId", async (req, res) => {
	try {
		const { productId } = req.params;

		const count = await Favorite.countDocuments({ product: productId });

		res.json({ count });
	} catch (error) {
		console.error("Error counting favorites:", error);
		res.status(500).json({ error: "Failed to count favorites" });
	}
});

// Get user's favorites (requires authentication)
app.get("/api/favorites", authenticateToken, async (req, res) => {
	try {
		const userId = req.user.userId;
		const { page = 1, limit = 12 } = req.query;

		const skip = (Number(page) - 1) * Number(limit);

		const favorites = await Favorite.find({ user: userId })
			.populate({
				path: "product",
				populate: {
					path: "seller",
					select: "name email phone location",
				},
			})
			.sort({ createdAt: -1 })
			.skip(skip)
			.limit(Number(limit));

		// Filter out favorites where product no longer exists
		const validFavorites = favorites.filter((fav) => fav.product !== null);

		const totalFavorites = await Favorite.countDocuments({ user: userId });

		res.json({
			favorites: validFavorites,
			pagination: {
				currentPage: Number(page),
				totalPages: Math.ceil(totalFavorites / Number(limit)),
				totalFavorites,
				hasNext: skip + validFavorites.length < totalFavorites,
				hasPrev: Number(page) > 1,
			},
		});
	} catch (error) {
		console.error("Error fetching favorites:", error);
		res.status(500).json({ error: "Failed to fetch favorites" });
	}
});

// Add product to favorites (requires authentication)
app.post("/api/favorites", authenticateToken, async (req, res) => {
	try {
		const { productId } = req.body;
		const userId = req.user.userId;

		if (!productId) {
			return res.status(400).json({ error: "Product ID is required" });
		}

		// Check if product exists
		const Product = require("./models/Product");
		const product = await Product.findById(productId);
		if (!product) {
			return res.status(404).json({ error: "Product not found" });
		}

		// Check if already favorited
		const existingFavorite = await Favorite.findOne({
			user: userId,
			product: productId,
		});

		if (existingFavorite) {
			return res.status(400).json({ error: "Product already in favorites" });
		}

		// Create favorite
		const favorite = new Favorite({
			user: userId,
			product: productId,
		});

		await favorite.save();

		res.status(201).json({
			message: "Product added to favorites",
			favorite,
		});
	} catch (error) {
		console.error("Error adding to favorites:", error);
		res.status(500).json({ error: "Failed to add to favorites" });
	}
});

// Remove product from favorites (requires authentication)
app.delete("/api/favorites/:productId", authenticateToken, async (req, res) => {
	try {
		const { productId } = req.params;
		const userId = req.user.userId;

		const result = await Favorite.findOneAndDelete({
			user: userId,
			product: productId,
		});

		if (!result) {
			return res.status(404).json({ error: "Favorite not found" });
		}

		res.json({ message: "Product removed from favorites" });
	} catch (error) {
		console.error("Error removing from favorites:", error);
		res.status(500).json({ error: "Failed to remove from favorites" });
	}
});

// ===== USER ROUTES =====

// Get all users
app.get("/api/users", async (req, res) => {
	try {
		const users = await User.find().sort({ createdAt: -1 });
		res.json(users);
	} catch (error) {
		console.error("Error fetching users:", error);
		res.status(500).json({ error: "Failed to fetch users" });
	}
});

// ===== BLOG ROUTES =====

// Import Blog model
const Blog = require("./models/Blog");

// Get all published blog posts
app.get("/api/blog", async (req, res) => {
	try {
		const { category, limit = 20, skip = 0 } = req.query;

		let query = { status: "published" };

		// Filter by category if provided
		if (category && category !== "all") {
			query.category = category;
		}

		const posts = await Blog.find(query)
			.populate("author", "name avatar")
			.sort({ publishedAt: -1 })
			.skip(Number(skip))
			.limit(Number(limit));

		res.json(posts);
	} catch (error) {
		console.error("Error fetching blog posts:", error);
		res.status(500).json({ error: "Failed to fetch blog posts" });
	}
});

// Get featured blog posts
app.get("/api/blog/featured", async (req, res) => {
	try {
		const posts = await Blog.find({
			status: "published",
			isFeatured: true,
		})
			.populate("author", "name avatar")
			.sort({ publishedAt: -1 })
			.limit(5);

		res.json(posts);
	} catch (error) {
		console.error("Error fetching featured posts:", error);
		res.status(500).json({ error: "Failed to fetch featured posts" });
	}
});

// Get a single blog post by slug
app.get("/api/blog/:slug", async (req, res) => {
	try {
		const post = await Blog.findOne({
			slug: req.params.slug,
			status: "published",
		}).populate("author", "name avatar");

		if (!post) {
			return res.status(404).json({ error: "Blog post not found" });
		}

		// Increment view count
		await Blog.findByIdAndUpdate(post._id, { $inc: { views: 1 } });

		res.json(post);
	} catch (error) {
		console.error("Error fetching blog post:", error);
		res.status(500).json({ error: "Failed to fetch blog post" });
	}
});

// Get blog posts by category
app.get("/api/blog/category/:category", async (req, res) => {
	try {
		const { limit = 10, skip = 0 } = req.query;

		const posts = await Blog.find({
			status: "published",
			category: req.params.category,
		})
			.populate("author", "name avatar")
			.sort({ publishedAt: -1 })
			.skip(Number(skip))
			.limit(Number(limit));

		res.json(posts);
	} catch (error) {
		console.error("Error fetching posts by category:", error);
		res.status(500).json({ error: "Failed to fetch posts by category" });
	}
});

// Get recent blog posts
app.get("/api/blog/recent", async (req, res) => {
	try {
		const { limit = 5 } = req.query;

		const posts = await Blog.find({ status: "published" })
			.populate("author", "name avatar")
			.sort({ publishedAt: -1 })
			.limit(Number(limit));

		res.json(posts);
	} catch (error) {
		console.error("Error fetching recent posts:", error);
		res.status(500).json({ error: "Failed to fetch recent posts" });
	}
});

// Get blog categories
app.get("/api/blog/categories", (req, res) => {
	const categories = [
		{ value: "Tips & Guides", label: "Tips & Guides" },
		{ value: "Market News", label: "Market News" },
		{ value: "Success Stories", label: "Success Stories" },
		{ value: "Safety & Security", label: "Safety & Security" },
		{ value: "Local News", label: "Local News" },
		{ value: "How To", label: "How To" },
		{ value: "Reviews", label: "Reviews" },
		{ value: "General", label: "General" },
	];
	res.json(categories);
});

// Create a new user
app.post("/api/users", async (req, res) => {
	try {
		const { name, email, phone, location, role } = req.body;

		if (!name || !email) {
			return res.status(400).json({ error: "Name and email are required" });
		}

		// Check if user already exists
		const existingUser = await User.findOne({ email });
		if (existingUser) {
			return res
				.status(400)
				.json({ error: "User with this email already exists" });
		}

		const newUser = new User({
			name,
			email,
			phone,
			location,
			role: role || "user",
		});

		const savedUser = await newUser.save();
		res.status(201).json(savedUser);
	} catch (error) {
		console.error("Error creating user:", error);
		if (error.code === 11000) {
			res.status(400).json({ error: "User with this email already exists" });
		} else {
			res.status(500).json({ error: "Failed to create user" });
		}
	}
});

// Serve static files from the React app build directory
// NOTE: This is disabled because frontend is deployed separately to Netlify
// Uncomment this only if you want to serve frontend and backend together
/*
if (process.env.NODE_ENV === "production") {
	const clientBuildPath = path.join(__dirname, "../client/build");
	const fs = require("fs");
	
	// Only serve frontend if build directory exists
	if (fs.existsSync(clientBuildPath)) {
		app.use(express.static(clientBuildPath));
		
		app.get("*", (req, res) => {
			res.sendFile(path.join(clientBuildPath, "index.html"));
		});
	}
}
*/

// Error handling middleware
app.use((err, req, res, next) => {
	console.error(err.stack);
	res.status(500).json({ error: "Something went wrong!" });
});

// ==================== SOCKET.IO CHAT FUNCTIONALITY ====================

// Store connected users
const connectedUsers = new Map();

// Socket.IO authentication middleware
io.use(async (socket, next) => {
	try {
		const token = socket.handshake.auth.token;
		if (!token) {
			return next(new Error("Authentication error"));
		}

		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		const user = await User.findById(decoded.userId).select("-password");

		if (!user) {
			return next(new Error("User not found"));
		}

		socket.userId = user._id.toString();
		socket.user = user;
		next();
	} catch (error) {
		next(new Error("Authentication error"));
	}
});

// Socket.IO connection handling
io.on("connection", (socket) => {
	console.log(`✅ User ${socket.user.name} connected to chat`);

	// Store user connection
	connectedUsers.set(socket.userId, {
		socketId: socket.id,
		user: socket.user,
		lastSeen: new Date(),
	});

	// Join user to their personal room for notifications
	socket.join(`user_${socket.userId}`);

	// Handle joining a chat room
	socket.on("join_chat", async (chatId) => {
		try {
			const chat = await Chat.findById(chatId).populate("participants.user");

			if (!chat) {
				socket.emit("error", { message: "Chat not found" });
				return;
			}

			// Check if user is a participant
			const isParticipant = chat.participants.some(
				(p) => p.user && p.user._id.toString() === socket.userId
			);

			if (!isParticipant) {
				socket.emit("error", { message: "Not authorized to join this chat" });
				return;
			}

			socket.join(`chat_${chatId}`);
			socket.currentChatId = chatId;

			// Update last read time
			const participant = chat.participants.find(
				(p) => p.user && p.user._id.toString() === socket.userId
			);
			if (participant) {
				participant.lastReadAt = new Date();
				await chat.save();
			}

			socket.emit("chat_joined", { chatId, chat });
		} catch (error) {
			console.error("Error joining chat:", error);
			socket.emit("error", { message: "Failed to join chat" });
		}
	});

	// Handle sending messages
	socket.on("send_message", async (data) => {
		try {
			const { chatId, content, type = "text" } = data;

			const chat = await Chat.findById(chatId).populate("participants.user");
			if (!chat) {
				socket.emit("error", { message: "Chat not found" });
				return;
			}

			// Create message
			const message = new ChatMessage({
				chat: new mongoose.Types.ObjectId(chatId),
				sender: new mongoose.Types.ObjectId(socket.userId),
				content,
				type,
			});

			await message.save();
			await message.populate("sender", "name email");

			// Update chat last message
			chat.lastMessage = {
				content,
				sender: new mongoose.Types.ObjectId(socket.userId),
				sentAt: new Date(),
			};
			chat.messageCount += 1;
			await chat.save();

			// Emit message to all participants in the chat
			io.to(`chat_${chatId}`).emit("new_message", message);

			// Send notifications to offline users via email (optional)
			const offlineParticipants = chat.participants
				.filter((p) => p.user && p.user._id.toString() !== socket.userId)
				.filter((p) => p.user && !connectedUsers.has(p.user._id.toString()));

			// Send email notification to offline users
			for (const participant of offlineParticipants) {
				try {
					await sendMessageNotificationEmail({
						senderName: socket.user.name,
						senderEmail: socket.user.email,
						seller: participant.user,
						product: await mongoose.model("Product").findById(chat.product),
						message: `New message in chat: ${content}`,
						preferredContactMethod: "chat",
					});
				} catch (emailError) {
					console.error("Failed to send email notification:", emailError);
				}
			}
		} catch (error) {
			console.error("Error sending message:", error);
			socket.emit("error", { message: "Failed to send message" });
		}
	});

	// Handle message read receipts
	socket.on("mark_as_read", async (chatId) => {
		try {
			const chat = await Chat.findById(chatId);
			if (!chat) return;

			const participant = chat.participants.find(
				(p) => p.user && p.user._id.toString() === socket.userId
			);

			if (participant) {
				participant.lastReadAt = new Date();
				await chat.save();

				// Notify other participants that message was read
				socket.to(`chat_${chatId}`).emit("message_read", {
					chatId,
					userId: socket.userId,
					readAt: participant.lastReadAt,
				});
			}
		} catch (error) {
			console.error("Error marking as read:", error);
		}
	});

	// Handle typing indicators
	socket.on("typing", (data) => {
		const { chatId, isTyping } = data;
		socket.to(`chat_${chatId}`).emit("user_typing", {
			userId: socket.userId,
			userName: socket.user.name,
			isTyping,
		});
	});

	// Handle disconnect
	socket.on("disconnect", () => {
		console.log(`❌ User ${socket.user.name} disconnected from chat`);
		connectedUsers.delete(socket.userId);
	});
});

// ==================== CHAT API ROUTES ====================

// Get or create a chat between two users
app.post("/api/chat/start", authenticateToken, async (req, res) => {
	try {
		const { sellerId, productId } = req.body;
		const buyerId = req.user.userId;

		// Find existing chat
		let chat = await Chat.findOne({
			participants: {
				$all: [
					{ $elemMatch: { user: new mongoose.Types.ObjectId(buyerId) } },
					{ $elemMatch: { user: new mongoose.Types.ObjectId(sellerId) } },
				],
			},
			product: productId ? new mongoose.Types.ObjectId(productId) : undefined,
		}).populate("participants.user", "name email");

		// Create new chat if doesn't exist
		if (!chat) {
			chat = new Chat({
				participants: [
					{ user: new mongoose.Types.ObjectId(buyerId) },
					{ user: new mongoose.Types.ObjectId(sellerId) },
				],
				product: productId ? new mongoose.Types.ObjectId(productId) : undefined,
			});

			if (productId) {
				const product = await mongoose.model("Product").findById(productId);
				chat.title = `Chat about ${product?.title || "product"}`;
			}

			await chat.save();
			await chat.populate("participants.user", "name email");
		}

		res.json({ chat });
	} catch (error) {
		console.error("Error starting chat:", error);
		res.status(500).json({ error: "Failed to start chat" });
	}
});

// Get user's chats
app.get("/api/chat/user/:userId", authenticateToken, async (req, res) => {
	try {
		const { userId } = req.params;

		// Ensure user can only access their own chats
		if (req.user.userId !== userId) {
			return res.status(403).json({ error: "Access denied" });
		}
		const { page = 1, limit = 20 } = req.query;

		const chats = await Chat.find({
			"participants.user": new mongoose.Types.ObjectId(userId),
			isActive: true,
		})
			.populate("participants.user", "name email")
			.populate("product", "title price currency images")
			.sort({ "lastMessage.sentAt": -1, createdAt: -1 })
			.limit(limit * 1)
			.skip((page - 1) * limit);

		// Calculate unread counts
		const chatsWithUnread = await Promise.all(
			chats.map(async (chat) => {
				const participant = chat.participants.find(
					(p) => p.user && p.user._id.toString() === userId
				);

				const unreadCount = participant
					? await ChatMessage.countDocuments({
							chat: chat._id,
							sender: { $ne: new mongoose.Types.ObjectId(userId) },
							createdAt: { $gt: participant.lastReadAt },
					  })
					: 0;

				return {
					...chat.toObject(),
					unreadCount,
				};
			})
		);

		// Add caching headers to reduce server load
		res.set("Cache-Control", "private, max-age=10"); // Cache for 10 seconds
		res.json({ chats: chatsWithUnread });
	} catch (error) {
		console.error("Error fetching chats:", error);
		res.status(500).json({ error: "Failed to fetch chats" });
	}
});

// Get chat messages
app.get("/api/chat/:chatId/messages", authenticateToken, async (req, res) => {
	try {
		const { chatId } = req.params;
		const { page = 1, limit = 50 } = req.query;

		// Check if user is participant in this chat
		const chat = await Chat.findById(chatId);
		if (!chat) {
			return res.status(404).json({ error: "Chat not found" });
		}

		const isParticipant = chat.participants.some(
			(p) => p.user && p.user._id.toString() === req.user.userId
		);
		if (!isParticipant) {
			return res.status(403).json({ error: "Access denied" });
		}

		const messages = await ChatMessage.find({ chat: chatId })
			.populate("sender", "name email")
			.sort({ createdAt: -1 })
			.limit(limit * 1)
			.skip((page - 1) * limit);

		res.json({ messages: messages.reverse() });
	} catch (error) {
		console.error("Error fetching messages:", error);
		res.status(500).json({ error: "Failed to fetch messages" });
	}
});

// Get unread message count for user
app.get(
	"/api/chat/user/:userId/unread-count",
	authenticateToken,
	async (req, res) => {
		try {
			const { userId } = req.params;

			// Ensure user can only access their own unread count
			if (req.user.userId !== userId) {
				return res.status(403).json({ error: "Access denied" });
			}

			const chats = await Chat.find({
				"participants.user": new mongoose.Types.ObjectId(userId),
				isActive: true,
			});

			let totalUnread = 0;
			for (const chat of chats) {
				const participant = chat.participants.find(
					(p) => p.user && p.user._id.toString() === userId
				);

				if (participant) {
					const unreadCount = await ChatMessage.countDocuments({
						chat: chat._id,
						sender: { $ne: new mongoose.Types.ObjectId(userId) },
						createdAt: { $gt: participant.lastReadAt },
					});

					totalUnread += unreadCount;
				}
			}

			// Add caching headers to reduce server load
			res.set("Cache-Control", "private, max-age=5"); // Cache for 5 seconds
			res.json({ unreadCount: totalUnread });
		} catch (error) {
			console.error("Error fetching unread count:", error);
			res.status(500).json({ error: "Failed to fetch unread count" });
		}
	}
);

// ==================== MESSAGE ROUTES ====================

// Send a message to seller
app.post("/api/messages", async (req, res) => {
	try {
		const {
			senderName,
			senderEmail,
			productId,
			message,
			preferredContactMethod = "email",
		} = req.body;

		// Validate required fields
		if (!senderName || !senderEmail || !productId || !message) {
			return res.status(400).json({
				error:
					"Missing required fields: senderName, senderEmail, productId, message",
			});
		}

		// Find the product to get seller information
		const product = await mongoose.model("Product").findById(productId);
		if (!product) {
			return res.status(404).json({ error: "Product not found" });
		}

		// Create the message
		const newMessage = new Message({
			senderName,
			senderEmail,
			seller: product.seller,
			product: productId,
			subject: `Message about ${product.title}`,
			message,
			preferredContactMethod,
		});

		await newMessage.save();

		// Populate the message with seller and product details
		await newMessage.populate([
			{ path: "seller", select: "name email phone location" },
			{ path: "product", select: "title price currency images" },
		]);

		// Send email notifications
		try {
			await sendMessageNotificationEmail(newMessage);
			await sendMessageConfirmationEmail(newMessage);
		} catch (emailError) {
			console.error("Error sending emails:", emailError);
			// Don't fail the request if email fails
		}

		res.status(201).json({
			message: "Message sent successfully",
			data: newMessage,
		});
	} catch (error) {
		console.error("Error sending message:", error);
		res.status(500).json({ error: "Failed to send message" });
	}
});

// Get messages for a seller (inbox)
app.get("/api/messages/seller/:sellerId", async (req, res) => {
	try {
		const { sellerId } = req.params;
		const { page = 1, limit = 10, status } = req.query;

		// Build query
		const query = { seller: sellerId };
		if (status && ["unread", "read", "replied"].includes(status)) {
			query.status = status;
		}

		// Get messages with pagination
		const messages = await Message.find(query)
			.populate("product", "title price currency images")
			.populate("seller", "name email phone location")
			.sort({ createdAt: -1 })
			.limit(limit * 1)
			.skip((page - 1) * limit);

		// Get total count for pagination
		const total = await Message.countDocuments(query);

		res.json({
			messages,
			pagination: {
				current: parseInt(page),
				pages: Math.ceil(total / limit),
				total,
			},
		});
	} catch (error) {
		console.error("Error fetching messages:", error);
		res.status(500).json({ error: "Failed to fetch messages" });
	}
});

// Get unread message count for a seller
app.get("/api/messages/seller/:sellerId/unread-count", async (req, res) => {
	try {
		const { sellerId } = req.params;
		const unreadCount = await Message.countDocuments({
			seller: sellerId,
			status: "unread",
		});

		res.json({ unreadCount });
	} catch (error) {
		console.error("Error fetching unread count:", error);
		res.status(500).json({ error: "Failed to fetch unread count" });
	}
});

// Mark message as read
app.patch("/api/messages/:messageId/read", async (req, res) => {
	try {
		const { messageId } = req.params;

		const message = await Message.findByIdAndUpdate(
			messageId,
			{
				status: "read",
				readAt: new Date(),
			},
			{ new: true }
		);

		if (!message) {
			return res.status(404).json({ error: "Message not found" });
		}

		res.json({ message: "Message marked as read", data: message });
	} catch (error) {
		console.error("Error marking message as read:", error);
		res.status(500).json({ error: "Failed to mark message as read" });
	}
});

// Mark message as replied
app.patch("/api/messages/:messageId/replied", async (req, res) => {
	try {
		const { messageId } = req.params;

		const message = await Message.findByIdAndUpdate(
			messageId,
			{
				status: "replied",
				repliedAt: new Date(),
			},
			{ new: true }
		);

		if (!message) {
			return res.status(404).json({ error: "Message not found" });
		}

		res.json({ message: "Message marked as replied", data: message });
	} catch (error) {
		console.error("Error marking message as replied:", error);
		res.status(500).json({ error: "Failed to mark message as replied" });
	}
});

// Delete a message
app.delete("/api/messages/:messageId", async (req, res) => {
	try {
		const { messageId } = req.params;

		const message = await Message.findByIdAndDelete(messageId);

		if (!message) {
			return res.status(404).json({ error: "Message not found" });
		}

		res.json({ message: "Message deleted successfully" });
	} catch (error) {
		console.error("Error deleting message:", error);
		res.status(500).json({ error: "Failed to delete message" });
	}
});

// 404 handler
app.use("*", (req, res) => {
	res.status(404).json({ error: "Route not found" });
});

server.listen(PORT, () => {
	console.log(`🚀 Server running on port ${PORT}`);
	console.log(`📱 Health check: http://localhost:${PORT}/api/health`);
	console.log(`💬 Chat server ready for Socket.IO connections`);
});
