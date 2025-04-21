// src/Kambaz/Courses/Assignments/AssignmentControlButtons.tsx
import { FaTrash } from "react-icons/fa";
import { IoEllipsisVertical } from "react-icons/io5";
import { BsPlus } from "react-icons/bs";
import GreenCheckmark from "./GreenCheckmark";
import { useSelector } from "react-redux";

export default function AssignmentControlButtons({ 
  assignmentId, 
  deleteAssignment 
}: { 
  assignmentId: string; 
  deleteAssignment: (assignmentId: string) => void; 
}) {
  const { currentUser } = useSelector((state: any) => state.accountReducer);
  
  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("Delete button clicked for assignment:", assignmentId);
    deleteAssignment(assignmentId);
  };
  
  return (
    <div className="d-flex flex-row">
      {currentUser?.role === "FACULTY" && (
        <FaTrash 
          className="text-danger me-2" 
          onClick={handleDelete}
          style={{ cursor: 'pointer' }}
        />
      )}

      <GreenCheckmark />
      <BsPlus className="fs-4" />
      <IoEllipsisVertical className="fs-4" />
    </div>
  );
}