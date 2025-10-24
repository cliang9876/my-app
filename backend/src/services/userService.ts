import prisma from "../db/prisma";
import type { User } from "@prisma/client";
import bcrypt from "bcryptjs";

const user = prisma.user;
const SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS) || 10;

export async function listUsers(): Promise<User[]> {
  return user.findMany();
}

export async function getUserById(id: number): Promise<User | null> {
  return user.findUnique({ where: { id } });
}

export async function getUserByEmail(email: string): Promise<User | null> {
  return user.findUnique({ where: { email } });
}

export async function createUser(data: User): Promise<User> {
  const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);
  const dataWithHashedPassword = { ...data, password: hashedPassword };
  return user.create({ data: dataWithHashedPassword });
}

export async function updateUser(data: User): Promise<User> {
  const updateData = { ...data };
  if (data.password) {
    const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);
    updateData.password = hashedPassword;
  }
  return user.update({ where: { id: data.id }, data: updateData });
}

export async function deleteUser(id: number): Promise<void> {
  await user.delete({ where: { id } });
}
