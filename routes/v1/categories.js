/**
 * Categories Router
 * This file defines the route for seeding categories data.
 * It utilizes the Express Router to handle the HTTP endpoint.
 * Route:
 *  POST /seed: Endpoint for seeding categories data.
 */
import { Router } from "express";
const router = Router();

import { seedCategoriesData } from "../../controllers/v1/categories.js";

router.route("/seed").post(seedCategoriesData);

export default router;
