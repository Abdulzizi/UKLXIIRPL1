import Joi from "joi";

// Allowed roles for menus
const allowedMenuRoles = ["ADMIN", "MANAGER", "KASIR"];

// Add menu schema
const addMenuSchema = Joi.object({
  name: Joi.string().min(1).required().messages({
    "string.empty": "Name is required",
    "string.min": "Name must be at least 1 character long",
  }),
  description: Joi.string().optional().allow("").messages({
    "string.empty": "Description can be empty",
  }),
  price: Joi.number().greater(0).required().messages({
    "number.base": "Price must be a number",
    "number.greater": "Price must be greater than 0",
    "any.required": "Price is required",
  }),
  role: Joi.string()
    .valid(...allowedMenuRoles)
    .messages({
      "string.base": "Role must be a valid string",
      "any.only": `Role must be one of: ${allowedMenuRoles.join(", ")}`,
    }),
});

// Update menu schema
const updateMenuSchema = Joi.object({
  name: Joi.string().min(1).messages({
    "string.empty": "Name cannot be empty",
    "string.min": "Name must be at least 1 character long",
  }),
  description: Joi.string().optional().allow("").messages({
    "string.empty": "Description can be empty",
  }),
  price: Joi.number().greater(0).messages({
    "number.base": "Price must be a number",
    "number.greater": "Price must be greater than 0",
  }),
  role: Joi.string()
    .valid(...allowedMenuRoles)
    .messages({
      "any.only": `Role must be one of: ${allowedMenuRoles.join(", ")}`,
    }),
});

// Verify Add Menu
export const verifyAddMenu = async (req, res, next) => {
  try {
    const { error } = addMenuSchema.validate(req.body, { abortEarly: false });

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
    console.error(`[VERIFY_ADD_MENU] ${error.message}`);
    res.status(500).json({ status: false, message: "Internal Server Error" });
  }
};

// Verify Update Menu
export const verifyUpdateMenu = async (req, res, next) => {
  try {
    const { error } = updateMenuSchema.validate(req.body, {
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
    console.error(`[VERIFY_UPDATE_MENU] ${error.message}`);
    res.status(500).json({ status: false, message: "Internal Server Error" });
  }
};
