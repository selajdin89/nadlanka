import React, { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";
import "./FavoriteButton.scss";

const FavoriteButton = ({ productId, size = "medium", showText = false }) => {
	const { user } = useAuth();
	const navigate = useNavigate();
	const { t } = useLanguage();
	const [isFavorite, setIsFavorite] = useState(false);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (user && productId) {
			checkFavoriteStatus();
		}

		// Listen for favorite changes from other components (e.g., sidebar)
		const handleFavoriteChange = (event) => {
			if (event.detail.productId === productId) {
				setIsFavorite(event.detail.isFavorite);
			}
		};

		window.addEventListener("favoriteChanged", handleFavoriteChange);

		return () => {
			window.removeEventListener("favoriteChanged", handleFavoriteChange);
		};
	}, [user, productId]);

	const checkFavoriteStatus = async () => {
		try {
			const response = await axios.get(`/api/favorites/check/${productId}`, {
				headers: {
					Authorization: `Bearer ${user.token}`,
				},
			});
			setIsFavorite(response.data.isFavorite);
		} catch (error) {
			console.error("Error checking favorite status:", error);
		}
	};

	const handleToggleFavorite = async (e) => {
		e.preventDefault();
		e.stopPropagation();

		if (!user) {
			// Redirect to login if not authenticated
			navigate("/login", { state: { from: window.location.pathname } });
			return;
		}

		setLoading(true);

		try {
			if (isFavorite) {
				// Remove from favorites
				await axios.delete(`/api/favorites/${productId}`, {
					headers: {
						Authorization: `Bearer ${user.token}`,
					},
				});
				setIsFavorite(false);

				// Notify other components about the change
				window.dispatchEvent(
					new CustomEvent("favoriteChanged", {
						detail: { productId, isFavorite: false },
					})
				);
			} else {
				// Add to favorites
				await axios.post(
					"/api/favorites",
					{ productId },
					{
						headers: {
							Authorization: `Bearer ${user.token}`,
						},
					}
				);
				setIsFavorite(true);

				// Notify other components about the change
				window.dispatchEvent(
					new CustomEvent("favoriteChanged", {
						detail: { productId, isFavorite: true },
					})
				);
			}
		} catch (error) {
			console.error("Error toggling favorite:", error);
			alert(
				error.response?.data?.error ||
					t("favorites.error") ||
					"Failed to update favorites"
			);
		} finally {
			setLoading(false);
		}
	};

	const sizeClass = `favorite-btn-${size}`;

	return (
		<button
			className={`favorite-btn ${sizeClass} ${isFavorite ? "favorited" : ""} ${
				loading ? "loading" : ""
			}`}
			onClick={handleToggleFavorite}
			disabled={loading}
			title={
				isFavorite
					? t("favorites.removeFromFavorites") || "Remove from favorites"
					: t("favorites.addToFavorites") || "Add to favorites"
			}
		>
			<Heart
				size={size === "small" ? 16 : size === "large" ? 24 : 20}
				fill={isFavorite ? "currentColor" : "none"}
			/>
			{showText && (
				<span>
					{isFavorite
						? t("favorites.saved") || "Saved"
						: t("favorites.save") || "Save"}
				</span>
			)}
		</button>
	);
};

export default FavoriteButton;
