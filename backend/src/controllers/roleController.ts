import { Request, Response, NextFunction } from "express";
import * as roleService from "../services/roleService";
import { createRoleSchema, updateRoleSchema } from "../schemas/role";

export async function listRoles(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const roles = await roleService.listRoles();
    res.json(roles);
  } catch (err) {
    next(err);
  }
}

export async function getRoleById(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const id = Number(req.params.id);
    const role = await roleService.getRoleById(id);
    if (!role) return res.status(404).json({ error: "Role not found" });
    res.json(role);
  } catch (err) {
    next(err);
  }
}

export async function createRole(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
  const parsed = createRoleSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues });
  const role = await roleService.createRole(parsed.data);
    res.status(201).json(role);
  } catch (err) {
    next(err);
  }
}

export async function updateRole(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const id = Number(req.params.id);
  const parsed = updateRoleSchema.safeParse({ id, ...req.body });
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues });
  const role = await roleService.updateRole(parsed.data);
    res.json(role);
  } catch (err) {
    next(err);
  }
}

export async function deleteRole(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const id = Number(req.params.id);
    await roleService.deleteRole(id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}
