import { Dropdown } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useState } from "react";
import { deleteQuiz } from "./reducer";
import { FaBan } from "react-icons/fa6";
import { FaCheckCircle } from "react-icons/fa";
import * as quizzesClient from "./client";

export default function QuizMenu({ quizId, quizzes : quizzesProp}: { quizId?: string; quizzes?: any[]; }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { cid } = useParams();
  const quizzes = quizzesProp || useSelector((state: any) => state.quizzesReducer.quizzes);
  //replaced on april 20
  // const { quizzes } = useSelector((state: any) => state.quizzesReducer);
  // const [isPublished, setIsPublished] = useState(false); 
  const quiz = quizzes.find((q: any) => q._id === quizId);
  const isPublished = quiz?.published || false;

  const handleDelete = async () => {
    try {
      let idToDelete = quizId;
      if (!idToDelete && quizzes.length > 0) {
        idToDelete = quizzes[quizzes.length - 1]._id;
      }
  
      if (!idToDelete) return;
  
      await quizzesClient.deleteQuiz(idToDelete); // delete and update database
      dispatch(deleteQuiz(idToDelete));           // update front end status
    } catch (err) {
      console.error("Failed to delete quiz:", err);
      alert("Delete failed. Please try again.");
    }
  };
  const handleEdit = () => {
    if (quizId) {
      navigate(`/Kambaz/Courses/${cid}/Quizzes/${quizId}`);
    } else if (quizzes.length > 0) {
      const lastId = quizzes[quizzes.length - 1]._id;
      navigate(`/Kambaz/Courses/${cid}/Quizzes/${lastId}`);
    }
  };

  const handleCopy = async () => {
    let quizToCopy;
    if (quizId) {
      quizToCopy = quizzes.find((q: any) => q._id === quizId);
    } else if (quizzes.length > 0) {
      quizToCopy = quizzes[quizzes.length - 1];
    }
    if (!quizToCopy) return;
  
    const copied = {
      ...quizToCopy,
      _id: undefined, // 💡 让后端自动生成新 ID
      title: `${quizToCopy.title} (Copy)`,
      published: false,
    };
  
    try {
      const saved = await quizzesClient.createQuizForCourse(cid as string, copied); // 💾 保存到后端
      dispatch({ type: "quizzes/addQuiz", payload: saved }); // 🧠 再更新前端 Redux
    } catch (err) {
      console.error("Failed to copy quiz:", err);
      alert("Copy failed. Please try again.");
    }
  };
  const handleSort = () => {
    if (!cid) return;
  
    const courseQuizzes = quizzes.filter((q: any) => q.course === cid);
    const otherQuizzes = quizzes.filter((q: any) => q.course !== cid);
  
    const sorted = [...courseQuizzes].sort((a, b) =>
      a.title.localeCompare(b.title)
    );
  
    dispatch({
      type: "quizzes/setQuizzes",
      payload: [...otherQuizzes, ...sorted],
    });
  };
  // const handleSort = () => {
  //   const sorted = [...quizzes].sort((a, b) => {
  //     const dateA = a.dueDate ? new Date(a.dueDate).getTime() : 0;
  //     const dateB = b.dueDate ? new Date(b.dueDate).getTime() : 0;
  //     return dateA - dateB;
  //   });
  //   dispatch({ type: "quizzes/setQuizzes", payload: sorted });
  // };
  const handleTogglePublish = async () => {
    let targetQuiz;
  
    if (quizId) {
      // ✅ 如果指定 quizId，就只修改该 quiz 的 published 状态
      targetQuiz = quizzes.find((q: any) => q._id === quizId);
    } else if (quizzes.length > 0) {
      // ✅ 否则，默认操作列表中的最后一个 quiz
      targetQuiz = quizzes[quizzes.length - 1];
    }
  
    if (!targetQuiz) return;
  
    const updated = {
      ...targetQuiz,
      published: !targetQuiz.published,
    };
  
    try {
      // ✅ 发请求更新数据库中的 quiz
      const saved = await quizzesClient.updateQuiz(updated);
      
      // ✅ 用 updateQuiz 来更新 Redux store，确保刷新后状态保留
      dispatch({ type: "quizzes/updateQuiz", payload: saved });
    } catch (error) {
      console.error("❌ Failed to toggle publish status:", error);
    }
  };

  return (
    <Dropdown align="end">
      <Dropdown.Toggle variant="secondary" size="sm" className="px-2 py-1">
        ⋮
      </Dropdown.Toggle>

      <Dropdown.Menu>
        <Dropdown.Item onClick={handleEdit}>✏️ Edit Quiz</Dropdown.Item>
        <Dropdown.Item onClick={handleDelete}>🗑️ Delete Quiz</Dropdown.Item>
        <Dropdown.Item onClick={handleTogglePublish}>
          {isPublished ? (
            <span>
              <FaBan className="me-2 text-danger" />
              Unpublish
            </span>
          ) : (
            <span>
              <FaCheckCircle className="me-2 text-success" />
              Publish
            </span>
          )}
        </Dropdown.Item>
        <Dropdown.Item onClick={handleCopy}>
        📋 Copy
        </Dropdown.Item>
        <Dropdown.Item onClick={handleSort}>
        🔃 Sort
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
}
