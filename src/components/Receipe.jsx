import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function Receipe(props) {
	return (
		<>
			<section className="suggested-recipe-container">
				<ReactMarkdown>{props.receipe}</ReactMarkdown>
			</section>
		</>
	);
}
