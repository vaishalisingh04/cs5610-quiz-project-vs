// index.js
import cors from "cors";
import express from "express";
import mongoose from "mongoose";
import session from "express-session";
import MongoStore from "connect-mongo";
import "dotenv/config";

import UserRoutes from "./Kambaz/Users/routes.js";
import CourseRoutes from "./Kambaz/Courses/routes.js";
import Lab5 from "./Lab5/index.js";
import ModuleRoutes from "./Kambaz/Modules/routes.js";
import AssignmentRoutes from "./Kambaz/Assignments/routes.js";
import EnrollmentRoutes from "./Kambaz/Enrollments/routes.js";
import QuizRoutes from "./Kambaz/Quizzes/routes.js";
import AnswerRoutes from "./Kambaz/Quizzes/Answers/routes.js";


import { v4 as uuidv4 } from "uuid";

const CONNECTION_STRING =
  process.env.MONGO_CONNECTION_STRING ||
  "mongodb+srv://gg:12345@kambaz.ltuskh5.mongodb.net/kambaz2?retryWrites=true&w=majority&appName=Kambaz";

console.log("Attempting to connect to MongoDB at:", CONNECTION_STRING);
mongoose
  .connect(CONNECTION_STRING)
  .then(() => console.log("Successfully connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

const app = express();

app.use(express.json());

app.use(cors({
  origin: "http://localhost:5173", // Allow Vite dev server
  credentials: true,
  methods: ["GET","POST","PUT","DELETE","OPTIONS"],
  allowedHeaders: ["Content-Type","Authorization"],
}));

const sessionOptions = {
  secret: process.env.SESSION_SECRET || "default_session_secret",
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: CONNECTION_STRING }),
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", 
    sameSite: process.env.NODE_ENV === "production"   
      ? "none"
      : "lax",                                        
    maxAge: 24*60*60*1000,
  }
};
app.use(session(sessionOptions));

if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
  console.log("Production: trust proxy enabled, cookies secure/none");
}

app.use((req, res, next) => {
  console.log("=== Session Debug ===");
  console.log("Session ID:", req.sessionID);
  console.log("Has user:", !!req.session.currentUser);
  if (req.session.currentUser) {
    console.log("User:", req.session.currentUser.username);
  }
  console.log("=====================");
  next();
});

app.get("/api/check-session", (req, res) => {
  res.json({
    sessionExists: !!req.session,
    sessionID: req.sessionID,
    hasUser: !!req.session.currentUser,
    user: req.session.currentUser || null,
  });
});

app.post("/api/courses/direct", async (req, res) => {
  try {
    const user = req.session.currentUser;
    if (!user) return res.status(401).json({ message: "Unauthorized" });

    const courseId = uuidv4();
    const courseData = { _id: courseId, ...req.body };
    await mongoose.connection.db.collection("courses").insertOne(courseData);

    const enrollment = {
      _id: uuidv4(),
      user: user._id,
      course: courseId,
      enrollmentDate: new Date(),
      status: "ENROLLED",
    };
    await mongoose
      .connection.db
      .collection("enrollments")
      .insertOne(enrollment);

    res.json(courseData);
  } catch (e) {
    console.error("[Direct Course Creation] Error:", e);
    res.status(500).json({ message: "Error creating course", error: e.message });
  }
});

app.post("/api/courses", async (req, res) => {
  try {
    const user = req.session.currentUser;
    if (!user) return res.status(401).json({ message: "Unauthorized" });

    const courseId = uuidv4();
    const courseData = { _id: courseId, ...req.body };
    await mongoose.connection.db.collection("courses").insertOne(courseData);

    const enrollment = {
      _id: uuidv4(),
      user: user._id,
      course: courseId,
      enrollmentDate: new Date(),
      status: "ENROLLED",
    };
    await mongoose.connection.db.collection("enrollments").insertOne(enrollment);

    res.json(courseData);
  } catch (e) {
    console.error("[Standard Course Creation] Error:", e);
    res.status(500).json({ message: "Error creating course", error: e.message });
  }
});

// Simple debug route that doesn't require a separate file
app.get("/api/debug/quizzes/count", async (req, res) => {
  try {
    const count = await mongoose.connection.db.collection("quizzes").countDocuments();
    res.json({ count });
  } catch (e) {
    console.error("Error counting quizzes:", e);
    res.status(500).json({ message: e.message });
  }
});

app.get("/api/debug/quizzes/stats", async (req, res) => {
  try {
    const totalQuizzes = await mongoose.connection.db.collection("quizzes").countDocuments();
    const publishedQuizzes = await mongoose.connection.db.collection("quizzes").countDocuments({ published: true });
    const courseDistribution = await mongoose.connection.db.collection("quizzes").aggregate([
      { $group: { _id: "$course", count: { $sum: 1 } } }
    ]).toArray();
    
    res.json({
      totalQuizzes,
      publishedQuizzes,
      unpublishedQuizzes: totalQuizzes - publishedQuizzes,
      courseDistribution
    });
  } catch (e) {
    console.error("Error getting quiz stats:", e);
    res.status(500).json({ message: e.message });
  }
});

// Simple test endpoint to verify DELETE requests
app.delete("/api/test-delete", (req, res) => {
  console.log("Test DELETE request received");
  res.json({ success: true, message: "DELETE request received successfully" });
});

// Test endpoint to check if a specific quiz exists
app.get("/api/test/quiz/:quizId", async (req, res) => {
  try {
    const quizId = req.params.quizId;
    console.log("Checking if quiz exists:", quizId);
    
    const quiz = await mongoose.connection.db.collection("quizzes").findOne({ _id: quizId });
    
    if (!quiz) {
      return res.json({ exists: false, message: "Quiz not found" });
    }
    
    res.json({ 
      exists: true, 
      message: "Quiz found", 
      quiz: {
        _id: quiz._id,
        title: quiz.title,
        course: quiz.course
      }
    });
  } catch (e) {
    console.error("Error in test endpoint:", e);
    res.status(500).json({ message: e.message });
  }
});

// Direct delete endpoint for testing
app.delete("/api/test/quiz/:quizId", async (req, res) => {
  try {
    const quizId = req.params.quizId;
    console.log("Test deleting quiz:", quizId);
    
    const result = await mongoose.connection.db.collection("quizzes").deleteOne({ _id: quizId });
    
    console.log("Delete result:", result);
    
    res.json({ 
      success: true, 
      message: "Delete operation completed",
      deletedCount: result.deletedCount
    });
  } catch (e) {
    console.error("Error in test delete endpoint:", e);
    res.status(500).json({ message: e.message });
  }
});

// Register all routes
UserRoutes(app);
CourseRoutes(app);
Lab5(app);
ModuleRoutes(app);
AssignmentRoutes(app);
EnrollmentRoutes(app);
QuizRoutes(app); // Added Quiz routes
AnswerRoutes(app);
// DebugRoutes(app); // Uncomment if you create a separate debug routes file

console.log("All routes initialized");

const PORT = process.env.PORT || 4000;
app.listen(PORT, () =>
  console.log(`Server running on port ${PORT} (NODE_ENV=${process.env.NODE_ENV})`)
);