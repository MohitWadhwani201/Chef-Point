import React, { useState } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';

function RecipeGenerator() {
  const [ingredients, setIngredients] = useState([]);
  const [currentIngredient, setCurrentIngredient] = useState('');
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const addIngredient = () => {
    if (currentIngredient.trim() && !ingredients.includes(currentIngredient.trim())) {
      setIngredients([...ingredients, currentIngredient.trim()]);
      setCurrentIngredient('');
    }
  };

  const removeIngredient = (index) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const generateRecipe = async () => {
    if (ingredients.length === 0) {
      setError('Please add at least one ingredient');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.post('http://localhost:5000/api/recipes/generate', {
        ingredients
      });
      setRecipe(response.data);
    } catch (error) {
      setError('Failed to generate recipe. Please try again.');
      console.error('Error generating recipe:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveRecipe = async () => {
    if (!recipe) return;

    try {
      await axios.post('http://localhost:5000/api/recipes/save', {
        title: recipe.title,
        ingredients: recipe.ingredients,
        instructions: recipe.instructions,
        content: recipe.content
      });
      alert('Recipe saved successfully!');
    } catch (error) {
      alert('Failed to save recipe');
      console.error('Error saving recipe:', error);
    }
  };

  return (
    <div className="main">
      <div className="header">
        <h1>Recipe Generator</h1>
      </div>

      <div className="add-ingredient">
        <input
          type="text"
          value={currentIngredient}
          onChange={(e) => setCurrentIngredient(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addIngredient()}
          placeholder="Enter an ingredient"
        />
        <button onClick={addIngredient}>Add Ingredient</button>
      </div>

      {ingredients.length > 0 && (
        <section>
          <h2>Your Ingredients:</h2>
          <ul className="ingr-list">
            {ingredients.map((ingredient, index) => (
              <li key={index}>
                {ingredient}
                <button 
                  onClick={() => removeIngredient(index)}
                  style={{ marginLeft: '10px', color: 'red', border: 'none', background: 'none' }}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="get-recipe-container">
        <div>
          <h3>Ready to cook?</h3>
          <p>Get a recipe based on your ingredients</p>
        </div>
        <button onClick={generateRecipe} disabled={loading}>
          {loading ? 'Generating...' : 'Get Recipe'}
        </button>
      </div>

      {error && (
        <div style={{ color: 'red', textAlign: 'center', margin: '20px' }}>
          {error}
        </div>
      )}

      {recipe && (
        <div className="suggested-recipe-container">
          <h2>{recipe.title}</h2>
          <ReactMarkdown>{recipe.content}</ReactMarkdown>
          <div className="recipe-actions">
            <button className="btn btn-primary" onClick={saveRecipe}>
              Save Recipe
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default RecipeGenerator;