import mongoose from "mongoose";

const recipeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: false,
  },
  ingredients: [
    {
      type: String,
      required: true,
    },
  ],
  steps: [
    {
      type: {
        type: String,
        required: true,
      },
      duration: {
        type: Number,
        required: false,
      },
    },
  ],
  total_time: {
    type: Number,
    required: true,
  },
  cuisine: {
    type: String,
    required: true,
  },
  difficulty_level: {
    type: Number,
    required: true,
  },
  calories_per_serving: {
    type: Number,
    required: true,
  },
  rating: {
    type: Number,
    required: true,
  },
  isChallenge: {
    type: Boolean,
    required: true,
  },
  image: { type: String, required: false },
});

const recipe = mongoose.model("Recipe", recipeSchema);

export default recipe;
