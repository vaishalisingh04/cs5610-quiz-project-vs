import React, { useState, useMemo, useEffect } from "react";
import { Card, Button, Form, Alert, Row, Col } from "react-bootstrap";
import { FaRegQuestionCircle } from "react-icons/fa";
import { GoArrowRight } from "react-icons/go";
import { HiOutlineFlag, HiPencilAlt } from "react-icons/hi";
import { useParams, useNavigate } from "react-router-dom";
import * as quizzesClient from "./client";
import { useSelector } from "react-redux";



export default function QuizPreview() {
  const { cid, qid } = useParams();
  const navigate = useNavigate();
  // const quiz = mockQuiz; // Replace with actual data from API
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [savedTime, setSavedTime] = useState<string>(new Date().toLocaleTimeString());
  const [attemptCount, setAttemptCount] = useState(0);
  const { currentUser } = useSelector((state: any) => state.accountReducer);
  const displayAttempt = submitted ? attemptCount : attemptCount + 1;

  const [quiz, setQuiz] = useState<any>({
    _id: qid,
    title: `Quiz ${qid}`,
    description: "Quiz Instructions",
    startedAt: new Date().toLocaleTimeString(),
    questions: [],
  });
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [attemptLimitReached, setAttemptLimitReached] = useState(false);
  useEffect(() => {
    const checkAttempts = async () => {
      const result = await quizzesClient.getLastAttemptWithMeta(qid!);

      if (result) {
        const { quiz, attemptCount, lastAttempt } = result;
        setQuiz((prev: any) => ({ ...prev, ...quiz, attemptCount}));
        setAttemptCount(attemptCount); 
        setAnswers(
          (lastAttempt?.answers || []).reduce((acc: any, a: any) => {
            acc[a.questionId] = a.answer;
            return acc;
          }, {})
        );
        setSubmitted(!!lastAttempt);
        if (quiz.multipleAttempts && attemptCount >= quiz.maxAttempts) {
          setAttemptLimitReached(true);
        }
      }
    };
    if (qid) checkAttempts();
  }, [qid]);

  useEffect(() => {
    const fetchQuizData = async () => {
      if (!qid) return;
  
      setLoading(true);
      setFetchError(null);
  
      try {
        const quizData = await quizzesClient.findQuizById(qid);
        console.log("Fetched quiz data:", quizData);
  
        const questionsData = await quizzesClient.getQuestions(qid);
        console.log("Fetched questions:", questionsData);
  
        if (quizData && Array.isArray(questionsData)) {
          setQuiz({
            _id: qid,
            title: quizData.title || `Quiz ${qid}`,
            description: quizData.description || "No description",
            startedAt: quizData.startedAt || new Date().toLocaleTimeString(),
            showCorrectAnswers: quizData.showCorrectAnswers || false,
            questions: questionsData,
            multipleAttempts: quizData.multipleAttempts ?? false,
            maxAttempts: quizData.maxAttempts ?? 1,
          });
        }
      } catch (err: any) {
        console.error("Error fetching quiz preview:", err);
        setFetchError(err.message || "Failed to load quiz.");
      } finally {
        setLoading(false);
      }
    };
  
    fetchQuizData();
  }, [qid]);

  // Calculate total points
  const totalPoints = useMemo(() => 
    quiz.questions.reduce((sum: any, q: { points: any; }) => sum + (q.points || 0), 0), 
    [quiz]
  );
  
  // Count answered questions
  const answeredCount = useMemo(() => {
    return quiz.questions.filter((q: any) => {
      const a = answers[q._id];
  
      if (q.type === "True/False") {
        return a === true || a === false;
      }
  
      if (q.type === "Multiple Choice") {
        return typeof a === "string" && a.trim() !== "";
      }
  
      if (q.type === "Fill in the Blank") {
        return typeof a === "string" && a.trim() !== "";
      }
  
      return false;
    }).length;
  }, [quiz.questions, answers]);
  
  // Auto-save answers every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (!submitted && Object.keys(answers).length > 0) {
        setSavedTime(new Date().toLocaleTimeString());
        // Here you would typically call an API to save progress
        console.log("Auto-saving quiz progress...");
      }
    }, 30000);
    
    return () => clearInterval(interval);
  }, [answers, submitted]);
  
  // Handle answer changes
  const handleChange = (qid: string, answer: any) => {
    setAnswers({ ...answers, [qid]: answer });
    if (errorMessage) setErrorMessage(null);
    setSavedTime(new Date().toLocaleTimeString());
  };
  
  // Navigate to next question
  const handleNext = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };
  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };
  
  // Navigate to a specific question
  const goToQuestion = (index: number) => {
    setCurrentQuestionIndex(index);
  };
  
  // Handle quiz submission
  const handleSubmit = () => {
    if (answeredCount < quiz.questions.length) {
      setErrorMessage("Please answer all questions before submitting.");
      return;
    }
    
    let total = 0;
    quiz.questions.forEach((q: any) => {
      const a = answers[q._id];
      if (q.type === "True/False" && a === q.correctAnswer) {
        total += q.points;
      } else if (q.type === "Multiple Choice" && a === q.correctAnswer) {
        total += q.points;
      } else if (q.type === "Fill in the Blank" && q.choices?.includes?.(a?.trim())) {
        total += q.points;
      }
    });
    
    setScore(total);
    setSubmitted(true);
    setAttemptCount((prev) => prev + 1);
  };
  
  // Return to quiz editor
  const handleKeepEditing = () => {
    // Navigate to quiz editor page
    navigate(`/Kambaz/Courses/${cid}/Quizzes/${qid}/edit`);
  };
  
  // Current question
  // const currentQuestion = quiz.questions?.[currentQuestionIndex];

if (loading) return <div className="mt-4">Loading quiz...</div>;
if (fetchError) return <div className="mt-4 text-danger">Error: {fetchError}</div>;
if (!quiz.questions || quiz.questions.length === 0) return <div>No questions found.</div>;

return (
  <div className="container mt-4 mb-5">
    <h2>{quiz.title}</h2>
    <Alert variant="light" className="mb-4" style={{ backgroundColor: '#F9E9E8', borderColor: '#F9DFDE', color: '#cc3232' }}>
      <div style={{ color: '#cc3232', display: 'inline-block', width: '16px', height: '16px', borderRadius: '50%', border: '1.5px solid #cc3232', textAlign: 'center', lineHeight: '14px', fontSize: '12px', fontWeight: 'bold' }}>!</div>
      This is a preview of the published version of the quiz
    </Alert>
    <div className="text-muted mb-2">Started: {quiz.startedAt}</div>
    <h3 className="mt-3 fw-bold">Quiz Instructions</h3>
    <hr />

    {!submitted ? (
      <div style={{ position: 'relative', paddingLeft: '32px' }}>
        <div style={{
          position: 'absolute',
          top: '10px',
          left: '0px',
          width: '24px',
          height: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#6c757d"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 4 H14 L20 12 L14 20 H4 Z" />
          </svg>
        </div>
        <Card className="mb-4">
          <Card.Header className="d-flex justify-content-between align-items-center bg-light">
            <div className="d-flex align-items-center fw-bold">Question {currentQuestionIndex + 1}</div>
            <div className="fw-bold">{quiz.questions[currentQuestionIndex].points} pts</div>
          </Card.Header>
          <Card.Body>
            <div dangerouslySetInnerHTML={{ __html: quiz.questions[currentQuestionIndex].text }} className="mb-4" />
            <Form>
              {quiz.questions[currentQuestionIndex].type === "True/False" && (
                <>
                  <Form.Check
                    type="radio"
                    id="true"
                    label="True"
                    name="answer"
                    checked={answers[quiz.questions[currentQuestionIndex]._id] === true}
                    onChange={() => handleChange(quiz.questions[currentQuestionIndex]._id, true)}
                    disabled={submitted}
                    className="mb-2"
                  />
                  <Form.Check
                    type="radio"
                    id="false"
                    label="False"
                    name="answer"
                    checked={answers[quiz.questions[currentQuestionIndex]._id] === false}
                    onChange={() => handleChange(quiz.questions[currentQuestionIndex]._id, false)}
                    disabled={submitted}
                  />
                </>
              )}

              {quiz.questions[currentQuestionIndex].type === "Multiple Choice" &&
                quiz.questions[currentQuestionIndex].choices?.map((choice: string, i: number) => (
                  <Form.Check
                    key={i}
                    type="radio"
                    id={`mc-${i}`}
                    label={choice}
                    name="answer"
                    checked={answers[quiz.questions[currentQuestionIndex]._id] === choice}
                    onChange={() => handleChange(quiz.questions[currentQuestionIndex]._id, choice)}
                    disabled={submitted}
                    className="mb-2"
                  />
                ))}

              {quiz.questions[currentQuestionIndex].type === "Fill in the Blank" && (
                <Form.Control
                  type="text"
                  placeholder="Type your answer here"
                  value={answers[quiz.questions[currentQuestionIndex]._id] || ""}
                  onChange={(e) => handleChange(quiz.questions[currentQuestionIndex]._id, e.target.value)}
                  disabled={submitted}
                  className="mb-2"
                />
              )}
            </Form>
          </Card.Body>
        </Card>

        <div className="d-flex justify-content-between mb-4">
          {currentQuestionIndex > 0 ? (
            <Button variant="light" onClick={handlePrevious}>← Previous</Button>
          ) : <div />}  

          {currentQuestionIndex < quiz.questions.length - 1 && (
            <Button variant="light" onClick={handleNext}>Next →</Button>
          )}
        </div>

      </div>
    ) : (
      quiz.questions.map((q: any, index: number) => {
        let isCorrect = false;
        const a = answers[q._id];

        if (q.type === "True/False") {
          isCorrect = a === q.correctAnswer;
        } else if (q.type === "Multiple Choice") {
          isCorrect = a === q.correctAnswer;
        } else if (q.type === "Fill in the Blank") {
          isCorrect = q.choices?.includes?.(a?.trim());
        }
        return (
          <Card key={q._id} className="mb-4">
            <Card.Header className="d-flex justify-content-between align-items-center bg-light">
              <div className="d-flex align-items-center fw-bold">Question {index + 1}</div>
              <div className="fw-bold">{q.points} pts</div>
            </Card.Header>
            <Card.Body>
              <div dangerouslySetInnerHTML={{ __html: q.text }} className="mb-4" />
              <div className="mb-2">Your Answer: <strong>{String(answers[q._id])}</strong></div>
              <Alert variant={isCorrect ? "success" : "danger"}>
              {isCorrect ? "Correct" : (
                <>
                  Incorrect
                  {quiz.showCorrectAnswers && (
                    <>
                      {" — "}Correct answer: <strong>
                        {q.type === "Fill in the Blank"
                          ? (q.choices || []).join(", ")
                          : String(q.correctAnswer)}
                      </strong>
                    </>
                  )}
                </>
              )}
            </Alert>
            </Card.Body>
          </Card>
        );
      })
    )}

    <Card className="mb-4">
      <Card.Body className="d-flex justify-content-end align-items-center gap-3">
        <div className="text-muted">Quiz saved at {savedTime}</div>
        <Button
          variant={answeredCount >= quiz.questions.length ? "danger" : "secondary"}
          onClick={handleSubmit}
          disabled={submitted || answeredCount < quiz.questions.length}
        >
          Submit Quiz
        </Button>
      </Card.Body>
    </Card>

    {currentUser?.role === "FACULTY" && (
      <Button
        variant="light"
        onClick={handleKeepEditing}
        className="w-100 text-start px-3 py-2 border rounded mb-4"
        style={{ backgroundColor: "#f8f9fa" }}
      >
        <HiPencilAlt className="me-2" style={{ fontSize: "18px" }} />
        Keep Editing This Quiz
      </Button>
    )}

    {/* Questions Navigation */}
    <div className="mb-4">
      <h5 className="mb-2">Questions</h5>
      <div>
        {quiz.questions.map((q: any, idx: number) => (
          <div key={q._id} className="d-flex align-items-center mb-1 ms-2">
            {/* Left icon (question mark in circle) */}
            <FaRegQuestionCircle className="me-2 text-secondary" size={14} />

            {/* Question Button */}
            <Button 
              variant="link"
              className={`text-decoration-none text-start text-danger p-0 ${currentQuestionIndex === idx ? 'fw-bold' : ''}`}
              onClick={() => goToQuestion(idx)}
              disabled={submitted}
            >
              Question {idx + 1}
            </Button>
          </div>
        ))}
      </div>
    </div>

    {submitted && (
    <Alert variant="success" className="mt-4">
      <h5>Quiz Results</h5>
      <p>Your Score: {score} out of {totalPoints} ({((score / totalPoints) * 100).toFixed(1)}%)</p>
      {quiz.multipleAttempts && (
        <p className="mt-2">
        Attempt used: <strong>{attemptCount}</strong> / {quiz.maxAttempts}
        </p>
      )}
    </Alert>
)}
  </div>
);
}
