import { Router, Request, Response, NextFunction } from "express";
import authenticate from "../middleware/authMiddleware";
import {
  listProducts,
  createProduct,
  updateProduct,
  getProductById,
  deleteProduct
} from "../controllers/productController";

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

router.get("/listProducts", listProducts);
router.get("/getProduct/:id", getProductById);
router.post("/createProduct", createProduct);
router.put("/updateProduct/:id", updateProduct);
router.delete("/deleteProduct/:id", deleteProduct);

export default router;
