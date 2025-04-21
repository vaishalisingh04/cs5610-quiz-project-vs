// src/Kambaz/Courses/Quizzes/QuizDetail.tsx
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { HiPencilAlt } from "react-icons/hi";
import { useEffect, useState } from "react";
import * as quizzesClient from "./client";
import { FaArrowLeft } from "react-icons/fa";

export default function QuizDetail() {
  const { cid, qid } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { quizzes } = useSelector((state: any) => state.quizzesReducer || { quizzes: [] });
  const { currentUser } = useSelector((state: any) => state.accountReducer);

  const [quiz, setQuiz] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch quiz data if not available in Redux store
  useEffect(() => {
    const fetchQuiz = async () => {
      if (!qid) return;

      // Check if quiz exists in Redux store first
      const existingQuiz = quizzes.find((q: any) => q._id === qid);
      if (existingQuiz) {
        setQuiz(existingQuiz);
        setLoading(false);
        return;
      }

      // Otherwise fetch from API
      try {
        setLoading(true);
        setError(null);
        console.log(`Fetching quiz details for: ${qid}`);
        const data = await quizzesClient.findQuizById(qid);
        console.log("Fetched quiz data:", data);
        
        if (data) {
          setQuiz(data);
        } else {
          setError("Quiz not found");
        }
      } catch (err: any) {
        console.error("Error fetching quiz:", err);
        setError(err.message || "Failed to load quiz details");
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [qid, quizzes, dispatch]);

  const formatDateTime = (dateStr: string) => {
    if (!dateStr) return "Not set";
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return "Invalid date";
      
      return date.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    } catch (e) {
      console.error("Date formatting error:", e);
      return "Date format error";
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="container mt-4 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p>Loading quiz details...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
        <button 
          className="btn btn-primary" 
          onClick={() => navigate(`/Kambaz/Courses/${cid}/Quizzes`)}
        >
          <FaArrowLeft className="me-2" />
          Back to Quizzes
        </button>
      </div>
    );
  }

  // Not found state
  if (!quiz) {
    return (
      <div className="container mt-4">
        <div className="alert alert-warning" role="alert">
          Quiz not found
        </div>
        <button 
          className="btn btn-primary" 
          onClick={() => navigate(`/Kambaz/Courses/${cid}/Quizzes`)}
        >
          <FaArrowLeft className="me-2" />
          Back to Quizzes
        </button>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      {/* Navigation */}
      <div className="mb-3">
        <button 
          className="btn btn-outline-secondary"
          onClick={() => navigate(`/Kambaz/Courses/${cid}/Quizzes`)}
        >
          <FaArrowLeft className="me-2" />
          Back to Quizzes
        </button>
      </div>

      {/* Faculty: Preview & Edit Buttons */}
      {currentUser?.role === "FACULTY" && (
        <div className="d-flex justify-content-center gap-2 mb-3">
          <button 
            className="btn btn-outline-secondary bg-light" 
            onClick={() => navigate(`/Kambaz/Courses/${cid}/Quizzes/${qid}/preview`)}
          >
            Preview
          </button>
          <button
            className="btn btn-light border"
            onClick={() => navigate(`/Kambaz/Courses/${cid}/Quizzes/${qid}/edit`)}
          >
            <HiPencilAlt className="me-1" />
            Edit
          </button>
        </div>
      )}

      {/* Student: Start Quiz */}
      {currentUser?.role === "STUDENT" && (
        <div className="d-flex justify-content-center mb-3"
        onClick={() => navigate(`/Kambaz/Courses/${cid}/Quizzes/${qid}/quiz`)}>
          <button className="btn btn-primary px-4">Start Quiz</button>
        </div>
      )}
      
      <hr />
      
      <h3 className="fw-bold">{quiz.title}</h3>
      
      {quiz.description && (
        <div className="card mb-4">
          <div className="card-header">Description</div>
          <div className="card-body" dangerouslySetInnerHTML={{ __html: quiz.description }} />
        </div>
      )}

      <table className="table table-borderless w-auto">
        <tbody>
          <tr><td className="fw-bold text-end">Quiz Type</td><td>{quiz.quizType || "Graded Quiz"}</td></tr>
          <tr><td className="fw-bold text-end">Points</td><td>{quiz.points || 0}</td></tr>
          <tr><td className="fw-bold text-end">Assignment Group</td><td>{quiz.assignmentGroup || "Quizzes"}</td></tr>
          <tr><td className="fw-bold text-end">Shuffle Answers</td><td>{quiz.shuffleAnswers ? "Yes" : "No"}</td></tr>
          <tr><td className="fw-bold text-end">Time Limit</td><td>{quiz.hasTimeLimit ? `${quiz.timeLimit} Minutes` : "No time limit"}</td></tr>
          <tr><td className="fw-bold text-end">Access Code</td><td>{quiz.accessCode ? quiz.accessCode : "None"}</td></tr>         
          <tr><td className="fw-bold text-end">Multiple Attempts</td><td>{quiz.multipleAttempts ? "Yes" : "No"}</td></tr>
          <tr><td className="fw-bold text-end">Attempts</td>
  <td>{quiz.multipleAttempts ? (quiz.maxAttempts || 1) : 1}</td>
</tr>
          <tr><td className="fw-bold text-end">View Responses</td><td>{quiz.viewResponse ? "Always" : "Never"}</td></tr>
          <tr><td className="fw-bold text-end">Show Correct Answers</td><td>{quiz.showCorrectAnswers ? "Immediately" : "Do not show"}</td></tr>
          <tr><td className="fw-bold text-end">One Question at a Time</td><td>{quiz.oneQuestionAtATime ? "Yes" : "No"}</td></tr>
          <tr><td className="fw-bold text-end">Require Responses LockDown Browser</td><td>{quiz.requireLockdownBrowser ? "Yes" : "No"}</td></tr>
          <tr><td className="fw-bold text-end">Required to View Quiz Results</td><td>{quiz.requiredToViewResults ? "Yes" : "No"}</td></tr>
          <tr><td className="fw-bold text-end">Webcam Required</td><td>{quiz.webcamRequired ? "Yes" : "No"}</td></tr>
          <tr><td className="fw-bold text-end">Lock Questions After Answering</td><td>{quiz.lockQuestionsAfterAnswering ? "Yes" : "No"}</td></tr>
        </tbody>
      </table>

      <table className="table table-sm mt-4" style={{ width: "fit-content" }}>
        <thead className="border-top border-bottom">
          <tr className="text-muted">
            <th className="fw-semibold px-3 py-2">Due</th>
            <th className="fw-semibold px-3 py-2">For</th>
            <th className="fw-semibold px-3 py-2">Available from</th>
            <th className="fw-semibold px-3 py-2">Until</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="px-3 py-2">{quiz.dueDate ? formatDateTime(quiz.dueDate) : "Not set"}</td>
            <td className="px-3 py-2">Everyone</td>
            <td className="px-3 py-2">{quiz.availableFrom ? formatDateTime(quiz.availableFrom) : "Not set"}</td>
            <td className="px-3 py-2">{quiz.availableUntil ? formatDateTime(quiz.availableUntil) : "Not set"}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}