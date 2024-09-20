import jsonwebtoken from "jsonwebtoken";
import db from "../db.js";

export const authenticate = async (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    const decoded = jsonwebtoken.verify(token, process.env.JWT_TOKEN);

    // Fetch user details including role from the database
    const user = await db.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, role: true },
    });

    if (!user) {
      return res.status(401).json({ error: "Invalid token" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error(`[AUTHENTICATE] ${error.message}`);
    res.status(401).json({ error: "Unauthorized" });
  }
};
