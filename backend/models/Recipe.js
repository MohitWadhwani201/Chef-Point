import mongoose from 'mongoose';

const recipeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  ingredients: [{
    type: String,
    required: true
  }],
  instructions: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isAiGenerated: {
    type: Boolean,
    default: true
  },
  editedContent: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

export default mongoose.model('Recipe', recipeSchema);