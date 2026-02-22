// List of all cities in North Macedonia (cities only, not municipalities)
export const macedonianCities = [
	{ value: "", label: "Цела Македонија" }, // Default option
	{ value: "Берово", label: "Берово" },
	{ value: "Битола", label: "Битола" },
	{ value: "Валандово", label: "Валандово" },
	{ value: "Велес", label: "Велес" },
	{ value: "Виница", label: "Виница" },
	{ value: "Гевгелија", label: "Гевгелија" },
	{ value: "Гостивар", label: "Гостивар" },
	{ value: "Дебар", label: "Дебар" },
	{ value: "Делчево", label: "Делчево" },
	{ value: "Демир Хисар", label: "Демир Хисар" },
	{ value: "Кавадарци", label: "Кавадарци" },
	{ value: "Кичево", label: "Кичево" },
	{ value: "Кочани", label: "Кочани" },
	{ value: "Кратово", label: "Кратово" },
	{ value: "Крива Паланка", label: "Крива Паланка" },
	{ value: "Крушево", label: "Крушево" },
	{ value: "Куманово", label: "Куманово" },
	{ value: "Македонски Брод", label: "Македонски Брод" },
	{ value: "Неготино", label: "Неготино" },
	{ value: "Охрид", label: "Охрид" },
	{ value: "Прилеп", label: "Прилеп" },
	{ value: "Пробиштип", label: "Пробиштип" },
	{ value: "Радовиш", label: "Радовиш" },
	{ value: "Ресен", label: "Ресен" },
	{ value: "Свети Николе", label: "Свети Николе" },
	{ value: "Скопје", label: "Скопје" },
	{ value: "Струга", label: "Струга" },
	{ value: "Струмица", label: "Струмица" },
	{ value: "Тетово", label: "Тетово" },
	{ value: "Штип", label: "Штип" },
];

// Helper function to get city label
export const getCityLabel = (value, language = "mk") => {
	const city = macedonianCities.find((c) => c.value === value);
	return city ? city.label : value;
};
