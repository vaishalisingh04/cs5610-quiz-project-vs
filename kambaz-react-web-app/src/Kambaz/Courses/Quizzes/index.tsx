// src/Kambaz/Courses/Quizzes/index.tsx
import { useEffect, useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams, Link } from "react-router-dom";
import { setQuizzes, deleteQuiz as deleteQuizAction, addQuiz } from "./reducer";
import QuizzesControls from "./QuizzesControls";
import QuizControlButtons from "./QuizControlButtons";
import { GoTriangleDown } from "react-icons/go";
import { IoRocketOutline } from "react-icons/io5";
import * as quizzesClient from "./client";
import { BsGripVertical } from "react-icons/bs";

export default function Quizzes() {
  console.log("🧩 Quizzes component mounted");

  const { currentUser } = useSelector((state: any) => state.accountReducer);
  const { cid } = useParams();
  const { quizzes } = useSelector(
    (state: any) => state.quizzesReducer || { quizzes: [] }
  );
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quizName, setQuizName] = useState("");

  useEffect(() => {
    async function fetchQuizzes() {
      if (!cid) return;

      setLoading(true);
      setError(null);

      try {
        console.log("Fetching quizzes for course:", cid);
        const data = await quizzesClient.findQuizzesForCourse(cid);
        console.log("Quizzes fetched:", data);

        if (Array.isArray(data)) {
          dispatch(setQuizzes(data));
        } else {
          console.error("Quizzes data is not an array:", data);
        }
      } catch (error) {
        const err = error as Error;
        console.error("Error fetching quizzes:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchQuizzes();
  }, [cid, dispatch]);

  const handleSaveQuiz = async (quiz: any) => {
    if (!cid) return;

    setError(null);

    try {
      console.log("Creating quiz for course:", cid, quiz);
      const createdQuiz = await quizzesClient.createQuizForCourse(cid, quiz);
      console.log("Quiz created:", createdQuiz);

      dispatch(addQuiz(createdQuiz));
      setQuizName("");
    } catch (error) {
      const err = error as Error;
      console.error("Error creating quiz:", err);
      setError(err.message);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const formatDateTime = (dateStr: string) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    const datePart = formatDate(dateStr);
    const timePart = date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
    return `${datePart} at ${timePart.toLowerCase()}`;
  };

  useEffect(() => {
    const fetchQuestionCounts = async () => {
      const updated = await Promise.all(
        courseQuizzes.map(async (q: any) => {
          const questions = await quizzesClient.getQuestions(q._id);
          return { ...q, questionsCount: questions.length };
        })
      );

      // Replace updated quizzes only for this course
      const otherCourses = quizzes.filter((q: any) => q.course !== cid);
      dispatch({
        type: "quizzes/setQuizzes",
        payload: [...otherCourses, ...updated],
      });
    };

    fetchQuestionCounts();
  }, [quizzes.length, cid]);

  const courseQuizzes = Array.isArray(quizzes)
    ? quizzes.filter((quiz: any) => quiz.course === cid)
    : [];

  return (
    <div className="d-flex flex-column">
      {currentUser?.role === "FACULTY" && (
        <div className="mb-4">
          <QuizzesControls
            quizName={quizName}
            setQuizName={setQuizName}
            addQuiz={handleSaveQuiz}
          />
        </div>
      )}

      {loading ? (
        <div className="text-center p-4">Loading quizzes...</div>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : (
        <ul id="wd-quizzes" className="list-group rounded-0">
          <li className="wd-module list-group-item p-0 border-gray">
            <div className="wd-title p-3 ps-2 bg-secondary d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center gap-3">
                <GoTriangleDown className="fs-3" />
                <h5 className="mb-0">QUIZZES</h5>
              </div>
              <div className="d-flex align-items-center gap-3">
                <h6 className="mb-0 text-muted">20% of Total</h6>
                <GoTriangleDown className="fs-4" />
              </div>
            </div>
          </li>

          {courseQuizzes.length === 0 ? (
            <li className="list-group-item text-center p-3">
              No quizzes available for this course.
            </li>
          ) : (
            courseQuizzes.map((quiz: any) => {
              const now = new Date();
              const availableFrom = quiz.availableFrom
                ? new Date(quiz.availableFrom)
                : null;
              const availableUntil = quiz.availableUntil
                ? new Date(quiz.availableUntil)
                : null;

              let availabilityText = "Availability Unknown";
              if (availableFrom && now < availableFrom) {
                availabilityText = `Not available until ${formatDateTime(
                  quiz.availableFrom
                )}`;
              } else if (availableUntil && now > availableUntil) {
                availabilityText = "Closed";
              } else {
                availabilityText = "Available";
              }

              return (
                <li key={quiz._id} className="list-group-item border-gray">
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center gap-2">
                      <div className="d-flex flex-row align-items-center">
                        <BsGripVertical className="fs-5 text-secondary" />
                        <IoRocketOutline className="text-success fs-5" />
                      </div>
                      <div className="d-flex flex-column">
                        <Link
                          to={`/Kambaz/Courses/${cid}/Quizzes/${quiz._id}`}
                          className="fw-bold text-dark text-decoration-none"
                        >
                          {quiz.title}
                        </Link>
                        <div className="text-muted small">
                          {availabilityText.startsWith(
                            "Not available until"
                          ) ? (
                            <>
                              <strong>Not available until </strong>
                              <span className="text-danger">
                                {formatDateTime(quiz.availableFrom)}
                              </span>{" "}
                              | <strong>Due </strong>
                              <span className="text-danger">
                                {quiz.dueDate
                                  ? formatDateTime(quiz.dueDate)
                                  : "Not set"}
                              </span>
                            </>
                          ) : availabilityText === "Closed" ? (
                            <>
                              <strong>Closed</strong> | <strong>Due </strong>
                              <span className="text-danger">
                                {quiz.dueDate
                                  ? formatDateTime(quiz.dueDate)
                                  : "Not set"}
                              </span>
                            </>
                          ) : (
                            <>
                              <strong>Available</strong>{" "}
                              <span className="text-danger">
                                {quiz.availableFrom
                                  ? formatDateTime(quiz.availableFrom)
                                  : "Not set"}
                              </span>{" "}
                              | <strong>Due </strong>
                              <span className="text-danger">
                                {quiz.dueDate
                                  ? formatDateTime(quiz.dueDate)
                                  : "Not set"}
                              </span>
                            </>
                          )}{" "}
                          | <strong>{quiz.points || 0} pts</strong> |{" "}
                          <strong>{quiz.questionsCount ?? 0} Questions</strong>
                          {currentUser?.role === "STUDENT" &&
                            quiz.score !== undefined && (
                              <>
                                {" "}
                                | <strong>Score:</strong> {quiz.score}%
                              </>
                            )}
                        </div>
                      </div>
                    </div>
                    <div className="d-flex flex-row">
                      <QuizControlButtons quizId={quiz._id} />
                    </div>
                  </div>
                </li>
              );
            })
          )}
        </ul>
      )}
    </div>
  );
}
