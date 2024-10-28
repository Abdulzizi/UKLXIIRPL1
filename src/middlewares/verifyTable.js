import Joi from "joi";

// Allowed roles for menus
const allowedTableStatus = ["AVAILABLE", "OCUPIED", "RESERVED"];

// Base menu schema
const baseTableSchema = {
  number: Joi.number().min(1).required().messages({
    "number.base": "Table number is required and must be a number",
    "number.min": "Table number must be at least 1",
    "any.required": "Table number is required",
  }),
  capacity: Joi.number().optional().allow(null).default(0).messages({
    "number.base": "Capacity must be a number",
  }),

  status: Joi.string()
    .valid(...allowedTableStatus)
    .optional()
    .default("AVAILABLE")
    .messages({
      "string.base": "Status must be a valid string",
      "any.only": `Status must be one of: ${allowedTableStatus.join(", ")}`,
    }),
};

const addTableSchema = Joi.object(baseTableSchema);

const verifyTable = (schema) => (req, res, next) => {
  try {
    const errors = [];

    const items = Array.isArray(req.body) ? req.body : [req.body];

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

const updateMenuSchema = Joi.object({
  number: baseTableSchema.number.optional(),
  capacity: baseTableSchema.capacity.optional(),
  status: baseTableSchema.status.optional(),
});

export const verifyUpdateTable = verifyTable(updateMenuSchema);
export const verifyAddTable = verifyTable(addTableSchema);
