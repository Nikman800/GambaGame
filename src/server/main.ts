import express, { Request, Response } from "express";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import ViteExpress from "vite-express";
import dotenv from "dotenv";
import auth from "./auth.js";
import { AuthenticatedRequest } from "./auth.js";
import { Server } from "socket.io";
import http from "http";
import { Socket } from "socket.io";

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

// ViteExpress.listen(app, 3000, () => {
//   console.log("Server is listening on port 3000...");
// });

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
  originalParticipants: [{ type: String }], // Add this line
  spectators: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  gamblers: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      points: { type: Number, required: true },
    },
  ],
  startingPoints: { type: Number, required: true },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: { type: Date, default: Date.now },
  isOpen: { type: Boolean, default: false },
  status: { type: String, default: "pending" }, // Add this line
  admin: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  currentMatch: {
    player1: String,
    player2: String,
  },
  bets: [
    {
      gambler: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      player: { type: String, required: true },
      amount: { type: Number, required: true },
    },
  ],
  bettingPhase: { type: Boolean, default: true },
  matchResults: {
    type: [{ round: Number, match: Number, winner: String }],
    default: [],
  },
  currentRound: { type: Number, default: 1 },
  currentMatchNumber: { type: Number, default: 0 },
  finalResults: [{
    bracketWinner: String,
    spectatorResults: [{
      username: String,
      points: Number
    }],
    finalBracket: {
      participants: [String],
      matchResults: [{
        round: Number,
        match: Number,
        winner: String
      }]
    },
    hasSpectators: Boolean,
    completedAt: { type: Date, default: Date.now }
  }]
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

      const { name, description, type, participants, startingPoints } =
        req.body;

      const participantsList = participants
        .split("\n")
        .map((p: string) => p.trim())
        .filter((p: string) => p);

      const newBracket = new Bracket({
        name,
        description,
        type,
        participants: participantsList,
        originalParticipants: participantsList,
        startingPoints: Number(startingPoints),
        createdBy: req.user.userId,
        admin: req.user.userId,
        matchResults: [],
        currentRound: 1,
        currentMatchNumber: 0,
        status: "created",
      });

      await newBracket.save();

      res.status(201).json({
        message: "Bracket created successfully",
        bracketId: newBracket._id,
        canEdit: true,
        canDelete: true,
        canOpen: true,
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
app.get(
  "/brackets/:id",
  auth,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const bracket = await Bracket.findById(req.params.id)
        .populate("spectators", "_id username")
        .populate("gamblers.user", "_id username");
      if (!bracket) {
        return res.status(404).json({ message: "Bracket not found" });
      }
      res.json({
        bracket: {
          ...bracket.toObject(),
          spectators: bracket.spectators.map((spectator: any) => ({
            _id: spectator._id,
            username: spectator.username,
          })),
          gamblers: bracket.gamblers.map((gambler: any) => ({
            _id: gambler.user._id,
            username: gambler.user.username,
            points: gambler.points,
          })),
          admin: bracket.admin,
        },
        participants: bracket.participants,
      });
    } catch (error) {
      console.error("Error fetching bracket:", error);
      res.status(500).json({ message: "Server error" });
    }
  },
);

app.put("/brackets/:id", auth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const { name, description, type, participants, originalParticipants, startingPoints } = req.body;

    const updatedBracket = await Bracket.findByIdAndUpdate(
      req.params.id,
      {
        name,
        description,
        type,
        participants,
        originalParticipants,
        startingPoints: Number(startingPoints),
      },
      { new: true }
    );

    if (!updatedBracket) {
      return res.status(404).json({ message: "Bracket not found" });
    }

    res.json({
      message: "Bracket updated successfully",
      bracketId: updatedBracket._id,
    });
  } catch (error) {
    console.error("Error in /brackets/:id:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.delete(
  "/brackets/:id",
  auth,
  async (req: AuthenticatedRequest, res: Response) => {
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
  },
);

app.put(
  "/brackets/:id/open",
  auth,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const updatedBracket = await Bracket.findByIdAndUpdate(
        req.params.id,
        { $set: { isOpen: true } },
        { new: true },
      );

      if (!updatedBracket) {
        return res.status(404).json({ message: "Bracket not found" });
      }

      res.json({
        message: "Bracket opened successfully",
        bracketId: updatedBracket._id,
      });
    } catch (error) {
      console.error("Error opening bracket:", error);
      res.status(500).json({ message: "Server error" });
    }
  },
);

app.get(
  "/brackets/:id/participants",
  auth,
  async (req: AuthenticatedRequest, res: Response) => {
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
  },
);

function manageBracketRounds(bracket: any): { currentMatch: { player1: string, player2: string } | null, isCompleted: boolean } {
  console.log('Managing bracket rounds...');
  
  // If it's the first round, reset participants to originalParticipants
  if (bracket.currentRound === 1 && bracket.currentMatchNumber === 0) {
    bracket.participants = [...bracket.originalParticipants];
  }

  console.log('Current participants:', bracket.participants);
  console.log('Current match results:', bracket.matchResults);

  const currentRoundWinners: string[] = [];
  const matchesPerRound = Math.floor(bracket.participants.length / Math.pow(2, bracket.currentRound - 1) / 2);
  console.log('Matches per round:', matchesPerRound);

  // Process current round results
  bracket.matchResults.forEach((result: { round: number, winner: string }) => {
    if (result.round === bracket.currentRound) {
      currentRoundWinners.push(result.winner);
    }
  });

  console.log('Current round winners:', currentRoundWinners);

  // Check if the tournament is completed
  const totalRounds = Math.ceil(Math.log2(bracket.originalParticipants.length));
  if (bracket.currentRound === totalRounds && currentRoundWinners.length === 1) {
    console.log('Tournament completed. Winner:', currentRoundWinners[0]);
    return { currentMatch: null, isCompleted: true };
  }

  // Check if we need to move to the next round
  if (currentRoundWinners.length === matchesPerRound) {
    bracket.currentRound++;
    bracket.currentMatchNumber = 0;
    bracket.participants = currentRoundWinners;
    console.log('Moving to next round:', bracket.currentRound);
  }

  const remainingParticipants = bracket.participants;
  console.log('Remaining participants:', remainingParticipants);

  if (remainingParticipants.length > 1) {
    const nextMatchIndex = bracket.currentMatchNumber * 2;
    const currentMatch = {
      player1: remainingParticipants[nextMatchIndex],
      player2: remainingParticipants[nextMatchIndex + 1] || 'BYE'
    };
    console.log('Next match:', currentMatch);
    bracket.currentMatchNumber++;
    return { currentMatch, isCompleted: false };
  } else {
    console.log('No more matches to play');
    return { currentMatch: null, isCompleted: true };
  }
}

app.post(
  "/brackets/:id/start",
  auth,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const bracket = await Bracket.findById(req.params.id);
      if (!bracket) {
        return res.status(404).json({ message: "Bracket not found" });
      }

      // Reset bracket state
      bracket.matchResults.splice(0, bracket.matchResults.length);
      bracket.currentRound = 1;
      bracket.currentMatchNumber = 0;
      bracket.status = "started";
      bracket.bettingPhase = true;
      bracket.participants = [...bracket.originalParticipants]; // Reset participants

      const { currentMatch, isCompleted } = manageBracketRounds(bracket);
      bracket.currentMatch = currentMatch;

      await bracket.save();

      io.to(bracket._id.toString()).emit("bracketStarted", {
        bracketId: bracket._id,
        match: bracket.currentMatch,
        bettingPhase: true,
        bracketName: bracket.name,
        currentRound: 1,
      });

      res.json({
        message: "Bracket started successfully",
        bracketId: bracket._id,
      });
    } catch (error) {
      console.error("Error starting bracket:", error);
      res.status(500).json({ message: "Server error" });
    }
  },
);

app.get(
  "/open-brackets",
  auth,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const openBrackets = await Bracket.find({ isOpen: true }).exec(); // Assuming isOpen is a field in your schema
      res.json(openBrackets);
    } catch (error) {
      console.error("Error fetching open brackets:", error);
      res.status(500).json({ message: "Server error" });
    }
  },
);

app.post(
  "/brackets/:id/join",
  auth,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      const bracket = await Bracket.findById(req.params.id);
      if (!bracket) {
        return res.status(404).json({ message: "Bracket not found" });
      }

      // Check if the user is the admin
      if (bracket.admin.toString() === req.user!.userId) {
        return res
          .status(400)
          .json({ message: "Admin cannot join their own bracket" });
      }

      // Check if the user is already a spectator or gambler
      const isSpectator = bracket.spectators.some(
        (spectator) => spectator.toString() === req.user!.userId,
      );
      const isGambler = bracket.gamblers.some(
        (gambler) =>
          gambler.user && gambler.user.toString() === req.user!.userId,
      );

      if (!isSpectator) {
        // Add the user to the spectators list
        bracket.spectators.push(new mongoose.Types.ObjectId(req.user.userId));
      }

      if (!isGambler) {
        // Add the user to the gamblers list with starting points
        bracket.gamblers.push({
          user: new mongoose.Types.ObjectId(req.user.userId),
          points: bracket.startingPoints,
        });
      }

      if (!isSpectator || !isGambler) {
        await bracket.save();
        const updatedBracket = await Bracket.findById(bracket._id)
          .populate("spectators", "_id username")
          .populate("gamblers.user", "_id username");

        if (updatedBracket) {
          io.to(bracket._id.toString()).emit("bracketUpdated", {
            spectators: updatedBracket.spectators,
            gamblers: updatedBracket.gamblers,
          });
        } else {
          console.error("Failed to fetch updated bracket");
        }
      }

      res.json({
        message: "Successfully joined the bracket",
        bracketId: bracket._id,
      });
    } catch (error) {
      console.error("Error joining bracket:", error);
      res.status(500).json({ message: "Server error" });
    }
  },
);

app.put(
  "/brackets/:id/end",
  auth,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      const bracket = await Bracket.findById(req.params.id);
      if (!bracket) {
        return res.status(404).json({ message: "Bracket not found" });
      }

      // Check if the user is the admin of the bracket
      if (bracket.admin.toString() !== req.user.userId) {
        return res
          .status(403)
          .json({ message: "You are not authorized to end this bracket" });
      }

      // Reset pertinent data
      bracket.status = "completed";
      bracket.currentMatch = null;
      bracket.$set("bets", []);
      bracket.gamblers.forEach((gambler) => {
        gambler.points = bracket.startingPoints;
      });
      bracket.bettingPhase = false;
      bracket.isOpen = false;
      bracket.participants = [...bracket.originalParticipants]; // Reset participants to original list
      bracket.currentRound = 1;
      bracket.currentMatchNumber = 0;
      bracket.$set('matchResults', []);
      await bracket.save();

      io.to(bracket._id.toString()).emit("bracketEnded", {
        message: "The bracket has ended",
        bracketId: bracket._id,
        participants: bracket.participants,
      });

      res.json({
        message: "Bracket ended successfully",
        bracketId: bracket._id,
        participants: bracket.participants,
      });
    } catch (error) {
      console.error("Error ending bracket:", error);
      res.status(500).json({ message: "Server error" });
    }
  },
);

app.post(
  "/brackets/:id/bet",
  auth,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      const { player, amount } = req.body;
      const bracket = await Bracket.findById(req.params.id);

      if (!bracket) {
        return res.status(404).json({ message: "Bracket not found" });
      }

      const gambler = bracket.gamblers.find(
        (g) => g.user && g.user.toString() === req.user!.userId,
      );

      if (!gambler) {
        return res
          .status(400)
          .json({ message: "You are not a gambler in this bracket" });
      }

      if (gambler.points < amount) {
        return res.status(400).json({ message: "Insufficient points" });
      }

      gambler.points -= amount;
      bracket.bets.push({ gambler: req.user.userId, player, amount });

      await bracket.save();

      io.to(bracket._id.toString()).emit("betPlaced", {
        gamblerId: req.user.userId,
        player,
        amount,
      });

      res.json({ message: "Bet placed successfully" });
    } catch (error) {
      console.error("Error placing bet:", error);
      res.status(500).json({ message: "Server error" });
    }
  },
);

app.get(
  "/brackets/:id/bets",
  auth,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const bracket = await Bracket.findById(req.params.id).populate(
        "bets.gambler",
        "username",
      );

      if (!bracket) {
        return res.status(404).json({ message: "Bracket not found" });
      }

      const totalBets = bracket.bets.reduce(
        (acc, bet) => {
          if (bet.player && bet.amount) {
            acc[bet.player] = (acc[bet.player] || 0) + bet.amount;
          }
          return acc;
        },
        {} as Record<string, number>,
      );

      const odds: Record<string, number> = {};
      if (
        bracket.currentMatch &&
        bracket.currentMatch.player1 &&
        bracket.currentMatch.player2
      ) {
        const player1Bets = totalBets[bracket.currentMatch.player1] || 0;
        const player2Bets = totalBets[bracket.currentMatch.player2] || 0;
        odds[bracket.currentMatch.player1] = player2Bets / player1Bets + 1 || 1;
        odds[bracket.currentMatch.player2] = player1Bets / player2Bets + 1 || 1;
      }

      res.json({ bets: bracket.bets, totalBets, odds });
    } catch (error) {
      console.error("Error fetching bets:", error);
      res.status(500).json({ message: "Server error" });
    }
  },
);

app.post("/brackets/:id/match-result", auth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const { winner } = req.body;
    const bracket = await Bracket.findById(req.params.id);

    if (!bracket) {
      return res.status(404).json({ message: "Bracket not found" });
    }

    console.log('Processing match result...');
    console.log('Current round:', bracket.currentRound);
    console.log('Current match number:', bracket.currentMatchNumber);
    console.log('Winner:', winner);

    // Add match result
    bracket.matchResults.push({
      round: bracket.currentRound,
      match: bracket.currentMatchNumber,
      winner
    });

    // Manage next round
    const { currentMatch, isCompleted } = manageBracketRounds(bracket);
    bracket.currentMatch = currentMatch;

    if (isCompleted) {
      bracket.status = 'completed';
      console.log('Bracket completed');
      io.to(bracket._id.toString()).emit('bracketEnded', {
        message: "Bracket has ended",
        bracketId: bracket._id.toString(),
        finalResults: {
          bracketWinner: winner,
          finalBracket: {
            participants: bracket.originalParticipants,
            matchResults: bracket.matchResults
          }
        }
      });
    } else {
      io.to(bracket._id.toString()).emit('matchEnded', {
        winner,
        nextMatch: bracket.currentMatch,
        currentRound: bracket.currentRound,
        currentMatchNumber: bracket.currentMatchNumber,
        bettingPhase: true  // Set this to true for the next match's betting phase
      });
    }

    await bracket.save();

    res.json({ message: "Match result processed successfully", nextMatch: bracket.currentMatch, isCompleted: isCompleted });
  } catch (error) {
    console.error("Error processing match result:", error);
    res.status(500).json({ message: "Server error" });
  }
});

const server = http.createServer(app);
const io = new Server(server);

io.on("connection", (socket) => {
  console.log("New client connected");

  socket.on("startBracket", (data) => {
    io.emit("bracketStarted", data);
  });

  socket.on("startMatch", (data) => {
    io.emit("matchStarted", data);
  });

  socket.on("matchResult", (data) => {
    io.emit("matchEnded", data);
  });

  socket.on("joinBracket", (bracketId) => {
    socket.join(bracketId);
  });

  socket.on("leaveBracket", (bracketId) => {
    socket.leave(bracketId);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

// Replace app.listen with server.listen
server.listen(3001, () => {
  console.log("Server is running on port 3001");
});

app.get(
  "/brackets/:id/admin-status",
  auth,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      const bracket = await Bracket.findById(req.params.id);
      if (!bracket) {
        return res.status(404).json({ message: "Bracket not found" });
      }

      const isAdmin = bracket.admin.toString() === req.user.userId;
      res.json({ isAdmin });
    } catch (error) {
      console.error("Error checking admin status:", error);
      res.status(500).json({ message: "Server error" });
    }
  },
);

app.post(
  "/brackets/:id/simulate",
  auth,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      const bracket = await Bracket.findById(req.params.id);
      if (!bracket) {
        return res.status(404).json({ message: "Bracket not found" });
      }

      // Check if the user is the admin of the bracket
      if (bracket.admin.toString() !== req.user.userId) {
        return res
          .status(403)
          .json({ message: "You are not authorized to simulate this bracket" });
      }

      // Implement your bracket simulation logic here
      // This is a placeholder for the actual simulation logic
      bracket.status = "completed";
      await bracket.save();

      io.to(bracket._id.toString()).emit("bracketSimulated", {
        message: "The bracket has been simulated",
        bracketId: bracket._id,
      });

      res.json({
        message: "Bracket simulated successfully",
        bracketId: bracket._id,
      });
    } catch (error) {
      console.error("Error simulating bracket:", error);
      res.status(500).json({ message: "Server error" });
    }
  },
);

app.post(
  "/brackets/:id/start-match",
  auth,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const bracket = await Bracket.findById(req.params.id);
      if (!bracket) {
        return res.status(404).json({ message: "Bracket not found" });
      }

      bracket.bettingPhase = false;
      await bracket.save();

      io.to(bracket._id.toString()).emit("matchStarted", {
        bracketId: bracket._id,
        match: bracket.currentMatch,
      });

      res.json({
        message: "Match started successfully",
        bracketId: bracket._id,
      });
    } catch (error) {
      console.error("Error starting match:", error);
      res.status(500).json({ message: "Server error" });
    }
  },
);

app.get('/brackets/:id/final-results', auth, async (req: AuthenticatedRequest, res: Response) => {
  console.log('Received request for bracket final results:', req.params.id);
  try {
    const bracket = await Bracket.findById(req.params.id).populate('spectators');
    console.log('Found bracket:', bracket);
    if (!bracket) {
      return res.status(404).json({ message: "Bracket not found" });
    }

    console.log('Bracket status:', bracket.status);
    console.log('Bracket participants:', bracket.participants);
    console.log('Bracket spectators:', bracket.spectators);
    console.log('Bracket match results:', bracket.matchResults);

    const spectatorResults = bracket.spectators.map((spectator: any) => ({
      username: spectator.username,
      points: spectator.points
    })).sort((a: any, b: any) => b.points - a.points);

    const finalMatch = bracket.matchResults[bracket.matchResults.length - 1];
    const bracketWinner = finalMatch ? finalMatch.winner : null;

    const result = {
      bracketWinner,
      spectatorResults,
      finalBracket: {
        participants: bracket.originalParticipants,
        matchResults: bracket.matchResults
      },
      hasSpectators: spectatorResults.length > 0
    };

    // Push the new result to the finalResults array
    bracket.finalResults.push(result);
    await bracket.save();

    console.log('Sending result:', result);
    res.json(result);
  } catch (error) {
    console.error("Error fetching bracket results:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.use((req, res, next) => {
  console.log('Unmatched route:', req.method, req.url);
  next();
});