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
    .optional() // Role can be omitted when adding
    .messages({
      "string.base": "Role must be a valid string",
      "any.only": `Role must be one of: ${allowedMenuRoles.join(", ")}`,
    }),
};

// Add menu schema
const addMenuSchema = Joi.object(baseMenuSchema);

// Validate adding or updating menu data
const verifyMenu = (schema) => async (req, res, next) => {
  try {
    const errors = [];

    // Convert to array if a single object is passed
    const items = Array.isArray(req.body) ? req.body : [req.body];

    // Validate each menu entry
    for (const item of items) {
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

// Update menu schema
const updateMenuSchema = Joi.object({
  name: baseMenuSchema.name.optional(),
  description: baseMenuSchema.description.optional(),
  price: baseMenuSchema.price.optional(),
  role: baseMenuSchema.role.optional(),
});

export const verifyUpdateMenu = verifyMenu(updateMenuSchema);
export const verifyAddMenu = verifyMenu(addMenuSchema);
