import { body } from "express-validator";

export const validateGenerateRecipe = [body("ingredients").isArray({ min: 1 }).withMessage("Ingredients must be a non-empty array")];
