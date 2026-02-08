import prisma from "../db/prisma";
import type { Product } from "@prisma/client";
// import { CreateProductDto, UpdateProductDto } from "../schemas/product";

const product = prisma.product;

export async function listProducts(): Promise<Product[]> {
  return product.findMany();
}

export async function getProductById(id: number): Promise<Product | null> {
  return product.findUnique({ where: { id } });
}

export async function createProduct(data: Product): Promise<Product> {
  return product.create({ data });
}

export async function updateProduct(data: Product): Promise<Product> {
  return product.update({ where: { id: data.id }, data });
}

export async function deleteProduct(id: number): Promise<void> {
  await product.delete({ where: { id } });
}
