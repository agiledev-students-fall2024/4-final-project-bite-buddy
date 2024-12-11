import "../index.css";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../Home.css";
import ShareRecipe from "../components/ShareRecipe";

function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

const Home = () => {
  const [weeklyActivitiesStats, setWeeklyActivitiesStats] = useState({
    date: new Date(),
    numActivities: 0,
    activityMins: 0,
  });
  const [numRecipesCompleted, setNumRecipesCompleted] = useState(0)
  const [timeSpent, setTimeSpent] = useState(0)
  const [randomRecipes, setRandomRecipes] = useState([]);
  const [share, setShare] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchWeeklyActivitiesData = async () => {
      try {
        const userId = localStorage.getItem('userId');
            const response = await axios.get(`${process.env.REACT_APP_BACK_PORT}/api/user`, { params: { userId } });
        const fetchedData = response.data || [];
        console.log('getting weekly activity')
        console.log(fetchedData)
        let numRecipes = 0;
          fetchedData.recipes.forEach((recipe) => {
            if (recipe.completed === true) {
              numRecipes++;
            }
          });
        
        
        setNumRecipesCompleted(numRecipes)
        console.log(fetchedData.recipes.length)
        
      } catch (error) {
        console.error("Error fetching activities data:", error);
      }
    };

    const fetchRecipeData = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_BACK_PORT}/api/recipes`
        );
        const fetchedData = response.data || [];
        setRandomRecipes(shuffleArray(fetchedData).slice(0, 4));
      } catch (error) {
        console.error("Error fetching recipe data:", error);
      }
    };

    fetchWeeklyActivitiesData();
    fetchRecipeData();
  }, []);

  async function submitShareRecipe(newRecipe) {
    try {
      await axios.post(
        `${process.env.REACT_APP_BACK_PORT}/api/shareRecipe`,
        newRecipe,
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      closeShare();
    } catch (error) {
      console.error(
        "Error submitting recipe:",
        error.response?.data || error.message
      );
    }
  }

  const handleStartRecipe = (selectedRecipe) => {
    
    const formattedRecipe = {
      id: selectedRecipe._id,
      description: selectedRecipe.description,
      name: selectedRecipe.name,
      difficulty_level: selectedRecipe.difficulty_level,
      ingredients: selectedRecipe.ingredients,
      steps: selectedRecipe.steps,
      duration: selectedRecipe.duration,
    };
  
    navigate("/record", { state: { selectedRecipe: formattedRecipe } });
  };

  const handleShareRecipe = () => {
    setShare(true);
  };

  const closeShare = () => {
    setShare(false);
  };

  return (
    <>
      <h1>Home</h1>
      <div className="home-container">
        {/* Activity Section */}
          <div className="activity-card">
          <h3>All-Time Summary</h3>
          <p>
            <strong>Recipes Completed:</strong>{" "}
            {numRecipesCompleted}
          </p>
        </div>
        

        {/* Share Recipe Section */}
        <div className="recipe-card">
          <h2>Share A Recipe</h2>
          <p>
            Sharing a recipe is an opportunity to connect with others, celebrate
            culinary traditions, and foster a sense of community.
          </p>
          <button className="make-recipe-button" onClick={handleShareRecipe}>
            Share Recipe
          </button>
        </div>

        {/* Share Modal */}
        {share && (
          <ShareRecipe
            closeShare={closeShare}
            submitShareRecipe={submitShareRecipe}
          />
        )}

        {/* Suggested Recipes Section */}
        {randomRecipes.length > 0 &&
          randomRecipes.map((recipe, index) => (
            <div key={recipe.id} className="recipe-card">
              <p className="recipe-type">
                Suggested Recipe
              </p>
              <h2>{recipe.name}</h2>
              <p>{recipe.description}</p>
              {/*<div className="recipe-image">
                <img src="https://picsum.photos/100" alt={recipe.name} />
              </div>*/}
              <button
                className="make-recipe-button"
                onClick={() => handleStartRecipe(recipe)}
              >
                Make Recipe
              </button>
            </div>
          ))}
      </div>
    </>
  );
};

export default Home;
