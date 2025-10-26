import {
  listUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
} from "../controllers/userController";
import { Router, Request, Response, NextFunction } from "express";
import authenticate from "../middleware/authMiddleware";

const router = Router();
router.use(authenticate);

// Validate and normalize :id to a number string
router.param(
  "id",
  (req: Request, _res: Response, next: NextFunction, id: string) => {
    const n = Number(id);
    if (Number.isNaN(n) || n <= 0)
      return _res.status(400).json({ error: "Invalid id" });
    // store normalized id
    req.params.id = String(n);
    next();
  }
);

// semantic endpoints
router.get("/listUsers", listUsers);
router.get("/getUser/:id", getUserById);
router.post("/createUser", createUser);
router.put("/updateUser/:id", updateUser);
router.delete("/deleteUser/:id", deleteUser);

export default router;
