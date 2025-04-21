// src/Kambaz/Courses/Quizzes/client.ts
import axios from "axios";

const REMOTE_SERVER = import.meta.env.VITE_REMOTE_SERVER_A6 || "http://localhost:4000";
const QUIZZES_API = `${REMOTE_SERVER}/api`;

export const createQuizForCourse = async (courseId: string, quiz: any) => {
    console.log(`Creating quiz for course ${courseId}:`, quiz);
    const { data } = await axios.post(`${QUIZZES_API}/courses/${courseId}/quizzes`, quiz, { withCredentials: true });
    return data;
};

export const findQuizzesForCourse = async (courseId: string) => {
    console.log(`Finding quizzes for course ${courseId}`);
    const { data } = await axios.get(`${QUIZZES_API}/courses/${courseId}/quizzes`, { withCredentials: true });
    return data;
};

export const updateQuiz = async (quiz: any) => {
    console.log(`Updating quiz ${quiz._id}:`, quiz);
    const { data } = await axios.put(`${QUIZZES_API}/quizzes/${quiz._id}`, quiz, { withCredentials: true });
    return data;
};

export const deleteQuiz = async (quizId: string) => {
    console.log(`Deleting quiz ${quizId}`);
    const { data } = await axios.delete(`${QUIZZES_API}/quizzes/${quizId}`, { withCredentials: true });
    return data;
};

export const findQuizById = async (quizId: string) => {
    console.log(`Finding quiz by ID ${quizId}`);
    const { data } = await axios.get(`${QUIZZES_API}/quizzes/${quizId}`, { withCredentials: true });
    return data;
};

export const getQuestions = async (quizId: string) => {
    console.log(`Getting questions for quiz ${quizId}`);
    const { data } = await axios.get(`${QUIZZES_API}/quizzes/${quizId}/questions`, { withCredentials: true });
    return data;
};

export const createQuestion = async (quizId: string, question: any) => {
    console.log(`Creating question for quiz ${quizId}:`, question);
    const { data } = await axios.post(`${QUIZZES_API}/quizzes/${quizId}/questions`, question, { withCredentials: true });
    return data;
};

export const updateQuestion = async (quizId: string, question: any) => {
    console.log(`Updating question ${question._id} for quiz ${quizId}:`, question);
    const { data } = await axios.put(`${QUIZZES_API}/quizzes/${quizId}/questions/${question._id}`, question, { withCredentials: true });
    return data;
};

export const deleteQuestion = async (quizId: string, questionId: string) => {
    console.log(`Deleting question ${questionId} from quiz ${quizId}`);
    const { data } = await axios.delete(`${QUIZZES_API}/quizzes/${quizId}/questions/${questionId}`, { withCredentials: true });
    return data;
};
export const getLastAttemptWithMeta = async (quizId: string) => {
    const { data } = await axios.get(`${QUIZZES_API}/quizzes/${quizId}/answers`, { withCredentials: true });
    return data;
  };