import Joi from "joi";

const allowedStatuses = ["AVAILABLE", "RESERVED", "OCCUPIED"];

// Schema for table validation
const tableSchema = Joi.object({
  number: Joi.number().integer().positive().messages({
    "number.base": "Table number must be a positive integer.",
  }),
  capacity: Joi.number().integer().positive().messages({
    "number.base": "Capacity must be a positive number.",
  }),
  status: Joi.string()
    .valid(...allowedStatuses)
    .required()
    .messages({
      "string.base": "Status must be a valid string.",
      "any.only": `Status must be one of: ${allowedStatuses.join(", ")}`,
      "any.required": "Status is required.",
    }),
});

// Validate adding or updating table data
export const verifyAddTable = async (req, res, next) => {
  try {
    const { error } = tableSchema.validate(req.body, { abortEarly: false });

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
    console.error(`[VERIFY_ADD_TABLE] ${error.message}`);
    res.status(500).json({ status: false, message: "Internal Server Error" });
  }
};

// Validate updating table data (optional fields)
export const verifyUpdateTable = async (req, res, next) => {
  try {
    const { error } = tableSchema.validate(req.body, { abortEarly: false });

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
    console.error(`[VERIFY_UPDATE_TABLE] ${error.message}`);
    res.status(500).json({ status: false, message: "Internal Server Error" });
  }
};
