import { Router } from "express";
import { storage } from "../../storage";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const { ids } = req.body;
    
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: "Invalid employee IDs" });
    }

    const success = await storage.deleteEmployees(ids);
    
    if (!success) {
      return res.status(500).json({ error: "Failed to delete employees" });
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Error in bulk delete employees:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router; 