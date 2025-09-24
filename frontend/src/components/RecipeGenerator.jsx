import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { recipesApi } from '../api';

function RecipeGenerator() {
  const [ingredients, setIngredients] = useState([]);
  const [currentIngredient, setCurrentIngredient] = useState('');
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const addIngredient = () => {
    const trimmed = currentIngredient.trim();
    if (trimmed && !ingredients.includes(trimmed)) {
      setIngredients([...ingredients, trimmed]);
      setCurrentIngredient('');
    }
  };

  const removeIngredient = (i) => setIngredients(ingredients.filter((_, index) => index !== i));

  const generateRecipe = async () => {
    if (!ingredients.length) return setError('Add at least one ingredient');
    setLoading(true);
    setError('');
    try {
      const response = await recipesApi.generate(ingredients);
      setRecipe(response.data);
    } catch (err) {
      setError('Failed to generate recipe');
    } finally {
      setLoading(false);
    }
  };

  const saveRecipe = async () => {
    if (!recipe) return;
    try {
      await recipesApi.save(recipe);
      alert('Recipe saved successfully!');
    } catch {
      alert('Failed to save recipe');
    }
  };

  return (
    <div className="main">
      <div className="header"><h1>Recipe Generator</h1></div>

      <div className="add-ingredient">
        <input value={currentIngredient} onChange={(e) => setCurrentIngredient(e.target.value)} placeholder="Enter an ingredient" onKeyPress={(e) => e.key === 'Enter' && addIngredient()} />
        <button onClick={addIngredient}>Add Ingredient</button>
      </div>

      {ingredients.length > 0 && (
        <ul className="ingr-list">
          {ingredients.map((i, idx) => (
            <li key={idx}>
              {i}
              <button onClick={() => removeIngredient(idx)} style={{ marginLeft: 10, color: 'red', border: 'none', background: 'none' }}>×</button>
            </li>
          ))}
        </ul>
      )}

      <div className="get-recipe-container">
        <div>
          <h3>Ready to cook?</h3>
          <p>Get a recipe based on your ingredients</p>
        </div>
        <button onClick={generateRecipe} disabled={loading}>{loading ? 'Generating...' : 'Get Recipe'}</button>
      </div>

      {error && <div style={{ color: 'red', textAlign: 'center', margin: '20px' }}>{error}</div>}

      {recipe && (
        <div className="suggested-recipe-container">
          <h2>{recipe.title}</h2>
          <ReactMarkdown>{recipe.content}</ReactMarkdown>
          <div className="recipe-actions">
            <button className="btn btn-primary" onClick={saveRecipe}>Save Recipe</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default RecipeGenerator;
