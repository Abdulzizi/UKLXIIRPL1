import express from "express";
import { authenticate, authorize } from "../middlewares/auth.js";
import * as admin from "../controller/adminTableController.js";
import * as tableVer from "../middlewares/verifyTable.js";

const app = express();

app.use(express.json());

// Get all table data
app.get("/table", authenticate, authorize(["ADMIN"]), admin.getTables);
// Get a table data
app.get("/table/:id", authenticate, authorize(["ADMIN"]), admin.getTableById);
// Create a new table
app.post(
  "/table",
  authenticate,
  authorize(["ADMIN"]),
  tableVer.verifyAddTable,
  admin.createTable
);
// Update a table
app.patch(
  "/table/:id",
  authenticate,
  authorize(["ADMIN"]),
  tableVer.verifyUpdateTable,
  admin.updateTable
);
// Delete a table
app.delete("/table/:id", authenticate, authorize(["ADMIN"]), admin.deleteTable);

export default app;
