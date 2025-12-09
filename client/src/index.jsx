import React from "react";
import ReactDOM from "react-dom/client";
import "./index.scss";
import "./config/api"; // Configure API base URL
import App from "./App";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
	<React.StrictMode>
		<App />
	</React.StrictMode>
);
