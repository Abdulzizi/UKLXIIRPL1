import express from "express";
import * as admin from "../controller/adminMenuController.js";
import { authenticate, authorize } from "../middlewares/auth.js";
import { verifyAddMenu, verifyUpdateMenu } from "../middlewares/verifyMenu.js";

const app = express();

app.use(express.json());

// Get all menu
app.get("/menu", authenticate, authorize(["ADMIN"]), admin.getAllMenuItems);

// Get a menu
app.get("/menu/:id", authenticate, authorize(["ADMIN"]), admin.getMenuById);

// Post new menu
app.post(
  "/menu",
  authenticate,
  authorize(["ADMIN"]),
  verifyAddMenu,
  admin.createMenuItem
);

// Update a menu
app.patch(
  "/menu/:id",
  authenticate,
  authorize(["ADMIN"]),
  verifyUpdateMenu,
  admin.updateMenuItem
);

// Delete a menu
app.delete(
  "/menu/:id",
  authenticate,
  authorize(["ADMIN"]),
  admin.deleteMenuItem
);

export default app;
