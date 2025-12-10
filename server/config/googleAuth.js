const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/User");

// Configure Google OAuth Strategy (only if credentials are available)
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
	passport.use(
		new GoogleStrategy(
			{
				clientID: process.env.GOOGLE_CLIENT_ID,
				clientSecret: process.env.GOOGLE_CLIENT_SECRET,
				callbackURL: process.env.CALLBACK_URL || `${process.env.SERVER_URL || process.env.CLIENT_URL || "http://localhost:5000"}/api/auth/google/callback`,
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

					// Create new user
					const newUser = new User({
						googleId: profile.id,
						name: profile.displayName,
						email: profile.emails[0].value,
						avatar: profile.photos[0]?.value || "",
						verified: true, // Google emails are pre-verified
						isActive: true,
						joinDate: new Date(),
						lastLogin: new Date(),
					});

					await newUser.save();
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
