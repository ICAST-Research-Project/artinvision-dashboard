"use server";

import { db } from "@/lib/db";

export type CreateCategoryParams = {
  categoryName: string;
};

export const createCategory = async ({
  categoryName,
}: CreateCategoryParams) => {
  try {
    const newCategory = await db.category.create({
      data: { name: categoryName },
    });
    return newCategory;
  } catch (error) {
    console.log(error);
  }
};

export const getAllCategories = async () => {
  try {
    const categories = await db.category.findMany();
    return categories;
  } catch (error) {
    console.log(error);
  }
};
