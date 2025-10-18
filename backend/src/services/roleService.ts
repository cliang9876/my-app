import prisma from "../db/prisma";
import { Role } from "@prisma/client";
import type { CreateRoleDto, UpdateRoleDto } from "../schemas/role";

const role = prisma.role;

export async function listRoles(): Promise<Role[]> {
  return role.findMany();
}

export async function getRoleById(id: number): Promise<Role | null> {
  return role.findUnique({ where: { id } });
}

export async function createRole(data: CreateRoleDto): Promise<Role> {
  return role.create({ data });
}

export async function updateRole(data: UpdateRoleDto): Promise<Role> {
  const { id, ...rest } = data;
  return role.update({ where: { id }, data: rest as any });
}

export async function deleteRole(id: number): Promise<void> {
  await role.delete({ where: { id } });
}
