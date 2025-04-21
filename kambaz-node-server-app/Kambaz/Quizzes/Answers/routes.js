// Kambaz/Modules/Answers/routes.js
import * as questionsDao from "../Questions/dao.js"; // Fixed path
import * as answersDao from "./dao.js"; // Fixed path
import AnswerModel from "./model.js";
import QuestionModel from "../Questions/model.js";
import * as quizzesDao from "../dao.js";

export default function AnswerRoutes(app) {
  app.post("/api/quizzes/:quizId/answers", async (req, res) => {
    const currentUser = req.session["currentUser"];
    if (!currentUser) return res.sendStatus(403);

    try {
      const { answers } = req.body;
      const questions = await questionsDao.findQuestionsForQuiz(
        req.params.quizId
      );
      let score = 0;

      questions.forEach((q) => {
        const a = answers.find((ans) => ans.questionId === q._id.toString());
        if (JSON.stringify(a?.answer) === JSON.stringify(q.correctAnswer)) {
          score += q.points;
        }
      });

      const result = await answersDao.createAnswer({
        quizId: req.params.quizId,
        userId: currentUser._id,
        answers,
        score,
      });

      res.json(result);
    } catch (e) {
      console.error("Error creating answer:", e);
      res.status(500).json({ message: e.message });
    }
  });

  // app.get("/api/quizzes/:quizId/answers", async (req, res) => {
  //   const currentUser = req.session["currentUser"];
  //   if (!currentUser) return res.sendStatus(403);

  //   try {
  //     const lastAttempt = await answersDao.findLatestAnswer(req.params.quizId, currentUser._id);
  //     res.json(lastAttempt);
  //   } catch (e) {
  //     console.error("Error fetching answers:", e);
  //     res.status(500).json({ message: e.message });
  //   }
  // });
  app.get("/api/quizzes/:quizId/answers", async (req, res) => {
    const currentUser = req.session["currentUser"];
    // if (!currentUser) return res.sendStatus(403);

    try {
      const quiz = await quizzesDao.findQuizById(req.params.quizId);
      const attemptCount = await AnswerModel.countDocuments({
        quizId: req.params.quizId,
        userId: currentUser._id,
      });
      const lastAttempt = await answersDao.findLatestAnswer(
        req.params.quizId,
        currentUser._id
      );

      res.json({
        quiz,
        attemptCount,
        lastAttempt,
      });
    } catch (e) {
      console.error("Error fetching answers:", e);
      res.status(500).json({ message: e.message });
    }
  });
  // Load previous answer progress
  app.get("/api/quiz-attempts/:qid", async (req, res) => {
    const currentUser = req.session["currentUser"];
    if (!currentUser) return res.sendStatus(403);

    try {
      const last = await AnswerModel.findOne({
        quizId: req.params.qid,
        userId: currentUser._id,
      }).sort({ attemptDate: -1 });

      if (!last) return res.json({ answers: {}, savedAt: null });

      const mappedAnswers = {};
      last.answers.forEach((a) => (mappedAnswers[a.questionId] = a.answer));

      res.json({
        answers: mappedAnswers,
        savedAt: last.attemptDate,
      });
    } catch (e) {
      console.error("Error fetching quiz attempt:", e);
      res.status(500).json({ message: e.message });
    }
  });

  // Submit final quiz answers
  app.post("/api/quiz-attempts/:qid/submit", async (req, res) => {
    const currentUser = req.session["currentUser"];
    if (!currentUser) return res.sendStatus(403);

    try {
      console.log(`[POST] /api/quiz-attempts/${req.params.qid}/submit`);
      console.log(">>> currentUser._id:", currentUser._id);
      console.log(">>> answers received:", req.body.answers);
      console.log(">>> req.body:", req.body);

      const { answers } = req.body;
      const questions = await QuestionModel.find({ quizId: req.params.qid });

      let score = 0;
      const results = {};

      // questions.forEach((q) => {
      //   const a = answers[q._id.toString()];
      //   const isCorrect = JSON.stringify(a) === JSON.stringify(q.correctAnswer);
      //   results[q._id.toString()] = isCorrect;
      //   if (isCorrect) score += q.points;
      // });
      questions.forEach((q) => {
        const a = answers[q._id.toString()];
        let isCorrect = false;
      
        if (q.type === "Fill in the Blank") {
          isCorrect = q.choices?.some(
            (choice) =>
              String(choice).toLowerCase().trim() === String(a).toLowerCase().trim()
          );
        } else {
          isCorrect = JSON.stringify(String(a)) === JSON.stringify(String(q.correctAnswer));
        }
      
        results[q._id.toString()] = isCorrect;
        if (isCorrect) score += q.points;
      });
      

      const totalPoints = questions.reduce((acc, q) => acc + q.points, 0);

      // await AnswerModel.create({
      //   quizId: req.params.qid,
      //   userId: currentUser._id,
      //   answers: Object.entries(answers).map(([qid, answer]) => ({
      //     questionId: qid,
      //     answer,
      //   })),
      //   score,
      // });

      const saved = await AnswerModel.create({
        quizId: req.params.qid,
        userId: currentUser._id,
        answers: Object.entries(answers).map(([qid, answer]) => ({
          questionId: qid,
          answer,
        })),
        score,
      });
      console.log("✅ Submission saved:", saved);

      res.json({
        score,
        totalPoints,
        results,
      });
    } catch (e) {
      console.error("Error submitting quiz attempt:", e);
      res.status(500).json({ message: e.message });
    }
  });

  // Auto-save progress
  app.put("/api/quiz-attempts/:qid", async (req, res) => {
    const currentUser = req.session["currentUser"];
    if (!currentUser) return res.sendStatus(403);

    try {
      const { answers, savedAt } = req.body;

      await AnswerModel.findOneAndUpdate(
        { quizId: req.params.qid, userId: currentUser._id },
        {
          quizId: req.params.qid,
          userId: currentUser._id,
          answers: Object.entries(answers).map(([qid, answer]) => ({
            questionId: qid,
            answer,
          })),
          attemptDate: savedAt,
        },
        { upsert: true }
      );

      res.sendStatus(204);
    } catch (e) {
      console.error("Error saving quiz attempt:", e);
      res.status(500).json({ message: e.message });
    }
  });

  // DEBUG ROUTES

  // Get all answers for debugging
  app.get("/api/debug/answers", async (req, res) => {
    try {
      const answers = await AnswerModel.find().limit(100);
      res.json(answers);
    } catch (e) {
      console.error("Error fetching all answers:", e);
      res.status(500).json({ message: e.message });
    }
  });

  // Get answer statistics
  app.get("/api/debug/answers/stats", async (req, res) => {
    try {
      const totalAnswers = await AnswerModel.countDocuments();
      const avgScore = await AnswerModel.aggregate([
        { $group: { _id: null, avg: { $avg: "$score" } } },
      ]);

      const quizDistribution = await AnswerModel.aggregate([
        { $group: { _id: "$quizId", count: { $sum: 1 } } },
      ]);

      res.json({
        totalAnswers,
        averageScore: avgScore[0]?.avg || 0,
        quizDistribution,
      });
    } catch (e) {
      console.error("Error fetching answer stats:", e);
      res.status(500).json({ message: e.message });
    }
  });

  // Test answer validation
  app.post("/api/debug/answers/validate", async (req, res) => {
    try {
      const answer = new AnswerModel(req.body);
      await answer.validate();

      res.json({
        valid: true,
        message: "Answer data is valid",
      });
    } catch (e) {
      res.json({
        valid: false,
        errors: e.errors,
      });
    }
  });


  app.get("/api/quiz-attempts/:qid/meta", async (req, res) => {
    const currentUser = req.session["currentUser"];
    if (!currentUser) return res.sendStatus(403);

    try {
      const quiz = await quizzesDao.findQuizById(req.params.qid);
      const attemptCount = await AnswerModel.countDocuments({
        quizId: req.params.qid,
        userId: currentUser._id,
      });
      const lastAttempt = await AnswerModel.findOne({
        quizId: req.params.qid,
        userId: currentUser._id,
      }).sort({ attemptDate: -1 });

      res.json({
        quiz: {
          multipleAttempts: quiz.multipleAttempts,
          maxAttempts: quiz.maxAttempts,
          showCorrectAnswers: quiz.showCorrectAnswers,
        },
        attemptCount,
        lastAttempt: lastAttempt
          ? {
              answers: lastAttempt.answers,
              score: lastAttempt.score,
              submittedAt: lastAttempt.attemptDate,
            }
          : null,
      });
    } catch (e) {
      console.error("Error fetching quiz meta:", e);
      res.status(500).json({ message: e.message });
    }
  });

  app.get("/api/debug/answers/quiz/:quizId", async (req, res) => {
    const answers = await AnswerModel.find({ quizId: req.params.quizId });
    res.json(answers);
  });
}
