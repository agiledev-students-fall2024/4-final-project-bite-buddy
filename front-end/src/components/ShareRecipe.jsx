import React, { useState } from "react";
import axios from "axios";
import "../Home.css";

function ShareRecipe({ closeShare, submitShareRecipe }) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    ingredients: [""],
    steps: [{ type: "", duration: 0 }],
    cuisine: "",
    difficulty_level: 1,
    calories_per_serving: 0,
    rating: 0,
    total_time: 0,
    isChallenge: false,
    image: null,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const numericFields = [
      "difficulty_level",
      "calories_per_serving",
      "rating",
      "total_time",
    ];

    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: numericFields.includes(name)
        ? value // Keep the value as a string for now
        : type === "checkbox"
        ? checked
        : value,
    }));
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, image: e.target.files[0] });
  };

  const handleArrayChange = (e, index, field) => {
    const newArray = [...formData[field]];
    const { name, value } = e.target;

    if (field === "steps") {
      // Ensure duration can be null but not less than 0
      const parsedValue =
        name === "duration"
          ? value === ""
            ? null
            : Math.max(Number(value), 0)
          : value;

      newArray[index] = {
        ...newArray[index],
        [name]: parsedValue,
      };
    } else {
      // For ingredients, handle simple strings
      newArray[index] = value;
    }

    setFormData({ ...formData, [field]: newArray });
  };

  const addArrayField = (field) => {
    if (field === "steps") {
      setFormData({
        ...formData,
        steps: [...formData.steps, { type: "", duration: 0 }],
      });
    } else {
      setFormData({ ...formData, [field]: [...formData[field], ""] });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const recipeData = new FormData();

    Object.entries(formData).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        if (key === "steps") {
          // Append each step object as a separate field
          value.forEach((item, index) => {
            recipeData.append(`${key}[${index}][type]`, item.type);
            recipeData.append(`${key}[${index}][duration]`, item.duration);
          });
        } else {
          // Append other arrays (e.g., ingredients) as separate fields
          value.forEach((item) => {
            recipeData.append(key, item);
          });
        }
      } else {
        recipeData.append(key, value);
      }
    });

    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACK_PORT}/api/shareRecipe`,
        {
          method: "POST",
          body: recipeData,
        }
      );

      const result = await response.json();
      if (response.ok) {
        console.log("Recipe submitted successfully:", result);
        closeShare();
      } else {
        console.error("Error submitting recipe:", result.message);
      }
    } catch (error) {
      console.error("Error submitting recipe:", error);
    }
  };

  return (
    <div className="share-full-page-card">
      <button className="share-close-button" onClick={closeShare}>
        X
      </button>
      <form className="share-form" onSubmit={handleSubmit}>
        <h1>Share Your Recipe!</h1>
        <div>
          <label>Recipe Name:</label>
          <input
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Description:</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Ingredients:</label>
          {formData.ingredients.map((ingredient, index) => (
            <div key={index}>
              <input
                type="text"
                value={ingredient}
                onChange={(e) => handleArrayChange(e, index, "ingredients")}
                required
              />
            </div>
          ))}
          <button
            className="share-button"
            type="button"
            onClick={() => addArrayField("ingredients")}
          >
            Add Ingredient
          </button>
        </div>
        <div>
          <label>Steps:</label>
          {formData.steps.map((step, index) => (
            <div key={index}>
              <textarea
                name="type"
                value={step.type}
                onChange={(e) => handleArrayChange(e, index, "steps")}
                required
                placeholder="Describe the step"
              />
              <input
                name="duration"
                type="number"
                value={step.duration !== null ? step.duration : ""}
                onChange={(e) => handleArrayChange(e, index, "steps")}
                min="0" // Enforce minimum value of 0
                placeholder="Duration (seconds, optional)"
              />
            </div>
          ))}

          <button
            className="share-button"
            type="button"
            onClick={() => addArrayField("steps")}
          >
            Add Step
          </button>
        </div>
        <div>
          <label>Total Time Approximation (seconds):</label>
          <input
            name="total_time"
            type="number"
            value={formData.total_time}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Cuisine:</label>
          <select
            name="cuisine"
            value={formData.cuisine}
            onChange={handleChange}
            required
          >
            <option value="">Select Cuisine</option>
            <option value="Italian">Italian</option>
            <option value="Mexican">Mexican</option>
            <option value="Indian">Indian</option>
            <option value="Chinese">Chinese</option>
            <option value="Japanese">Japanese</option>
            <option value="French">French</option>
            <option value="Thai">Thai</option>
            <option value="Mediterranean">Mediterranean</option>
          </select>
        </div>
        <div>
          <label>Difficulty Level:</label>
          <select
            name="difficulty_level"
            value={formData.difficulty_level}
            onChange={handleChange}
            required
          >
            <option value="1">1 - Very Easy</option>
            <option value="2">2 - Easy</option>
            <option value="3">3 - Moderate</option>
            <option value="4">4 - Hard</option>
            <option value="5">5 - Very Hard</option>
          </select>
        </div>
        <div>
          <label>Calories Per Serving:</label>
          <input
            name="calories_per_serving"
            type="number"
            value={formData.calories_per_serving}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Recipe Image:</label>
          <input type="file" onChange={handleFileChange} accept="image/*" />
        </div>
        <button className="share-form-submit-button" type="submit">
          Submit
        </button>
      </form>
    </div>
  );
}

export default ShareRecipe;
