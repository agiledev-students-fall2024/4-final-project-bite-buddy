import "../index.css";
import "../recipes.css";
import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Timer from "../components/Timer.jsx";
import mongoose from "mongoose";

function Recipes() {
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [recipeData, setRecipeData] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRecipeData = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_BACK_PORT}/api/recipes`
        );

        const formattedData = response.data.map((item) => {
          const imagePath = item.image
            ? `${process.env.REACT_APP_BACK_PORT}/uploads/${item.image
                .split("\\")
                .pop()}`
            : "https://picsum.photos/400";

          return {
            id: item._id,
            description: item.description,
            name: item.name,
            difficulty_level: item.difficulty_level,
            ingredients: item.ingredients,
            steps: item.steps,
            duration: item.duration,
            imgs: imagePath,
          };
        });

        console.log(formattedData); // Log the entire formatted array
        setRecipeData(formattedData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchRecipeData();
  }, []);

  const handleStartClick = (recipeItem) => {
    setSelectedRecipe(recipeItem);
  };

  const close = () => {
    setSelectedRecipe(null);
  };
  const handleStartRecipe = async (selectedRecipe) => {
    // Navigate to the record activity page, passing the recipe data
    console.log("going to recipe id:" + selectedRecipe.id);
    console.log("selectedrecipe is", selectedRecipe);
    try {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");
      const userRecipes = (
        await axios.get(`${process.env.REACT_APP_BACK_PORT}/api/user`, {
          params: {
            userId: userId,
          },
        })
      ).data.recipes;
      console.log("user info", userRecipes);
      if (!userRecipes.some((recipe) => recipe.id === selectedRecipe.id)) {
        await axios.post(
          `${process.env.REACT_APP_BACK_PORT}/api/user/add-recipe`,
          {
            userId,
            userRecipe: {
              _id: new mongoose.Types.ObjectId(),
              id: selectedRecipe.id,
            },
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }

      console.log("User recipes updated successfully");
      navigate("/record", { state: { selectedRecipe } });
    } catch (error) {
      console.error("Error updating user recipes:", error);
      console.error(error.response.data);
    }
  };

  return (
    <>
      <h1 className="centered-header">RECIPES</h1>
      <div className="recipePage">
        <div className="recipeDashboardOuter">
          <div className="recipeDashboardInner">
            {recipeData.map((recipeItem, index) => (
              <div
                className="recipeCard"
                onClick={() => handleStartClick(recipeItem)}
                key={index}
              >
                <div className="recipeImg">
                  <img src={recipeItem.imgs} alt="oops,img problems!" />
                </div>
                <div className="recipeText">
                  <h1>{recipeItem.name}</h1>
                  <p>{recipeItem.description}</p>
                </div>
                <button
                  className="start-button"
                  onClick={() => handleStartRecipe(recipeItem)}
                >
                  START RECIPE
                </button>
              </div>
            ))}
            {selectedRecipe && (
              <div className="popup-overlay" onClick={close}>
                <div
                  className="popup-content"
                  onClick={(e) => e.stopPropagation()}
                >
                  <h1>{selectedRecipe.name}</h1>
                  <h3 style={{ color: "#242424" }}>Ingredients:</h3>
                  <ul className="recipes-ingredients-list">
                    {selectedRecipe.ingredients?.map((ingredient, index) => (
                      <li>{ingredient}</li>
                    ))}
                  </ul>
                  <button
                    className="start-button"
                    onClick={() => handleStartRecipe(selectedRecipe)}
                  >
                    START RECIPE
                  </button>
                  {selectedRecipe.steps.map((step, index) => (
                    <div key={index}>
                      <p>
                        Step {index + 1}: {step.type}{" "}
                        {step.duration ? `(${step.duration} minutes)` : ""}
                      </p>
                    </div>
                  ))}
                </div>
                <button className="close-button" onClick={close}>
                  X
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      {selectedRecipe && (
        <div className="popup-overlay" onClick={close}>
          <div className="popup-content" onClick={(e) => e.stopPropagation()}>
            <h1>{selectedRecipe.name}</h1>
            <h3 style={{ color: "#242424" }}>Ingredients:</h3>
            <ul className="recipes-ingredients-list">
              {selectedRecipe.ingredients?.map((ingredient, index) => (
                <li key={index}>{ingredient}</li>
              ))}
            </ul>
            <button
              className="start-button"
              onClick={() => handleStartRecipe(selectedRecipe)}
            >
              START RECIPE
            </button>
            {selectedRecipe.steps.map((step, index) => (
              <div key={index}>
                <p>
                  Step {index + 1}: {step.type}{" "}
                  {step.duration ? `(${step.duration} minutes)` : ""}
                </p>
              </div>
            ))}
          </div>
          <button className="close-button" onClick={close}>
            X
          </button>
        </div>
      )}
    </>
  );
}

export default Recipes;
