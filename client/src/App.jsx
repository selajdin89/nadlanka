import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "./contexts/LanguageContext";
import { AuthProvider } from "./contexts/AuthContext";
import { SocketProvider } from "./contexts/SocketContext";
import { ActiveChatProvider } from "./contexts/ActiveChatContext";
import Header from "./components/Header";
import FavoritesSidebar from "./components/FavoritesSidebar";
import FloatingInbox from "./components/FloatingInbox";
import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import EditProduct from "./pages/EditProduct";
import CreateProduct from "./pages/CreateProduct";
import Profile from "./pages/Profile";
import About from "./pages/About";
import Category from "./pages/Category";
import Favorites from "./pages/Favorites";
import Messages from "./pages/Messages";
import Chat from "./pages/Chat";
import Login from "./components/Login";
import Register from "./components/Register";

function App() {
	const [isFavoritesSidebarOpen, setIsFavoritesSidebarOpen] = useState(false);

	const toggleFavoritesSidebar = () => {
		setIsFavoritesSidebarOpen(!isFavoritesSidebarOpen);
	};

	return (
		<LanguageProvider>
			<AuthProvider>
				<SocketProvider>
					<ActiveChatProvider>
						<Router>
							<div className="app-container">
								<Header onToggleFavorites={toggleFavoritesSidebar} />
								<main className="main-content">
									<Routes>
										<Route path="/" element={<Home />} />
										<Route path="/products" element={<Products />} />
										<Route path="/products/:id" element={<ProductDetail />} />
										<Route path="/edit-product/:id" element={<EditProduct />} />
										<Route
											path="/category/:categorySlug"
											element={<Category />}
										/>
										<Route path="/create-product" element={<CreateProduct />} />
										<Route path="/profile" element={<Profile />} />
										<Route path="/favorites" element={<Favorites />} />
										<Route path="/about" element={<About />} />
										<Route path="/messages" element={<Messages />} />
										<Route path="/chat" element={<Chat />} />
										<Route path="/login" element={<Login />} />
										<Route path="/register" element={<Register />} />
									</Routes>
								</main>
								<FavoritesSidebar
									isOpen={isFavoritesSidebarOpen}
									onClose={() => setIsFavoritesSidebarOpen(false)}
								/>
								<FloatingInbox />
							</div>
						</Router>
					</ActiveChatProvider>
				</SocketProvider>
			</AuthProvider>
		</LanguageProvider>
	);
}

export default App;
