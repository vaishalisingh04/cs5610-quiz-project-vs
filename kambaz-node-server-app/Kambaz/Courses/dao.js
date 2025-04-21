// Kambaz/Courses/dao.js
import { v4 as uuidv4 } from "uuid";
import model from "./model.js";
import * as enrollmentsDao from "../Enrollments/dao.js";

export async function findAllCourses() {
  return model.find();
}

export async function findCoursesForEnrolledUser(userId) {
  return enrollmentsDao.findCoursesForUser(userId);
}

export async function createCourse(course) {
  const newCourse = { ...course, _id: uuidv4() };
  return model.create(newCourse);
}

export async function deleteCourse(courseId) {
  await enrollmentsDao.deleteEnrollmentsForCourse(courseId);
  return model.deleteOne({ _id: courseId });
}

export async function updateCourse(courseId, courseUpdates) {
  return model.updateOne({ _id: courseId }, { $set: courseUpdates });
}
