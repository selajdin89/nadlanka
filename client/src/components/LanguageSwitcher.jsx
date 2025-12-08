import React, { useState, useRef, useEffect } from "react";
import { useLanguage } from "../contexts/LanguageContext";
import "./LanguageSwitcher.scss";

const LanguageSwitcher = () => {
	const { currentLanguage, changeLanguage, getAvailableLanguages } =
		useLanguage();
	const [isOpen, setIsOpen] = useState(false);
	const dropdownRef = useRef(null);

	const languages = getAvailableLanguages();
	const currentLang = languages.find((lang) => lang.code === currentLanguage);

	useEffect(() => {
		const handleClickOutside = (event) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
				setIsOpen(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	const handleLanguageChange = (languageCode) => {
		changeLanguage(languageCode);
		setIsOpen(false);
	};

	return (
		<div className="language-switcher" ref={dropdownRef}>
			<button
				className="language-button"
				onClick={() => setIsOpen(!isOpen)}
				aria-label="Change language"
			>
				<svg
					className="world-icon"
					width="20"
					height="20"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
				>
					<circle cx="12" cy="12" r="10"></circle>
					<line x1="2" y1="12" x2="22" y2="12"></line>
					<path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
				</svg>
			</button>

			{isOpen && (
				<div className="language-dropdown">
					{languages.map((language) => (
						<button
							key={language.code}
							className={`language-option ${
								language.code === currentLanguage ? "active" : ""
							}`}
							onClick={() => handleLanguageChange(language.code)}
							title={language.name}
						>
							<span className="language-code">
								{language.code.toUpperCase()}
							</span>
						</button>
					))}
				</div>
			)}
		</div>
	);
};

export default LanguageSwitcher;
