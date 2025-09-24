import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { recipesApi } from '../api';

function MyRecipes() {
  const [recipes, setRecipes] = useState([]);
  const [editing, setEditing] = useState(null);
  const [editedContent, setEditedContent] = useState('');

  useEffect(() => { fetchRecipes(); }, []);

  const fetchRecipes = async () => {
    const response = await recipesApi.fetchMyRecipes();
    setRecipes(response.data);
  };

  const deleteRecipe = async (id) => {
    if (!window.confirm('Are you sure?')) return;
    await recipesApi.delete(id);
    fetchRecipes();
  };

  const startEditing = (r) => { setEditing(r); setEditedContent(r.editedContent || r.content); };
  const cancelEdit = () => { setEditing(null); setEditedContent(''); };
  const saveEdit = async () => { await recipesApi.update(editing._id, editedContent); cancelEdit(); fetchRecipes(); };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>My Saved Recipes</h1>
      <div className="recipe-list">
        {recipes.map(r => (
          <div key={r._id} className="recipe-card">
            {editing && editing._id === r._id ? (
              <>
                <h3>Editing: {r.title}</h3>
                <textarea className="recipe-editor" value={editedContent} onChange={(e) => setEditedContent(e.target.value)} />
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
        ))}
        {!recipes.length && <p>No recipes saved yet!</p>}
      </div>
    </div>
  );
}

export default MyRecipes;
