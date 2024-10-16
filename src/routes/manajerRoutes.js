import express from "express";
import { authenticate, authorize } from "../middlewares/auth.js";
import * as kasir from "../controller/transactionController.js";

const app = express();

app.use(express.json());

// Get untuk transaksi dengan filtering
app.get(
  "/transaksi",
  authenticate,
  authorize(["MANAJER"]),
  kasir.getTransactionsWithFilter
);

export default app;
