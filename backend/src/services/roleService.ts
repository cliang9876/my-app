import prisma from "../db/prisma";
import { Role } from "@prisma/client";

const role = prisma.role;

export async function listRoles(): Promise<Role[]> {
  return role.findMany();
}

export async function getRoleById(id: number): Promise<Role | null> {
  return role.findUnique({ where: { id } });
}

export async function createRole(data: Role): Promise<Role> {
  return role.create({ data });
}

export async function updateRole(data: Role): Promise<Role> {
  return role.update({ where: { id: data.id }, data });
}

export async function deleteRole(id: number): Promise<void> {
  await role.delete({ where: { id } });
}
