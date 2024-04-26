/**
 * This file contains the register and login functionality
 */
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import Joi from "joi";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// Joi validation
const userSchema = Joi.object({
  firstName: Joi.string()
    .min(2)
    .max(50)
    .regex(/^[A-Za-z]+$/)
    .required()
    .messages({
      "string.base": "First name must be a string",
      "string.empty": "First name is required",
      "string.min": "First name must have a minimum length of {#limit}",
      "string.max": "First name must have a maximum length of {#limit}",
      "string.pattern.base":
        "First name must contain only alphabetic characters",
      "any.required": "First name is required",
    }),
  lastName: Joi.string()
    .min(2)
    .max(50)
    .regex(/^[A-Za-z]+$/)
    .required()
    .messages({
      "string.base": "Last name must be a string",
      "string.empty": "Last name is required",
      "string.min": "Last name must have a minimum length of {#limit}",
      "string.max": "Last name must have a maximum length of {#limit}",
      "string.pattern.base":
        "Last name must contain only alphabetic characters",
      "any.required": "Last name is required",
    }),
  username: Joi.string().alphanum().min(5).max(10).required().messages({
    "string.base": "Username must be a string",
    "string.empty": "Username is required",
    "string.alphanum": "Username must contain only alphanumeric characters",
    "string.min": "Username must have a minimum length of {#limit}",
    "string.max": "Username must have a maximum length of {#limit}",
    "any.required": "Username is required",
  }),
  email: Joi.string().email().required().messages({
    "string.base": "Email must be a string",
    "string.empty": "Email is required",
    "string.email": "Email must be a valid email address",
    "any.required": "Email is required",
  }),
  password: Joi.string()
    .min(8)
    .max(16)
    .pattern(/^(?=.*\d)(?=.*[!@#$%^&*])[a-zA-Z\d!@#$%^&*]{8,16}$/)
    .required()
    .messages({
      "string.base": "Password must be a string",
      "string.empty": "Password is required",
      "string.min": "Password must have a minimum length of {#limit}",
      "string.max": "Password must have a maximum length of {#limit}",
      "string.pattern.base":
        "Password must contain at least one numeric character and one special character",
      "any.required": "Password is required",
    }),
  confirmPassword: Joi.string().valid(Joi.ref("password")).required().messages({
    "any.only": "Confirm password must match the password",
    "any.required": "Confirm password is required",
  }),
});

const register = async (req, res) => {
  try {
    const {
      id,
      firstName,
      lastName,
      username,
      email,
      profilePicture,
      password,
      confirmPassword,
      role,
    } = req.body;

    const { error, value } = userSchema.validate({
      firstName,
      lastName,
      username,
      email,
      password,
      confirmPassword,
    });

    let user = await prisma.user.findFirst({
      where: {
        OR: [{ email: email }, { username: username }],
      },
    });

    if (error) {
      return res.status(400).json({
        msg: error.details[0].message,
      });
    }

    if (user) {
      return res.status(409).json({ msg: "User already exists" });
    }

    // Checks if confirmedPassword does not match password
    if (confirmPassword !== password) {
      return res.status(401).json({
        msg: "Confirm password must match password",
      });
    }

    /**
     * A salt is random bits added to a password before it is hashed. Salts
     * create unique passwords even if two users have the same passwords
     */
    const salt = await bcryptjs.genSalt();

    /**
     * Generate a hash for a given string. The first argument
     * is a string to be hashed, i.e., Pazzw0rd123 and the second
     * argument is a salt, i.e., E1F53135E559C253
     */
    const hashedPassword = await bcryptjs.hash(password, salt);

    user = await prisma.user.create({
      data: {
        id,
        firstName: value.firstName,
        lastName: value.lastName,
        username: value.username,
        email: value.email,
        profilePicture,
        password: hashedPassword,
        role,
      },
    });

    /**
     * Delete the password property from the user object. It
     * is a less expensive operation than querying the User
     * table to get only user's email and name
     */
    delete user.password;

    return res.status(201).json({
      msg: "User successfully registered",
      data: user,
    });
  } catch (err) {
    return res.status(500).json({
      msg: err.message,
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, username, password } = req.body;

    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (!user) {
      return res.status(401).json({ msg: "Invalid email" });
    }

    /**
     * Compare the given string, i.e., Pazzw0rd123, with the given
     * hash, i.e., user's hashed password
     */
    const isPasswordCorrect = await bcryptjs.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(401).json({ msg: "Invalid password" });
    }

    const { JWT_SECRET, JWT_LIFETIME } = process.env;

    /**
     * Return a JWT. The first argument is the payload, i.e., an object containing
     * the authenticated user's id and name, the second argument is the secret
     * or public/private key, and the third argument is the lifetime of the JWT
     */
    const token = jwt.sign(
      {
        id: user.id,
        name: user.name,
      },
      JWT_SECRET,
      { expiresIn: JWT_LIFETIME }
    );

    // return successful login message with username
    return res.status(200).json({
      msg: `${user.username} successfully logged in`,
      token: token,
    });
  } catch (err) {
    return res.status(500).json({
      msg: err.message,
    });
  }
};

export { register, login };
