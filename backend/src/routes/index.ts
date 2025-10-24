import userRouter from "./users";
import roleRouter from "./role";
import loginRouter from "./auth";

import express from "express";

const router = express.Router();

router.use("/users", userRouter);
router.use("/roles", roleRouter);
router.use("/", loginRouter);

export default router;
