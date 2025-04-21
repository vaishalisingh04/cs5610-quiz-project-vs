// src/Kambaz/Courses/Modules/client.ts
import axios from "axios";

const REMOTE_SERVER = import.meta.env.VITE_REMOTE_SERVER_A6 || "http://localhost:4000";
const MODULES_API = `${REMOTE_SERVER}/api/modules`;

export const updateModule = async (module: any) => {
  console.log(`Updating module ${module._id}:`, module);
  const { data } = await axios.put(`${MODULES_API}/${module._id}`, module, { withCredentials: true });
  return data;
};

export const deleteModule = async (moduleId: string) => {
  console.log(`Deleting module ${moduleId}`);
  const response = await axios.delete(`${MODULES_API}/${moduleId}`, { withCredentials: true });
  return response.data;
};