import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { validateGenerateRecipe } from "../validators/recipeValidator.js";
import { aiLimiter } from "../middleware/rateLimiter.js";

import { generateRecipe, saveRecipe, getMyRecipes, updateRecipe, deleteRecipe } from "../controller/recipeController.js";

const router = express.Router();

router.post("/generate", authMiddleware, aiLimiter, validateGenerateRecipe, generateRecipe);
router.post("/save", authMiddleware, saveRecipe);
router.get("/my-recipes", authMiddleware, getMyRecipes);
router.put("/:id", authMiddleware, updateRecipe);
router.delete("/:id", authMiddleware, deleteRecipe);

export default router;
