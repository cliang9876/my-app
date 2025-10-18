import { z } from "zod";

// Request schema for creating a Role
export const createRoleSchema = z.object({
  name: z.string().min(1, "name is required").max(100),
});

// Request schema for updating a Role
export const updateRoleSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1).max(100),
});

// Response / DTO schema for Role
export const roleResponseSchema = z.object({
  id: z.number().int(),
  name: z.string(),
});

export type CreateRoleDto = z.infer<typeof createRoleSchema>;
export type UpdateRoleDto = z.infer<typeof updateRoleSchema>;
export type RoleDto = z.infer<typeof roleResponseSchema>;
