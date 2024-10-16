import db from "../db.js";
import { Prisma } from "@prisma/client";
import { startOfDay, endOfDay } from "date-fns";

// Function untuk catch error
const handleError = (error, res) => {
  console.error(error.message);
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return res.status(400).json({ message: error.message });
  }
  return res.status(500).json({ message: "An unexpected error occurred." });
};

// Make order
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
      const parsedTableId = parseInt(tableId);

      const table = await prisma.table.findUnique({
        where: { id: parsedTableId },
      });

      if (!table) {
        return {
          status: 400,
          response: { message: `Table with id ${tableId} not found.` },
        };
      }

      // Check if the table is occupied or reserved
      if (table.status === "OCCUPIED" || table.status === "RESERVED") {
        return {
          status: 400,
          response: { message: "Table is already occupied." },
        };
      }

      // Fetch menu items and calculate order items
      const orderItems = await Promise.all(
        items.map(async (item) => {
          const menuItem = await prisma.menuItem.findUnique({
            where: { id: item.menuItemId },
          });
          if (!menuItem) {
            throw new Error(`MenuItem with id ${item.menuItemId} not found.`);
          }
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

      // Update table status to OCCUPIED
      await prisma.table.update({
        where: { id: parsedTableId },
        data: { status: "OCCUPIED" },
      });

      return order; // Return the created order
    });

    // Handle the response from the transaction
    if (newOrder.status === 400) {
      return res.status(newOrder.status).json(newOrder.response);
    }

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

  const parseOrderId = parseInt(orderId);

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: "Items are required." });
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
    const { date, paymentMethod } = req.query; // Get data from query
    // console.log(req.user);

    // Construct the filter conditions
    const filterConditions = {
      kasirId: req.user.id,
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
          paymentMethod: paymentMethod.toUpperCase(), // Ensure paymentMethod matches the enum case
        },
      };
    }

    const transactions = await db.order.findMany({
      where: filterConditions,
      include: { items: true, transaction: true },
    });

    return res.status(200).json({
      status: true,
      message: "Success in getting transactions",
      data: transactions,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Error retrieving transactions",
      error: error.message,
    });
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

    // console.log(req.user);

    // Create the receipt
    const receipt = {
      cafeName: "Blow eatery",
      date: new Date(order.createdAt).toLocaleString(),
      cashier: req.user.name,
      table: order.table.id,
      items: order.items,
      total: order.total,
    };

    // Print the receipt (send it to the user)
    res.status(200).json(receipt);

    // Clean operasi setelah nota di print

    // 1. update table jadi available lagi
    await db.table.update({
      where: { id: order.table.id },
      data: { status: "AVAILABLE" },
    });

    // 2. delete semua order item yang bersangkutan
    await db.orderItem.deleteMany({ where: { orderId: parsedOrderId } });

    // 3. delete ordernya sendiri
    await db.order.delete({ where: { id: parsedOrderId } });
  } catch (error) {
    handleError(error, res);
  }
};
