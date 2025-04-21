// src/Kambaz/Courses/Assignments/client.ts
import axios from "axios";

const REMOTE_SERVER = import.meta.env.VITE_REMOTE_SERVER_A6 || "http://localhost:4000";
const ASSIGNMENTS_API = `${REMOTE_SERVER}/api`;

export const createAssignmentForCourse = async (courseId: string, assignment: any) => {
    console.log(`Creating assignment for course ${courseId}:`, assignment);
    const { data } = await axios.post(`${ASSIGNMENTS_API}/courses/${courseId}/assignments`, assignment, { withCredentials: true });
    return data;
};

export const findAssignmentsForCourse = async (courseId: string) => {
    console.log(`Finding assignments for course ${courseId}`);
    const { data } = await axios.get(`${ASSIGNMENTS_API}/courses/${courseId}/assignments`, { withCredentials: true });
    return data;
};

export const updateAssignment = async (assignment: any) => {
    console.log(`Updating assignment ${assignment._id}:`, assignment);
    const { data } = await axios.put(`${ASSIGNMENTS_API}/assignments/${assignment._id}`, assignment, { withCredentials: true });
    return data;
};

export const deleteAssignment = async (assignmentId: string) => {
    console.log(`Deleting assignment ${assignmentId}`);
    const { data } = await axios.delete(`${ASSIGNMENTS_API}/assignments/${assignmentId}`, { withCredentials: true });
    return data;
};

export const findAssignmentById = async (assignmentId: string) => {
    console.log(`Finding assignment by ID ${assignmentId}`);
    const { data } = await axios.get(`${ASSIGNMENTS_API}/assignments/${assignmentId}`, { withCredentials: true });
    return data;
};