import "./config.mjs";
import express from "express";
import multer from "multer";
import axios from "axios";
import cors from "cors";
import { fileURLToPath } from "url";
import { dirname } from "path";
import bodyParser from "body-parser";
import morgan from "morgan";
import authRoutes from "../routes/authRoutes.mjs";
import mongoose from "mongoose";
import keys from "../keys.mjs";
import User from "../models/user.mjs";
import ActivitySchema from "../models/activity.mjs";
import Recipe from "../models/recipe.mjs";
import path from "path";
import {
  validateUser,
  validateRecipe, 
  validateUpdateProfile,
  handleValidationErrors,
} from "../middleware/validators.mjs";

// Set up paths and directories
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Express app
const app = express();
const PORT = process.env.backPORT || 5000;

// MongoDB Connection
mongoose.connect(keys.MONGOURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
mongoose.connection.on("connected", () => console.log("Connected to MongoDB"));
mongoose.connection.on("error", (err) =>
  console.error("MongoDB connection error:", err)
);

// Configure CORS
app.use(
  cors({
    origin: `${process.env.frontPORT}`,
    credentials: true,
  })
);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(morgan("dev"));

// // CORS middleware
// const corsMiddleware = (req, res, next) => {
//   res.setHeader("Access-Control-Allow-Origin", "*"); // Allow requests from any origin
//   res.setHeader(
//     "Access-Control-Allow-Methods",
//     "GET, POST, PUT, DELETE, OPTIONS"
//   ); // Allowed HTTP methods
//   res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization"); // Allowed headers

//   // Handle preflight requests
//   if (req.method === "OPTIONS") {
//     return res.status(204).end();
//   }

//   next();
// };
// app.use(corsMiddleware);
app.use(cors());

// Routes for auth
app.use("/api/auth", authRoutes);

app.use("/uploads", express.static(path.join(__dirname, "../public/uploads")));

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/uploads"); // Upload directory
  },
  filename: function (req, file, cb) {
    const extension = path.extname(file.originalname);
    const basenameWithoutExtension = path.basename(
      file.originalname,
      extension
    );
    const newName = `${basenameWithoutExtension}-${Date.now()}-${Math.random()
      .toString(36)
      .substring(2)}${extension}`;
    cb(null, newName);
  },
});

const upload = multer({ storage });

// File upload API
app.post("/api/upload-recipe-image", upload.single("my_file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      status: "error",
      message: "No file uploaded",
    });
  }

  // Check if the uploaded file is an image
  const allowedMimeTypes = ["image/jpeg", "image/png", "image/gif"];
  if (!allowedMimeTypes.includes(req.file.mimetype)) {
    return res.status(400).json({
      status: "error",
      message: "Invalid file type. Only images are allowed.",
    });
  }

  res.status(200).json({
    status: "success",
    message: "File uploaded successfully",
    file: req.file,
  });
});

// Example API for recipe sharing
app.post("/api/shareRecipe", upload.single("image"), async (req, res) => {
  try {
    // Extract the uploaded image's path if it exists
    const imagePath = req.file ? req.file.path : null;

    // Merge form data and the image path
    const newRecipeData = { ...req.body, image: imagePath };

    // Create and save the new recipe
    const newRecipe = new Recipe(newRecipeData);
    await newRecipe.save();

    res.status(200).json({ message: "Share Successful", newRecipe });
  } catch (error) {
    console.error("Error sharing recipe:", error.message);
    res.status(400).json({ message: error.message });
  }
});

app.get("/api/recipes", async (req, res) => {
  try {
    const recipes = await Recipe.find();
    res.status(200).json(recipes);
  } catch (error) {
    console.error("Error fetching recipes:", error.message);
    res.status(500).json({ error: "Failed to fetch recipes" });
  }
});

app.get("/api/challenges", async (req, res) => {
  try {
    const mockError = process.env.MOCK_ERROR === "true";
    if (mockError) {
      throw new Error("Forced error for testing");
    }
    const data = await Recipe.find({ isChallenge: true });
    res.json(data);
  } catch (error) {
    console.error("Error fetching data from API:", error.message);
    res.status(500).json({ error: "Failed to fetch activity tracker data" });
  }
});
app.get("/api/weeklyactivity", async (req, res) => {
  try {
    if (process.env.MOCK_ERROR === "true") {
      throw new Error("Mocked error");
    }
    const thisUserId = req.query.userId;

    if (!thisUserId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    // Fetch the user based on the userId
    const user = await User.findById(thisUserId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error("Error fetching data from API:", error.message);
    res.status(500).json({ error: "Failed to fetch user data" });
  }
});

app.get("/api/user", async (req, res) => {
  try {
    if (process.env.MOCK_ERROR === "true") {
      throw new Error("Mocked error");
    }

    // Access the userId from the query string
    const thisUserId = req.query.userId;

    if (!thisUserId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    // Fetch the user based on the userId
    const user = await User.findById(thisUserId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Error fetching data from API:", error.message);
    res.status(500).json({ error: "Failed to fetch user data" });
  }
});

/*app.get("/api/biteBuddyProfile", async (req, res) => {
  try {
    const { data } = await axios.get(
      "https://my.api.mockaroo.com/bite_buddy_profile.json?key=786e37d0"
    );
    res.json(data);
  } catch (error) {
    console.error("Error fetching data from API:", error.message);
    res.status(500).json({ error: "Failed to fetch bite buddy profile data" });
  }
});*/

// NOT TESTED YET because route is not used yet
app.post(
  "/api/user/add-recipe",
  validateRecipe, // Validate recipe data
  handleValidationErrors, // Handle validation errors
  async (req, res) => {
    try {
      const { userId, userRecipe } = req.body;

      // Validate if user exists
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $push: { recipes: userRecipe } },
        { new: true }
      );
      console.log(updatedUser)
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      res.status(200).json(updatedUser);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update user recipe list" });
    }
  }
);

/*app.post("/api/user/add-recipe", async (req, res) => {
  try {
    const { userId, userRecipe } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $push: { recipes: userRecipe } },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Failed to update user recipe list" });
  }
});*/

app.put("/api/user/complete-recipe", async (req, res) => {
  console.log("route hit");
  try {
    const { userId, recipeId } = req.body;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    let recipe = user.recipes.find((r) => r.id.toString() === recipeId);
    console.log("recipeId is, ", recipeId);
    if (!recipe) {
      recipe = {
        id: recipeId,
        completed: true,
      };
      user.recipes.push(recipe);
    }

    recipe["completed"] = true;

    await user.save();
    res.json({
      message: "Recipe completed successfully",
      updatedRecipe: recipe,
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Failed to update user recipe list" });
  }
});

app.put(
  "/api/update-profile",
  validateUpdateProfile,
  handleValidationErrors,
  async (req, res) => {
    try {
      const { userId, firstName, lastName, age, location, bio } = req.body;
      const updateFields = {};
      if (firstName) updateFields.first_name = firstName;
      if (lastName) updateFields.last_name = lastName;
      if (age) updateFields.age = age;
      if (location) updateFields.location = location;
      if (bio !== undefined && bio !== '') updateFields.bio = bio;
      if (Object.keys(updateFields).length === 0) {
        return res.status(400).json({ message: "No fields provided for update" });
      }
      const updatedUser = await User.findByIdAndUpdate(userId, updateFields, {
        new: true, 
        runValidators: true,
      });
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      res.status(200).json(updatedUser);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Server error while updating profile" });
    }
  }
);


/// Start the server
export const startServer = () => {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
};

startServer();

export default app;
