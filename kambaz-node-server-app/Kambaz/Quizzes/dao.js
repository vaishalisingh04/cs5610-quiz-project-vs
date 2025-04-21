// Kambaz/Quizzes/dao.js
import model from "./model.js";
import { v4 as uuidv4 } from "uuid";

export function createQuiz(quiz) {
  const newQuiz = {
    ...quiz,
    _id: quiz._id || uuidv4(),
    title: quiz.title || "New Quiz",
    course: quiz.course
  };

  console.log("Creating quiz in DB:", newQuiz);
  return model.create(newQuiz);
}

export function findQuizzesForCourse(courseId) {
  console.log("Finding quizzes for course in DB:", courseId);
  return model.find({ course: courseId });
}

export function updateQuiz(quizId, updates) {
  console.log("Updating quiz in DB:", quizId, updates);
  return model.findOneAndUpdate({ _id: quizId }, updates, { new: true });
}

export async function deleteQuiz(quizId) {
  console.log("Deleting quiz in DB:", quizId);
  try {
    const result = await model.findOneAndDelete({ _id: quizId });
    console.log("Delete result:", result);
    if (!result) {
      console.log("Fallback to deleteOne for quiz:", quizId);
      const deleteResult = await model.deleteOne({ _id: quizId });
      console.log("DeleteOne result:", deleteResult);
      return deleteResult;
    }

    return result;
  } catch (error) {
    console.error("Error in deleteQuiz:", error);
    return null;
  }
}

export const findQuizById = async (quizId) => {
  console.log("Finding quiz by ID in DB:", quizId);
  try {
    const quiz = await model.findOne({ _id: quizId });
    if (!quiz) {
      console.log("Quiz not found:", quizId);
      return null;
    }
    console.log("Found quiz:", quiz);
    return quiz;
  } catch (error) {
    console.error("Error finding quiz by ID:", error);
    return null;
  }
};