// src/Kambaz/Courses/Assignments/Editor.tsx
import { Form, Button, Container, Row, Col } from "react-bootstrap";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { addAssignment, updateAssignment } from "./reducer";
import * as assignmentsClient from "./client";

export default function AssignmentEditor() {
  const { currentUser } = useSelector((state: any) => state.accountReducer);
  const { cid, aid } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { assignments } = useSelector((state: any) => state.assignmentsReducer);

  const [loading, setLoading] = useState(false);
  const [assignment, setAssignment] = useState({
    _id: "",
    title: "",
    description: "",
    points: 100,
    dueDate: "",
    availableFrom: "",
    availableUntil: "",
    course: cid,
  });
  
  // Debug info
  const [debugInfo, setDebugInfo] = useState({
    assignmentId: "",
    courseId: "",
    loading: false,
    error: null as Error | null
  });

  useEffect(() => {
    console.log("AssignmentEditor render with params:", { cid, aid });
    setDebugInfo(prev => ({
      ...prev,
      assignmentId: aid || "",
      courseId: cid || ""
    }));
    
    // If we have an assignment ID, try to find the existing assignment
    if (aid) {
      console.log("Looking for existing assignment in store:", aid);
      // First check if it's in the Redux store
      const existingAssignment = assignments.find((a: any) => a._id === aid);
      if (existingAssignment) {
        console.log("Found existing assignment in store:", existingAssignment);
        setAssignment(existingAssignment);
      } else {
        // Otherwise, fetch it from the API
        console.log("Assignment not found in store, fetching from API");
        fetchAssignment();
      }
    }
  }, [aid, assignments, cid]);

  const fetchAssignment = async () => {
    if (!aid) return;
    
    setLoading(true);
    setDebugInfo(prev => ({ ...prev, loading: true }));
    
    try {
      console.log("Fetching assignment by ID:", aid);
      const result = await assignmentsClient.findAssignmentById(aid);
      console.log("Assignment fetched:", result);
      
      if (result && typeof result === 'object' && '_id' in result) {
        setAssignment(result);
      }
    } catch (error) {
      console.error("Failed to fetch assignment:", error);
      setDebugInfo(prev => ({ ...prev, error: error as Error }));
    } finally {
      setLoading(false);
      setDebugInfo(prev => ({ ...prev, loading: false }));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setAssignment({ ...assignment, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      if (assignment._id) {
        // Update existing assignment
        console.log("Updating existing assignment:", assignment);
        const updated = await assignmentsClient.updateAssignment(assignment);
        console.log("Assignment updated:", updated);
        dispatch(updateAssignment(updated));
      } else {
        // Create new assignment
        const newAssignment = {
          ...assignment,
          course: cid || ""
        };
        
        console.log("Creating new assignment:", newAssignment);
        // Make API call
        const created = await assignmentsClient.createAssignmentForCourse(cid as string, newAssignment);
        console.log("Assignment created:", created);
        // Update Redux store with returned data
        dispatch(addAssignment(created));
      }
      
      // Navigate back to assignments list
      navigate(`/Kambaz/Courses/${cid}/Assignments`);
    } catch (error) {
      console.error("Failed to save assignment:", error);
      setDebugInfo(prev => ({ ...prev, error: error as Error }));
    }
  };

  // Emergency debug panel - remove in production
  const DebugPanel = () => (
    <div style={{ 
      border: '2px solid red', 
      borderRadius: '5px', 
      padding: '10px', 
      marginBottom: '20px',
      backgroundColor: '#ffeeee'
    }}>
      <h5>Debug Info</h5>
      <p><strong>Course ID:</strong> {debugInfo.courseId}</p>
      <p><strong>Assignment ID:</strong> {debugInfo.assignmentId}</p>
      <p><strong>Loading:</strong> {debugInfo.loading ? 'Yes' : 'No'}</p>
      {debugInfo.error && (
        <p><strong>Error:</strong> {debugInfo.error.message}</p>
      )}
      <button 
        className="btn btn-sm btn-danger" 
        onClick={() => console.log("Current State:", { assignment, assignments, cid, aid })}
      >
        Log State
      </button>
    </div>
  );

  if (loading) {
    return (
      <Container className="mt-4">
        <DebugPanel />
        <div className="text-center">
          <h4>Loading assignment...</h4>
        </div>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <DebugPanel />
      <h4>{assignment._id ? "Edit Assignment" : "New Assignment"}</h4>
      <Form.Control 
        type="text" 
        name="title" 
        value={assignment.title || ""} 
        onChange={handleChange} 
        className="mb-3" 
        placeholder="Assignment Title"
      />

      <Form.Group className="mb-3">
        <Form.Label>Description</Form.Label>
        <Form.Control 
          as="textarea" 
          name="description" 
          rows={4} 
          value={assignment.description || ""} 
          onChange={handleChange} 
          placeholder="Assignment Description"
        />
      </Form.Group>

      <Row className="mb-3">
        <Col md={3}>
          <Form.Group>
            <Form.Label>Points</Form.Label>
            <Form.Control 
              type="number" 
              name="points" 
              value={assignment.points || 100} 
              onChange={handleChange} 
            />
          </Form.Group>
        </Col>
      </Row>

      <Row className="mb-3">
        <Col md={6}>
          <Form.Group>
            <Form.Label>Due Date</Form.Label>
            <Form.Control 
              type="date" 
              name="dueDate" 
              value={assignment.dueDate || ""} 
              onChange={handleChange} 
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group>
            <Form.Label>Available from</Form.Label>
            <Form.Control 
              type="date" 
              name="availableFrom" 
              value={assignment.availableFrom || ""} 
              onChange={handleChange} 
            />
          </Form.Group>
        </Col>
      </Row>

      <Row className="mb-3">
        <Col md={6}>
          <Form.Group>
            <Form.Label>Available until</Form.Label>
            <Form.Control 
              type="date" 
              name="availableUntil" 
              value={assignment.availableUntil || ""} 
              onChange={handleChange} 
            />
          </Form.Group>
        </Col>
      </Row>

      <div className="mb-4">
        <Row>
          <Col>
            <Link to={`/Kambaz/Courses/${cid}/Assignments`}>
              <Button variant="secondary" className="me-2">Cancel</Button>
            </Link>
            {currentUser?.role === "FACULTY" && (
              <Button variant="primary" onClick={handleSave}>Save</Button>
            )}
          </Col>
        </Row>
      </div>
    </Container>
  );
}