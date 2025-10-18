import { z } from "zod";

export const createUserSchema = z.object({
  email: z.email(),
  name: z.string().optional(),
  password: z.string().min(6),
  roleId: z.number().int().positive()
});

export const updateUserSchema = z.object({
  id: z.number().int().positive(),
  email: z.email().optional(),
  name: z.string().optional(),
  password: z.string().min(6).optional(),
  roleId: z.number().int().positive().optional()
});

export const userResponseSchema = z.object({
  id: z.number().int(),
  email: z.string(),
  name: z.string().nullable().optional(),
  roleId: z.number().int(),
  createdAt: z.string()
});

export type CreateUserDto = z.infer<typeof createUserSchema>;
export type UpdateUserDto = z.infer<typeof updateUserSchema>;
export type UserDto = z.infer<typeof userResponseSchema>;
