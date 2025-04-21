// Kambaz/Users/routes.js
import * as dao from "./dao.js";
import * as courseDao from "../Courses/dao.js";
import * as enrollmentsDao from "../Enrollments/dao.js";

export default function UserRoutes(app) {
  // Create user
  app.post("/api/users", async (req, res) => {
    try {
      const user = await dao.createUser(req.body);
      res.json(user);
    } catch (e) {
      console.error("Error creating user:", e);
      res.status(500).json({ message: e.message });
    }
  });

  // Sign up (register & login)
  app.post("/api/users/signup", async (req, res) => {
    try {
      const existing = await dao.findUserByUsername(req.body.username);
      if (existing) {
        return res.status(400).json({ message: "Username already in use" });
      }
      const user = await dao.createUser(req.body);
      req.session.currentUser = user;
      await req.session.save();
      res.json(user);
    } catch (e) {
      console.error("Signup error:", e);
      res.status(500).json({ message: e.message });
    }
  });

  // Sign in
  app.post("/api/users/signin", async (req, res) => {
    try {
      const { username, password } = req.body;
      console.log("[DEBUG] Received signin request:", { username, password });
      const user = await dao.findUserByCredentials(username, password);
      console.log("[DEBUG] User found:", user);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      req.session.currentUser = user;
      await req.session.save();
      res.json(user);
    } catch (e) {
      console.error("Signin error:", e);
      res.status(500).json({ message: e.message });
    }
  });

  // Sign out
  app.post("/api/users/signout", (req, res) => {
    req.session.destroy(err => {
      if (err) {
        console.error("Error signing out:", err);
        return res.status(500).json({ message: err.message });
      }
      res.sendStatus(200);
    });
  });

  // Profile (who am I?)
  app.get("/api/users/profile", (req, res) => {
    const me = req.session.currentUser;
    if (!me) return res.status(401).json({ message: "Not authenticated" });
    res.json(me);
  });

  // List / filter users
  app.get("/api/users", async (req, res) => {
    try {
      const { role, name } = req.query;
      let users;
      if (role) users = await dao.findUsersByRole(role);
      else if (name) users = await dao.findUsersByPartialName(name);
      else users = await dao.findAllUsers();
      res.json(users);
    } catch (e) {
      console.error("Error finding users:", e);
      res.status(500).json({ message: e.message });
    }
  });

  // Get one user
  app.get("/api/users/:userId", async (req, res) => {
    try {
      const user = await dao.findUserById(req.params.userId);
      if (!user) return res.status(404).json({ message: "User not found" });
      res.json(user);
    } catch (e) {
      console.error("Error fetching user:", e);
      res.status(500).json({ message: e.message });
    }
  });

  // Update user
  app.put("/api/users/:userId", async (req, res) => {
    try {
      const me = req.session.currentUser;
      if (!me) return res.status(401).json({ message: "Unauthorized" });

      const result = await dao.updateUser(req.params.userId, req.body);
      if (result.matchedCount === 0) {
        return res.status(404).json({ message: "User not found" });
      }

      // If I updated myself, sync session
      if (me._id === req.params.userId) {
        Object.assign(me, req.body);
        req.session.currentUser = me;
        await req.session.save();
      }

      res.json({ modifiedCount: result.modifiedCount });
    } catch (e) {
      console.error("Error updating user:", e);
      res.status(500).json({ message: e.message });
    }
  });

  // Delete user
  app.delete("/api/users/:userId", async (req, res) => {
    try {
      const me = req.session.currentUser;
      if (!me) return res.status(401).json({ message: "Unauthorized" });

      const result = await dao.deleteUser(req.params.userId);
      if (result.deletedCount === 0) {
        return res.status(404).json({ message: "User not found" });
      }
      res.sendStatus(200);
    } catch (e) {
      console.error("Error deleting user:", e);
      res.status(500).json({ message: e.message });
    }
  });

  // Get courses for a user
  app.get("/api/users/:uid/courses", async (req, res) => {
    try {
      const me = req.session.currentUser;
      if (!me) return res.status(401).json({ message: "Unauthorized" });

      if (me.role === "ADMIN") {
        const all = await courseDao.findAllCourses();
        return res.json(all);
      }

      let uid = req.params.uid === "current" ? me._id : req.params.uid;
      const courses = await enrollmentsDao.findCoursesForUser(uid);
      res.json(courses);
    } catch (e) {
      console.error("Error fetching user’s courses:", e);
      res.status(500).json({ message: e.message });
    }
  });

  // Enroll / unenroll
  app.post("/api/users/:uid/courses/:cid", async (req, res) => {
    try {
      const me = req.session.currentUser;
      if (!me) return res.status(401).json({ message: "Unauthorized" });

      const uid = req.params.uid === "current" ? me._id : req.params.uid;
      const enrollment = await enrollmentsDao.enrollUserInCourse(uid, req.params.cid);
      res.json(enrollment);
    } catch (e) {
      console.error("Error enrolling user:", e);
      res.status(500).json({ message: e.message });
    }
  });

  app.delete("/api/users/:uid/courses/:cid", async (req, res) => {
    try {
      const me = req.session.currentUser;
      if (!me) return res.status(401).json({ message: "Unauthorized" });

      const uid = req.params.uid === "current" ? me._id : req.params.uid;
      const result = await enrollmentsDao.unenrollUserFromCourse(uid, req.params.cid);
      if (result.deletedCount === 0) {
        return res.status(404).json({ message: "Not enrolled" });
      }
      res.sendStatus(200);
    } catch (e) {
      console.error("Error unenrolling user:", e);
      res.status(500).json({ message: e.message });
    }
  });
}
