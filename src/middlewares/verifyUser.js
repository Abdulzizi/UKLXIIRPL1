import Joi from "joi";

const addDataSchema = Joi.object({
  name: Joi.string().min(1).required(),
  email: Joi.string().email().required(),
  password: Joi.required(),
  role: Joi.string().min(1),
});

const loginSchema = Joi.object({
  email: Joi.string().min(1).email().required(),
  password: Joi.required(),
});

export const verifyAddUser = async (req, res, next) => {
  try {
    const { error } = addDataSchema.validate(req.body, { abortEarly: false });

    if (error) {
      return res.status(400).json({
        status: false,
        message: error.details.map((i) => i.message).join(),
      });
    }

    return next();
  } catch (error) {
    console.error(`[VERIFY_ADD_USER] ${error.message}`);
  }
};

export const verifyLoginUser = async (req, res, next) => {
  try {
    const { error } = loginSchema.validate(req.body, { abortEarly: false });

    if (error) {
      return res.status(400).json({
        status: false,
        message: error.details.map((i) => i.message).join(),
      });
    }

    return next();
  } catch (error) {
    console.error(`[VERIFY_LOGIN_USER] ${error.message}`);
  }
};
