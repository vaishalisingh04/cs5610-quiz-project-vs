// Kambaz/Enrollments/routes.js
import * as dao from "./dao.js";

export default function EnrollmentRoutes(app) {
  // List all
  app.get("/api/enrollments", async (req, res) => {
    try {
      const list = await dao.findAllEnrollments();
      res.json(list);
    } catch (e) {
      console.error("Error fetching enrollments:", e);
      res.status(500).json({ message: e.message });
    }
  });

  // Enroll
  app.post("/api/enrollments", async (req, res) => {
    try {
      const me = req.session.currentUser;
      if (!me) return res.status(401).json({ message: "Unauthorized" });

      const { userId, courseId } = req.body;
      const enrollment = await dao.enrollUserInCourse(userId, courseId);
      res.json(enrollment);
    } catch (e) {
      console.error("Error enrolling user:", e);
      res.status(500).json({ message: e.message });
    }
  });

  // Unenroll
  app.delete("/api/enrollments", async (req, res) => {
    try {
      const me = req.session.currentUser;
      if (!me) return res.status(401).json({ message: "Unauthorized" });

      const { userId, courseId } = req.body;
      const result = await dao.unenrollUserFromCourse(userId, courseId);
      if (result.deletedCount === 0) {
        return res.status(404).json({ message: "Enrollment not found" });
      }
      res.sendStatus(200);
    } catch (e) {
      console.error("Error unenrolling user:", e);
      res.status(500).json({ message: e.message });
    }
  });
}
