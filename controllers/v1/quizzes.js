/**
 * This file contains several functions related to quizzes, including seeding quizzes data,
 * retrieving quizzes based on different criteria (past, present, future), deleting quizzes,
 * and allowing users to participate in quizzes and calculate scores.
 */
import axios from "axios";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const seedQuizzesData = async (req, res) => {
  try {
    const { name, categoryId, type, difficulty, startDate, endDate } = req.body;
    const quizzesURL = `https://opentdb.com/api.php?amount=10&category=${categoryId}&difficulty=${difficulty}&type=${type}`;

    const response = await axios.get(quizzesURL);
    const data = response.data;

    const user = await prisma.user.findUnique({
      where: { id: Number(req.user.id) },
    });

    if (user.role !== "ADMIN_USER") {
      return res.status(403).json({
        msg: "Not authorized to access this route",
      });
    }

    await prisma.quiz.deleteMany({});

    const todaysDate = new Date();

    /**
     * Date error checking
     */
    const diffTime = Math.abs(endDate - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (startDate < todaysDate) {
      return res.json({
        msg: "Start date cannot be before today's date",
      });
    }
    if (startDate > endDate) {
      return res.json({
        msg: "Start date cannot be greater than end date",
      });
    }
    if (diffDays > 5) {
      return res.json({
        msg: "Quiz duration cannot be longer than five days",
      });
    }

    const quizPayload = {
      name,
      categoryId,
      type,
      difficulty,
      startDate,
      endDate,
    };

    // Creates Quiz
    const quiz = await prisma.quiz.create({
      data: quizPayload,
    });

    const questionPayload = data.results.map((questionData) => ({
      quizId: quiz.id,
      question: questionData.question,
      correctAnswer: questionData.correct_answer,
      incorrectAnswers: questionData.incorrect_answers,
    }));

    // Creates Questions
    await prisma.question.createMany({
      data: questionPayload,
    });

    return res.json({
      msg: "Quiz successfully created",
      data: quiz,
      questions: questionPayload,
    });
  } catch (err) {
    return res.status(500).json({
      msg: err.message,
    });
  }
};

const getQuizzes = async (req, res) => {
  try {
    const quizzes = await prisma.quiz.findMany();

    if (quizzes.length === 0) {
      return res.status(200).json({ msg: "No quizzes found" });
    }

    const user = await prisma.user.findUnique({
      where: { id: Number(req.user.id) },
    });

    if (user.role !== "BASIC_USER" && user.role !== "ADMIN_USER") {
      return res.status(403).json({
        msg: "Not authorized to access this route",
      });
    }

    return res.json({ data: quizzes });
  } catch (err) {
    return res.status(500).json({
      msg: err.message,
    });
  }
};

const getPastQuizzes = async (req, res) => {
  try {
    const today = new Date();

    const pastQuizzes = await prisma.quiz.findMany({
      where: {
        startDate: {
          lt: today,
        },
      },
    });

    if (pastQuizzes.length === 0) {
      return res.status(200).json({ msg: "No past quizzes found" });
    }

    const user = await prisma.user.findUnique({
      where: { id: Number(req.user.id) },
    });

    if (user.role !== "BASIC_USER" && user.role !== "ADMIN_USER") {
      return res.status(403).json({
        msg: "Not authorized to access this route",
      });
    }

    return res.json({ data: pastQuizzes });
  } catch (err) {
    return res.status(500).json({
      msg: err.message,
    });
  }
};

const getPresentQuizzes = async (req, res) => {
  try {
    const today = new Date();

    const presentQuizzes = await prisma.quiz.findMany({
      where: {
        startDate: {
          lte: today,
        },
        endDate: {
          gte: today,
        },
      },
    });

    if (presentQuizzes.length === 0) {
      return res.status(200).json({ msg: "No present quizzes found" });
    }

    const user = await prisma.user.findUnique({
      where: { id: Number(req.user.id) },
    });

    if (user.role !== "BASIC_USER" && user.role !== "ADMIN_USER") {
      return res.status(403).json({
        msg: "Not authorized to access this route",
      });
    }

    return res.json({ data: presentQuizzes });
  } catch (err) {
    return res.status(500).json({
      msg: err.message,
    });
  }
};

const getFutureQuizzes = async (req, res) => {
  try {
    const today = new Date();

    const futureQuizzes = await prisma.quiz.findMany({
      where: {
        startDate: {
          gt: today,
        },
      },
    });

    if (futureQuizzes.length === 0) {
      return res.status(200).json({ msg: "No future quizzes found" });
    }

    const user = await prisma.user.findUnique({
      where: { id: Number(req.user.id) },
    });

    if (user.role !== "BASIC_USER" && user.role !== "ADMIN_USER") {
      return res.status(403).json({
        msg: "Not authorized to access this route",
      });
    }

    return res.json({ data: futureQuizzes });
  } catch (err) {
    return res.status(500).json({
      msg: err.message,
    });
  }
};

const deleteQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    let user = await prisma.user.findUnique({
      where: { id: Number(req.user.id) },
    });

    if (user.role !== "ADMIN_USER") {
      return res.status(403).json({
        msg: "Not authorized to access this route",
      });
    }

    let existingQuiz = await prisma.quiz.findUnique({
      where: { id: Number(id) },
    });

    if (!existingQuiz) {
      return res.status(200).json({ msg: `No quiz with the id: ${id} found` });
    }

    await prisma.quiz.delete({
      where: {
        id: Number(id),
      },
    });

    return res.json({
      msg: `Quiz with the id: ${id} successfully deleted`,
    });
  } catch (err) {
    return res.status(500).json({
      msg: err.message,
    });
  }
};

const participateInQuiz = async (req, res) => {
  try {
    const { answers } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: Number(req.user.id) },
    });

    if (user.role !== "BASIC_USER") {
      return res.status(403).json({
        msg: "Not authorized to access this route",
      });
    }

    const quiz = await prisma.quiz.findUnique({
      where: { id: Number(req.params.id) },
    });

    if (!quiz) {
      return res.status(404).json({
        msg: "Quiz not found",
      });
    }

    const today = new Date();

    if (today >= quiz.endDate) {
      return res.status(400).json({
        msg: "Quiz has already ended",
      });
    }

    let questions = await prisma.question.findMany({
      where: { quizId: Number(req.params.id) },
    });

    if (questions.length !== answers.length) {
      return res.status(400).json({
        msg: "Number of answers must match the number of questions",
      });
    }

    let score = 0;

    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      const userAnswer = answers[i];

      if (question.correctAnswer === userAnswer) {
        score++;
      }

      await prisma.userQuestionAnswer.create({
        data: {
          userId: Number(req.user.id),
          quizId: Number(req.params.id),
          questionId: question.id,
          answer: userAnswer,
          isCorrect: question.correctAnswer === userAnswer,
        },
      });
    }

    await prisma.userQuizScore.create({
      data: {
        userId: Number(req.user.id),
        quizId: Number(req.params.id),
        score,
      },
    });

    const quizAvgScore = await prisma.userQuizScore.aggregate({
      where: { quizId: Number(req.params.id) },
      _avg: { score: true },
    });

    /**
     * when performing a POST request for a basic user who has participated in a quiz, returns 
     * a status code, a response message, users score and quiz's average score
     */
    return res.status(201).json({
      msg: `${user.username} has successfully participated in ${quiz.name}`,
      userScore: score,
      quizAvgScore: quizAvgScore.score,
    });
  } catch (err) {
    return res.status(500).json({
      msg: err.message,
    });
  }
};

export {
  seedQuizzesData,
  getQuizzes,
  getPastQuizzes,
  getPresentQuizzes,
  getFutureQuizzes,
  deleteQuiz,
  participateInQuiz,
};
