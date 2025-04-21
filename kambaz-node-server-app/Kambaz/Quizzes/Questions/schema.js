// Kambaz/Modules/Questions/schema.js
import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
  _id: { type: String },
  // quizId: { type: mongoose.Schema.Types.ObjectId, ref: "QuizModel", required: true },
  quizId: { type: String, ref: "QuizModel", required: true },
  title: String,
  text: String,
  type: String, // 'True/False', 'Multiple Choice', 'Fill in the Blank'
  choices: [String], // optional for multiple choice
  correctAnswer: mongoose.Schema.Types.Mixed,
  points: Number,
});

export default questionSchema;