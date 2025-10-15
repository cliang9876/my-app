import prisma from "../db/prisma";
import type { User } from "@prisma/client";

const user = prisma.user;

export async function listUsers(): Promise<User[]> {
  return user.findMany();
}

export async function getUserById(id: number): Promise<User | null> {
  return user.findUnique({ where: { id } });
}

export async function createUser(data: User): Promise<User> {
  return user.create({ data });
}

export async function updateUser(data: User): Promise<User> {
  return user.update({ where: { id: data.id }, data });
}

export async function deleteUser(id: number): Promise<void> {
  await user.delete({ where: { id } });
}
