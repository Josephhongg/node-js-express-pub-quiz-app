/**
 * Users Router
 * This file defines the routes for user-related operations.
 * It utilizes the Express Router to handle the HTTP endpoints.
 * Routes:
 *   GET /: Retrieve all users
 *   POST /seed: Seed basic users data
 *   GET /:id: Retrieve a user by ID
 *   PUT /:id: Update a user by ID
 *   DELETE /:id: Delete a user by ID
 */
import { Router } from "express";
const router = Router();

import {
  getUser,
  getUsers,
  updateUser,
  deleteUser,
  seedBasicUsersData,
} from "../../controllers/v1/users.js";

router.route("/").get(getUsers);
router.route("/seed").post(seedBasicUsersData);
router.route("/:id").get(getUser).put(updateUser).delete(deleteUser);

export default router;
