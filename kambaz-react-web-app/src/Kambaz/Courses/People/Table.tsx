// src/Kambaz/Courses/People/Table.tsx

import { Table, Button, Modal, Form } from "react-bootstrap";
import { FaUserCircle } from "react-icons/fa";
import { Link, useParams } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import * as usersClient from "./client";
import * as coursesClient from "../client";
import { useSelector } from "react-redux";
import PeopleDetails from "./Details";

export default function PeopleTable({ users = [] }: { users?: any[] }) {
  const { cid } = useParams();
  const [courseUsers, setCourseUsers] = useState<any[]>(users);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    password: "password123",
    role: "STUDENT",
    lastActivity: "",
    totalActivity: 0,
  });

  // Use ref to prevent multiple fetches
  const dataFetched = useRef(false);

  const currentUser = useSelector((state: any) => state.accountReducer.currentUser);
  const enrollments = useSelector((state: any) => state.enrollmentReducer.enrollments);

  // Load users logic
  const loadUsers = async () => {
    if (!cid || dataFetched.current) return;
    
    setLoading(true);
    try {
      console.log(`Loading users for course: ${cid}`);
      // If we're in the admin Users panel, just get all users
      if (window.location.pathname.includes('/Account/Users')) {
        const data = await usersClient.findAllUsers();
        console.log("All users loaded:", data);
        setCourseUsers(data || []);
      } else {
        // Otherwise, get users for this specific course
        const data = await coursesClient.findUsersForCourse(cid);
        console.log(`Users for course ${cid}:`, data);
        setCourseUsers(data || []);
      }
      // Mark as fetched to prevent loops
      dataFetched.current = true;
    } catch (error) {
      console.error("Failed to load users:", error);
      setCourseUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Reset our fetch flag if the course ID changes
    if (cid !== undefined) {
      dataFetched.current = false;
    }
    
    if (users.length > 0) {
      setCourseUsers(users);
      dataFetched.current = true;
    } else if (!dataFetched.current) {
      loadUsers();
    }
    
    // Cleanup function to reset the flag if component unmounts
    return () => {
      dataFetched.current = false;
    };
  }, [cid]); // Only depend on cid, not users
  
  // User sections mapping
  const userSections: Record<string, Set<string>> = {};
  (enrollments || []).forEach((enrollment: any) => {
    if (!userSections[enrollment.user]) userSections[enrollment.user] = new Set();
    userSections[enrollment.user].add(enrollment.course);
  });

  // Save user logic
  const handleSave = async () => {
    try {
      if (editingUser) {
        // Update existing user
        const updated = await usersClient.updateUser({ 
          ...editingUser, 
          ...formData,
          // Ensure we're using the right field names
          username: formData.username || editingUser.username
        });
        setCourseUsers(courseUsers.map(u => u._id === updated._id ? updated : u));
      } else {
        // Create new user
        const created = await usersClient.createUser({
          ...formData,
          // Ensure we have required fields
          username: formData.username,
          password: formData.password || "password123"
        });
        setCourseUsers([...courseUsers, created]);
      }
      
      setShowModal(false);
      setFormData({ 
        firstName: "", 
        lastName: "", 
        username: "", 
        password: "password123",
        role: "STUDENT", 
        lastActivity: "", 
        totalActivity: 0 
      });
      setEditingUser(null);
      
      // Don't refresh the list - this causes the infinite loop
      // loadUsers();
      // Instead, just let the state update naturally
    } catch (error) {
      console.error("Error saving user:", error);
      alert("Error saving user. Check console for details.");
    }
  };

  // Delete user logic
  const handleDelete = async (userId: string) => {
    try {
      await usersClient.deleteUser(userId);
      setCourseUsers(courseUsers.filter(u => u._id !== userId));
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Error deleting user. Check console for details.");
    }
  };
  return (
    <div id="wd-people-table">
      <PeopleDetails />
      
      {currentUser?.role === "FACULTY" && (
        <Button className="mb-3" onClick={() => setShowModal(true)}>+ Add User</Button>
      )}
      
      {loading ? (
        <div className="text-center p-4">Loading users...</div>
      ) : courseUsers.length === 0 ? (
        <div className="alert alert-info">No users found.</div>
      ) : (
        <Table striped>
          <thead>
            <tr>
              <th>Name</th>
              <th>Login ID</th>
              <th>Sections</th>
              <th>Role</th>
              <th>Last Activity</th>
              <th>Total Activity</th>
              {currentUser?.role === "FACULTY" && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {courseUsers.map((user) => (
              <tr key={user._id}>
                <td className="text-nowrap">
                  <Link to={`/Kambaz/Account/Users/${user._id}`} className="text-decoration-none">
                    <FaUserCircle className="me-2 fs-1 text-secondary" />
                    <span className="wd-first-name">{user.firstName}</span>{" "}
                    <span className="wd-last-name">{user.lastName}</span>
                  </Link>
                </td>
                <td>{user.loginId || user.username}</td>
                <td>{user._id && userSections[user._id] ? 
                  [...userSections[user._id]].join(", ") : 
                  ""}
                </td>
                <td>{user.role}</td>
                <td>{user.lastActivity}</td>
                <td>{user.totalActivity}</td>
                {currentUser?.role === "FACULTY" && (
                  <td>
                    <Button size="sm" variant="warning" className="me-2" onClick={() => {
                      setEditingUser(user);
                      setFormData({
                        firstName: user.firstName || '',
                        lastName: user.lastName || '',
                        username: user.username || user.loginId || '',
                        password: "password123", // Default for existing users
                        role: user.role || 'STUDENT',
                        lastActivity: user.lastActivity || '',
                        totalActivity: user.totalActivity || 0,
                      });
                      setShowModal(true);
                    }}>Edit</Button>
                    <Button size="sm" variant="danger" onClick={() => handleDelete(user._id)}>Delete</Button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{editingUser ? "Edit User" : "Create User"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-2">
              <Form.Label>First Name</Form.Label>
              <Form.Control value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Last Name</Form.Label>
              <Form.Control value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Username</Form.Label>
              <Form.Control value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} />
            </Form.Group>
            {!editingUser && (
              <Form.Group className="mb-2">
                <Form.Label>Password</Form.Label>
                <Form.Control 
                  type="password"
                  value={formData.password} 
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })} 
                />
              </Form.Group>
            )}
            <Form.Group className="mb-2">
              <Form.Label>Role</Form.Label>
              <Form.Select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })}>
                <option value="STUDENT">STUDENT</option>
                <option value="FACULTY">FACULTY</option>
                <option value="ADMIN">ADMIN</option>
                <option value="TA">TA</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Last Activity</Form.Label>
              <Form.Control value={formData.lastActivity} onChange={(e) => setFormData({ ...formData, lastActivity: e.target.value })} />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Total Activity</Form.Label>
              <Form.Control type="number" value={formData.totalActivity} onChange={(e) => setFormData({ ...formData, totalActivity: parseInt(e.target.value || "0") })} />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button onClick={handleSave}>{editingUser ? "Update" : "Create"}</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}