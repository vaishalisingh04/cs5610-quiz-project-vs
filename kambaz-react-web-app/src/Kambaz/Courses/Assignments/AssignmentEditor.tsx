import { Button, FormControl, Form, Modal } from "react-bootstrap";
import { useState, useEffect } from "react";
import * as assignmentsClient from "./client";
import { useDispatch } from "react-redux";
import { updateAssignment, addAssignment } from "./reducer";

interface AssignmentEditorProps {
  show: boolean;
  handleClose: () => void;
  dialogTitle: string;
  assignmentName: string;
  setAssignmentName: (title: string) => void;
  addAssignment: (assignment: any) => void;
  assignment?: any;
}

export default function AssignmentEditor({
  show,
  handleClose,
  dialogTitle,
  setAssignmentName,
  addAssignment,
  assignment,
}: AssignmentEditorProps) {
  const dispatch = useDispatch();

  const [editedAssignment, setEditedAssignment] = useState({
    _id: assignment?._id || "",
    title: assignment?.title || "",
    description: assignment?.description || "",
    points: assignment?.points || 100,
    dueDate: assignment?.dueDate || "",
    availableFrom: assignment?.availableFrom || "",
    availableUntil: assignment?.availableUntil || "",
    course: assignment?.course || "",
  });

  useEffect(() => {
    if (assignment) {
      setEditedAssignment({
        _id: assignment._id,
        title: assignment.title,
        description: assignment.description,
        points: assignment.points,
        dueDate: assignment.dueDate,
        availableFrom: assignment.availableFrom,
        availableUntil: assignment.availableUntil,
        course: assignment.course,
      });
    }
  }, [assignment]);

  const handleSave = async () => {
    if (editedAssignment._id) {
      const updated = await assignmentsClient.updateAssignment(editedAssignment);
      dispatch(updateAssignment(updated));
    } else {
      addAssignment(editedAssignment); // New creation logic passed from parent
    }
    handleClose();
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>{dialogTitle}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Title</Form.Label>
            <FormControl
              value={editedAssignment.title}
              onChange={(e) => {
                setEditedAssignment({ ...editedAssignment, title: e.target.value });
                setAssignmentName(e.target.value);
              }}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <FormControl
              as="textarea"
              rows={3}
              value={editedAssignment.description}
              onChange={(e) => setEditedAssignment({ ...editedAssignment, description: e.target.value })}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Points</Form.Label>
            <FormControl
              type="number"
              value={editedAssignment.points}
              onChange={(e) => setEditedAssignment({ ...editedAssignment, points: Number(e.target.value) })}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Due Date</Form.Label>
            <FormControl
              type="date"
              value={editedAssignment.dueDate}
              onChange={(e) => setEditedAssignment({ ...editedAssignment, dueDate: e.target.value })}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Available From</Form.Label>
            <FormControl
              type="date"
              value={editedAssignment.availableFrom}
              onChange={(e) => setEditedAssignment({ ...editedAssignment, availableFrom: e.target.value })}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Available Until</Form.Label>
            <FormControl
              type="date"
              value={editedAssignment.availableUntil}
              onChange={(e) => setEditedAssignment({ ...editedAssignment, availableUntil: e.target.value })}
            />
          </Form.Group>

          <div className="d-flex gap-2">
            <Button variant="secondary" onClick={handleClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save</Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
}
