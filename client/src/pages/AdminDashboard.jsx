import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import axios from "axios";
import {
	BarChart3,
	Package,
	Users,
	MessageSquare,
	CheckCircle,
	XCircle,
	Clock,
	Search,
	Filter,
	Eye,
	Trash2,
	Shield,
} from "lucide-react";
import "./AdminDashboard.scss";

const AdminDashboard = () => {
	const { user, isAuthenticated, loading: authLoading } = useAuth();
	const { t } = useLanguage();
	const navigate = useNavigate();
	const [activeTab, setActiveTab] = useState("overview");
	const [stats, setStats] = useState(null);
	const [products, setProducts] = useState([]);
	const [users, setUsers] = useState([]);
	const [loading, setLoading] = useState(true);
	const [productsLoading, setProductsLoading] = useState(false);
	const [usersLoading, setUsersLoading] = useState(false);
	const [productsPagination, setProductsPagination] = useState({
		currentPage: 1,
		totalPages: 1,
		total: 0,
	});
	const [usersPagination, setUsersPagination] = useState({
		currentPage: 1,
		totalPages: 1,
		total: 0,
	});
	const [filters, setFilters] = useState({
		status: "",
		category: "",
		search: "",
	});

	// Check if user is admin
	useEffect(() => {
		// Wait for auth context to finish loading
		if (authLoading) {
			return;
		}

		const checkAdminAccess = async () => {
			try {
				const token = localStorage.getItem("token");
				
				// If no token, redirect to login
				if (!token) {
					navigate("/login");
					return;
				}

				// Verify token and get user data
				const response = await axios.get("/api/auth/me", {
					headers: { Authorization: `Bearer ${token}` },
				});

				// Check if user has admin or moderator role
				if (response.data.role !== "admin" && response.data.role !== "moderator") {
					navigate("/");
					return;
				}

				// User is admin/moderator, allow access
				setLoading(false);
			} catch (error) {
				console.error("Error checking admin status:", error);
				// Token invalid or expired, redirect to login
				navigate("/login");
			}
		};

		checkAdminAccess();
	}, [authLoading, isAuthenticated, navigate]);

	// Fetch dashboard stats
	useEffect(() => {
		if (activeTab === "overview") {
			fetchStats();
		}
	}, [activeTab]);

	// Fetch products
	useEffect(() => {
		if (activeTab === "products") {
			fetchProducts();
		}
	}, [activeTab, filters, productsPagination.currentPage]);

	// Fetch users
	useEffect(() => {
		if (activeTab === "users") {
			fetchUsers();
		}
	}, [activeTab, usersPagination.currentPage]);

	const fetchStats = async () => {
		try {
			setLoading(true);
			const token = localStorage.getItem("token");
			const response = await axios.get("/api/admin/stats", {
				headers: { Authorization: `Bearer ${token}` },
			});
			setStats(response.data.stats);
		} catch (error) {
			console.error("Error fetching stats:", error);
		} finally {
			setLoading(false);
		}
	};

	const fetchProducts = async () => {
		try {
			setProductsLoading(true);
			const token = localStorage.getItem("token");
			const params = new URLSearchParams({
				page: productsPagination.currentPage.toString(),
				limit: "20",
			});
			if (filters.status) params.append("status", filters.status);
			if (filters.category) params.append("category", filters.category);
			if (filters.search) params.append("search", filters.search);

			const response = await axios.get(`/api/admin/products?${params}`, {
				headers: { Authorization: `Bearer ${token}` },
			});
			setProducts(response.data.products);
			setProductsPagination(response.data.pagination);
		} catch (error) {
			console.error("Error fetching products:", error);
		} finally {
			setProductsLoading(false);
		}
	};

	const fetchUsers = async () => {
		try {
			setUsersLoading(true);
			const token = localStorage.getItem("token");
			const params = new URLSearchParams({
				page: usersPagination.currentPage.toString(),
				limit: "20",
			});

			const response = await axios.get(`/api/admin/users?${params}`, {
				headers: { Authorization: `Bearer ${token}` },
			});
			setUsers(response.data.users);
			setUsersPagination(response.data.pagination);
		} catch (error) {
			console.error("Error fetching users:", error);
		} finally {
			setUsersLoading(false);
		}
	};

	const handleProductStatusChange = async (productId, newStatus) => {
		try {
			const token = localStorage.getItem("token");
			await axios.patch(
				`/api/admin/products/${productId}/status`,
				{ status: newStatus },
				{
					headers: { Authorization: `Bearer ${token}` },
				}
			);
			fetchProducts();
			if (activeTab === "overview") fetchStats();
		} catch (error) {
			console.error("Error updating product status:", error);
			alert("Failed to update product status");
		}
	};

	const handleDeleteProduct = async (productId) => {
		if (!window.confirm("Are you sure you want to delete this product?")) {
			return;
		}

		try {
			const token = localStorage.getItem("token");
			await axios.delete(`/api/admin/products/${productId}`, {
				headers: { Authorization: `Bearer ${token}` },
			});
			fetchProducts();
			if (activeTab === "overview") fetchStats();
		} catch (error) {
			console.error("Error deleting product:", error);
			alert("Failed to delete product");
		}
	};

	const getStatusBadge = (status) => {
		const statusConfig = {
			active: { label: "Active", color: "green", icon: CheckCircle },
			pending: { label: "Pending", color: "yellow", icon: Clock },
			rejected: { label: "Rejected", color: "red", icon: XCircle },
			inactive: { label: "Inactive", color: "gray", icon: XCircle },
		};

		const config = statusConfig[status] || statusConfig.inactive;
		const Icon = config.icon;

		return (
			<span className={`status-badge status-${config.color}`}>
				<Icon size={14} />
				{config.label}
			</span>
		);
	};

	if (loading && activeTab === "overview") {
		return (
			<div className="admin-dashboard">
				<div className="loading">Loading dashboard...</div>
			</div>
		);
	}

	return (
		<div className="admin-dashboard">
			<div className="admin-header">
				<h1>
					<Shield size={24} />
					Admin Dashboard
				</h1>
			</div>

			<div className="admin-tabs">
				<button
					className={activeTab === "overview" ? "active" : ""}
					onClick={() => setActiveTab("overview")}
				>
					<BarChart3 size={18} />
					Overview
				</button>
				<button
					className={activeTab === "products" ? "active" : ""}
					onClick={() => setActiveTab("products")}
				>
					<Package size={18} />
					Products
				</button>
				<button
					className={activeTab === "users" ? "active" : ""}
					onClick={() => setActiveTab("users")}
				>
					<Users size={18} />
					Users
				</button>
			</div>

			{activeTab === "overview" && stats && (
				<div className="admin-content">
					<div className="stats-grid">
						<div className="stat-card">
							<div className="stat-icon users">
								<Users size={24} />
							</div>
							<div className="stat-info">
								<h3>{stats.totalUsers}</h3>
								<p>Total Users</p>
								<span className="stat-change">+{stats.recentUsers} this week</span>
							</div>
						</div>

						<div className="stat-card">
							<div className="stat-icon products">
								<Package size={24} />
							</div>
							<div className="stat-info">
								<h3>{stats.totalProducts}</h3>
								<p>Total Products</p>
								<span className="stat-change">+{stats.recentProducts} this week</span>
							</div>
						</div>

						<div className="stat-card">
							<div className="stat-icon active">
								<CheckCircle size={24} />
							</div>
							<div className="stat-info">
								<h3>{stats.activeProducts}</h3>
								<p>Active Products</p>
							</div>
						</div>

						<div className="stat-card">
							<div className="stat-icon pending">
								<Clock size={24} />
							</div>
							<div className="stat-info">
								<h3>{stats.pendingProducts}</h3>
								<p>Pending Approval</p>
							</div>
						</div>

						<div className="stat-card">
							<div className="stat-icon messages">
								<MessageSquare size={24} />
							</div>
							<div className="stat-info">
								<h3>{stats.totalMessages}</h3>
								<p>Total Messages</p>
							</div>
						</div>

						<div className="stat-card">
							<div className="stat-icon chats">
								<MessageSquare size={24} />
							</div>
							<div className="stat-info">
								<h3>{stats.totalChats}</h3>
								<p>Active Chats</p>
							</div>
						</div>
					</div>

					{stats.productsByCategory && stats.productsByCategory.length > 0 && (
						<div className="category-stats">
							<h2>Products by Category</h2>
							<div className="category-list">
								{stats.productsByCategory.map((cat) => (
									<div key={cat._id} className="category-item">
										<span className="category-name">{cat._id}</span>
										<span className="category-count">{cat.count}</span>
									</div>
								))}
							</div>
						</div>
					)}
				</div>
			)}

			{activeTab === "products" && (
				<div className="admin-content">
					<div className="filters-bar">
						<div className="filter-group">
							<Search size={18} />
							<input
								type="text"
								placeholder="Search products..."
								value={filters.search}
								onChange={(e) =>
									setFilters({ ...filters, search: e.target.value })
								}
								onKeyPress={(e) => {
									if (e.key === "Enter") {
										setProductsPagination({ ...productsPagination, currentPage: 1 });
										fetchProducts();
									}
								}}
							/>
						</div>
						<select
							value={filters.status}
							onChange={(e) => {
								setFilters({ ...filters, status: e.target.value });
								setProductsPagination({ ...productsPagination, currentPage: 1 });
							}}
						>
							<option value="">All Status</option>
							<option value="active">Active</option>
							<option value="pending">Pending</option>
							<option value="rejected">Rejected</option>
							<option value="inactive">Inactive</option>
						</select>
						<select
							value={filters.category}
							onChange={(e) => {
								setFilters({ ...filters, category: e.target.value });
								setProductsPagination({ ...productsPagination, currentPage: 1 });
							}}
						>
							<option value="">All Categories</option>
							<option value="Vehicles">Vehicles</option>
							<option value="Real Estate">Real Estate</option>
							<option value="Electronics">Electronics</option>
							<option value="Fashion">Fashion</option>
							<option value="Other">Other</option>
						</select>
					</div>

					{productsLoading ? (
						<div className="loading">Loading products...</div>
					) : (
						<>
							<div className="products-table">
								<table>
									<thead>
										<tr>
											<th>Title</th>
											<th>Seller</th>
											<th>Category</th>
											<th>Status</th>
											<th>Price</th>
											<th>Created</th>
											<th>Actions</th>
										</tr>
									</thead>
									<tbody>
										{products.map((product) => (
											<tr key={product._id}>
												<td>
													<div className="product-title">
														{product.images && product.images.length > 0 && (
															<img
																src={product.images[0]}
																alt={product.title}
																className="product-thumb"
															/>
														)}
														<span>{product.title}</span>
													</div>
												</td>
												<td>
													{product.seller?.name || "Unknown"}
													<br />
													<small>{product.seller?.email}</small>
												</td>
												<td>{product.category}</td>
												<td>{getStatusBadge(product.status)}</td>
												<td>
													{product.price
														? `${product.price} ${product.currency || "EUR"}`
														: "N/A"}
												</td>
												<td>
													{new Date(product.createdAt).toLocaleDateString()}
												</td>
												<td>
													<div className="action-buttons">
														<button
															className="btn-view"
															onClick={() =>
																navigate(`/products/${product._id}`)
															}
														>
															<Eye size={16} />
														</button>
														{product.status === "pending" && (
															<button
																className="btn-approve"
																onClick={() =>
																	handleProductStatusChange(
																		product._id,
																		"active"
																	)
																}
															>
																<CheckCircle size={16} />
															</button>
														)}
														{product.status === "active" && (
															<button
																className="btn-reject"
																onClick={() =>
																	handleProductStatusChange(
																		product._id,
																		"inactive"
																	)
																}
															>
																<XCircle size={16} />
															</button>
														)}
														<button
															className="btn-delete"
															onClick={() => handleDeleteProduct(product._id)}
														>
															<Trash2 size={16} />
														</button>
													</div>
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>

							{productsPagination.totalPages > 1 && (
								<div className="pagination">
									<button
										onClick={() =>
											setProductsPagination({
												...productsPagination,
												currentPage: productsPagination.currentPage - 1,
											})
										}
										disabled={productsPagination.currentPage === 1}
									>
										Previous
									</button>
									<span>
										Page {productsPagination.currentPage} of{" "}
										{productsPagination.totalPages}
									</span>
									<button
										onClick={() =>
											setProductsPagination({
												...productsPagination,
												currentPage: productsPagination.currentPage + 1,
											})
										}
										disabled={
											productsPagination.currentPage ===
											productsPagination.totalPages
										}
									>
										Next
									</button>
								</div>
							)}
						</>
					)}
				</div>
			)}

			{activeTab === "users" && (
				<div className="admin-content">
					{usersLoading ? (
						<div className="loading">Loading users...</div>
					) : (
						<>
							<div className="users-table">
								<table>
									<thead>
										<tr>
											<th>Name</th>
											<th>Email</th>
											<th>Role</th>
											<th>Listings</th>
											<th>Joined</th>
											<th>Status</th>
										</tr>
									</thead>
									<tbody>
										{users.map((user) => (
											<tr key={user._id}>
												<td>{user.name}</td>
												<td>{user.email}</td>
												<td>
													<select
														value={user.role}
														onChange={async (e) => {
															try {
																const token = localStorage.getItem("token");
																await axios.patch(
																	`/api/admin/users/${user._id}/role`,
																	{ role: e.target.value },
																	{
																		headers: {
																			Authorization: `Bearer ${token}`,
																		},
																	}
																);
																fetchUsers();
															} catch (error) {
																console.error("Error updating role:", error);
																alert("Failed to update user role");
															}
														}}
													>
														<option value="user">User</option>
														<option value="moderator">Moderator</option>
														<option value="admin">Admin</option>
													</select>
												</td>
												<td>{user.stats?.totalListings || 0}</td>
												<td>
													{new Date(user.createdAt).toLocaleDateString()}
												</td>
												<td>
													{user.isActive ? (
														<span className="status-badge status-green">
															Active
														</span>
													) : (
														<span className="status-badge status-gray">
															Inactive
														</span>
													)}
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>

							{usersPagination.totalPages > 1 && (
								<div className="pagination">
									<button
										onClick={() =>
											setUsersPagination({
												...usersPagination,
												currentPage: usersPagination.currentPage - 1,
											})
										}
										disabled={usersPagination.currentPage === 1}
									>
										Previous
									</button>
									<span>
										Page {usersPagination.currentPage} of{" "}
										{usersPagination.totalPages}
									</span>
									<button
										onClick={() =>
											setUsersPagination({
												...usersPagination,
												currentPage: usersPagination.currentPage + 1,
											})
										}
										disabled={
											usersPagination.currentPage === usersPagination.totalPages
										}
									>
										Next
									</button>
								</div>
							)}
						</>
					)}
				</div>
			)}
		</div>
	);
};

export default AdminDashboard;

