import express, { Request, Response } from 'express';
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import ViteExpress from "vite-express";
import dotenv from "dotenv";
import auth from './auth.js';
import { AuthenticatedRequest } from './auth.js';

dotenv.config();

const app = express();
app.use(express.json());

// Middleware to handle CORS errors
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  next();
});

if (!process.env.MONGODB_URI) {
  console.error("MONGODB_URI environment variable is not defined");
  process.exit(1);
}

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    console.log("Current database:", mongoose.connection.db.databaseName);
  })
  .catch(err => console.error("Could not connect to MongoDB", err));

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  // email: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
  tournaments: Array,
  updatedAt: { type: Date, default: Date.now },
});

const User = mongoose.model("User", userSchema);

const SECRET_KEY = process.env.JWT_SECRET || "RANDOM-TOKEN"; // Use environment variable for JWT secret

app.post("/register", async (req, res) => {
  try {
    const { username, password} = req.body;

    console.log(username, password);

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ username }] });
    console.log(existingUser);
    if (existingUser) {
      return res.status(400).json({ message: "Username already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = new User({
      username,
      password: hashedPassword,
    });

    await newUser.save();

    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    console.error("Error in /register:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ $or: [{ username }] });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user._id }, SECRET_KEY, { expiresIn: "1h" });

    res.json({ token });
  } catch (error) {
    console.error("Error in /login:", error);
    res.status(500).json({ message: "Server error" });
  }
});

ViteExpress.listen(app, 3000, () => {
  console.log("Server is listening on port 3000...");
});


// Free endpoint
app.get("/free-endpoint", (req: express.Request, res: express.Response) => {
  res.json({ message: "You are free to access me anytime" });
});

app.get("/auth-endpoint", auth, (req: AuthenticatedRequest, res: Response) => {
  res.json({ 
    message: "You are authorized to access me",
    user: req.user // Now TypeScript knows that req.user exists
  });
});