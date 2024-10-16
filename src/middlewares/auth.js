import jsonwebtoken from "jsonwebtoken";
import db from "../db.js";

export const authenticate = async (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    const decoded = jsonwebtoken.verify(token, process.env.JWT_TOKEN);

    // fetch db untuk ambil detail user
    const user = await db.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, name: true, role: true },
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

// Middleware untuk check role
export const authorize = (allowedRoles) => {
  return (req, res, next) => {
    const { role } = req.user;
    // console.log(role);

    if (!allowedRoles.includes(role)) {
      return res.status(403).json({
        message: "Access Denied: Insufficient privileges",
        requiredRoles: allowedRoles,
        userRole: role,
      });
    }

    next();
  };
};
