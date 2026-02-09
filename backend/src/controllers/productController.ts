import e, { Request, Response, NextFunction } from "express";
import * as productService from "../services/productService";
import { Product } from "@prisma/client";

export async function listProducts(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const products: Product[] = await productService.listProducts();
    res.json(products);
  } catch (error) {
    next(error);
  }
}

export async function getProductById(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const id = Number(req.params.id);
    const product = await productService.getProductById(id);
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json(product);
  } catch (e) {
    next(e);
  }
}

export async function createProduct(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { name, description, price, stock, code, categoryId } = req.body;
    const product = await productService.createProduct({
      name,
      description,
      price,
      stock,
      code,
      categoryId
    });
    res.status(201).json(product);
  } catch (e) {
    next(e);
  }
}

export async function updateProduct(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const id = Number(req.params.id);
    const { name, description, price, stock, code, categoryId } = req.body;
    const product = await productService.updateProduct(id, {
      name,
      description,
      price,
      stock,
      code,
      categoryId
    });
    res.json(product);
  } catch (e) {
    next(e);
  }
}

export async function deleteProduct(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const id = Number(req.params.id);
    await productService.deleteProduct(id);
    res.status(204).send();
  } catch (e) {
    next(e);
  }
}
