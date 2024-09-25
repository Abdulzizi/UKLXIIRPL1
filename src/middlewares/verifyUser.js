import Joi from "joi";

const allowedRoles = ["ADMIN", "MANAGER", "KASIR"];

// Add user schema
const addDataSchema = Joi.object({
  name: Joi.string().min(1).required().messages({
    "string.empty": "Name is required",
    "string.min": "Name must be at least 1 character long",
  }),
  email: Joi.string().email().required().messages({
    "string.email": "Invalid email format",
    "any.required": "Email is required",
  }),
  password: Joi.string().min(6).required().messages({
    "string.min": "Password must be at least 6 characters long",
    "any.required": "Password is required",
  }),
  role: Joi.string()
    .valid(...allowedRoles)
    .messages({
      "string.base": "Role must be a valid string",
      "any.only": `Role must be one of: ${allowedRoles.join(", ")}`,
    }),
});

// Login Schema
const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Invalid email format",
    "any.required": "Email is required",
  }),
  password: Joi.string().min(6).required().messages({
    "string.min": "Password must be at least 6 characters long",
    "any.required": "Password is required",
  }),
});

// Update User Schema
const updateUserSchema = Joi.object({
  name: Joi.string().min(1).messages({
    "string.empty": "Name cannot be empty",
    "string.min": "Name must be at least 1 character long",
  }),
  email: Joi.string().email().messages({
    "string.email": "Invalid email format",
  }),
  password: Joi.string().min(6).messages({
    "string.min": "Password must be at least 6 characters long",
  }),
  role: Joi.string()
    .valid(...allowedRoles)
    .messages({
      "any.only": `Role must be one of: ${allowedRoles.join(", ")}`,
    }),
});

export const verifyAddUser = async (req, res, next) => {
  try {
    const { error } = addDataSchema.validate(req.body, { abortEarly: false });

    if (error) {
      return res.status(400).json({
        status: false,
        errors: error.details.map((i) => ({
          field: i.context.label,
          message: i.message,
        })),
      });
    }

    return next();
  } catch (error) {
    console.error(`[VERIFY_ADD_USER] ${error.message}`);
    res.status(500).json({ status: false, message: "Internal Server Error" });
  }
};

export const verifyLoginUser = async (req, res, next) => {
  try {
    const { error } = loginSchema.validate(req.body, { abortEarly: false });

    if (error) {
      return res.status(400).json({
        status: false,
        errors: error.details.map((i) => ({
          field: i.context.label,
          message: i.message,
        })),
      });
    }

    return next();
  } catch (error) {
    console.error(`[VERIFY_LOGIN_USER] ${error.message}`);
    res.status(500).json({ status: false, message: "Internal Server Error" });
  }
};

export const verifyUpdateUser = async (req, res, next) => {
  try {
    const { error } = updateUserSchema.validate(req.body, {
      abortEarly: false,
    });

    if (error) {
      return res.status(400).json({
        status: false,
        errors: error.details.map((i) => ({
          field: i.context.label,
          message: i.message,
        })),
      });
    }

    return next();
  } catch (error) {
    console.error(`[VERIFY_UPDATE_USER] ${error.message}`);
    res.status(500).json({ status: false, message: "Internal Server Error" });
  }
};
