import express, { Request, Response } from "express";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import ViteExpress from "vite-express";
import dotenv from "dotenv";
import auth from "./auth.js";
import { AuthenticatedRequest } from "./auth.js";

dotenv.config();

const app = express();
app.use(express.json());

// Middleware to handle CORS errors
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization",
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS",
  );
  next();
});

if (!process.env.MONGODB_URI) {
  console.error("MONGODB_URI environment variable is not defined");
  process.exit(1);
}

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    console.log("Current database:", mongoose.connection.db.databaseName);
  })
  .catch((err) => console.error("Could not connect to MongoDB", err));

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
    const { username, password } = req.body;

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

    const token = jwt.sign({ userId: user._id }, SECRET_KEY, {
      expiresIn: "1h",
    });

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
    user: req.user, // Now TypeScript knows that req.user exists
  });
});

app.get(
  "/user-info",
  auth,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      const user = await User.findById(req.user.userId).select("-password");
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({ username: user.username });
    } catch (error) {
      console.error("Error in /user-info:", error);
      res.status(500).json({ message: "Server error" });
    }
  },
);

const bracketSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  type: { type: String, required: true },
  participants: [{ type: String }],
  spectators: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  startingPoints: { type: Number, required: true },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: { type: Date, default: Date.now },
  isOpen: { type: Boolean, default: false },
  status: { type: String, default: "pending" }, // Add this line
  admin: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
});

const Bracket = mongoose.model("Bracket", bracketSchema);

app.post(
  "/create-bracket",
  auth,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      const { name, description, type, participants, startingPoints } = req.body;

      const newBracket = new Bracket({
        name,
        description,
        type,
        participants: participants
          .split("\n")
          .map((p: string) => p.trim())
          .filter((p: string) => p),
        startingPoints: Number(startingPoints),
        createdBy: req.user.userId, // Safe to access req.user.userId here
        admin: req.user.userId,
      });

      await newBracket.save();

      res.status(201).json({
        message: "Bracket created successfully",
        bracketId: newBracket._id,
        canEdit: true,
        canDelete: true,
        canOpen: true
      });
    } catch (error) {
      console.error("Error in /create-bracket:", error);
      res.status(500).json({ message: "Server error" });
    }
  },
);

// Add this new route to fetch all brackets created by the authenticated user
app.get("/brackets", auth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    // Fetch all brackets created by the user
    const brackets = await Bracket.find({ createdBy: req.user.userId }).exec();

    res.json(brackets);
  } catch (error) {
    console.error("Error fetching brackets:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Add this route after the existing bracket-related routes
app.get("/brackets/:id", auth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const bracket = await Bracket.findById(req.params.id).populate('spectators', '_id username');
    if (!bracket) {
      return res.status(404).json({ message: "Bracket not found" });
    }
    res.json({
      bracket: {
        ...bracket.toObject(),
        spectators: bracket.spectators.map((spectator: any) => ({
          _id: spectator._id,
          username: spectator.username
        })),
        admin: bracket.admin
      },
      participants: bracket.participants,
    });
  } catch (error) {
    console.error("Error fetching bracket:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.put("/brackets/:id", auth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const { name, description, type, participants, startingPoints } = req.body;

    const updatedBracket = await Bracket.findByIdAndUpdate(
      req.params.id,
      {
        name,
        description,
        type,
        participants: participants
          .split("\n")
          .map((p: string) => p.trim())
          .filter((p: string) => p),
        startingPoints: Number(startingPoints),
      },
      { new: true } // Return the updated document
    );

    if (!updatedBracket) {
      return res.status(404).json({ message: "Bracket not found" });
    }

    res.json({
      message: "Bracket updated successfully",
      bracketId: updatedBracket._id,
    });
  } catch (error) {
    console.error("Error updating bracket:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.delete("/brackets/:id", auth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const deletedBracket = await Bracket.findByIdAndDelete(req.params.id);

    if (!deletedBracket) {
      return res.status(404).json({ message: "Bracket not found" });
    }

    res.json({ message: "Bracket deleted successfully" });
  } catch (error) {
    console.error("Error deleting bracket:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.put("/brackets/:id/open", auth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const updatedBracket = await Bracket.findByIdAndUpdate(
      req.params.id,
      { $set: { isOpen: true } },
      { new: true }
    );

    if (!updatedBracket) {
      return res.status(404).json({ message: "Bracket not found" });
    }

    res.json({ message: "Bracket opened successfully", bracketId: updatedBracket._id });
  } catch (error) {
    console.error("Error opening bracket:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/brackets/:id/participants", auth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const bracket = await Bracket.findById(req.params.id);
    if (!bracket) {
      return res.status(404).json({ message: "Bracket not found" });
    }
    res.json(bracket.participants);
  } catch (error) {
    console.error("Error fetching participants:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/brackets/:id/start", auth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const bracket = await Bracket.findById(req.params.id);
    if (!bracket) {
      return res.status(404).json({ message: "Bracket not found" });
    }

    // Logic to start the bracket (e.g., setting a status, notifying participants)
    bracket.status = "started"; // Assuming you have a status field
    await bracket.save();

    res.json({ message: "Bracket started successfully", bracketId: bracket._id });
  } catch (error) {
    console.error("Error starting bracket:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/open-brackets", auth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const openBrackets = await Bracket.find({ isOpen: true }).exec(); // Assuming isOpen is a field in your schema
    res.json(openBrackets);
  } catch (error) {
    console.error("Error fetching open brackets:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/brackets/:id/join", auth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const bracket = await Bracket.findById(req.params.id);
    if (!bracket) {
      return res.status(404).json({ message: "Bracket not found" });
    }

    console.log('User:', req.user);
    console.log('Bracket spectators:', bracket.spectators);

    // Check if the user is already a spectator
    if (bracket.spectators.some(spectator => spectator.toString() === req.user!.userId)) {
      return res.status(400).json({ message: "You are already a spectator in this bracket" });
    }

    // Add the user to the spectators list
    bracket.spectators.push(new mongoose.Types.ObjectId(req.user.userId));
    await bracket.save();

    res.json({ message: "Successfully joined the bracket as a spectator", bracketId: bracket._id });
  } catch (error) {
    console.error("Error joining bracket:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.put("/brackets/:id/close", auth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const updatedBracket = await Bracket.findByIdAndUpdate(
      req.params.id,
      { $set: { isOpen: false, spectators: [] } },
      { new: true }
    );

    if (!updatedBracket) {
      return res.status(404).json({ message: "Bracket not found" });
    }

    res.json({ message: "Bracket closed successfully", bracketId: updatedBracket._id });
  } catch (error) {
    console.error("Error closing bracket:", error);
    res.status(500).json({ message: "Server error" });
  }
});