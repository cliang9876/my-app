import userRouter from "./users";
import roleRouter from "./role";

import express from "express";

const router = express.Router();

router.use("/users", userRouter);
router.use("/roles", roleRouter);

export default router;
