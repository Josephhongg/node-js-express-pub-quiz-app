import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import bcryptjs from "bcryptjs";
const prisma = new PrismaClient();

// Importing data
import { adminUsers } from "../data/adminUsers.js";

dotenv.config();

const seedAdminUsers = async () => {
  adminUsers.forEach((user) => {
    const salt = bcryptjs.genSaltSync();
    const hashedPassword = bcryptjs.hashSync(user.password, salt);
    user.password = hashedPassword;
  });

  const AdminUserIdsToDelete = adminUsers
    .filter((user) => user.role === "ADMIN_USER")
    .map((user) => user.id);

  await prisma.user.deleteMany({
    where: {
      id: {
        in: AdminUserIdsToDelete,
      },
    },
  });

  await prisma.user.createMany({
    data: adminUsers,
  });
};

seedAdminUsers()
  .then(async () => {
    await prisma.$disconnect();
    console.log("Admin users successfully created");
  })
  .catch(async (err) => {
    console.error(err);
    await prisma.$disconnect();
    process.exit(1);
  });
