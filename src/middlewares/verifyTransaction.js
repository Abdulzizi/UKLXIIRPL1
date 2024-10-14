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

// Validation for printing the receipt (orderId is required in params)
const printReceiptSchema = Joi.object({
  orderId: Joi.number().integer().required().messages({
    "number.base": "Order ID must be a number",
    "any.required": "Order ID is required",
  }),
});

// Validation for deleting an order (orderId is required in params)
const deleteOrderSchema = Joi.object({
  orderId: Joi.number().integer().required().messages({
    "number.base": "Order ID must be a number",
    "any.required": "Order ID is required",
  }),
});

// Middleware for creating an order
export const verifyCreateOrder = async (req, res, next) => {
  try {
    const { error } = createOrderSchema.validate(req.body, {
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
    console.error(`[VERIFY_CREATE_ORDER] ${error.message}`);
    res.status(500).json({ status: false, message: "Internal Server Error" });
  }
};

// Middleware for updating an order
export const verifyUpdateOrder = async (req, res, next) => {
  try {
    const { error } = updateOrderSchema.validate(req.body, {
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
    console.error(`[VERIFY_UPDATE_ORDER] ${error.message}`);
    res.status(500).json({ status: false, message: "Internal Server Error" });
  }
};

// Middleware for printing receipt
export const verifyPrintReceipt = async (req, res, next) => {
  try {
    const { error } = printReceiptSchema.validate(req.params, {
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
    console.error(`[VERIFY_PRINT_RECEIPT] ${error.message}`);
    res.status(500).json({ status: false, message: "Internal Server Error" });
  }
};

// Middleware for deleting an order
export const verifyDeleteOrder = async (req, res, next) => {
  try {
    const { error } = deleteOrderSchema.validate(req.params, {
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
    console.error(`[VERIFY_DELETE_ORDER] ${error.message}`);
    res.status(500).json({ status: false, message: "Internal Server Error" });
  }
};
