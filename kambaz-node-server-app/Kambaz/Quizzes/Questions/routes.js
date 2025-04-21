// Kambaz/Modules/Questions/routes.js
import * as questionsDao from "./dao.js";

export default function QuestionRoutes(app) {
    app.get("/api/quizzes/:quizId/questions", async (req, res) => {
      const questions = await questionsDao.findQuestionsForQuiz(req.params.quizId);
      res.json(questions);
    });
  
    app.post("/api/quizzes/:quizId/questions", async (req, res) => {
      const newQuestion = await questionsDao.createQuestion({ ...req.body, quizId: req.params.quizId });
      res.json(newQuestion);
    });
  
    app.put("/api/quizzes/:quizId/questions/:qid", async (req, res) => {
      const updated = await questionsDao.updateQuestion(req.params.qid, req.body);
      res.json(updated);
    });
  
    app.delete("/api/quizzes/:quizId/questions/:qid", async (req, res) => {
      await questionsDao.deleteQuestion(req.params.qid);
      res.sendStatus(200);
    });
  }
  