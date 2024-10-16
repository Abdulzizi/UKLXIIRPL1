import express from "express";
import userRoutes from "./routes/userRoutes.js";
import adminMenuRoutes from "./routes/adminMenuRoutes.js";
import adminTableRoutes from "./routes/adminTableRoutes.js";
import transactionRoutes from "./routes/transactionRoutes.js";
import manajerRoutes from "./routes/manajerRoutes.js";

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// USER ROUTES
app.use("/api/user", userRoutes);
app.use("/api/admin", adminMenuRoutes);
app.use("/api/admin", adminTableRoutes);
app.use("/api/kasir", transactionRoutes);
app.use("/api/manajer", manajerRoutes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
