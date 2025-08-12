import express from "express";
import { auth } from "../middleware/auth.js";
import { isAdmin } from "../middleware/isAdmin.js";
import { getDashboardOverview } from "../controllers/adminController.js";

const router = express.Router();

// GET /api/admin/dashboard
router.get("/dashboard", auth, isAdmin, getDashboardOverview);

export default router;
