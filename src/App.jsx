import { useState } from "react";
import Header from "./components/Header.jsx";
import Main from "./components/Main.jsx";

export default function App() {
	return (
		<>
			<div className="main">
				<Header />
				<Main />
			</div>
		</>
	);
}
