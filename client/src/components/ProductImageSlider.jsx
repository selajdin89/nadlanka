import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import "./ProductImageSlider.scss";

const ProductImageSlider = ({ images, title, onError }) => {
	const [currentImageIndex, setCurrentImageIndex] = useState(0);
	const [imageError, setImageError] = useState(false);

	if (!images || images.length === 0) {
		return (
			<div className="product-image-slider">
				<div className="placeholder-image">No Image</div>
			</div>
		);
	}

	const handleImageError = (e) => {
		setImageError(true);
		if (onError) {
			onError(e);
		}
	};

	const goToPrevious = (e) => {
		e.preventDefault();
		e.stopPropagation();
		setCurrentImageIndex((prevIndex) =>
			prevIndex === 0 ? images.length - 1 : prevIndex - 1
		);
		setImageError(false); // Reset error state when navigating
	};

	const goToNext = (e) => {
		e.preventDefault();
		e.stopPropagation();
		setCurrentImageIndex((prevIndex) =>
			prevIndex === images.length - 1 ? 0 : prevIndex + 1
		);
		setImageError(false); // Reset error state when navigating
	};

	return (
		<div className="product-image-slider">
			{imageError ? (
				<div className="placeholder-image">Image failed to load</div>
			) : (
				<img
					src={images[currentImageIndex]}
					alt={`${title} ${currentImageIndex + 1}`}
					onError={handleImageError}
				/>
			)}

			{images.length > 1 && (
				<>
					<button
						className="slider-arrow slider-arrow-left"
						onClick={goToPrevious}
						aria-label="Previous image"
					>
						<ChevronLeft size={16} />
					</button>

					<button
						className="slider-arrow slider-arrow-right"
						onClick={goToNext}
						aria-label="Next image"
					>
						<ChevronRight size={16} />
					</button>

					<div className="slider-dots">
						{images.map((_, index) => (
							<button
								key={index}
								className={`slider-dot ${
									index === currentImageIndex ? "active" : ""
								}`}
								onClick={(e) => {
									e.preventDefault();
									e.stopPropagation();
									setCurrentImageIndex(index);
									setImageError(false); // Reset error state when navigating
								}}
								aria-label={`Go to image ${index + 1}`}
							/>
						))}
					</div>
				</>
			)}
		</div>
	);
};

export default ProductImageSlider;
