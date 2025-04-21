// src/Kambaz/Courses/Quizzes/QuizzesControls.tsx
import { FaPlus } from "react-icons/fa6";
import { Dropdown,Button, Form, FormControl, Modal } from "react-bootstrap";
// import { IoEllipsisVertical } from "react-icons/io5";
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux"; 
import { addQuiz } from "./reducer";
import * as quizzesClient from "./client";
import { v4 as uuidv4 } from "uuid";
import QuizMenu from "./QuizMenu";

export default function QuizzesControls({
  quizName,
  setQuizName,
  addQuiz,
}: {
  quizName: string;
  setQuizName: (title: string) => void;
  addQuiz: (quiz: any) => void;
}) {
  const { cid } = useParams();
  // const navigate = useNavigate();
  const quizzes = useSelector((state: any) => state.quizzesReducer.quizzes || []);
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const [quizPoints, setQuizPoints] = useState(100);

  const handleAddQuiz = () => {
    const newQuiz = {
      _id: uuidv4(),
      title: quizName || "New Quiz",
      description: "",
      points: quizPoints,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      availableFrom: new Date().toISOString(),
      availableUntil: new Date(
        Date.now() + 14 * 24 * 60 * 60 * 1000
      ).toISOString(),
      course: cid,
      questions: 0,
      published: false,
    };

    addQuiz(newQuiz);
    setShow(false);
  };

  return (
    <div
      id="wd-quizzes-controls"
      className="d-flex align-items-center justify-content-between"
    >
      <div className="flex-grow-1 me-3">
        <FormControl
          className="w-100 border-secondary"
          placeholder="Search for Quiz"
        />
      </div>

      <div className="d-flex align-items-center gap-2">
        <Button variant="secondary" size="lg">
          <FaPlus className="me-2" />
          Group
        </Button>
        <Button variant="danger" size="lg" onClick={handleShow}>
          <FaPlus className="me-2" />
          Quiz
        </Button>
        <Button variant="secondary" size="lg">
          <QuizMenu quizzes={quizzes} />
        </Button>
        
      </div>

      {/* Modal for creating a new quiz */}
      <Modal show={show} onHide={handleClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>Add Quiz</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Title</Form.Label>
              <FormControl
                value={quizName}
                onChange={(e) => setQuizName(e.target.value)}
                placeholder="Quiz Title"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Points</Form.Label>
              <Form.Control
                type="number"
                value={quizPoints}
                onChange={(e) => setQuizPoints(Number(e.target.value))}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleAddQuiz}>Add Quiz</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
