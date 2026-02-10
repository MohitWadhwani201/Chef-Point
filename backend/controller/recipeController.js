import Recipe from "../models/Recipe.js";
import User from "../models/User.js";
import { generateRecipeFromAI } from "../services/aiService.js";
import { getEmbedding, cosineSimilarity } from "../services/embeddingService.js";
import { validationResult } from "express-validator";

// ================= GENERATE (NO SAVE) =================
export const generateRecipe = async (req, res, next) => {
	try {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			const err = new Error(errors.array()[0].msg);
			err.statusCode = 400;
			return next(err);
		}

		const { ingredients } = req.body;

		if (!Array.isArray(ingredients) || !ingredients.length) {
			const err = new Error("Ingredients must be a non-empty array");
			err.statusCode = 400;
			return next(err);
		}

		// 🔹 Generate embedding
		const embedding = await getEmbedding(ingredients.join(", "));

		// 🔹 Fetch past recipes for similarity
		const past = await Recipe.find({
			user: req.user.userId,
			embedding: { $exists: true, $ne: [] },
		});

		let context = "";
		for (const r of past) {
			const score = cosineSimilarity(embedding, r.embedding);
			if (score > 0.85) context += r.title + "\n";
		}

		// 🔹 Call AI
		const aiResult = await generateRecipeFromAI([...ingredients, context]);

		// ✅ NORMALIZE INGREDIENTS
		const normalizedIngredients = aiResult.ingredients.map((ing) => {
			if (typeof ing === "string") return ing;

			let line = `${ing.quantity} ${ing.item}`;
			if (ing.preparation) line += `, ${ing.preparation}`;
			return line;
		});

		const normalizedRecipe = {
			title: aiResult.title,
			ingredients: normalizedIngredients,
			steps: aiResult.steps,
		};

		// ✅ Return clean + raw
		res.json({
			...normalizedRecipe,
			embedding,
			content: JSON.stringify(normalizedRecipe),
		});
	} catch (e) {
		e.statusCode ||= 500;
		next(e);
	}
};

// ================= SAVE =================
export const saveRecipe = async (req, res, next) => {
	try {
		const { title, ingredients, steps } = req.body;

		if (!title || !Array.isArray(ingredients) || !Array.isArray(steps)) {
			const err = new Error("Invalid recipe data");
			err.statusCode = 400;
			return next(err);
		}

		// ✅ Create HUMAN readable recipe text
		const humanInstructions = `
${title}

Ingredients:
${ingredients.map((i) => `- ${i}`).join("\n")}

Steps:
${steps.map((s, i) => `${i + 1}. ${s}`).join("\n")}
`.trim();

		const recipe = new Recipe({
			title,
			ingredients,

			// 👇 what user edits later
			instructions: humanInstructions,

			// 👇 raw structured version
			content: JSON.stringify({
				title,
				ingredients,
				steps,
			}),

			user: req.user.userId,
			isAiGenerated: true,
		});

		await recipe.save();

		res.status(201).json(recipe);
	} catch (e) {
		e.statusCode ||= 500;
		next(e);
	}
};

// ================= FETCH =================
export const getMyRecipes = async (req, res, next) => {
	try {
		const recipes = await Recipe.find({ user: req.user.userId }).sort({
			createdAt: -1,
		});

		res.json(recipes);
	} catch (e) {
		e.statusCode = 500;
		next(e);
	}
};

// ================= UPDATE =================
export const updateRecipe = async (req, res, next) => {
	try {
		const recipe = await Recipe.findOne({
			_id: req.params.id,
			user: req.user.userId,
		});

		if (!recipe) {
			const err = new Error("Recipe not found");
			err.statusCode = 404;
			return next(err);
		}

		const updatedText = req.body.editedContent;

		if (!updatedText) {
			const err = new Error("No content provided");
			err.statusCode = 400;
			return next(err);
		}

		// ✅ Human readable version
		recipe.instructions = updatedText;

		// ✅ Backup
		recipe.editedContent = updatedText;

		await recipe.save();

		res.json(recipe);
	} catch (e) {
		e.statusCode = 500;
		next(e);
	}
};

// ================= DELETE =================
export const deleteRecipe = async (req, res, next) => {
	try {
		const recipe = await Recipe.findOneAndDelete({
			_id: req.params.id,
			user: req.user.userId,
		});

		if (!recipe) {
			const err = new Error("Recipe not found");
			err.statusCode = 404;
			return next(err);
		}

		res.json({ message: "Deleted" });
	} catch (e) {
		e.statusCode = 500;
		next(e);
	}
};
