// src/Kambaz/Courses/Assignments/index.tsx
import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams } from "react-router";
import { setAssignments, addAssignment, deleteAssignment as deleteAssignmentAction } from "./reducer";
import AssignmentsControls from "./AssignmentsControls";
import { IoEllipsisVertical } from "react-icons/io5";
import { LuNotebookPen } from "react-icons/lu";
import { BsGripVertical, BsPlus } from "react-icons/bs";
import AssignmentControlButtons from "./AssignmentControlButtons";
import * as assignmentsClient from "./client";

export default function Assignments() {
  const { currentUser } = useSelector((state: any) => state.accountReducer);
  const { cid } = useParams();
  const { assignments } = useSelector((state: any) => state.assignmentsReducer);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [assignmentName, setAssignmentName] = useState("");

  useEffect(() => {
    async function fetchAssignments() {
      if (!cid) return;
      
      setLoading(true);
      setError(null);
      
      try {
        console.log("Fetching assignments for course:", cid);
        const data = await assignmentsClient.findAssignmentsForCourse(cid);
        console.log("Assignments fetched:", data);
        
        if (Array.isArray(data)) {
          dispatch(setAssignments(data));
        } else {
          console.error("Assignments data is not an array:", data);
        }
      } catch (error) {
        const err = error as Error;
        console.error("Error fetching assignments:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchAssignments();
  }, [cid, dispatch]);

  const handleSaveAssignment = async (assignment: any) => {
    if (!cid) return;
    
    setError(null);
    
    try {
      console.log("Creating assignment for course:", cid, assignment);
      const createdAssignment = await assignmentsClient.createAssignmentForCourse(cid, assignment);
      console.log("Assignment created:", createdAssignment);
      
      dispatch(addAssignment(createdAssignment));
      setAssignmentName("");
    } catch (error) {
      const err = error as Error;
      console.error("Error creating assignment:", err);
      setError(err.message);
    }
  };

  const handleDeleteAssignment = async (assignmentId: string) => {
    setError(null);
    
    try {
      console.log("Deleting assignment:", assignmentId);
      await assignmentsClient.deleteAssignment(assignmentId);
      console.log("Assignment deleted successfully");
      
      dispatch(deleteAssignmentAction(assignmentId));
    } catch (error) {
      const err = error as Error;
      console.error("Error deleting assignment:", err);
      setError(err.message);
    }
  };

  const courseAssignments = assignments.filter(
    (assignment: any) => assignment.course === cid
  );

  return (
    <div className="d-flex flex-column">
      
      {currentUser?.role === "FACULTY" && (
        <div className="mb-4">
          <AssignmentsControls
            assignmentName={assignmentName}
            setAssignmentName={setAssignmentName}
            addAssignment={handleSaveAssignment}
          />
        </div>
      )}

      {loading ? (
        <div className="text-center p-4">Loading assignments...</div>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : (
        <ul id="wd-assignments" className="list-group rounded-0">
          <li className="wd-module list-group-item p-0 border-gray">
            <div className="wd-title p-3 ps-2 bg-secondary d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center gap-3">
                <BsGripVertical className="fs-3" />
                <h5 className="mb-0">ASSIGNMENTS</h5>
              </div>
              <div className="d-flex align-items-center gap-3">
                <h6 className="mb-0 text-muted">40% of Total</h6>
                <BsPlus className="fs-4" />
                <IoEllipsisVertical className="fs-4" />
              </div>
            </div>
          </li>

          {courseAssignments.length === 0 ? (
            <li className="list-group-item text-center p-3">
              No assignments available for this course.
            </li>
          ) : (
            courseAssignments.map((assignment: any) => (
              <li key={assignment._id} className="wd-assignment list-group-item border-gray">
                <div className="d-flex justify-content-between align-items-center">
                  <div className="d-flex align-items-center gap-2">
                    <div className="d-flex flex-row align-items-center">
                      <BsGripVertical className="fs-5 text-secondary" />
                      <LuNotebookPen className="text-success fs-5" />
                    </div>
                    <div className="d-flex flex-column">
                      <a
                        href={`#/Kambaz/Courses/${cid}/Assignments/${assignment._id}`}
                        className="fw-bold text-dark text-decoration-none"
                      >
                        {assignment.title}
                      </a>
                      <div className="text-muted small">
                        <span className="text-danger">Multiple Assignments</span> |
                        <strong> Not available until </strong> {assignment.availableFrom || "Not set"} |
                        <strong> Due </strong> {assignment.dueDate || "Not set"} | {assignment.points} pts
                      </div>
                    </div>
                  </div>
                  <div className="d-flex flex-row">
                    <AssignmentControlButtons
                      assignmentId={assignment._id}
                      deleteAssignment={handleDeleteAssignment}
                    />
                  </div>
                </div>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}