import React, { useState } from "react";
import { Link } from "react-router-dom";
import { authApi } from "../api";

function Register({ login }) {
	const [formData, setFormData] = useState({ username: "", email: "", password: "" });
	const [error, setError] = useState("");

	const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			const response = await authApi.register(formData);
			login(response.data.token, response.data.user);
		} catch (err) {
			setError(err.message);
		}
	};

	return (
		<div className="auth-container">
			<form className="auth-form" onSubmit={handleSubmit}>
				<h2>Register</h2>
				{error && <div style={{ color: "red", marginBottom: "1rem" }}>{error}</div>}
				<input
					type="text"
					name="username"
					placeholder="Username"
					value={formData.username}
					onChange={handleChange}
					required
				/>
				<input
					type="email"
					name="email"
					placeholder="Email"
					value={formData.email}
					onChange={handleChange}
					required
				/>
				<input
					type="password"
					name="password"
					placeholder="Password"
					value={formData.password}
					onChange={handleChange}
					required
				/>
				<button type="submit">Register</button>
				<p style={{ textAlign: "center", marginTop: "1rem" }}>
					Already have an account? <Link to="/login">Login</Link>
				</p>
			</form>
		</div>
	);
}

export default Register;
