import dotenv from "dotenv";
import express, { urlencoded, json } from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import cacheRoute from "./middleware/cacheRoute.js";
import auth from "./routes/v1/auth.js";
import authRoute from "./middleware/authRoute.js";
import users from "./routes/v1/users.js";
import categories from "./routes/v1/categories.js";
import quizzes from "./routes/v1/quizzes.js";

dotenv.config();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

const app = express();
app.use(cors());
app.use(helmet());
app.use(compression());
app.use(cacheRoute);
app.use(limiter);

const BASE_URL = "api";

/**
 * The current version of this API is 1
 */
const CURRENT_VERSION = "v1";

const PORT = process.env.PORT;

app.use(urlencoded({ extended: false }));
app.use(json());

app.use(`/${BASE_URL}/${CURRENT_VERSION}/auth`, auth);
app.use(`/${BASE_URL}/${CURRENT_VERSION}/users`, authRoute, users);
app.use(`/${BASE_URL}/${CURRENT_VERSION}/categories`, categories);
app.use(`/${BASE_URL}/${CURRENT_VERSION}/quizzes`, authRoute, quizzes);

const endpoints = [
  "/api/v1/auth/register",
  "/api/v1/auth/login",
  "/api/v1/users",
  "/api/v1/users/seed",
  "/api/v1/users/:id",
  "/api/v1/categories/seed",
  "/api/v1/quizzes",
  "/api/v1/quizzes/:id",
  "/api/v1/quizzes/seed",
  "/api/v1/quizzes/participate",
  "/api/v1/quizzes/pastQuizzes",
  "/api/v1/quizzes/presentQuizzes",
  "/api/v1/quizzes/futureQuizzes",
];

/**
 * When performing a GET request gor /api/v1, 
 * returns a response containing all available 
 * endpoints in the REST API
 */
app.get("/api/v1/", (req, res) => {
  res.json({ endpoints });
});

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});

export default app;
