// src/Kambaz/Courses/Quizzes/QuizControlButtons.tsx
import { FaTrash } from "react-icons/fa";
// import { IoEllipsisVertical } from "react-icons/io5";
import { BsPlus } from "react-icons/bs";
import GreenCheckmark from "./GreenCheckmark";
import { useSelector, useDispatch } from "react-redux";
import { deleteQuiz } from "./reducer";
import * as quizzesClient from "./client";
import QuizMenu from "./QuizMenu";
import { FaBan } from "react-icons/fa";


export default function QuizControlButtons({ quizId }: { quizId: string }) {
  const { currentUser } = useSelector((state: any) => state.accountReducer);
  const dispatch = useDispatch();
  // Find the specific quiz to check its published status
  const quiz = useSelector((state: any) =>
    state.quizzesReducer.quizzes.find((q: any) => q._id === quizId)
  );
  
  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (window.confirm("Are you sure you want to delete this quiz?")) {
      try {
        console.log("Deleting quiz:", quizId);
        await quizzesClient.deleteQuiz(quizId);
        dispatch(deleteQuiz(quizId));
      } catch (error) {
        console.error("Error deleting quiz:", error);
        alert("Failed to delete quiz. Please try again.");
      }
    }
  };
  
  return (
    <div className="d-flex flex-row gap-3">
      {currentUser?.role === "FACULTY" && (
        <FaTrash 
          className="text-danger me-2" 
          onClick={handleDelete} 
          style={{ cursor: 'pointer', fontSize: "1.2rem" }}
        />
      )}
      {/* Publish Status Indicator */}
      {/* Wrap GreenCheckmark in a span if you were to add onClick={handleTogglePublish} */}
      {quiz?.published ? (
          <span title="Published" style={{ fontSize: "1.2rem" }}>
          <GreenCheckmark /></span>
       ) : (
         <span title="Unpublished" className="text-secondary" style={{ fontSize: "1.2rem"}}> 
             <FaBan />
         </span>
       )}
      {/* <GreenCheckmark /> */}
      {/* <BsPlus className="fs-4" /> */}
      {/* <IoEllipsisVertical className="fs-4" /> */}
      <div style={{ fontSize: "1.2rem" }}>
      <QuizMenu quizId={quizId} />
      </div>
     
    </div>
  );
}