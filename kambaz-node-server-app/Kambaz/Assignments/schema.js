// Kambaz/Assignments/schema.js
import mongoose from "mongoose";
const assignmentSchema = new mongoose.Schema(
  {
    _id: String,
    title: String,
    description: String,
    course: { type: String, ref: "CourseModel" },
    points: Number,
    dueDate: Date,
    availableFrom: Date,
    availableUntil: Date,
  },
  { collection: "assignments" }
);
export default assignmentSchema;