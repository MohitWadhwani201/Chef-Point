import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { recipesApi } from '../api';

function MyRecipes() {
  const [recipes, setRecipes] = useState([]);
  const [editing, setEditing] = useState(null);
  const [editedContent, setEditedContent] = useState('');
  const [loading, setLoading] = useState(false); // 👈 new state

  useEffect(() => {
    fetchRecipes();
  }, []);

  const fetchRecipes = async () => {
    try {
      setLoading(true); // 👈 start loading
      const response = await recipesApi.fetchMyRecipes();
      setRecipes(response.data);
    } catch (error) {
      console.error('Error fetching recipes:', error);
    } finally {
      setLoading(false); // 👈 stop loading
    }
  };

  const deleteRecipe = async (id) => {
    if (!window.confirm('Are you sure?')) return;
    setLoading(true);
    await recipesApi.delete(id);
    await fetchRecipes();
  };

  const startEditing = (r) => {
    setEditing(r);
    setEditedContent(r.editedContent || r.content);
  };

  const cancelEdit = () => {
    setEditing(null);
    setEditedContent('');
  };

  const saveEdit = async () => {
    setLoading(true);
    await recipesApi.update(editing._id, editedContent);
    cancelEdit();
    await fetchRecipes();
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>My Saved Recipes</h1>

      {/* 👇 Show loading indicator */}
      {loading ? (
        <p style={{ fontStyle: 'italic', color: '#555' }}>Loading recipes...</p>
      ) : (
        <div className="recipe-list">
          {recipes.length ? (
            recipes.map((r) => (
              <div key={r._id} className="recipe-card">
                {editing && editing._id === r._id ? (
                  <>
                    <h3>Editing: {r.title}</h3>
                    <textarea
                      className="recipe-editor"
                      value={editedContent}
                      onChange={(e) => setEditedContent(e.target.value)}
                    />
                    <div className="recipe-actions">
                      <button className="btn btn-primary" onClick={saveEdit}>Save</button>
                      <button className="btn btn-secondary" onClick={cancelEdit}>Cancel</button>
                    </div>
                  </>
                ) : (
                  <>
                    <h3>{r.title}</h3>
                    <p><strong>Ingredients:</strong> {r.ingredients.join(', ')}</p>
                    <ReactMarkdown>{r.editedContent || r.content}</ReactMarkdown>
                    <div className="recipe-actions">
                      <button className="btn btn-primary" onClick={() => startEditing(r)}>Edit</button>
                      <button className="btn btn-secondary" onClick={() => deleteRecipe(r._id)}>Delete</button>
                    </div>
                  </>
                )}
              </div>
            ))
          ) : (
            <p>No recipes saved yet!</p>
          )}
        </div>
      )}
    </div>
  );
}

export default MyRecipes;
