import express from 'express';
import jwt from 'jsonwebtoken';
import Recipe from '../models/Recipe.js';
import User from '../models/User.js';
import fetch from 'node-fetch';

const router = express.Router();

// Middleware to verify token
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Get AI-generated recipe

router.post('/generate', auth, async (req, res) => {
  try {
    const { ingredients } = req.body;

    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      return res.status(400).json({ message: 'Ingredients array is required' });
    }

    console.log('Ingredients received:', ingredients);

    const SYSTEM_PROMPT = `
You are an assistant that receives a list of ingredients that a user has and suggests a recipe they could make with some or all of those ingredients. 
You don't need to use every ingredient they mention in your recipe. 
The recipe can include additional ingredients they didn't mention, but try not to include too many extra ingredients. 
Format your response in markdown to make it easier to render to a web page.
`;

    const apiKey = process.env.OPENROUTER_API_KEY;
    const model = "x-ai/grok-4-fast:free";

    // Call OpenRouter Chat Completion
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: `I have ${ingredients.join(', ')}. Please give me a recipe you'd recommend I make!` }
        ]
      }),
    });

    const data = await response.json();

    const recipeContent = data?.choices?.[0]?.message?.content || 'Unable to generate recipe';

    // Extract title from first line
    const title = recipeContent.split('\n')[0].replace('#', '').trim() || 'Generated Recipe';

    // Save to database
    const recipe = new Recipe({
      title,
      ingredients,
      instructions: recipeContent,
      content: recipeContent,
      user: req.user.userId,
      isAiGenerated: true
    });


    res.status(201).json(recipe);
  } catch (error) {
    console.error('Error generating recipe:', error);
    res.status(500).json({ message: 'Error generating recipe', error: error?.message });
  }
});

// Save recipe
router.post('/save', auth, async (req, res) => {
  try {
    const { title, ingredients, instructions, content } = req.body;

    const recipe = new Recipe({
      title,
      ingredients,
      instructions,
      content,
      user: req.user.userId,
      isAiGenerated: false
    });

    await recipe.save();

    // Add to user's saved recipes
    await User.findByIdAndUpdate(req.user.userId, {
      $push: { savedRecipes: recipe._id }
    });

    res.json(recipe);
  } catch (error) {
    res.status(500).json({ message: 'Error saving recipe' });
  }
});

// Get user's recipes
router.get('/my-recipes', auth, async (req, res) => {
  try {
    const recipes = await Recipe.find({ user: req.user.userId })
      .sort({ createdAt: -1 });
    res.json(recipes);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching recipes' });
  }
});

// Update recipe
router.put('/:id', auth, async (req, res) => {
  try {
    const { content, editedContent } = req.body;
    
    const recipe = await Recipe.findOne({ 
      _id: req.params.id, 
      user: req.user.userId 
    });

    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    recipe.editedContent = editedContent || content;
    await recipe.save();

    res.json(recipe);
  } catch (error) {
    res.status(500).json({ message: 'Error updating recipe' });
  }
});

// Delete recipe
router.delete('/:id', auth, async (req, res) => {
  try {
    const recipe = await Recipe.findOneAndDelete({ 
      _id: req.params.id, 
      user: req.user.userId 
    });

    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    // Remove from user's saved recipes
    await User.findByIdAndUpdate(req.user.userId, {
      $pull: { savedRecipes: recipe._id }
    });

    res.json({ message: 'Recipe deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting recipe' });
  }
});

export default router;