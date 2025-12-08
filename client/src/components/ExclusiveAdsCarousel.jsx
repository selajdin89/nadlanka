import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
	translateCategory,
	translateCondition,
} from "../utils/productTranslations";
import ProductImageSlider from "./ProductImageSlider";
import FavoriteButton from "./FavoriteButton";
import { useLanguage } from "../contexts/LanguageContext";
import "./ExclusiveAdsCarousel.scss";

const ExclusiveAdsCarousel = ({ products }) => {
	const { t } = useLanguage();
	const [currentIndex, setCurrentIndex] = useState(0);
	const [itemsPerView, setItemsPerView] = useState(4);
	const [cardWidth, setCardWidth] = useState(280);
	const [gapPixels, setGapPixels] = useState(24);

	// Update items per view and card dimensions based on screen size
	useEffect(() => {
		let resizeTimeout;
		const handleResize = () => {
			// Debounce resize events to prevent excessive calculations
			clearTimeout(resizeTimeout);
			resizeTimeout = setTimeout(() => {
				// Get gap in rem based on screen size
				const getGapRem = () => {
					if (window.innerWidth >= 900) return 1.5;
					if (window.innerWidth >= 600) return 1;
					return 0.75;
				};
				const gapRem = getGapRem();
				const gapPx = gapRem * 16; // Convert rem to px

				// Calculate container width accounting for carousel padding
				const maxWidth = 1440;
				const currentWidth = window.innerWidth;
				const containerWidth =
					currentWidth > maxWidth ? maxWidth : currentWidth;
				const carouselPadding = 40; // 20px on each side (1.25rem * 2)
				const availableWidth = containerWidth - carouselPadding;

				const cardMinWidth = 250; // Minimum card width

				// Calculate how many full cards can fit
				let items = 1;
				let calculatedCardWidth = 280;
				for (let i = 4; i >= 1; i--) {
					const totalGaps = (i - 1) * gapPx;
					const cardWidth = (availableWidth - totalGaps) / i;

					if (cardWidth >= cardMinWidth) {
						items = i;
						calculatedCardWidth = cardWidth;
						break;
					}
				}

				// Update all state values
				setItemsPerView(items);
				setCardWidth(calculatedCardWidth);
				setGapPixels(gapPx);

				// Reset to first position on resize to prevent layout issues
				setCurrentIndex(0);
			}, 150); // 150ms debounce
		};

		handleResize();
		window.addEventListener("resize", handleResize);

		return () => {
			window.removeEventListener("resize", handleResize);
			clearTimeout(resizeTimeout);
		};
	}, []);

	const formatPrice = (price, currency = "MKD") => {
		return new Intl.NumberFormat("mk-MK", {
			style: "currency",
			currency: currency,
		}).format(price);
	};

	const goToPrevious = () => {
		setCurrentIndex((prev) => {
			if (prev === 0) {
				return products.length - 1;
			}
			return prev - 1;
		});
	};

	const goToNext = () => {
		setCurrentIndex((prev) => {
			if (prev >= products.length - 1) {
				return 0;
			}
			return prev + 1;
		});
	};

	if (!products || products.length === 0) {
		return null;
	}

	// Create extended array for infinite loop effect
	const extendedProducts = [...products, ...products, ...products];
	const offset = products.length;

	// Calculate gap in rem for CSS (using state values)
	const gapRem = gapPixels / 16; // Convert px back to rem for CSS

	// For transform, we need to move by full card widths + gaps
	const currentSlide = currentIndex + offset;
	const translateX = currentSlide * (cardWidth + gapPixels); // Move by actual pixel width + gap

	return (
		<div className="exclusive-carousel">
			<div className="carousel-controls">
				<button
					className="carousel-arrow carousel-arrow-left"
					onClick={goToPrevious}
					aria-label="Previous"
				>
					<ChevronLeft size={20} />
				</button>
				<button
					className="carousel-arrow carousel-arrow-right"
					onClick={goToNext}
					aria-label="Next"
				>
					<ChevronRight size={20} />
				</button>
			</div>

			<div className="carousel-container">
				<div className="carousel-track-container">
					<div
						className="carousel-track"
						style={{
							gap: `${gapRem}rem`,
							transform: `translateX(-${translateX}px)`,
						}}
					>
						{extendedProducts.map((product, idx) => (
							<Link
								key={`${product._id}-${idx}`}
								to={`/products/${product._id}`}
								className="carousel-card"
								style={{
									width: `${cardWidth}px`,
									flexShrink: 0,
								}}
							>
								<div className="product-image-wrapper">
									<ProductImageSlider
										images={product.images}
										title={product.title}
										onError={(e) => {
											e.target.src = "/placeholder-image.jpg";
										}}
									/>
									<div className="favorite-btn-wrapper">
										<FavoriteButton productId={product._id} size="small" />
									</div>
								</div>
								<div className="product-info">
									<h3 className="product-title">{product.title}</h3>
									<p className="product-price">
										{formatPrice(product.price, product.currency)}
									</p>
									<p className="product-location">{product.location}</p>
									<div className="product-meta">
										<span className="product-category">
											{translateCategory(product.category, t)}
										</span>
										<span className="product-condition">
											{translateCondition(product.condition, t)}
										</span>
									</div>
								</div>
							</Link>
						))}
					</div>
				</div>
			</div>

			{/* Dots indicator */}
			{products.length > 1 && (
				<div className="carousel-dots">
					{products.map((_, index) => (
						<button
							key={index}
							className={`carousel-dot ${
								index === currentIndex ? "active" : ""
							}`}
							onClick={() => setCurrentIndex(index)}
							aria-label={`Go to position ${index + 1}`}
						/>
					))}
				</div>
			)}
		</div>
	);
};

export default ExclusiveAdsCarousel;
