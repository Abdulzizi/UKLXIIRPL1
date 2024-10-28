import express from "express";
import * as user from "../controller/userController.js";
import * as adminVer from "../middlewares/verifyUser.js";
import { authenticate, authorize } from "../middlewares/auth.js";

const app = express();

app.use(express.json());

// Public routes
app.post("/register", adminVer.verifyAddUser, user.register);
app.post("/login", adminVer.verifyLoginUser, user.login);

// Protected routes (hanya bisa diakses jika sudah login dan rolenya sesuai)

// semua role bisa lihat semua user
app.get(
  "/",
  authenticate,
  authorize(["ADMIN", "MANAGER"]),
  user.showAllUsers
);
// semua role bisa lihat individual user
app.get(
  "/:id",
  authenticate,
  authorize(["ADMIN", "MANAGER"]),
  user.getUserById
);
// hanya admin yang mendelete user
app.delete("/:id", authenticate, authorize(["ADMIN"]), user.deleteUser);
// ADMIN dan MANAGER yang update users
app.patch(
  "/:id",
  authenticate,
  authorize(["ADMIN"]),
  adminVer.verifyUpdateUser,
  user.updateUser
);

export default app;
