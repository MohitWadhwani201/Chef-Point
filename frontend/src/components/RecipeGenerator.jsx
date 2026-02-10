import React, { useState } from "react";
import { recipesApi } from "../api";

function RecipeGenerator() {
  const [ingredients, setIngredients] = useState([]);
  const [currentIngredient, setCurrentIngredient] = useState("");
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const addIngredient = () => {
    const trimmed = currentIngredient.trim();
    if (trimmed && !ingredients.includes(trimmed)) {
      setIngredients([...ingredients, trimmed]);
      setCurrentIngredient("");
    }
  };

  const removeIngredient = (i) =>
    setIngredients(ingredients.filter((_, index) => index !== i));

  const generateRecipe = async () => {
    if (!ingredients.length) return setError("Add at least one ingredient");

    setLoading(true);
    setError("");

    try {
      const response = await recipesApi.generate(ingredients);
      setRecipe(response.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const saveRecipe = async () => {
    if (!recipe) return;

    try {
      await recipesApi.save(recipe);
      alert("Recipe saved successfully!");
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  // ✅ Safe parsing
  const parseRecipe = () => {
    if (!recipe?.content) return null;

    try {
      return typeof recipe.content === "string"
        ? JSON.parse(recipe.content)
        : recipe.content;
    } catch {
      return null;
    }
  };

  const parsed = recipe ? parseRecipe() : null;

  // ✅ Normalize steps (string | object)
  const renderStep = (step) => {
    if (typeof step === "string") return step;
    if (typeof step === "object" && step.instruction) return step.instruction;
    return "";
  };

  return (
    <div className="main">
      <div className="header">
        <h1>Recipe Generator</h1>
      </div>

      <div className="add-ingredient">
        <input
          value={currentIngredient}
          onChange={(e) => setCurrentIngredient(e.target.value)}
          placeholder="Enter an ingredient"
          onKeyDown={(e) => e.key === "Enter" && addIngredient()}
        />
        <button onClick={addIngredient}>Add Ingredient</button>
      </div>

      {ingredients.length > 0 && (
        <ul className="ingr-list">
          {ingredients.map((i, idx) => (
            <li key={idx}>
              {i}
              <button
                onClick={() => removeIngredient(idx)}
                style={{ marginLeft: 10, color: "red", border: "none", background: "none" }}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="get-recipe-container">
        <div>
          <h3>Ready to cook?</h3>
          <p>Get a recipe based on your ingredients</p>
        </div>
        <button onClick={generateRecipe} disabled={loading || !ingredients.length}>
          {loading ? "Generating..." : "Get Recipe"}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {parsed ? (
        <div className="suggested-recipe-container">
          <h2>{parsed.title}</h2>

          <h4>Ingredients</h4>
          <ul>
            {parsed.ingredients.map((i, idx) => (
              <li key={idx}>{i}</li>
            ))}
          </ul>

          <h4>Steps</h4>
          <ol>
            {parsed.steps.map((s, idx) => (
              <li key={idx}>{renderStep(s)}</li>
            ))}
          </ol>

          <div className="recipe-actions">
            <button className="btn btn-primary" onClick={saveRecipe}>
              Save Recipe
            </button>
          </div>
        </div>
      ) : recipe ? (
        <div className="error-message">Recipe format invalid</div>
      ) : null}
    </div>
  );
}

export default RecipeGenerator;
