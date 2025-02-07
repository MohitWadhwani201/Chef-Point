import React from "react";

export default function Ingr(props) {
	const ingrList = props.ingr.map((ingre) => <li key={ingre}>{ingre}</li>);
	return (
		<section>
			<h2>Ingredients on Hands:</h2>
			<ul className="ingr-list">{ingrList}</ul>
			{props.ingr.length > 3 && (
				<div className="get-recipe-container">
					<div>
						<h3>Ready for a recipe?</h3>
						<p>Generate a recipe from your list of ingredients.</p>
					</div>
					<button onClick={props.getReceipe}>Get a recipe</button>
				</div>
			)}
		</section>
	);
}
