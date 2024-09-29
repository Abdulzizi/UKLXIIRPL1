import express from "express";
import userRoutes from "./routes/userRoutes.js";
import adminRoutes from "./routes/adminMenuRoutes.js";

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// USER ROUTES
app.use("/api/user", userRoutes);
app.use("/api/admin", adminRoutes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
