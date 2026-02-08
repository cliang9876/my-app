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
    const user: User | null = await getUserByEmail(email);

    const isMatch = user
      ? await bcrypt.compare(password, user?.password)
      : false;

    if (!user || !isMatch) {
      return res
        .status(401)
        .json({ status: 401, message: "Invalid email or password" });
    }

    // Generate JWT token
    const secret = process.env.JWT_SECRET;
    const accessExpiresIn = process.env.JWT_ACCESS_EXPIRES_IN || "1h";
    const refreshExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN || "7d";

    if (!secret) {
      throw new Error("JWT_SECRET is not defined in environment variables");
    }
    const accessToken = jwt.sign(
      { id: user.id, email: user.email, role: user.roleId },
      secret,
      {
        expiresIn: accessExpiresIn as SignOptions["expiresIn"]
      }
    );
    const refreshToken = jwt.sign(
      { id: user.id, email: user.email, role: user.roleId },
      secret,
      {
        expiresIn: refreshExpiresIn as SignOptions["expiresIn"]
      }
    );

    res
      .cookie("refresh_token", refreshToken, {
        httpOnly: true,
        //生产下设置true
        secure: false,
        sameSite: "lax",
        maxAge: 7 * 24 * 3600 * 1000
      })
      .status(200)
      .json({ status: 200, message: "Login successful", accessToken });
  } catch (err: any) {
    next(err);
  }
};

export const logout = async (req: Request, res: Response) => {
  res
    .clearCookie("refresh_token", {
      httpOnly: true,
      //生产下设置true
      secure: false,
      sameSite: "lax"
    })
    .json({ message: "Logout successful" });
};

export const refresh = (req: Request, res: Response) => {
  const secret = process.env.JWT_SECRET;
  const accessExpiresIn = process.env.JWT_ACCESS_EXPIRES_IN || "1h";
  const refreshExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN || "7d";
  if (!secret) return res.status(500).json({ message: "JWT secret missing" });

  const rt = req.cookies?.refresh_token;
  if (!rt) return res.status(401).json({ message: "No refresh token" });

  try {
    const payload = jwt.verify(rt, secret) as jwt.JwtPayload;
    const safePayload = {
      id: payload.id,
      email: payload.email,
      role: payload.role
    };
    const accessToken = jwt.sign(safePayload, secret, {
      expiresIn: accessExpiresIn as SignOptions["expiresIn"]
    });
    const newRefresh = jwt.sign(safePayload, secret, {
      expiresIn: refreshExpiresIn as SignOptions["expiresIn"]
    });

    res
      .cookie("refresh_token", newRefresh, {
        httpOnly: true,
        //生产下设置true
        secure: false,
        sameSite: "lax",
        maxAge: 7 * 24 * 3600 * 1000
      })
      .json({ accessToken });
  } catch (e) {
    // console.log(e);
    return res.status(401).json({ message: "Invalid refresh token" });
  }
};
