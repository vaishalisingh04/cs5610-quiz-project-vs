// Kambaz/Modules/routes.js
import * as dao from "./dao.js";

export default function ModuleRoutes(app) {
  app.delete("/api/modules/:moduleId", async (req, res) => {
    try {
      const me = req.session.currentUser;
      if (!me) return res.status(401).json({ message: "Unauthorized" });

      const result = await dao.deleteModule(req.params.moduleId);
      if (result.deletedCount === 0) {
        return res.status(404).json({ message: "Module not found" });
      }
      res.sendStatus(200);
    } catch (e) {
      console.error("Error deleting module:", e);
      res.status(500).json({ message: e.message });
    }
  });

  app.put("/api/modules/:moduleId", async (req, res) => {
    try {
      const me = req.session.currentUser;
      if (!me) return res.status(401).json({ message: "Unauthorized" });

      const result = await dao.updateModule(req.params.moduleId, req.body);
      if (result.matchedCount === 0) {
        return res.status(404).json({ message: "Module not found" });
      }
      res.json({ modifiedCount: result.modifiedCount });
    } catch (e) {
      console.error("Error updating module:", e);
      res.status(500).json({ message: e.message });
    }
  });
}
