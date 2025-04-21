// Kambaz/Modules/Answers/model.js
import mongoose from "mongoose";
import schema from "./schema.js";
const model = mongoose.model("Answer", schema, "answers");
export default model;