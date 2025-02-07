import React from "react";

import { Receipe } from "./Receipe";
import Ingr from "./Ingr";
import { getRecipeFromMistral } from "../ai";

export default function Main() {
	var [ingr, setIngr] = React.useState([]);
	const [receipe, setReceipe] = React.useState("");
	function submit(event) {
		event.preventDefault();
		const formData = new FormData(event.currentTarget);
		const newIngredient = formData.get("input-field");
		setIngr((prev) => [...prev, newIngredient]);
	}

	async function getReceipe() {
		const receipeGiven = await getRecipeFromMistral(ingr);
		setReceipe(receipeGiven);
	}

	return (
		<>
			<form className="add-ingredient" name="form" onSubmit={submit}>
				<input
					type="text"
					placeholder="eg. butter"
					aria-label="Add Ingredients"
					id="input-field"
					name="input-field"
				/>
				<button>+ Add Ingredient</button>
			</form>
			{ingr.length > 0 && <Ingr getReceipe={getReceipe} ingr={ingr} />}
			{receipe && <Receipe receipe={receipe} />}
		</>
	);
}
