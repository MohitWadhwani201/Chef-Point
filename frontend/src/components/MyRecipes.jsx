import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';

function MyRecipes() {
  const [recipes, setRecipes] = useState([]);
  const [editingRecipe, setEditingRecipe] = useState(null);
  const [editedContent, setEditedContent] = useState('');

  useEffect(() => {
    fetchRecipes();
  }, []);

  const fetchRecipes = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/recipes/my-recipes');
      setRecipes(response.data);
    } catch (error) {
      console.error('Error fetching recipes:', error);
    }
  };

  const deleteRecipe = async (id) => {
    if (window.confirm('Are you sure you want to delete this recipe?')) {
      try {
        await axios.delete(`http://localhost:5000/api/recipes/${id}`);
        fetchRecipes();
      } catch (error) {
        console.error('Error deleting recipe:', error);
      }
    }
  };

  const startEditing = (recipe) => {
    setEditingRecipe(recipe);
    setEditedContent(recipe.editedContent || recipe.content);
  };

  const saveEdit = async () => {
    try {
      await axios.put(`http://localhost:5000/api/recipes/${editingRecipe._id}`, {
        editedContent
      });
      setEditingRecipe(null);
      fetchRecipes();
    } catch (error) {
      console.error('Error updating recipe:', error);
    }
  };

  const cancelEdit = () => {
    setEditingRecipe(null);
    setEditedContent('');
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>My Saved Recipes</h1>
      <div className="recipe-list">
        {recipes.map((recipe) => (
          <div key={recipe._id} className="recipe-card">
            {editingRecipe && editingRecipe._id === recipe._id ? (
              <div>
                <h3>Editing: {recipe.title}</h3>
                <textarea
                  className="recipe-editor"
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                />
                <div className="recipe-actions">
                  <button className="btn btn-primary" onClick={saveEdit}>
                    Save Changes
                  </button>
                  <button className="btn btn-secondary" onClick={cancelEdit}>
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <h3>{recipe.title}</h3>
                <p><strong>Ingredients used:</strong> {recipe.ingredients.join(', ')}</p>
                <ReactMarkdown>
                  {recipe.editedContent || recipe.content}
                </ReactMarkdown>
                <div className="recipe-actions">
                  <button 
                    className="btn btn-primary"
                    onClick={() => startEditing(recipe)}
                  >
                    Edit Recipe
                  </button>
                  <button 
                    className="btn btn-secondary"
                    onClick={() => deleteRecipe(recipe._id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
        {recipes.length === 0 && (
          <p>No recipes saved yet. Generate some recipes to see them here!</p>
        )}
      </div>
    </div>
  );
}

export default MyRecipes;