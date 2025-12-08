import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { useLanguage } from "../contexts/LanguageContext";
import { useAuth } from "../contexts/AuthContext";
import LanguageSwitcher from "./LanguageSwitcher";
import {
	Menu,
	Grid3x3,
	Heart,
	Plus,
	User,
	LogIn,
	UserPlus,
} from "lucide-react";
import logo1 from "../assets/logo13.png";
import logo2 from "../assets/logo-without-text.png";
import logosvg from "../assets/logo-nadlanka-full.svg";

const Header = ({ onToggleFavorites }) => {
	const location = useLocation();
	const navigate = useNavigate();
	const { t } = useLanguage();
	const { user, logout, isAuthenticated, loading } = useAuth();
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
	const [showUserMenu, setShowUserMenu] = useState(false);
	const [favoritesCount, setFavoritesCount] = useState(0);

	const userMenuRef = useRef(null);

	// Close user menu when clicking outside or when route changes
	useEffect(() => {
		const handleClickOutside = (event) => {
			// Don't close if clicking on a user-menu-item
			if (event.target.closest('.user-menu-item')) {
				return;
			}
			
			if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
				setShowUserMenu(false);
			}
		};

		if (showUserMenu) {
			// Use a slight delay to ensure menu items can be clicked
			const timeoutId = setTimeout(() => {
				document.addEventListener("click", handleClickOutside);
			}, 0);

			return () => {
				clearTimeout(timeoutId);
				document.removeEventListener("click", handleClickOutside);
			};
		}
	}, [showUserMenu]);

	// Close menu when route changes
	useEffect(() => {
		setShowUserMenu(false);
	}, [location.pathname]);

	// Close user menu when user logs out
	useEffect(() => {
		if (!isAuthenticated) {
			setShowUserMenu(false);
		}
	}, [isAuthenticated]);

	// Fetch favorites count
	useEffect(() => {
		if (user && isAuthenticated) {
			fetchFavoritesCount();
		} else {
			setFavoritesCount(0);
		}

		// Listen for favorite changes
		const handleFavoriteChange = () => {
			if (user && isAuthenticated) {
				fetchFavoritesCount();
			}
		};

		window.addEventListener("favoriteChanged", handleFavoriteChange);

		return () => {
			window.removeEventListener("favoriteChanged", handleFavoriteChange);
		};
	}, [user, isAuthenticated]);

	const fetchFavoritesCount = async () => {
		try {
			const response = await axios.get("/api/favorites?limit=1", {
				headers: {
					Authorization: `Bearer ${user.token}`,
				},
			});
			setFavoritesCount(response.data.pagination?.totalFavorites || 0);
		} catch (error) {
			console.error("Error fetching favorites count:", error);
		}
	};

	const toggleMobileMenu = () => {
		setIsMobileMenuOpen(!isMobileMenuOpen);
	};

	const closeMobileMenu = () => {
		setIsMobileMenuOpen(false);
	};

	const handleLogout = () => {
		logout();
		setShowUserMenu(false);
		setIsMobileMenuOpen(false);
		navigate("/");
	};

	return (
		<header className="header-container">
			<nav className="nav">
				{/* Left Section */}
				<div className="nav-left">
					{/* Logo */}
					<Link to="/" className="logo" onClick={closeMobileMenu}>
						<span className="logo-text">
							<img
								// width={125}
								// height={70}
								// style={{ objectFit: "cover" }}
								src={logosvg}
								alt="NaDlanka"
							/>
						</span>
					</Link>
				</div>

				{/* Center Section - Desktop Navigation */}
				<div className="nav-center">
					<div className="desktop-nav-links">
						<Link
							to="/products"
							className={`nav-link ${
								location.pathname === "/products" ? "active" : ""
							}`}
						>
							<Grid3x3 size={18} />
							<span>{t("nav.products")}</span>
						</Link>

						<Link
							to={isAuthenticated ? "/create-product" : "/login"}
							className={`nav-link ${
								location.pathname === "/create-product" ? "active" : ""
							}`}
							onClick={(e) => {
								if (!isAuthenticated) {
									e.preventDefault();
									navigate("/login", { state: { from: "/create-product" } });
								}
							}}
						>
							<Plus size={18} />
							<span>{t("nav.sell")}</span>
						</Link>

						{!loading && isAuthenticated && (
							<button
								className="favorites-icon-btn desktop-favorites"
								onClick={onToggleFavorites}
								title={t("favorites.title") || "Favorites"}
							>
								<Heart size={18} />
								{favoritesCount > 0 && (
									<span className="favorites-badge">{favoritesCount}</span>
								)}
							</button>
						)}

						<Link
							to="/about"
							className={`nav-link ${
								location.pathname === "/about" ? "active" : ""
							}`}
						>
							<span>{t("nav.about")}</span>
						</Link>

						{!loading && !isAuthenticated && (
							<>
								<Link
									to="/login"
									className={`nav-link ${
										location.pathname === "/login" ? "active" : ""
									}`}
								>
									<LogIn size={18} />
									<span>{t("auth.login.button")}</span>
								</Link>
								<Link
									to="/register"
									className={`nav-link register-link ${
										location.pathname === "/register" ? "active" : ""
									}`}
								>
									<UserPlus size={18} />
									<span>{t("auth.register.button")}</span>
								</Link>
							</>
						)}
					</div>
				</div>

				{/* Right Section */}
				<div className="nav-right">
					{!loading && isAuthenticated && (
						<div
							className="user-menu-container desktop-user-menu"
							ref={userMenuRef}
						>
							<button
								className={`profile-icon ${
									location.pathname === "/profile" ? "active" : ""
								}`}
								onClick={() => setShowUserMenu(!showUserMenu)}
								title={user?.name || t("nav.profile")}
							>
								<User size={20} />
							</button>

							{showUserMenu && (
								<div className="user-menu">
									<div className="user-info">
										<p className="user-name">{user?.name}</p>
										<p className="user-email">{user?.email}</p>
									</div>
									<button
										type="button"
										className="user-menu-item"
										onClick={() => {
											navigate("/profile");
											setShowUserMenu(false);
										}}
									>
										{t("nav.profile")}
									</button>
									<button
										type="button"
										className="user-menu-item"
										onClick={() => {
											navigate("/favorites");
											setShowUserMenu(false);
										}}
									>
										{t("favorites.title") || "Favorites"}
									</button>
									<button
										className="user-menu-item logout-btn"
										onClick={() => {
											handleLogout();
										}}
									>
										{t("auth.logout")}
									</button>
								</div>
							)}
						</div>
					)}

					<div className="language-switcher">
						<LanguageSwitcher />
					</div>

					{/* Mobile Menu Button - Only visible on mobile */}
					<button
						className="mobile-menu-button"
						onClick={toggleMobileMenu}
						aria-label="Toggle mobile menu"
					>
						<Menu
							size={24}
							className={`menu-icon ${isMobileMenuOpen ? "open" : ""}`}
						/>
					</button>
				</div>

				{/* Mobile Navigation Menu */}
				<div className={`nav-links ${isMobileMenuOpen ? "mobile-open" : ""}`}>
					{/* Mobile Primary Navigation */}
					<div className="mobile-primary-nav">
						<Link
							to="/products"
							className={`nav-link ${
								location.pathname === "/products" ? "active" : ""
							}`}
							onClick={closeMobileMenu}
						>
							<svg
								width="20"
								height="20"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
							>
								<rect x="3" y="3" width="7" height="7"></rect>
								<rect x="14" y="3" width="7" height="7"></rect>
								<rect x="14" y="14" width="7" height="7"></rect>
								<rect x="3" y="14" width="7" height="7"></rect>
							</svg>
							<span>{t("nav.products")}</span>
						</Link>

						<Link
							to={isAuthenticated ? "/create-product" : "/login"}
							className={`nav-link ${
								location.pathname === "/create-product" ? "active" : ""
							}`}
							onClick={(e) => {
								if (!isAuthenticated) {
									e.preventDefault();
									navigate("/login", { state: { from: "/create-product" } });
									closeMobileMenu();
								} else {
									closeMobileMenu();
								}
							}}
						>
							<svg
								width="20"
								height="20"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
							>
								<line x1="12" y1="5" x2="12" y2="19"></line>
								<line x1="5" y1="12" x2="19" y2="12"></line>
							</svg>
							<span>{t("nav.sell")}</span>
						</Link>

						<Link
							to="/about"
							className={`nav-link ${
								location.pathname === "/about" ? "active" : ""
							}`}
							onClick={closeMobileMenu}
						>
							<svg
								width="20"
								height="20"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
							>
								<circle cx="12" cy="12" r="10"></circle>
								<path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
								<line x1="12" y1="17" x2="12.01" y2="17"></line>
							</svg>
							<span>{t("nav.about")}</span>
						</Link>
					</div>

					{/* Favorites Button */}
					<button
						className="favorites-icon-btn"
						onClick={() => {
							if (isAuthenticated) {
								onToggleFavorites();
							} else {
								navigate("/login", { state: { from: "/favorites" } });
								closeMobileMenu();
							}
						}}
						title={t("favorites.title") || "Favorites"}
					>
						<Heart size={20} />
						<span>{t("favorites.title") || "Favorites"}</span>
						{isAuthenticated && favoritesCount > 0 && (
							<span className="favorites-badge">{favoritesCount}</span>
						)}
					</button>

					{!loading && isAuthenticated ? (
						<div className="user-menu-container" ref={userMenuRef}>
							<button
								className={`profile-icon ${
									location.pathname === "/profile" ? "active" : ""
								}`}
								onClick={() => setShowUserMenu(!showUserMenu)}
								title={user?.name || t("nav.profile")}
							>
								<svg
									width="24"
									height="24"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
								>
									<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
									<circle cx="12" cy="7" r="4"></circle>
								</svg>
							</button>

							{showUserMenu && (
								<div className="user-menu">
									<div className="user-info">
										<p className="user-name">{user?.name}</p>
										<p className="user-email">{user?.email}</p>
									</div>
									<Link
										to="/profile"
										className="user-menu-item"
									>
										{t("nav.profile")}
									</Link>
									<Link
										to="/favorites"
										className="user-menu-item"
									>
										{t("favorites.title") || "Favorites"}
									</Link>
									<button
										className="user-menu-item logout-btn"
										onClick={() => {
											handleLogout();
										}}
									>
										{t("auth.logout")}
									</button>
								</div>
							)}
						</div>
					) : !loading && !isAuthenticated ? (
						<>
							<Link
								to="/login"
								className={`nav-link ${
									location.pathname === "/login" ? "active" : ""
								}`}
								onClick={closeMobileMenu}
							>
								<svg
									width="20"
									height="20"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
								>
									<path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
									<polyline points="10,17 15,12 10,7"></polyline>
									<line x1="15" y1="12" x2="3" y2="12"></line>
								</svg>
								<span>{t("auth.login.button")}</span>
							</Link>
							<Link
								to="/register"
								className={`nav-link ${
									location.pathname === "/register" ? "active" : ""
								}`}
								onClick={closeMobileMenu}
							>
								<svg
									width="20"
									height="20"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
								>
									<path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
									<circle cx="8.5" cy="7" r="4"></circle>
									<line x1="20" y1="8" x2="20" y2="14"></line>
									<line x1="23" y1="11" x2="17" y2="11"></line>
								</svg>
								<span>{t("auth.register.button")}</span>
							</Link>
						</>
					) : null}

					{/* Language Switcher in Mobile Menu */}
					<div className="mobile-language-switcher">
						<LanguageSwitcher />
					</div>
				</div>

				{/* Mobile Menu Overlay */}
				{isMobileMenuOpen && (
					<div className="mobile-menu-overlay" onClick={closeMobileMenu}></div>
				)}
			</nav>
		</header>
	);
};

export default Header;
