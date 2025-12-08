import React, { useState, useEffect } from "react";
import axios from "axios";

const Users = () => {
	const [users, setUsers] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [success, setSuccess] = useState(null);
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		role: "user",
	});

	useEffect(() => {
		fetchUsers();
	}, []);

	const fetchUsers = async () => {
		try {
			setLoading(true);
			const response = await axios.get("/api/users");
			setUsers(response.data);
			setError(null);
		} catch (err) {
			setError("Failed to fetch users");
			console.error("Error fetching users:", err);
		} finally {
			setLoading(false);
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			setError(null);
			setSuccess(null);

			const response = await axios.post("/api/users", formData);
			setUsers([...users, response.data]);
			setFormData({ name: "", email: "", role: "user" });
			setSuccess("User created successfully!");
		} catch (err) {
			setError(err.response?.data?.error || "Failed to create user");
			console.error("Error creating user:", err);
		}
	};

	const handleChange = (e) => {
		setFormData({
			...formData,
			[e.target.name]: e.target.value,
		});
	};

	return (
		<div className="users-container">
			<h1 className="title">User Management</h1>

			<div className="card">
				<h2>Add New User</h2>
				{error && <div className="error-message">{error}</div>}
				{success && <div className="success-message">{success}</div>}

				<form className="form" onSubmit={handleSubmit}>
					<input
						type="text"
						name="name"
						placeholder="Full Name"
						value={formData.name}
						onChange={handleChange}
						className="input"
						required
					/>
					<input
						type="email"
						name="email"
						placeholder="Email Address"
						value={formData.email}
						onChange={handleChange}
						className="input"
						required
					/>
					<select
						name="role"
						value={formData.role}
						onChange={handleChange}
						className="select"
					>
						<option value="user">User</option>
						<option value="admin">Admin</option>
						<option value="moderator">Moderator</option>
					</select>
					<button type="submit" className="button">
						Add User
					</button>
				</form>
			</div>

			<div className="card">
				<h2>Users List</h2>
				{loading ? (
					<p>Loading users...</p>
				) : (
					<div className="user-list">
						{users.map((user) => (
							<div key={user.id} className="user-card">
								<h3 className="user-name">{user.name}</h3>
								<p className="user-email">{user.email}</p>
								<span className="user-role">{user.role}</span>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
};

export default Users;
