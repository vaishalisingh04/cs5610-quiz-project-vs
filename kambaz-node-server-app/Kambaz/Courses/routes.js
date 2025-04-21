// Kambaz/Courses/routes.js
import * as dao from "./dao.js";
import * as modulesDao from "../Modules/dao.js";

export default function CourseRoutes(app) {
  // Create course (auto‐enroll current user)
  app.post("/api/courses", async (req, res) => {
    try {
      const me = req.session.currentUser;
      if (!me) return res.status(401).json({ message: "Unauthorized" });

      const course = await dao.createCourse(req.body);
      await dao.findCoursesForEnrolledUser(me._id); // refresh logic, if needed
      // enroll creator
      await enrollmentsDao.enrollUserInCourse(me._id, course._id);
      res.json(course);
    } catch (e) {
      console.error("Error creating course:", e);
      res.status(500).json({ message: e.message });
    }
  });

  // List all courses
  app.get("/api/courses", async (req, res) => {
    try {
      const courses = await dao.findAllCourses();
      res.json(courses);
    } catch (e) {
      console.error("Error fetching courses:", e);
      res.status(500).json({ message: e.message });
    }
  });

  // Delete
  app.delete("/api/courses/:courseId", async (req, res) => {
    try {
      const me = req.session.currentUser;
      if (!me) return res.status(401).json({ message: "Unauthorized" });

      const result = await dao.deleteCourse(req.params.courseId);
      if (result.deletedCount === 0) {
        return res.status(404).json({ message: "Course not found" });
      }
      res.sendStatus(200);
    } catch (e) {
      console.error("Error deleting course:", e);
      res.status(500).json({ message: e.message });
    }
  });

  // Update
  app.put("/api/courses/:courseId", async (req, res) => {
    try {
      const me = req.session.currentUser;
      if (!me) return res.status(401).json({ message: "Unauthorized" });

      const result = await dao.updateCourse(req.params.courseId, req.body);
      if (result.matchedCount === 0) {
        return res.status(404).json({ message: "Course not found" });
      }
      res.json({ modifiedCount: result.modifiedCount });
    } catch (e) {
      console.error("Error updating course:", e);
      res.status(500).json({ message: e.message });
    }
  });

  // Modules sub‐resource (list & create)
  app.get("/api/courses/:courseId/modules", async (req, res) => {
    try {
      const mods = await modulesDao.findModulesForCourse(req.params.courseId);
      res.json(mods);
    } catch (e) {
      console.error("Error fetching modules:", e);
      res.status(500).json({ message: e.message });
    }
  });

  app.post("/api/courses/:courseId/modules", async (req, res) => {
    try {
      const me = req.session.currentUser;
      if (!me) return res.status(401).json({ message: "Unauthorized" });

      const payload = { ...req.body, course: req.params.courseId };
      const mod = await modulesDao.createModule(payload);
      res.json(mod);
    } catch (e) {
      console.error("Error creating module:", e);
      res.status(500).json({ message: e.message });
    }
  });
}
