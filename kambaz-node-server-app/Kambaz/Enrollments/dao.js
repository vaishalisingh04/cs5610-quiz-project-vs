// Kambaz/Enrollments/dao.js
import model from "./model.js";

// fetch courses for a user (populated)
export async function findCoursesForUser(userId) {
  const enrolls = await model.find({ user: userId }).populate("course");
  return enrolls.map(e => e.course);
}

// enroll
export function enrollUserInCourse(user, course) {
  return model.create({ _id: `${user}-${course}`, user, course });
}

// unenroll one
export function unenrollUserFromCourse(user, course) {
  return model.deleteOne({ user, course });
}

// cleanup many for a course
export function deleteEnrollmentsForCourse(courseId) {
  return model.deleteMany({ course: courseId });
}

// cleanup many for a user (if needed)
export function deleteEnrollmentsForUser(userId) {
  return model.deleteMany({ user: userId });
}

// list all enrollments
export function findAllEnrollments() {
  return model.find();
}
