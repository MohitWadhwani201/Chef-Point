import React, { useState, useEffect } from "react";
import { recipesApi } from "../api";

function MyRecipes() {
  const [recipes, setRecipes] = useState([]);
  const [editing, setEditing] = useState(null);
  const [editedContent, setEditedContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchRecipes();
  }, []);

  const fetchRecipes = async () => {
    try {
      setLoading(true);
      const response = await recipesApi.fetchMyRecipes();
      setRecipes(response.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteRecipe = async (id) => {
    if (!window.confirm("Are you sure?")) return;

    try {
      setLoading(true);
      await recipesApi.delete(id);
      await fetchRecipes();
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const startEditing = (r) => {
    setEditing(r);
    setEditedContent(r.editedContent || r.instructions); // ✅ FIX
  };

  const cancelEdit = () => {
    setEditing(null);
    setEditedContent("");
  };

  const saveEdit = async () => {
    try {
      setLoading(true);
      await recipesApi.update(editing._id, editedContent);
      cancelEdit();
      await fetchRecipes();
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>My Saved Recipes</h1>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <p style={{ fontStyle: "italic", color: "#555" }}>Loading recipes...</p>
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
                      <button className="btn btn-primary" onClick={saveEdit}>
                        Save
                      </button>
                      <button className="btn btn-secondary" onClick={cancelEdit}>
                        Cancel
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <h3>{r.title}</h3>

                    <h4>Ingredients</h4>
                    <ul>
                      {r.ingredients.map((i, idx) => (
                        <li key={idx}>{i}</li>
                      ))}
                    </ul>

                    <h4>Instructions</h4>
                    <pre style={{ whiteSpace: "pre-wrap" }}>
                      {r.editedContent || r.instructions}
                    </pre>

                    <div className="recipe-actions">
                      <button
                        className="btn btn-primary"
                        onClick={() => startEditing(r)}
                      >
                        Edit
                      </button>

                      <button
                        className="btn btn-secondary"
                        onClick={() => deleteRecipe(r._id)}
                      >
                        Delete
                      </button>
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
