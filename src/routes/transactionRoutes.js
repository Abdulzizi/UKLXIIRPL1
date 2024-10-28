import express from "express";
import { authenticate, authorize } from "../middlewares/auth.js";
import * as kasir from "../controller/transactionController.js";
import * as transVer from "../middlewares/verifyTransaction.js";

const app = express();

app.use(express.json());

// Protected routes (hanya bisa diakses jika sudah login dan rolenya sesuai)
app.post(
  "/transaction",
  authenticate,
  authorize(["KASIR"]),
  transVer.verifyCreateOrder,
  kasir.createOrder
);
app.get(
  "/transaction/",
  authenticate,
  authorize(["KASIR", "MANAGER"]),
  kasir.getTransactionsWithFilter
);
app.get(
  "/transaction/:orderId",
  authenticate,
  authorize(["KASIR", "MANAGER"]),
  kasir.getTransactionById
);

app.get(
  "/transaction/:orderId/receipt",
  authenticate,
  authorize(["KASIR"]),
  kasir.printReceipt
);
app.patch(
  "/transaction/:orderId",
  authenticate,
  authorize(["KASIR"]),
  transVer.verifyUpdateOrder,
  kasir.updateOrder
);
app.delete(
  "/transaction/:orderId",
  authenticate,
  authorize(["KASIR"]),
  kasir.deleteOrder
);

export default app;
