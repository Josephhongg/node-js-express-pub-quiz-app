/**
 * This file contains a function to seed categories data
 */
import axios from "axios";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const seedCategoriesData = async (req, res) => {
  const categoriesURL = "https://opentdb.com/api_category.php";

  const response = await axios.get(categoriesURL);
  const data = response.data;

  await prisma.category.deleteMany({});

  const categories = data.trivia_categories.map((category) => ({
    id: category.id,
    name: category.name,
  }));

  await prisma.category.createMany({
    data: categories,
  });

  return res.json({
    data: categories,
  });
};

export { seedCategoriesData };