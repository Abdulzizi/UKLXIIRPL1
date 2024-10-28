import Joi from "joi";

// Validation schema for order items
const orderItemSchema = Joi.object({
  menuItemId: Joi.number().integer().required().messages({
    "number.base": "MenuItem ID must be a number",
    "any.required": "MenuItem ID is required",
  }),
  quantity: Joi.number().integer().min(1).required().messages({
    "number.base": "Quantity must be a number",
    "number.min": "Quantity must be at least 1",
    "any.required": "Quantity is required",
  }),
});

// Validation schema for creating an order
const createOrderSchema = Joi.object({
  tableId: Joi.number().integer().required().messages({
    "number.base": "Table ID must be a number",
    "any.required": "Table ID is required",
  }),
  items: Joi.array().items(orderItemSchema).min(1).required().messages({
    "array.base": "Items must be an array",
    "array.min": "At least one item is required",
    "any.required": "Items are required",
  }),
});

// Validation schema for updating an order
const updateOrderSchema = Joi.object({
  items: Joi.array().items(orderItemSchema).min(1).required().messages({
    "array.base": "Items must be an array",
    "array.min": "At least one item is required",
    "any.required": "Items are required",
  }),
});

// Middleware for validating requests against the provided schema
const verifySchema = (schema) => (req, res, next) => {
  try {
    const { error } = schema.validate(req.body || req.params, {
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
    console.error(`[VERIFY_TRANSACTION] ${error.message}`);
    return res
      .status(500)
      .json({ status: false, message: "Internal Server Error" });
  }
};

// Exporting the validation middlewares
export const verifyCreateOrder = verifySchema(createOrderSchema);
export const verifyUpdateOrder = verifySchema(updateOrderSchema);
