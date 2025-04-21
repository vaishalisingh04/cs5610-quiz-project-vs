import axios from "axios";

export const REMOTE_SERVER =
  import.meta.env.VITE_REMOTE_SERVER_A6 || "http://localhost:4000";

const axiosWithCredentials = axios.create({
  baseURL: REMOTE_SERVER,
  withCredentials: true,
});

export const USERS_API = `/api/users`;

export const signin = async (credentials: any) => {
  try {
    const response = await axiosWithCredentials.post(
      `${USERS_API}/signin`,
      credentials
    );
    return response.data;
  } catch (error) {
    console.error("Signin error:", error);
    throw error;
  }
};

export const profile = async () => {
  try {
    const response = await axiosWithCredentials.get(
      `${USERS_API}/profile`
    );
    return response.data;
  } catch (error) {
    console.error("Profile fetch error:", error);
    return null;
  }
};

export const findCoursesForUser = async (userId: string) => {
  const response = await axiosWithCredentials.get(
    `${USERS_API}/${userId}/courses`
  );
  return response.data;
};

export const enrollIntoCourse = async (
  userId: string,
  courseId: string
) => {
  try {
    console.log(`Enrolling user ${userId} in course ${courseId}`);
    // Check both endpoints to ensure we're using the correct one
    try {
      // Try the user-specific endpoint first
      const response = await axiosWithCredentials.post(
        `${USERS_API}/${userId}/courses/${courseId}`
      );
      return response.data;
    } catch (error) {
      console.log("Trying alternative enrollment endpoint...");
      // If that fails, try the enrollments API
      const response = await axiosWithCredentials.post(
        `/api/enrollments`,
        { userId, courseId }
      );
      return response.data;
    }
  } catch (error) {
    console.error("Error enrolling into course:", error);
    throw error;
  }
};

export const unenrollFromCourse = async (
  userId: string,
  courseId: string
) => {
  try {
    console.log(`Unenrolling user ${userId} from course ${courseId}`);
    // Try both endpoints to ensure we're using the correct one
    try {
      // Try the user-specific endpoint first
      const response = await axiosWithCredentials.delete(
        `${USERS_API}/${userId}/courses/${courseId}`
      );
      return response.data;
    } catch (firstError) {
      console.log("Trying alternative unenrollment endpoint...");
      // If that fails, try the enrollments API
      const response = await axiosWithCredentials.delete(
        `/api/enrollments`,
        { 
          data: { userId, courseId }
        }
      );
      return response.data;
    }
  } catch (error) {
    console.error("Error unenrolling from course:", error);
    throw error;
  }
};

export const findAllUsers = async () => {
  const response = await axiosWithCredentials.get(`${USERS_API}`);
  return response.data;
};

export const findUsersByRole = async (role: string) => {
  const response = await axiosWithCredentials.get(
    `${USERS_API}?role=${role}`
  );
  return response.data;
};

export const findUsersByPartialName = async (name: string) => {
  const response = await axiosWithCredentials.get(
    `${USERS_API}?name=${name}`
  );
  return response.data;
};

export const findUserById = async (id: string) => {
  const response = await axiosWithCredentials.get(`${USERS_API}/${id}`);
  return response.data;
};

export const createUser = async (user: any) => {
  const response = await axiosWithCredentials.post(
    `${USERS_API}`,
    user
  );
  return response.data;
};

export const deleteUser = async (userId: string) => {
  const response = await axiosWithCredentials.delete(
    `${USERS_API}/${userId}`
  );
  return response.data;
};

export const signup = async (user: any) => {
  const response = await axiosWithCredentials.post(
    `${USERS_API}/signup`,
    user
  );
  return response.data;
};

export const updateUser = async (user: any) => {
  const response = await axiosWithCredentials.put(
    `${USERS_API}/${user._id}`,
    user
  );
  return response.data;
};

export const signout = async () => {
  const response = await axiosWithCredentials.post(
    `${USERS_API}/signout`
  );
  return response.data;
};

export const findMyCourses = async () => {
  const { data } = await axiosWithCredentials.get(
    `${USERS_API}/current/courses`
  );
  return data;
};

// In src/Kambaz/Account/client.ts, to create a course:
export const createCourse = async (course: any) => {
  console.log("Creating course with direct endpoint:", course);
  const { data } = await axiosWithCredentials.post(
    `/api/courses/direct`,
    course
  );
  return data;
};