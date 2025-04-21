// Kambaz/Modules/Questions/model.js
import mongoose from "mongoose";
import schema from "./schema.js";
// const model = mongoose.model("QuestionModel", schema);
const questionModel = mongoose.model("Question", schema, "questions");
export default questionModel;