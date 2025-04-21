// Kambaz/Assignments/routes.js
import * as dao from "./dao.js";

export default function AssignmentRoutes(app) {
  app.post("/api/courses/:courseId/assignments", async (req, res) => {
    try {
      const me = req.session.currentUser;
      if (!me) return res.status(401).json({ message: "Unauthorized" });

      const payload = { ...req.body, course: req.params.courseId };
      const a = await dao.createAssignment(payload);
      res.json(a);
    } catch (e) {
      console.error("Error creating assignment:", e);
      res.status(500).json({ message: e.message });
    }
  });

  app.get("/api/courses/:courseId/assignments", async (req, res) => {
    try {
      const list = await dao.findAssignmentsForCourse(req.params.courseId);
      res.json(list);
    } catch (e) {
      console.error("Error fetching assignments:", e);
      res.status(500).json({ message: e.message });
    }
  });

  app.put("/api/assignments/:assignmentId", async (req, res) => {
    try {
      const result = await dao.updateAssignment(req.params.assignmentId, req.body);
      if (result.matchedCount === 0) {
        return res.status(404).json({ message: "Assignment not found" });
      }
      res.json({ modifiedCount: result.modifiedCount });
    } catch (e) {
      console.error("Error updating assignment:", e);
      res.status(500).json({ message: e.message });
    }
  });

  app.delete("/api/assignments/:assignmentId", async (req, res) => {
    try {
      const result = await dao.deleteAssignment(req.params.assignmentId);
      if (result.deletedCount === 0) {
        return res.status(404).json({ message: "Assignment not found" });
      }
      res.sendStatus(200);
    } catch (e) {
      console.error("Error deleting assignment:", e);
      res.status(500).json({ message: e.message });
    }
  });

  app.get("/api/assignments/:assignmentId", async (req, res) => {
    try {
      const a = await dao.findAssignmentById(req.params.assignmentId);
      if (!a) {
        return res.status(404).json({ message: "Assignment not found" });
      }
      res.json(a);
    } catch (e) {
      console.error("Error fetching assignment:", e);
      res.status(500).json({ message: e.message });
    }
  });
}
