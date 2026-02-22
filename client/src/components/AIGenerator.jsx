import React, { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import axios from "axios";
import { useLanguage } from "../contexts/LanguageContext";
import "./AIGenerator.scss";

const AIGenerator = ({ formData, onGenerated }) => {
	const { t } = useLanguage();
	const [loading, setLoading] = useState(false);
	const [generated, setGenerated] = useState(false);

	const handleGenerate = async () => {
		setLoading(true);
		try {
			const API_BASE_URL = import.meta.env.VITE_API_URL || "";
			const token = localStorage.getItem("token") || 
				(document.cookie.match(/token=([^;]+)/) || [])[1];
			
			const response = await axios.post(`${API_BASE_URL}/api/products/generate-content`, formData, {
				headers: {
					Authorization: token ? `Bearer ${token}` : undefined,
					"Content-Type": "application/json",
				},
			});

			if (response.data.success) {
				onGenerated({
					title: response.data.title,
					description: response.data.description,
				});
				setGenerated(true);
			}
		} catch (error) {
			console.error("Error generating content:", error);
		} finally {
			setLoading(false);
		}
	};

	// Check if we have enough data to generate
	const canGenerate =
		formData.category ||
		formData.brand ||
		formData.model ||
		formData.categorySpecific?.propertyType ||
		formData.categorySpecific?.year;

	return (
		<div className="ai-generator">
			<div className="ai-generator-header">
				<Sparkles size={20} />
				<h4>{t("createProduct.ai.title") || "AI Assistant"}</h4>
			</div>
			<p className="ai-generator-description">
				{t("createProduct.ai.description") ||
					"Let AI generate a professional title and description based on your product details."}
			</p>
			<button
				type="button"
				onClick={handleGenerate}
				disabled={loading || !canGenerate || generated}
				className="ai-generate-btn"
			>
				{loading ? (
					<>
						<Loader2 className="spinner" size={16} />
						{t("createProduct.ai.generating") || "Generating..."}
					</>
				) : generated ? (
					<>
						<Sparkles size={16} />
						{t("createProduct.ai.regenerate") || "Regenerate"}
					</>
				) : (
					<>
						<Sparkles size={16} />
						{t("createProduct.ai.generate") || "Generate with AI"}
					</>
				)}
			</button>
			{!canGenerate && (
				<p className="ai-generator-hint">
					{t("createProduct.ai.hint") ||
						"Fill in category, brand, or model to enable AI generation"}
				</p>
			)}
		</div>
	);
};

export default AIGenerator;

