import { Router } from "express";
import {
  listRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole
} from "../controllers/roleController";

const router = Router();

// Validate and normalize :id
router.param("id", (req, _res, next, id: string) => {
  const n = Number(id);
  if (Number.isNaN(n) || n <= 0) return _res.status(400).json({ error: "Invalid id" });
  req.params.id = String(n);
  next();
});

// semantic endpoints
router.get("/listRoles", listRoles);
router.get("/getRole/:id", getRoleById);
router.post("/createRole", createRole);
router.put("/updateRole/:id", updateRole);
router.delete("/deleteRole/:id", deleteRole);

export default router;
