// Kambaz/Modules/Answers/schema.js
import mongoose from "mongoose";

const answerSchema = new mongoose.Schema({
  // quizId: { type: mongoose.Schema.Types.ObjectId, ref: "QuizModel", required: true },
  quizId: { type: String },
  userId: { type: String, ref: "UserModel"   },
  answers: [
    {
      questionId: { type: String, ref: "QuestionModel" },
      answer: mongoose.Schema.Types.Mixed,
    }
  ],
  score: Number,
  attemptDate: { type: Date, default: Date.now },
});

export default answerSchema;