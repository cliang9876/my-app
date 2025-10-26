import { Request, Response, NextFunction } from "express";
import jwt, { SignOptions } from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { User } from "@prisma/client";
import { getUserByEmail } from "../services/userService";

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;
    console.log("login payload:", { email, password });
    const user: User | null = await getUserByEmail(email);
    //bcrypt 支持安全地对比明文输入和数据库里的哈希值，数据库里存的是哈希值
    const isMatch = user
      ? await bcrypt.compare(password, user?.password)
      : false;

    if (!user || !isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Generate JWT token
    const secret = process.env.JWT_SECRET;
    const expiresIn = process.env.JWT_EXPIRES_IN || "1h";
    if (!secret) {
      throw new Error("JWT_SECRET is not defined in environment variables");
    }
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.roleId },
      secret,
      {
        expiresIn: expiresIn as SignOptions["expiresIn"]
      }
    );

    res.json({ message: "Login successful", token });
  } catch (err) {
    next(err);
  }
};

export const logout = async (req: Request, res: Response) => {
  res.json({ message: "Logout successful" });
};
