// src/Kambaz/Courses/People/client.ts
import axios from "axios";

const REMOTE_SERVER = import.meta.env.VITE_REMOTE_SERVER_A6 || "http://localhost:4000";
const axiosWithCredentials = axios.create({
  baseURL: REMOTE_SERVER,
  withCredentials: true
});

export const findAllUsers = async () => {
  console.log("Finding all users");
  try {
    const { data } = await axiosWithCredentials.get('/api/users');
    return data;
  } catch (error) {
    console.error("Error finding all users:", error);
    return [];
  }
};

export const updateUser = async (user: any) => {
  console.log("Updating user:", user);
  try {
    const { data } = await axiosWithCredentials.put(`/api/users/${user._id}`, user);
    return data;
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
};

export const deleteUser = async (userId: string) => {
  console.log("Deleting user:", userId);
  try {
    const { data } = await axiosWithCredentials.delete(`/api/users/${userId}`);
    return data;
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
};

export const createUser = async (user: any) => {
  console.log("Creating user:", user);
  try {
    const { data } = await axiosWithCredentials.post('/api/users', user);
    return data;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
};