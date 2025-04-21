// src/Kambaz/Enrollments/client.ts
import axios from "axios";

const REMOTE_SERVER = import.meta.env.VITE_REMOTE_SERVER_A6 || "http://localhost:4000";
const ENROLLMENTS_API = `${REMOTE_SERVER}/api/enrollments`;

// Create axios instance with credentials
const axiosWithCredentials = axios.create({
  baseURL: REMOTE_SERVER,
  withCredentials: true
});

export const enrollInCourse = async (userId: string, courseId: string) => {
  try {
    console.log(`Enrolling user ${userId} in course ${courseId}`);
    const { data } = await axiosWithCredentials.post('/api/enrollments', { userId, courseId });
    return data;
  } catch (error) {
    console.error("Error enrolling in course:", error);
    throw error;
  }
};

export const unenrollFromCourse = async (userId: string, courseId: string) => {
  try {
    console.log(`Unenrolling user ${userId} from course ${courseId}`);
    // Use the user-specific endpoint instead of the general endpoint
    const { data } = await axiosWithCredentials.delete(`/api/users/${userId}/courses/${courseId}`);
    return data;
  } catch (error) {
    console.error("Error unenrolling from course:", error);
    throw error;
  }
};

export const getAllEnrollments = async () => {
  try {
    console.log("Getting all enrollments");
    const { data } = await axiosWithCredentials.get('/api/enrollments');
    console.log("Enrollments data:", data);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Error getting all enrollments:", error);
    return [];
  }
};