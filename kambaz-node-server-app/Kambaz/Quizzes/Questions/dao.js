// Kambaz/Modules/Questions/dao.js
import model from "./model.js";

export function findQuestionsForQuiz(quizId) {
  return model.find({ quizId });
}


export function createQuestion(question) {
  return model.create(question);
}

export function updateQuestion(questionId, updates) {
  return model.findByIdAndUpdate(questionId, updates, { new: true });
}

export function deleteQuestion(questionId) {
  return model.findByIdAndDelete(questionId);
}
