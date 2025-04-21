import { useEffect, useRef, useState } from "react";
import { Dropdown } from "react-bootstrap";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Tabs,
  Tab,
  Form,
  Button,
  FormControl,
  Col,
  Row,
  Card,
  InputGroup,
} from "react-bootstrap";
// import "react-quill/dist/quill.snow.css";
import { updateQuiz, addQuiz } from "./reducer";
import * as quizzesClient from "./client";
import { Editor } from "@tinymce/tinymce-react";
import { GoX } from "react-icons/go";
import { FaBan } from "react-icons/fa";
import { HiDotsVertical } from "react-icons/hi";
import QuestionEditor from "./QuestionEditor";
import {
  addQuestion,
  updateQuestion,
  deleteQuestion,
  setQuestions,
} from "./reducer";
import { v4 as uuidv4 } from "uuid";

interface QuizType {
  _id: string;
  title: string;
  description: string;
  points: number;

  dueDate?: string;
  availableFrom?: string;
  availableUntil?: string;
  course: string;
  published?: boolean;
  quizType: string;
  assignmentGroup: string;
  shuffleAnswers: boolean;
  timeLimit: number;
  multipleAttempts: boolean;
  maxAttempts: number;
  showCorrectAnswers: boolean;
  accessCode?: string;
  hasTimeLimit: boolean;
  oneQuestionAtATime: boolean;
  webcamRequired: boolean;
  lockQuestionsAfterAnswering: boolean;
  viewResponse: boolean;
  requireLockdownBrowser: boolean;
  requiredToViewResults: boolean;
}

export default function QuizEditor() {
  const { qid, cid } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Safely access Redux state with fallbacks
  const quizzesState = useSelector((state: any) => state.quizzesReducer);
  const quizzes = quizzesState?.quizzes || [];
  const questionsFromState = quizzesState?.questions || [];

  const existingQuiz = quizzes.find((q: any) => q._id === qid);
  const editorRef = useRef<any>(null);

  const [key, setKey] = useState("details");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editedQuiz, setEditedQuiz] = useState<QuizType>({
    _id: existingQuiz?._id || qid || uuidv4(),
    title: existingQuiz?.title || "New Quiz",
    description: existingQuiz?.description || "",
    points: existingQuiz?.points || 10,

    dueDate: existingQuiz?.dueDate || "",
    availableFrom: existingQuiz?.availableFrom || "",
    availableUntil: existingQuiz?.availableUntil || "",
    course: existingQuiz?.course || cid || "",
    published: existingQuiz?.published || false,
    quizType: existingQuiz?.quizType || "Graded Quiz",
    assignmentGroup: existingQuiz?.assignmentGroup || "Quizzes",
    shuffleAnswers: existingQuiz?.shuffleAnswers ?? true,
    timeLimit: existingQuiz?.timeLimit || 20,
    multipleAttempts: existingQuiz?.multipleAttempts ?? false,
    maxAttempts: existingQuiz?.maxAttempts ?? 1,
    showCorrectAnswers: existingQuiz?.showCorrectAnswers ?? true,
    accessCode: existingQuiz?.accessCode || "",
    hasTimeLimit: existingQuiz?.hasTimeLimit ?? true,
    oneQuestionAtATime: existingQuiz?.oneQuestionAtATime ?? true,
    webcamRequired: existingQuiz?.webcamRequired ?? false,
    lockQuestionsAfterAnswering:
      existingQuiz?.lockQuestionsAfterAnswering ?? false,
    viewResponse: existingQuiz?.viewResponse ?? false,
    requireLockdownBrowser: existingQuiz?.requireLockdownBrowser ?? false,
    requiredToViewResults: existingQuiz?.requiredToViewResults ?? false,
  });

  // Use local state for questions
  const [questions, setQuestionsLocal] = useState<any[]>([]);
  const [newQuestion, setNewQuestion] = useState<any | null>(null);
  const [originalQuestionsMap, setOriginalQuestionsMap] = useState<
    Record<string, any>
  >({});

  const formatDateForInput = (iso: string) => {
    return new Date(iso).toISOString().slice(0, 16);
  };

  // Fetch quiz details and questions if editing an existing quiz
  useEffect(() => {
    const fetchQuizData = async () => {
      if (!qid) return;

      setLoading(true);
      setError(null);

      try {
        // Fetch quiz details
        const quizData = await quizzesClient.findQuizById(qid);
        console.log("Fetched quiz data:", quizData);

        // if (quizData) {
        //   setEditedQuiz({
        //     ...editedQuiz,
        //     ...quizData,
        //   });
        // }
        if (quizData) {
          setEditedQuiz({
            ...editedQuiz,
            ...quizData,
            dueDate: quizData.dueDate
              ? formatDateForInput(quizData.dueDate)
              : "",
            availableFrom: quizData.availableFrom
              ? formatDateForInput(quizData.availableFrom)
              : "",
            availableUntil: quizData.availableUntil
              ? formatDateForInput(quizData.availableUntil)
              : "",
          });
        }

        // Fetch questions for this quiz
        const questionsData = await quizzesClient.getQuestions(qid);
        console.log("Fetched questions:", questionsData);

        if (Array.isArray(questionsData)) {
          const completedQuestions = questionsData.map((q) => ({
            ...q,
            isEditing: false,
            correctAnswer:
              typeof q.correctAnswer === "boolean"
                ? q.correctAnswer
                : q.type === "True/False"
                ? false
                : q.correctAnswer,
            choices:
              Array.isArray(q.choices) || q.type === "Multiple Choice"
                ? q.choices || []
                : undefined,
          }));
          // setQuestionsLocal(questionsData);
          // dispatch(setQuestions(questionsData));
          setQuestionsLocal(completedQuestions);
          dispatch(setQuestions(completedQuestions));
        }
      } catch (err) {
        console.error("Error fetching quiz data:", err);
        setError("Failed to load quiz. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchQuizData();
  }, [qid, dispatch]);

  // const handleSave = async () => {
  //   try {
  //     setLoading(true);

  //     const isExistingQuiz = quizzes.some((q: any) => q._id === editedQuiz._id);
  //     let savedQuiz;

  //     if (isExistingQuiz) {
  //       console.log("Updating existing quiz:", editedQuiz);
  //       savedQuiz = await quizzesClient.updateQuiz(editedQuiz);
  //       dispatch(updateQuiz(savedQuiz));
  //     } else {
  //       console.log("Creating new quiz:", editedQuiz);
  //       savedQuiz = await quizzesClient.createQuizForCourse(
  //         cid as string,
  //         editedQuiz
  //       );
  //       dispatch(addQuiz(savedQuiz));
  //     }

  //     navigate(
  //       `/Kambaz/Courses/${editedQuiz.course}/Quizzes/${editedQuiz._id}`
  //     );
  //   } catch (err) {
  //     console.error("Error saving quiz:", err);
  //     setError("Failed to save quiz. Please try again.");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleSave = async () => {
    try {
      setLoading(true);
      const updatedDescription = editorRef.current?.getContent() || "";

      const quizToSave = {
        ...editedQuiz,
        description: updatedDescription,
      };

      const isExistingQuiz = quizzes.some((q: any) => q._id === editedQuiz._id);
      let savedQuiz;

      if (isExistingQuiz) {
        console.log("Updating existing quiz:", quizToSave);
        savedQuiz = await quizzesClient.updateQuiz(quizToSave);
        dispatch(updateQuiz(savedQuiz));
      } else {
        console.log("Creating new quiz:", quizToSave);
        savedQuiz = await quizzesClient.createQuizForCourse(
          cid as string,
          quizToSave
        );
        dispatch(addQuiz(savedQuiz));
      }

      navigate(
        `/Kambaz/Courses/${quizToSave.course}/Quizzes/${quizToSave._id}`
      );
    } catch (err) {
      console.error("Error saving quiz:", err);
      setError("Failed to save quiz. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // const handleSaveAndPublish = async () => {
  //   try {
  //     setLoading(true);

  //     const quizToSave = { ...editedQuiz, published: true };
  //     let savedQuiz;

  //     const isExistingQuiz = quizzes.some((q: any) => q._id === editedQuiz._id);
  //     if (isExistingQuiz) {
  //       console.log("Updating and publishing existing quiz:", quizToSave);
  //       savedQuiz = await quizzesClient.updateQuiz(quizToSave);
  //       dispatch(updateQuiz(savedQuiz));
  //     } else {
  //       console.log("Creating and publishing new quiz:", quizToSave);
  //       savedQuiz = await quizzesClient.createQuizForCourse(
  //         cid as string,
  //         quizToSave
  //       );
  //       dispatch(addQuiz(savedQuiz));
  //     }

  //     navigate(`/Kambaz/Courses/${editedQuiz.course}/Quizzes`);
  //   } catch (err) {
  //     console.error("Error saving and publishing quiz:", err);
  //     setError("Failed to publish quiz. Please try again.");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleSaveAndPublish = async () => {
    try {
      setLoading(true);

      // ✅ 从编辑器中拿到当前内容
      const updatedDescription = editorRef.current?.getContent() || "";

      const quizToSave = {
        ...editedQuiz,
        description: updatedDescription,
        published: true,
      };

      const isExistingQuiz = quizzes.some((q: any) => q._id === editedQuiz._id);
      let savedQuiz;

      if (isExistingQuiz) {
        console.log("Updating and publishing existing quiz:", quizToSave);
        savedQuiz = await quizzesClient.updateQuiz(quizToSave);
        dispatch(updateQuiz(savedQuiz));
      } else {
        console.log("Creating and publishing new quiz:", quizToSave);
        savedQuiz = await quizzesClient.createQuizForCourse(
          cid as string,
          quizToSave
        );
        dispatch(addQuiz(savedQuiz));
      }

      navigate(`/Kambaz/Courses/${quizToSave.course}/Quizzes`);
    } catch (err) {
      console.error("Error saving and publishing quiz:", err);
      setError("Failed to publish quiz. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuestion = () => {
    setNewQuestion({
      _id: uuidv4(),
      title: "",
      points: 1,
      text: "",
      correctAnswer: true,
      isEditing: true,
      type: "Multiple Choice",
      quiz: editedQuiz._id,
      course: cid,
    });
  };

  const handleQuestionChange = (questionId: string, updatedQuestion: any) => {
    const updatedQuestions = questions.map((q) =>
      q._id === questionId ? updatedQuestion : q
    );
    setQuestionsLocal(updatedQuestions);
  };

  // const handleCancelQuestion = (questionId: string) => {
  //   const updatedQuestions = questions.map((q) =>
  //     q._id === questionId ? { ...q, isEditing: false } : q
  //   );
  //   setQuestionsLocal(updatedQuestions);
  // };
  const handleCancelQuestion = (questionId: string) => {
    const original = originalQuestionsMap[questionId];

    const updatedQuestions = questions.map((q) =>
      q._id === questionId && original ? { ...original, isEditing: false } : q
    );

    setQuestionsLocal(updatedQuestions);
  };

  const handleSaveQuestion = async (question: any) => {
    try {
      let savedQuestion: any;

      if (!questions.some((q) => q._id === question._id)) {
        // New question
        console.log("Creating new question:", question);
        savedQuestion = await quizzesClient.createQuestion(editedQuiz._id, {
          ...question,
          quiz: editedQuiz._id,
          course: cid,
        });
        dispatch(addQuestion(savedQuestion));

        // Update local state
        setQuestionsLocal([
          ...questions,
          { ...savedQuestion, isEditing: false },
        ]);
        setNewQuestion(null);
      } else {
        // Existing question
        console.log("Updating existing question:", question);
        savedQuestion = await quizzesClient.updateQuestion(
          editedQuiz._id,
          question
        );
        dispatch(updateQuestion(savedQuestion));

        // Update local state
        const updatedQuestions = questions.map((q) =>
          q._id === savedQuestion._id
            ? { ...savedQuestion, isEditing: false }
            : q
        );
        setQuestionsLocal(updatedQuestions);
      }

      console.log("Question saved:", savedQuestion);
    } catch (error) {
      console.error("Failed to save question", error);
      setError("Failed to save question. Please try again.");
    }
  };

  // const handleEditQuestion = (questionId: string) => {
  //   const updatedQuestions = questions.map((q) =>
  //     q._id === questionId ? { ...q, isEditing: true } : q
  //   );
  //   setQuestionsLocal(updatedQuestions);
  // };
  const handleEditQuestion = (questionId: string) => {
    const original = questions.find((q) => q._id === questionId);
    if (original) {
      setOriginalQuestionsMap((prev) => ({
        ...prev,
        [questionId]: { ...original },
      }));
    }

    const updatedQuestions = questions.map((q) =>
      q._id === questionId ? { ...q, isEditing: true } : q
    );
    setQuestionsLocal(updatedQuestions);
  };

  const handleDeleteQuestion = async (questionId: string) => {
    try {
      console.log("Deleting question:", questionId);
      await quizzesClient.deleteQuestion(editedQuiz._id, questionId);
      dispatch(deleteQuestion(questionId));

      // Update local state
      const updatedQuestions = questions.filter((q) => q._id !== questionId);
      setQuestionsLocal(updatedQuestions);
    } catch (error) {
      console.error("Failed to delete question", error);
      setError("Failed to delete question. Please try again.");
    }
  };

  if (loading) {
    return <div className="text-center p-4">Loading quiz editor...</div>;
  }

  if (error) {
    return (
      <div className="alert alert-danger">
        {error}
        <Button
          className="ms-3"
          onClick={() => navigate(`/Kambaz/Courses/${cid}/Quizzes`)}
        >
          Return to Quizzes
        </Button>
      </div>
    );
  }

  return (
    <div className="quiz-editor mt-4">
      <div
        className="d-flex justify-content-end align-items-center mb-3"
        style={{ gap: "16px" }}
      >
        {/* <div>Points {editedQuiz.points}</div> */}
        <div>
          Points{" "}
          {key === "questions"
            ? questions.reduce((sum, q) => sum + (q.points || 0), 0)
            : editedQuiz.points}
        </div>
        {/* <div
          className="text-muted d-flex align-items-center"
          style={{ gap: "4px" }}
        >
          <FaBan />
          <span>Not Published</span>
        </div> */}
        {editedQuiz.published ? ( // ✅ Added
          <div
            className="text-success d-flex align-items-center"
            style={{ gap: "4px" }}
          >
            <span>✅ Published</span>
          </div>
        ) : (
          <div
            className="text-muted d-flex align-items-center"
            style={{ gap: "4px" }}
          >
            <FaBan />
            <span>Not Published</span>
          </div>
        )}
        {/* <Button
          variant="outline-secondary"
          size="sm"
          style={{
            backgroundColor: "rgb(240, 240, 240)",
            borderRadius: "6px",
            padding: "6px 4px",
            display: "flex",
            alignItems: "center",
            border: "1px solid rgb(200, 200, 200)",
          }}
        >
          <HiDotsVertical />
        </Button> */}
        <Dropdown align="end">
          <Dropdown.Toggle
            as={Button}
            variant="outline-secondary"
            size="sm"
            style={{
              backgroundColor: "rgb(240, 240, 240)",
              borderRadius: "6px",
              padding: "6px 4px",
              display: "flex",
              alignItems: "center",
              border: "1px solid rgb(200, 200, 200)",
            }}
          >
            <HiDotsVertical />
          </Dropdown.Toggle>

          <Dropdown.Menu>
            <Dropdown.Item
              onClick={() => navigate(`/Kambaz/Courses/${cid}/Quizzes/${qid}`)}
            >
              View
            </Dropdown.Item>
            {/* <Dropdown.Item
              onClick={() => {
                const updated = { ...editedQuiz, published: !editedQuiz.published };
                setEditedQuiz(updated);
              }}
            >
              {editedQuiz.published ? "Unpublish" : "Publish"}
            </Dropdown.Item> */}
            <Dropdown.Item
              onClick={async () => {
                const updated = {
                  ...editedQuiz,
                  published: !editedQuiz.published,
                };
                setEditedQuiz(updated);
                try {
                  const saved = await quizzesClient.updateQuiz(updated);
                  dispatch(updateQuiz(saved));
                } catch (error) {
                  console.error("Failed to toggle publish status:", error);
                }
              }}
            >
              {editedQuiz.published ? "Unpublish" : "Publish"}
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>

      <hr />
      <Tabs
        activeKey={key}
        onSelect={(k) => setKey(k || "details")}
        className="mb-3"
      >
        <Tab eventKey="details" title="Details">
          <Form id="wd-quizzes-editor" className="p-4">
            {/* Title */}
            <Form.Group className="mb-3">
              <FormControl
                value={editedQuiz.title}
                onChange={(e) =>
                  setEditedQuiz({ ...editedQuiz, title: e.target.value })
                }
                style={{ width: "500px" }}
              />
            </Form.Group>

            {/* Instructions */}
            {/* <Form.Group className="mb-3">
              <Form.Label>Quiz Instructions:</Form.Label>
              <Editor
                tinymceScriptSrc="/tinymce/tinymce.min.js"
                onInit={(_, editor: any) => (editorRef.current = editor)}
                initialValue={editedQuiz.description}
                init={{
                  base_url: "/tinymce",
                  height: 300,
                  menubar: "file edit view insert format tools table help",
                  plugins:
                    "advlist autolink lists link image charmap preview anchor searchreplace visualblocks code fullscreen insertdatetime media table paste help wordcount codesample",
                  toolbar:
                    "undo redo | blocks | bold italic underline strikethrough | " +
                    "forecolor backcolor | alignleft aligncenter alignright alignjustify | " +
                    "bullist numlist outdent indent | removeformat | help | table codesample fullscreen",
                  statusbar: true,
                  branding: false,
                  content_style:
                    "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
                }}
                onEditorChange={(content: any) =>
                  setEditedQuiz({ ...editedQuiz, description: content })
                }
              />
            </Form.Group> */}
            <Form.Group className="mb-3">
              <Form.Label>Quiz Instructions:</Form.Label>
              <Editor
                tinymceScriptSrc="/tinymce/tinymce.min.js"
                onInit={(_, editor: any) => (editorRef.current = editor)}
                initialValue={editedQuiz.description}
                init={{
                  base_url: "/tinymce",
                  height: 300,
                  menubar: "file edit view insert format tools table help",
                  plugins:
                    "advlist autolink lists link image charmap preview anchor searchreplace visualblocks code fullscreen insertdatetime media table paste help wordcount codesample",
                  toolbar:
                    "undo redo | blocks | bold italic underline strikethrough | " +
                    "forecolor backcolor | alignleft aligncenter alignright alignjustify | " +
                    "bullist numlist outdent indent | removeformat | help | table codesample fullscreen",
                  statusbar: true,
                  branding: false,
                  content_style:
                    "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
                }}
              />
            </Form.Group>

            {/* Points */}
            <Form.Group as={Row} className="mb-3 align-items-center">
              <Form.Label column sm={3} className="text-end">
                Total Points
              </Form.Label>
              <Col sm={9}>
                <Form.Control
                  type="number"
                  min={0}
                  value={editedQuiz.points}
                  onChange={(e) =>
                    setEditedQuiz({
                      ...editedQuiz,
                      points: parseInt(e.target.value),
                    })
                  }
                />
              </Col>
            </Form.Group>
            {/* Access Code */}
            <Form.Group as={Row} className="mb-3 align-items-center">
              <Form.Label column sm={3} className="text-end">
                Access Code
              </Form.Label>
              <Col sm={9}>
                <Form.Control
                  type="text"
                  value={editedQuiz.accessCode}
                  onChange={(e) =>
                    setEditedQuiz({
                      ...editedQuiz,
                      accessCode: e.target.value,
                    })
                  }
                />
              </Col>
            </Form.Group>

            {/* Quiz Type */}
            <Form.Group as={Row} className="mb-3 align-items-center">
              <Form.Label column sm={3} className="text-end">
                Quiz Type
              </Form.Label>
              <Col sm={9}>
                <Form.Select
                  value={editedQuiz.quizType}
                  onChange={(e) =>
                    setEditedQuiz({ ...editedQuiz, quizType: e.target.value })
                  }
                >
                  <option>Graded Quiz</option>
                  <option>Practice Quiz</option>
                  <option>Graded Survey</option>
                  <option>Ungraded Survey</option>
                </Form.Select>
              </Col>
            </Form.Group>

            {/* Assignment Group */}
            <Form.Group as={Row} className="mb-3">
              <Form.Label column sm={3} className="text-end">
                Assignment Group
              </Form.Label>

              <Col sm={9}>
                <Form.Group className="mb-3 position-relative">
                  <Form.Select
                    value={editedQuiz.assignmentGroup}
                    onChange={(e) =>
                      setEditedQuiz({
                        ...editedQuiz,
                        assignmentGroup: e.target.value,
                      })
                    }
                  >
                    <option>Quizzes</option>
                    <option>Exams</option>
                    <option>Assignments</option>
                    <option>Project</option>
                  </Form.Select>
                </Form.Group>
                {/* Options */}
                <Form.Group className="mb-3">
                  <Form.Label>
                    <strong>Options</strong>
                  </Form.Label>
                  <Form.Group className="mb-3 align-items-center">
                    <Form.Check
                      label="Shuffle Answers"
                      className="mt-2"
                      checked={editedQuiz.shuffleAnswers}
                      onChange={(e) =>
                        setEditedQuiz({
                          ...editedQuiz,
                          shuffleAnswers: e.target.checked,
                        })
                      }
                    />
                    <Form.Check
                      label="One Question at a Time"
                      className="mt-2"
                      checked={editedQuiz.oneQuestionAtATime}
                      onChange={(e) =>
                        setEditedQuiz({
                          ...editedQuiz,
                          oneQuestionAtATime: e.target.checked,
                        })
                      }
                    />
                    <Form.Check
                      label="Webcam Required"
                      className="mt-2"
                      checked={editedQuiz.webcamRequired}
                      onChange={(e) =>
                        setEditedQuiz({
                          ...editedQuiz,
                          webcamRequired: e.target.checked,
                        })
                      }
                    />
                    <Form.Check
                      label="Lock Questions After Answering"
                      className="mt-2"
                      checked={editedQuiz.lockQuestionsAfterAnswering}
                      onChange={(e) =>
                        setEditedQuiz({
                          ...editedQuiz,
                          lockQuestionsAfterAnswering: e.target.checked,
                        })
                      }
                    />
                    <Form.Check
                      label="View Responses"
                      className="mt-2"
                      checked={editedQuiz.viewResponse}
                      onChange={(e) =>
                        setEditedQuiz({
                          ...editedQuiz,
                          viewResponse: e.target.checked,
                        })
                      }
                    />
                    <Form.Check
                      label="Require Lockdown Browser"
                      className="mt-2"
                      checked={editedQuiz.requireLockdownBrowser}
                      onChange={(e) =>
                        setEditedQuiz({
                          ...editedQuiz,
                          requireLockdownBrowser: e.target.checked,
                        })
                      }
                    />
                    {/* Webcam Required */}
                    <Form.Check
                      label="Webcam Required"
                      className="mt-2"
                      checked={editedQuiz.webcamRequired}
                      onChange={(e) =>
                        setEditedQuiz({
                          ...editedQuiz,
                          webcamRequired: e.target.checked,
                        })
                      }
                    />
                    <Form.Check
                      label="Required to View Quiz Results"
                      className="mt-2"
                      checked={editedQuiz.requiredToViewResults}
                      onChange={(e) =>
                        setEditedQuiz({
                          ...editedQuiz,
                          requiredToViewResults: e.target.checked,
                        })
                      }
                    />
                    <Form.Check
                      type="checkbox"
                      label="Show Correct Answers"
                      checked={editedQuiz.showCorrectAnswers}
                      onChange={(e) =>
                        setEditedQuiz({
                          ...editedQuiz,
                          showCorrectAnswers: e.target.checked,
                        })
                      }
                    />

                    {/* Time Limit */}
                    <div className="d-flex align-items-center mt-2">
                      <Form.Check
                        label="Time Limit"
                        className="me-5"
                        checked={editedQuiz.hasTimeLimit}
                        onChange={(e) =>
                          setEditedQuiz({
                            ...editedQuiz,
                            hasTimeLimit: e.target.checked,
                          })
                        }
                      />
                      <Form.Control
                        type="number"
                        value={editedQuiz.timeLimit}
                        onChange={(e) =>
                          setEditedQuiz({
                            ...editedQuiz,
                            timeLimit: Number(e.target.value),
                          })
                        }
                        className="me-1"
                        style={{ width: "100px" }}
                        min={1}
                        disabled={!editedQuiz.hasTimeLimit}
                      />
                      Minutes
                    </div>
                    <div className="border rounded p-2 mt-2">
                      {/* <Form.Check
                        label="Allow Multiple Attempts"
                        checked={editedQuiz.multipleAttempts}
                        onChange={(e) =>
                          setEditedQuiz({
                            ...editedQuiz,
                            multipleAttempts: e.target.checked,
                          })
                        }
                      /> */}
                      <div className="border rounded p-2 mt-2">
                        <Form.Check
                          label="Allow Multiple Attempts"
                          checked={editedQuiz.multipleAttempts}
                          onChange={(e) =>
                            setEditedQuiz((prev) => ({
                              ...prev,
                              multipleAttempts: e.target.checked,
                              maxAttempts: e.target.checked
                                ? prev.maxAttempts || 1
                                : 1, // 默认设为1
                            }))
                          }
                        />

                        {editedQuiz.multipleAttempts && (
                          <div className="d-flex align-items-center mt-2 ps-4">
                            <span className="me-2">Max Attempts:</span>
                            <Form.Control
                              type="number"
                              min={1}
                              style={{ width: "100px" }}
                              value={editedQuiz.maxAttempts}
                              onChange={(e) =>
                                setEditedQuiz({
                                  ...editedQuiz,
                                  maxAttempts: Number(e.target.value),
                                })
                              }
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </Form.Group>
                </Form.Group>
              </Col>
            </Form.Group>

            {/* Assign to */}
            <Form.Group as={Row} className="mb-3">
              <Form.Label column sm={3} className="text-end">
                Assign
              </Form.Label>

              <Col sm={9}>
                <Card className="p-3" style={{ width: "500px" }}>
                  <Form.Group className="mb-3 position-relative">
                    <Form.Label>
                      <strong>Assign to</strong>
                    </Form.Label>
                    <div className="assign-input-wrapper">
                      <text className="assign-badge">
                        Everyone
                        <GoX className="assign-close-icon ms-3" />
                      </text>
                      <Form.Control type="text" className="assign-input" />
                    </div>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>
                      <strong>Due</strong>
                    </Form.Label>
                    <InputGroup>
                      <Form.Control
                        type="datetime-local"
                        className="custom-date-input"
                        value={editedQuiz.dueDate}
                        onChange={(e) =>
                          setEditedQuiz({
                            ...editedQuiz,
                            dueDate: e.target.value,
                          })
                        }
                      />
                    </InputGroup>
                  </Form.Group>

                  <Form.Group as={Row}>
                    <Col>
                      <Form.Label>
                        <strong>Available from</strong>
                      </Form.Label>
                      <InputGroup>
                        <Form.Control
                          type="datetime-local"
                          className="custom-date-input"
                          value={editedQuiz.availableFrom}
                          onChange={(e) =>
                            setEditedQuiz({
                              ...editedQuiz,
                              availableFrom: e.target.value,
                            })
                          }
                        />
                      </InputGroup>
                    </Col>

                    <Col>
                      <Form.Label>
                        <strong>Until</strong>
                      </Form.Label>
                      <InputGroup>
                        <Form.Control
                          type="datetime-local"
                          className="custom-date-input"
                          value={editedQuiz.availableUntil}
                          onChange={(e) =>
                            setEditedQuiz({
                              ...editedQuiz,
                              availableUntil: e.target.value,
                            })
                          }
                        />
                      </InputGroup>
                    </Col>
                  </Form.Group>
                  <div className="assign-add-section text-center">+ Add</div>
                </Card>
              </Col>
            </Form.Group>

            <hr
              style={{
                width: "30%",
                margin: "10px auto",
                borderTop: "1px solid #333",
              }}
            />
            <div className="d-flex justify-content-center gap-2">
              <Button
                variant="secondary"
                onClick={() => {
                  navigate(
                    `/Kambaz/Courses/${editedQuiz.course}/Quizzes/${editedQuiz._id}`
                  );
                }}
              >
                Cancel
              </Button>

              <button
                type="button"
                className="btn btn-danger"
                onClick={handleSave}
              >
                Save
              </button>
              <Button variant="primary" onClick={handleSaveAndPublish}>
                Save and Publish
              </Button>
            </div>
            <hr
              style={{
                width: "30%",
                margin: "10px auto",
                borderTop: "1px solid #333",
              }}
            />
          </Form>
        </Tab>

        {/* Questions tab */}
        <Tab eventKey="questions" title="Questions">
          <div className="p-3">
            {/* Questions List UI */}
            <div className="mb-3">
              {questions.length === 0 ? (
                <div className="alert alert-info">
                  No questions added yet. Click the "New Question" button to add
                  your first question.
                </div>
              ) : (
                <ul className="list-group">
                  {questions.map((question) => (
                    <li
                      key={question._id}
                      className="list-group-item d-flex justify-content-between align-items-center"
                    >
                      <div>
                        <strong>{question.title || "Untitled Question"}</strong>{" "}
                        - {question.points} pts
                      </div>
                      <div className="d-flex gap-2">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => handleEditQuestion(question._id)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleDeleteQuestion(question._id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Add new question button */}
            <div className="d-flex justify-content-between align-items-center mb-3">
              <Button
                style={{
                  backgroundColor: "#f5f5f5",
                  borderColor: "#ccc",
                  color: "#333",
                  display: "block",
                  margin: "20px auto",
                  padding: "6px 12px",
                }}
                size="lg"
                onClick={handleAddQuestion}
              >
                + New Question
              </Button>
            </div>

            {/* New question editor */}
            {newQuestion && (
              <QuestionEditor
                question={newQuestion}
                onChange={(updatedQuestion: any) =>
                  setNewQuestion(updatedQuestion)
                }
                onCancel={() => setNewQuestion(null)}
                onSave={handleSaveQuestion}
              />
            )}

            {/* Existing question editors */}
            {questions.map(
              (question) =>
                question.isEditing && (
                  <QuestionEditor
                    key={question._id}
                    question={question}
                    onChange={(updatedQuestion: any) =>
                      handleQuestionChange(question._id, updatedQuestion)
                    }
                    onCancel={() => handleCancelQuestion(question._id)}
                    onSave={handleSaveQuestion}
                  />
                )
            )}
          </div>
        </Tab>
      </Tabs>
    </div>
  );
}
