// src/Kambaz/Courses/Modules/ModuleControlButtons.tsx
import { FaTrash } from "react-icons/fa";
import { FaPencil } from "react-icons/fa6";
import { IoEllipsisVertical } from "react-icons/io5";
import { BsPlus } from "react-icons/bs";
import GreenCheckmark from "./GreenCheckmark";

export default function ModuleControlButtons({ 
  moduleId, 
  deleteModule, 
  editModule 
}: { 
  moduleId: string; 
  deleteModule: (moduleId: string) => void; 
  editModule: (moduleId: string) => void 
}) {
  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("Delete button clicked for module:", moduleId);
    deleteModule(moduleId);
  };
  
  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("Edit button clicked for module:", moduleId);
    editModule(moduleId);
  };
  
  return (
    <div className="float-end">
      <FaPencil onClick={handleEdit} className="text-primary me-3" style={{ cursor: 'pointer' }} />
      <FaTrash className="text-danger me-2 mb-1" onClick={handleDelete} style={{ cursor: 'pointer' }} />
      <GreenCheckmark />
      <BsPlus className="fs-4" />
      <IoEllipsisVertical className="fs-4" />
    </div>
  );
}