import userRouter from "./users";
import roleRouter from "./role";
import loginRouter from "./auth";
import fileRouter from "./files";

import express from "express";

const router = express.Router();

router.use("/users", userRouter);
router.use("/roles", roleRouter);
router.use("/auth", loginRouter);
router.use("/files", fileRouter);

export default router;
