import db from "../db.js";
import { Prisma } from "@prisma/client";
import { startOfDay, endOfDay } from "date-fns";

// Function to handle errors
const handleError = (error, res) => {
  console.error(error);
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return res.status(400).json({ message: error.message });
  }
  return res.status(500).json({ message: "An unexpected error occurred." });
};

// Create order
export const createOrder = async (req, res) => {
  const { tableId, items, totalPaid, change, paymentMethod } = req.body;
  const isValidItem = (item) => item.menuItemId && item.quantity > 0;

  if (
    !tableId ||
    !Array.isArray(items) ||
    items.length === 0 ||
    !items.every(isValidItem)
  ) {
    return res.status(400).json({
      status: false,
      message:
        "Valid Table ID and items with menuItemId and quantity are required.",
    });
  }

  try {
    const newOrder = await db.$transaction(async (prisma) => {
      const parsedTableId = parseInt(tableId);
      const table = await prisma.table.findUnique({
        where: { id: parsedTableId },
      });

      if (!table) throw new Error(`Table with id ${tableId} not found.`);

      if (table.status === "OCCUPIED" || table.status === "RESERVED") {
        return res.status(400).json({
          status: false,
          message: "Table is already occupied.",
        });
      }

      const orderItems = await Promise.all(
        items.map(async (item) => {
          const menuItem = await prisma.menuItem.findUnique({
            where: { id: item.menuItemId },
          });
          if (!menuItem)
            throw new Error(`MenuItem with id ${item.menuItemId} not found.`);
          return {
            menuItemId: menuItem.id,
            quantity: item.quantity,
            price: menuItem.price * item.quantity,
          };
        })
      );

      const total = orderItems.reduce((sum, item) => sum + item.price, 0);
      const order = await prisma.order.create({
        data: {
          tableId: parsedTableId,
          kasirId: req.user.id,
          total,
          items: { create: orderItems },
        },
      });

      await prisma.table.update({
        where: { id: parsedTableId },
        data: { status: "OCCUPIED" },
      });
      return order;
    });

    return res.status(201).json({
      status: true,
      message: "Order created successfully",
      order: newOrder,
    });
  } catch (error) {
    handleError(error, res);
  }
};

// Update order
export const updateOrder = async (req, res) => {
  const { orderId } = req.params;
  const { items } = req.body;

  const parseOrderId = parseInt(orderId);
  const isValidItem = (item) => item.menuItemId && item.quantity > 0;

  if (
    !Array.isArray(items) ||
    items.length === 0 ||
    !items.every(isValidItem)
  ) {
    return res
      .status(400)
      .json({ message: "Items must have valid menuItemId and quantity." });
  }

  try {
    const updatedOrder = await db.$transaction(async (prisma) => {
      const order = await prisma.order.findUnique({
        where: { id: parseOrderId },
        include: { items: true },
      });
      if (!order) throw new Error("Order not found.");

      const updatedItems = await Promise.all(
        items.map(async (item) => {
          const menuItem = await prisma.menuItem.findUnique({
            where: { id: item.menuItemId },
          });
          if (!menuItem)
            throw new Error(`MenuItem with id ${item.menuItemId} not found.`);
          return {
            menuItemId: menuItem.id,
            quantity: item.quantity,
            price: menuItem.price * item.quantity,
          };
        })
      );

      const newTotal = updatedItems.reduce((sum, item) => sum + item.price, 0);

      const orderUpdated = await prisma.order.update({
        where: { id: parseOrderId },
        data: {
          total: newTotal,
          items: { deleteMany: {}, create: updatedItems },
        },
      });

      return orderUpdated;
    });

    return res
      .status(200)
      .json({ message: "Order updated successfully", order: updatedOrder });
  } catch (error) {
    handleError(error, res);
  }
};

// Delete order
export const deleteOrder = async (req, res) => {
  const { orderId } = req.params;
  const parsedOrderId = parseInt(orderId);

  try {
    const order = await db.order.findUnique({ where: { id: parsedOrderId } });
    if (!order) return res.status(404).json({ message: "Order not found." });

    if (order.status === "FINALIZED") {
      return res
        .status(400)
        .json({ message: "Cannot delete a finalized order." });
    }

    // Delete related OrderItems
    await db.orderItem.deleteMany({ where: { orderId: parsedOrderId } });

    // Now delete the order
    await db.order.delete({ where: { id: parsedOrderId } });

    return res.status(200).json({ message: "Order deleted successfully" });
  } catch (error) {
    handleError(error, res);
  }
};

// Get transactions with filtering
export const getTransactionsWithFilter = async (req, res) => {
  try {
    const { date, paymentMethod } = req.query;

    const filterConditions = {
      // kasirId: req.user.id,
    };

    if (date) {
      const parsedDate = new Date(date);
      filterConditions.createdAt = {
        gte: startOfDay(parsedDate), // Start of the day
        lt: endOfDay(parsedDate), // End of the day
      };
    }

    if (paymentMethod) {
      filterConditions.transaction = {
        some: {
          paymentMethod: paymentMethod.toUpperCase(), // Convert to uppercase
        },
      };
    }

    const transactions = await db.order.findMany({
      where: filterConditions,
      include: { items: true },
    });

    return res.status(200).json({
      status: true,
      message: "Success in getting transactions",
      data: transactions,
    });
  } catch (error) {
    handleError(error, res);
  }
};

export const getTransactionById = async (req, res) => {
  const { orderId } = req.params;
  const parsedOrderId = parseInt(orderId);

  if (!orderId) {
    return res.status(400).json({ message: "Invalid order ID." });
  }

  try {
    const transaction = await db.order.findUnique({
      where: { id: parsedOrderId },
      include: {
        items: {
          include: {
            menuItem: true,
          },
        },
        kasir: true,
      },
    });

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found." });
    }

    return res.status(200).json({
      status: true,
      message: "Transaction retrieved successfully.",
      data: transaction,
    });
  } catch (error) {
    handleError(error, res);
  }
};

// Print receipt
export const printReceipt = async (req, res) => {
  const { orderId } = req.params;
  const parsedOrderId = parseInt(orderId);

  try {
    const order = await db.order.findUnique({
      where: { id: parsedOrderId },
      include: { items: true, table: true },
    });

    if (!order) return res.status(404).json({ message: "Order not found." });

    // Create the receipt
    const receipt = {
      cafeName: "Blow Eatery",
      date: new Date(order.createdAt).toLocaleString(),
      cashier: req.user.name,
      table: order.table.id,
      items: order.items,
      total: order.total,
    };

    // Send receipt to user
    res.status(200).json(receipt);

    // Clean up operations after printing the receipt
    await db.$transaction(async (prisma) => {
      try {
        // 1. Update table status to AVAILABLE
        await prisma.table.update({
          where: { id: order.table.id },
          data: { status: "AVAILABLE" },
        });

        // 2. Update order status to FINALIZED
        await prisma.order.update({
          where: { id: parsedOrderId },
          data: { status: "FINALIZED" },
        });
      } catch (cleanupError) {
        console.error("Cleanup Error: ", cleanupError);
      }
    });
  } catch (error) {
    handleError(error, res);
  }
};
