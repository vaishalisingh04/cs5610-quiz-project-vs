// Kambaz/Quizzes/schema.js
import mongoose from "mongoose";

const schema = new mongoose.Schema({
  _id: { type: String, required: true },
  title: { type: String, required: true, default: "Unnamed Quiz" },
  description: { type: String, default: "" },
  quizType: {
    type: String,
    enum: ["Graded Quiz", "Practice Quiz", "Graded Survey", "Ungraded Survey"],
    default: "Graded Quiz",
  },
  points: { type: Number, default: 0 },
  assignmentGroup: {
    type: String,
    enum: ["Quizzes", "Exams", "Assignments", "Project", "QUIZZES", "ASSIGNMENTS"],
    default: "Quizzes",
  },
  shuffleAnswers: { type: Boolean, default: true },
  timeLimit: { type: Number, default: 20 },
  multipleAttempts: { type: Boolean, default: false },
  maxAttempts: { type: Number, default: 1 },
  showCorrectAnswers: { type: Boolean, default: false },
  accessCode: { type: String, default: "" },
  oneQuestionAtATime: { type: Boolean, default: true },
  webcamRequired: { type: Boolean, default: false },
  lockQuestionsAfterAnswering: { type: Boolean, default: false },
  hasTimeLimit: { type: Boolean, default: true },
  viewResponse: { type: Boolean, default: false },
  requireLockdownBrowser: { type: Boolean, default: false },
  requiredToViewResults: { type: Boolean, default: false },
  dueDate: { type: Date },
  availableFrom: { type: Date },
  availableUntil: { type: Date },
  published: { type: Boolean, default: false },
  course: { type: String, required: true },
  createdBy: { type: String, ref: "UserModel" },
}, { collection: "quizzes", timestamps: true });

export default schema;