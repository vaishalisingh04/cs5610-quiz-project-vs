// src/Kambaz/Courses/client.ts
import axios from "axios";

const REMOTE_SERVER = import.meta.env.VITE_REMOTE_SERVER_A6 || "http://localhost:4000";
const axiosWithCredentials = axios.create({
  baseURL: REMOTE_SERVER,
  withCredentials: true
});

export const fetchAllCourses = async () => {
  console.log("Fetching all courses");
  const { data } = await axiosWithCredentials.get(`/api/courses`);
  return data;
};

export const createCourse = async (course: any) => {
  console.log("Creating new course:", course);
  const { data } = await axiosWithCredentials.post(`/api/courses`, course);
  return data;
};

export const deleteCourse = async (id: string) => {
  console.log(`Deleting course ${id}`);
  const { data } = await axiosWithCredentials.delete(`/api/courses/${id}`);
  return data;
};

export const updateCourse = async (course: any) => {
  console.log(`Updating course ${course._id}:`, course);
  const { data } = await axiosWithCredentials.put(`/api/courses/${course._id}`, course);
  return data;
};

export const findModulesForCourse = async (courseId: string) => {
  console.log(`Finding modules for course ${courseId}`);
  const response = await axiosWithCredentials.get(`/api/courses/${courseId}/modules`);
  return response.data;
};

export const createModuleForCourse = async (courseId: string, module: any) => {
  console.log(`Creating module for course ${courseId}:`, module);
  const response = await axiosWithCredentials.post(
    `/api/courses/${courseId}/modules`,
    module
  );
  return response.data;
};

export const findUsersForCourse = async (courseId: string) => {
  console.log(`Finding users for course ${courseId}`);
  try {
    // First try to get all users to see what's available
    const allUsersResponse = await axiosWithCredentials.get(`/api/users`);
    const allUsers: any[] = allUsersResponse.data;
    console.log("All users in system:", allUsers);

    // Get all enrollments to see the relationships
    const enrollmentsResponse = await axiosWithCredentials.get(`/api/enrollments`);
    const allEnrollments: any[] = enrollmentsResponse.data;
    console.log("All enrollments in system:", allEnrollments);
    
    // Filter enrollments for this course
    const courseEnrollments = allEnrollments.filter(
      (enrollment: any) => enrollment.course === courseId
    );
    console.log(`Enrollments for course ${courseId}:`, courseEnrollments);
    
    // Check if we have any enrollments for this course
    if (courseEnrollments.length === 0) {
      console.log(`No enrollments found for course ${courseId}`);
      return [];
    }
    
    // Get user IDs from enrollments
    const userIds = courseEnrollments.map((enrollment: any) => enrollment.user);
    console.log("User IDs enrolled in this course:", userIds);
    
    // Get users with these IDs
    const enrolledUsers = allUsers.filter((user: any) => userIds.includes(user._id));
    console.log(`Found ${enrolledUsers.length} enrolled users:`, enrolledUsers);
    
    return enrolledUsers;
  } catch (error) {
    console.error(`Error finding users for course ${courseId}:`, error);
    return [];
  }
};

// Also add these methods for user management within courses
export const createUser = async (user: any) => {
  console.log("Creating user:", user);
  const { data } = await axiosWithCredentials.post(`/api/users`, user);
  return data;
};

export const updateUser = async (user: any) => {
  console.log("Updating user:", user);
  const { data } = await axiosWithCredentials.put(`/api/users/${user._id}`, user);
  return data;
};

export const deleteUser = async (userId: string) => {
  console.log("Deleting user:", userId);
  const { data } = await axiosWithCredentials.delete(`/api/users/${userId}`);
  return data;
};

export const enrollIntoCourse = async (userId: string, courseId: string) => {
  console.log(`Enrolling user ${userId} in course ${courseId}`);
  const { data } = await axiosWithCredentials.post(`/api/users/${userId}/courses/${courseId}`);
  return data;
};

export const unenrollFromCourse = async (userId: string, courseId: string) => {
  console.log(`Unenrolling user ${userId} from course ${courseId}`);
  const { data } = await axiosWithCredentials.delete(`/api/users/${userId}/courses/${courseId}`);
  return data;
};