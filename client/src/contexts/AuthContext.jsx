import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

export const useAuth = () => {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
};

export const AuthProvider = ({ children }) => {
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);
	const [token, setToken] = useState(localStorage.getItem("token"));

	// Set up axios interceptor for authentication
	useEffect(() => {
		if (token) {
			axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
		} else {
			delete axios.defaults.headers.common["Authorization"];
		}
	}, [token]);

	// Check if user is authenticated on app load
	useEffect(() => {
		const checkAuth = async () => {
			const savedToken = localStorage.getItem("token");
			if (savedToken) {
				try {
					axios.defaults.headers.common[
						"Authorization"
					] = `Bearer ${savedToken}`;
					const response = await axios.get("/api/auth/me");
					setUser({ ...response.data, token: savedToken });
					setToken(savedToken);
				} catch (error) {
					console.error("Auth check failed:", error);
					localStorage.removeItem("token");
					delete axios.defaults.headers.common["Authorization"];
				}
			}
			setLoading(false);
		};

		checkAuth();
	}, []);

	// Handle Google OAuth callback
	useEffect(() => {
		const urlParams = new URLSearchParams(window.location.search);
		const googleToken = urlParams.get("token");

		if (googleToken) {
			localStorage.setItem("token", googleToken);
			setToken(googleToken);
			axios.defaults.headers.common["Authorization"] = `Bearer ${googleToken}`;

			// Fetch user data after setting token
			const fetchUser = async () => {
				try {
					const response = await axios.get("/api/auth/me");
					setUser({ ...response.data, token: googleToken });
				} catch (error) {
					console.error("Failed to fetch user after OAuth:", error);
				}
			};
			fetchUser();

			// Clean up URL
			window.history.replaceState({}, document.title, window.location.pathname);
		}
	}, []);

	const login = async (email, password) => {
		try {
			const response = await axios.post("/api/auth/login", {
				email,
				password,
			});

			const { user: userData, token: authToken } = response.data;

			localStorage.setItem("token", authToken);
			setToken(authToken);
			setUser({ ...userData, token: authToken });
			axios.defaults.headers.common["Authorization"] = `Bearer ${authToken}`;

			return { success: true, user: userData };
		} catch (error) {
			console.error("Login error:", error);
			return {
				success: false,
				error: error.response?.data?.error || "Login failed",
			};
		}
	};

	const register = async (userData) => {
		try {
			const response = await axios.post("/api/auth/register", userData);

			const { user: newUser, token: authToken } = response.data;

			localStorage.setItem("token", authToken);
			setToken(authToken);
			setUser({ ...newUser, token: authToken });
			axios.defaults.headers.common["Authorization"] = `Bearer ${authToken}`;

			return { success: true, user: newUser };
		} catch (error) {
			console.error("Registration error:", error);
			return {
				success: false,
				error: error.response?.data?.error || "Registration failed",
			};
		}
	};

	const logout = () => {
		localStorage.removeItem("token");
		setToken(null);
		setUser(null);
		delete axios.defaults.headers.common["Authorization"];
	};

	const updateProfile = async (profileData) => {
		try {
			const response = await axios.put("/api/auth/profile", profileData);
			setUser(response.data.user);
			return { success: true, user: response.data.user };
		} catch (error) {
			console.error("Profile update error:", error);
			return {
				success: false,
				error: error.response?.data?.error || "Profile update failed",
			};
		}
	};

	const changePassword = async (currentPassword, newPassword) => {
		try {
			await axios.put("/api/auth/change-password", {
				currentPassword,
				newPassword,
			});
			return { success: true };
		} catch (error) {
			console.error("Password change error:", error);
			return {
				success: false,
				error: error.response?.data?.error || "Password change failed",
			};
		}
	};

	const value = {
		user,
		token,
		loading,
		login,
		register,
		logout,
		updateProfile,
		changePassword,
		isAuthenticated: !!user,
	};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
