import Joi from "joi";

// Allowed roles for menus
const allowedMenuRoles = ["ADMIN", "MANAGER", "KASIR"];

// Base menu schema
const baseMenuSchema = {
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
};

// Add menu schema
const addMenuSchema = Joi.object(baseMenuSchema);

// Update menu schema
const updateMenuSchema = Joi.object({
  ...baseMenuSchema,
  name: baseMenuSchema.name.optional(),
  price: baseMenuSchema.price.optional(),
});

const verifyMenu = (schema) => async (req, res, next) => {
  try {
    const errors = [];

    // If the request body is an array, validate each item
    if (Array.isArray(req.body)) {
      for (const item of req.body) {
        const { error } = schema.validate(item, { abortEarly: false });
        if (error) {
          errors.push(
            ...error.details.map(({ context, message }) => ({
              field: context.label,
              message,
            }))
          );
        }
      }
    } else {
      // If the request body is a single object, validate it directly
      const { error } = schema.validate(req.body, { abortEarly: false });
      if (error) {
        errors.push(
          ...error.details.map(({ context, message }) => ({
            field: context.label,
            message,
          }))
        );
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({ status: false, errors });
    }

    return next();
  } catch (error) {
    console.error(`[VERIFY_MENU] ${error.message}`);
    return res
      .status(500)
      .json({ status: false, message: "Internal Server Error" });
  }
};

export const verifyAddMenu = verifyMenu(addMenuSchema);
export const verifyUpdateMenu = verifyMenu(updateMenuSchema);
