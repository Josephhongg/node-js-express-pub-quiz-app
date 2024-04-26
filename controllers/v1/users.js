/**
 * The provided file contains functions related to user management. It includes the following functions:
 *  getUser: Retrieves a user's information based on the provided id.
 *  getUsers: Retrieves a list of all users.
 *  updateUser: Updates a user's information based on the provided id.
 *  deleteUser: Deletes a user based on the provided id.
 *  seedBasicUsersData: Populates the database with basic user records.
 */
import axios from "axios";
import { PrismaClient } from "@prisma/client";
import bcryptjs from "bcryptjs";
const prisma = new PrismaClient();

const getUser = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = Number(req.user.id);

    let user = await prisma.user.findUnique({
      where: { id: Number(id) },
    });

    if (!user) {
      return res.status(200).json({ msg: `No User with the id: ${id} found` });
    }

    if (user.id !== userId) {
      return res.status(403).json({
        msg: "Not authorized to access other user's information",
      });
    }

    return res.json({ data: user });
  } catch (err) {
    return res.status(500).json({
      msg: err.message,
    });
  }
};

const getUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    const user = await prisma.user.findUnique({
      where: { id: Number(req.user.id) },
    });

    // Only admin users can access
    if (user.role !== "ADMIN_USER") {
      return res.status(403).json({
        msg: "Not authorized to access this route",
      });
    }

    if (users.length === 0) {
      return res.status(200).json({ msg: "No users found" });
    }

    return res.json({ data: users });
  } catch (err) {
    return res.status(500).json({
      msg: err.message,
    });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      firstName,
      lastName,
      username,
      email,
      profilePicture,
      password,
      role,
    } = req.body;

    const userId = Number(req.user.id);

    let user = await prisma.user.findUnique({
      where: { id: Number(req.user.id) },
    });

    // Users can get their info only
    if (user.id !== userId) {
      return res.status(403).json({
        msg: "Not authorized to access other user's information",
      });
    }

    if (!user) {
      return res.status(200).json({ msg: `No user with the id: ${id} found` });
    }

    user = await prisma.user.update({
      where: { id: Number(id) },
      data: {
        firstName,
        lastName,
        username,
        email,
        profilePicture,
        password,
        role,
      },
    });

    return res.json({
      msg: `User with the id: ${id} successfully updated`,
      data: user,
    });
  } catch (err) {
    return res.status(500).json({
      msg: err.message,
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    let user = await prisma.user.findUnique({
      where: { id: Number(req.user.id) },
    });

    // Only admin users can access this route
    if (user.role === "ADMIN_USER") {
      return res.status(403).json({
        msg: "Not authorized to update admin user's information",
      });
    }

    if (!user) {
      return res.status(200).json({ msg: `No user with the id: ${id} found` });
    }

    await prisma.user.delete({
      where: { id: Number(id) },
    });

    return res.json({
      msg: `User with the id: ${id} successfully deleted`,
    });
  } catch (err) {
    return res.status(500).json({
      msg: err.message,
    });
  }
};

const seedBasicUsersData = async (req, res) => {
  const gistURL =
    "https://gist.githubusercontent.com/Josephhongg/0d13f6bad2501fed836a139e57d68375/raw/ccb50fe5b7d04a45c74227ee8bdce8c04df7f275/basicUsers.json";

  const response = await axios.get(gistURL);
  const data = response.data;

  const { id } = req.user;

  const user = await prisma.user.findUnique({
    where: { id: Number(id) },
  });

  // Admin users can access this route
  if (user.role !== "ADMIN_USER") {
    return res.status(403).json({
      msg: "Not authorized to access this route",
    });
  }

  data.forEach((user) => {
    const salt = bcryptjs.genSaltSync();
    const hashedPassword = bcryptjs.hashSync(user.password, salt);
    user.password = hashedPassword;
  });

  await prisma.user.deleteMany({
    where: {
      role: {
        in: ["BASIC_USER"],
      },
    },
  });

  await prisma.user.createMany({
    data: data,
  });

  return res.json({
    data: data,
  });
};

export { getUser, getUsers, updateUser, deleteUser, seedBasicUsersData };
