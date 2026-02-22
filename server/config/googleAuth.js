const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const crypto = require("crypto");
const User = require("../models/User");
const { sendVerificationEmail } = require("../services/emailService");

// Configure Google OAuth Strategy (only if credentials are available)
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
	// Determine the callback URL
	let callbackURL;
	if (process.env.CALLBACK_URL) {
		callbackURL = process.env.CALLBACK_URL;
	} else if (process.env.SERVER_URL) {
		// Ensure no trailing slash in SERVER_URL
		const serverUrl = process.env.SERVER_URL.replace(/\/$/, "");
		callbackURL = `${serverUrl}/api/auth/google/callback`;
	} else {
		// Default to production URL if not set
		callbackURL = "https://nadlanka.onrender.com/api/auth/google/callback";
	}

	console.log(`🔐 Google OAuth callback URL configured: ${callbackURL}`);

	passport.use(
		new GoogleStrategy(
			{
				clientID: process.env.GOOGLE_CLIENT_ID,
				clientSecret: process.env.GOOGLE_CLIENT_SECRET,
				callbackURL: callbackURL,
			},
			async (accessToken, refreshToken, profile, done) => {
				try {
					// Check if user already exists with this Google ID
					let user = await User.findOne({ googleId: profile.id });

					if (user) {
						// Update last login
						user.lastLogin = new Date();
						await user.save();
						return done(null, user);
					}

					// Check if user exists with this email
					user = await User.findOne({ email: profile.emails[0].value });

					if (user) {
						// Link Google account to existing user
						user.googleId = profile.id;
						user.lastLogin = new Date();
						await user.save();
						return done(null, user);
					}

					// Create new user (require email verification for receiving mails etc.)
					const emailVerificationToken = crypto.randomBytes(32).toString("hex");
					const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
					const newUser = new User({
						googleId: profile.id,
						name: profile.displayName,
						email: profile.emails[0].value,
						avatar: profile.photos[0]?.value || "",
						isVerified: false,
						isActive: true,
						joinedDate: new Date(),
						lastLogin: new Date(),
						emailVerificationToken,
						emailVerificationExpires,
					});

					await newUser.save();

					// Send verification email (non-blocking)
					const baseUrl = process.env.SERVER_URL || "http://localhost:5000";
					const verificationUrl = `${baseUrl}/api/auth/verify-email?token=${emailVerificationToken}`;
					sendVerificationEmail(newUser.email, newUser.name, verificationUrl).catch((err) =>
						console.error("Failed to send verification email:", err)
					);

					return done(null, newUser);
				} catch (error) {
					return done(error, null);
				}
			}
		)
	);
} else {
	console.log("⚠️  Google OAuth credentials not found. Google OAuth disabled.");
	console.log(
		"   To enable Google OAuth, set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in your .env file"
	);
}

// Serialize user for session
passport.serializeUser((user, done) => {
	done(null, user._id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
	try {
		const user = await User.findById(id);
		done(null, user);
	} catch (error) {
		done(error, null);
	}
});

module.exports = passport;
