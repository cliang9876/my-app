import { Category } from "./../../generated/prisma/index.d";
import z from "zod";

export const createProductSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  price: z.number().positive(),
  stock: z.number().int().nonnegative(),
  code: z.string(),
  CategoryId: z.number().int().positive()
});

export const updateProductSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().optional(),
  description: z.string().optional(),
  price: z.number().positive().optional(),
  stock: z.number().int().nonnegative().optional(),
  code: z.string(),
  CategoryId: z.number().int().positive()
});

export const productResponseSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  description: z.string().nullable().optional(),
  price: z.number(),
  stock: z.number().int(),
  createdAt: z.string()
});

export type CreateProductDto = z.infer<typeof createProductSchema>;
export type UpdateProductDto = z.infer<typeof updateProductSchema>;
export type ProductDto = z.infer<typeof productResponseSchema>;
