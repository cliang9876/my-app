import { Request, Response, NextFunction } from "express";
import * as userService from "../services/userService";
import { User } from "@prisma/client";

export async function listUsers(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const users = await userService.listUsers();
    res.json(users);
  } catch (err) {
    next(err);
  }
}

export async function getUserById(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const id = Number(req.params.id);
    const user = await userService.getUserById(id);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    next(err);
  }
}

export async function createUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { email, name, roleId, password } = req.body;
    const userObj = { email, name, roleId, password };
    const user = await userService.createUser(userObj as User);
    res.status(201).json(user);
  } catch (err) {
    next(err);
  }
}

export async function updateUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const id = Number(req.params.id);
    const { email, name, role, password } = req.body;
    const userObj = { id, email, name, roleId: role, password };
    const user = await userService.updateUser(userObj as User);
    res.json(user);
  } catch (err) {
    next(err);
  }
}

export async function deleteUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const id = Number(req.params.id);
    await userService.deleteUser(id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
