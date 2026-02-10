import React, { useState } from "react";
import { Link } from "react-router-dom";
import { authApi } from "../api";

function Login({ login }) {
	const [formData, setFormData] = useState({ email: "", password: "" });
	const [error, setError] = useState("");

	const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			const response = await authApi.login(formData);
			login(response.data.token, response.data.user);
		} catch (err) {
			setError(err.message);
		}
	};

	return (
		<div className="auth-container">
			<form className="auth-form" onSubmit={handleSubmit}>
				<h2>Login</h2>
				{error && <div style={{ color: "red", marginBottom: "1rem" }}>{error}</div>}
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
				<button type="submit">Login</button>
				<p style={{ textAlign: "center", marginTop: "1rem" }}>
					Don't have an account? <Link to="/register">Register</Link>
				</p>
			</form>
		</div>
	);
}

export default Login;
