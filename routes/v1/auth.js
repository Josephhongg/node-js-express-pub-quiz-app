/**
 * Auth Router
 * This file defines the authentication routes for user registration and login.
 * It utilizes the Express Router to handle the HTTP endpoints.
 * Routes:
 *   POST /register: Endpoint for user registration.
 *   POST /login: Endpoint for user login.
 */
import { Router } from "express";
const router = Router();

import { register, login } from "../../controllers/v1/auth.js";

router.route("/register").post(register);
router.route("/login").post(login);

export default router;
