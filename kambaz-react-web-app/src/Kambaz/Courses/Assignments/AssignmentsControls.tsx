import { FaPlus } from "react-icons/fa6";
import { Button, FormControl } from "react-bootstrap";
import { IoEllipsisVertical } from "react-icons/io5";
import { useState } from "react";
import AssignmentEditor from "./AssignmentEditor";
import { useSelector } from "react-redux";

export default function AssignmentsControls(
  { assignmentName, setAssignmentName, addAssignment }:
    { assignmentName: string; setAssignmentName: (title: string) => void; addAssignment: (assignment: any) => void; }) {
  const { currentUser } = useSelector((state: any) => state.accountReducer);

  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  return (
    <div id="wd-assignments-controls" className="d-flex align-items-center justify-content-between">
      <div className="flex-grow-1 me-3">
        <FormControl className="w-100 border-secondary" placeholder="Search for Assignment" />
      </div>

      {currentUser?.role === "FACULTY" && (
        <div className="d-flex align-items-center gap-2">
          <Button variant="secondary" size="lg">
            <FaPlus className="me-2" />
            Group
          </Button>
          <Button variant="danger" size="lg" onClick={handleShow}>
            <FaPlus className="me-2" />
            Assignment
          </Button>
          <Button variant="secondary" size="lg">
            <IoEllipsisVertical className="fs-4" />
          </Button>
        </div>
      )}

      <AssignmentEditor
        show={show}
        handleClose={handleClose}
        dialogTitle="Add Assignment"
        assignmentName={assignmentName}
        setAssignmentName={setAssignmentName}
        addAssignment={addAssignment}
      />
    </div>
  );
}
