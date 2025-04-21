// Kambaz/Quizzes/routes.js
import * as quizzesDao from "./dao.js";
import * as questionsDao from "./Questions/dao.js";

export default function QuizRoutes(app) {
  // List quizzes for a course
  app.get("/api/courses/:courseId/quizzes", async (req, res) => {
    try {
      const quizzes = await quizzesDao.findQuizzesForCourse(req.params.courseId);
      console.log(`Found ${quizzes.length} quizzes for course ${req.params.courseId}`);
      res.json(quizzes);
    } catch (e) {
      console.error("Error fetching quizzes:", e);
      res.status(500).json({ message: e.message });
    }
  });
  
  // Create quiz for a course
  app.post("/api/courses/:courseId/quizzes", async (req, res) => {
    try {
      const me = req.session.currentUser;
      if (!me) return res.status(401).json({ message: "Unauthorized" });

      const payload = { 
        ...req.body, 
        course: req.params.courseId,
        createdBy: me._id
      };
      console.log("Creating quiz with payload:", payload);
      const quiz = await quizzesDao.createQuiz(payload);
      res.json(quiz);
    } catch (e) {
      console.error("Error creating quiz:", e);
      res.status(500).json({ message: e.message });
    }
  });
  
  // Get a specific quiz by ID
  app.get("/api/quizzes/:quizId", async (req, res) => {
    try {
      console.log("GET quiz with ID:", req.params.quizId);
      const quiz = await quizzesDao.findQuizById(req.params.quizId);
      if (!quiz) {
        return res.status(404).json({ message: "Quiz not found" });
      }
      res.json(quiz);
    } catch (e) {
      console.error("Error fetching quiz:", e);
      res.status(500).json({ message: e.message });
    }
  });
  
  // Update a quiz
  app.put("/api/quizzes/:quizId", async (req, res) => {
    try {
      console.log("PUT update quiz with ID:", req.params.quizId);
      const me = req.session.currentUser;
      if (!me) return res.status(401).json({ message: "Unauthorized" });

      const updated = await quizzesDao.updateQuiz(req.params.quizId, req.body);
      if (!updated) {
        return res.status(404).json({ message: "Quiz not found" });
      }
      res.json(updated);
    } catch (e) {
      console.error("Error updating quiz:", e);
      res.status(500).json({ message: e.message });
    }
  });
  
  // Delete a quiz
  app.delete("/api/quizzes/:quizId", async (req, res) => {
    try {
      console.log("DELETE quiz with ID:", req.params.quizId);
      const result = await quizzesDao.deleteQuiz(req.params.quizId);
      console.log("Delete result:", result);
      
      if (!result) {
        console.log("Quiz not found or not deleted");
        return res.status(200).json({ message: "Quiz not found or not deleted" });
      }
      
      res.status(200).json({ success: true, message: "Quiz deleted", result });
    } catch (e) {
      console.error("Error deleting quiz:", e);
      res.status(500).json({ message: e.message });
    }
  });
  
  // Questions API
  app.get("/api/quizzes/:quizId/questions", async (req, res) => {
    try {
      const questions = await questionsDao.findQuestionsForQuiz(req.params.quizId);
      res.json(questions);
    } catch (e) {
      console.error("Error fetching questions:", e);
      res.status(500).json({ message: e.message });
    }
  });
  
  app.post("/api/quizzes/:quizId/questions", async (req, res) => {
    try {
      const newQuestion = await questionsDao.createQuestion({ 
        ...req.body, 
        quizId: req.params.quizId 
      });
      res.json(newQuestion);
    } catch (e) {
      console.error("Error creating question:", e);
      res.status(500).json({ message: e.message });
    }
  });
  
  app.put("/api/quizzes/:quizId/questions/:qid", async (req, res) => {
    try {
      const updated = await questionsDao.updateQuestion(req.params.qid, req.body);
      res.json(updated);
    } catch (e) {
      console.error("Error updating question:", e);
      res.status(500).json({ message: e.message });
    }
  });
  
  app.delete("/api/quizzes/:quizId/questions/:qid", async (req, res) => {
    try {
      await questionsDao.deleteQuestion(req.params.qid);
      res.sendStatus(200);
    } catch (e) {
      console.error("Error deleting question:", e);
      res.status(500).json({ message: e.message });
    }
  });
}