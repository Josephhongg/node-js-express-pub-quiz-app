/**
 * Quizzes Router
 * his file defines the routes for quizzes related operations.
 * It utilizes the Express Router to handle the HTTP endpoints.
 * Routes:
 *   GET /: Retrieve all quizzes
 *   DELETE /:id: Delete a quiz by ID
 *   POST /seed: Seed quizzes data
 *   POST /participate/:id: Participate in a quiz by ID
 *   GET /pastQuizzes: Retrieve past quizzes
 *   GET /presentQuizzes: Retrieve present quizzes
 *   GET /futureQuizzes: Retrieve future quizzes
 */
import { Router } from "express";
const router = Router();

import {
  seedQuizzesData,
  getQuizzes,
  getPastQuizzes,
  getPresentQuizzes,
  getFutureQuizzes,
  deleteQuiz,
  participateInQuiz,
} from "../../controllers/v1/quizzes.js";

router.route("/").get(getQuizzes);
router.route("/:id").delete(deleteQuiz);
router.route("/seed").post(seedQuizzesData);
router.route("/participate/:id").post(participateInQuiz);
router.route("/pastQuizzes").get(getPastQuizzes);
router.route("/presentQuizzes").get(getPresentQuizzes);
router.route("/futureQuizzes").get(getFutureQuizzes);

export default router;
