import express from "express";
import * as user from "../controller/userController.js";
import * as adminVer from "../middlewares/verifyUser.js";
import { authenticate } from "../middlewares/auth.js";

const app = express();

app.use(express.json());

// Public routes
app.post("/register", adminVer.verifyAddUser, user.register);
app.post("/login", adminVer.verifyLoginUser, user.login);

// Protected routes
app.get("/", authenticate, user.showAllUsers);
app.delete("/delete", authenticate, user.deleteUser);

export default app;
