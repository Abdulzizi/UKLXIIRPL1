import db from "../db.js";
import { Prisma } from "@prisma/client";

// Helper function to handle errors
const handleError = (error, res) => {
  console.error(error.message);
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return res.status(400).json({ message: error.message });
  }
  return res.status(500).json({ message: "An unexpected error occurred." });
};

// Create order
export const createOrder = async (req, res) => {
  const { tableId, items } = req.body;

  if (!tableId || !Array.isArray(items) || items.length === 0) {
    return res
      .status(400)
      .json({ message: "Table ID and items are required." });
  }

  try {
    // Create order within a transaction
    const newOrder = await db.$transaction(async (prisma) => {
      const table = await prisma.table.findUnique({ where: { id: tableId } });
      if (!table) throw new Error("Table not found.");

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
          tableId,
          kasirId: req.user.id,
          total,
          items: { create: orderItems },
        },
      });
      await prisma.table.update({
        where: { id: tableId },
        data: { status: "OCCUPIED" },
      });

      return order;
    });

    return res
      .status(201)
      .json({ message: "Order created successfully", order: newOrder });
  } catch (error) {
    handleError(error, res);
  }
};

// Update order
export const updateOrder = async (req, res) => {
  const { orderId } = req.params;
  const { items } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: "Items are required." });
  }

  try {
    const updatedOrder = await db.$transaction(async (prisma) => {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
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
        where: { id: orderId },
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

  try {
    const order = await db.order.findUnique({ where: { id: orderId } });
    if (!order) return res.status(404).json({ message: "Order not found." });

    if (order.status === "FINALIZED") {
      return res
        .status(400)
        .json({ message: "Cannot delete a finalized order." });
    }

    await db.order.delete({ where: { id: orderId } });
    return res.status(200).json({ message: "Order deleted successfully" });
  } catch (error) {
    handleError(error, res);
  }
};

// Get transactions
export const getTransactionsByCashier = async (req, res) => {
  try {
    const transactions = await db.order.findMany({
      where: { kasirId: req.user.id },
      include: { items: true },
    });
    return res.status(200).json(transactions);
  } catch (error) {
    handleError(error, res);
  }
};

// Print receipt
export const printReceipt = async (req, res) => {
  const { orderId } = req.params;

  try {
    const order = await db.order.findUnique({
      where: { id: orderId },
      include: { items: true, table: true },
    });
    if (!order) return res.status(404).json({ message: "Order not found." });

    const receipt = {
      cafeName: "Blow eatery",
      date: new Date(order.createdAt).toLocaleString(),
      cashier: req.user.name,
      table: order.table.id,
      items: order.items,
      total: order.total,
    };

    return res.status(200).json(receipt);
  } catch (error) {
    handleError(error, res);
  }
};
