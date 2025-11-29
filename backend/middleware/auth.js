// middleware/auth.js
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();


// Ensure you have process.env.JWT_SECRET set in your .env
const JWT_SECRET = process.env.JWT_SECRET ;
console.log("JWT_SECRET inside middleware:", JWT_SECRET);


export default function auth(req, res, next) {
  try {
    const header = req.headers.authorization || req.headers.Authorization;
    if (!header || !header.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = header.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Invalid token format" });

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
  console.log("JWT ERROR:", err.message);
  return res.status(401).json({ message: "Invalid or expired token" });
}


    // Attach user info for later middleware/handlers
    req.user = { id: decoded.id, role: decoded.role };

    next();
  } catch (err) {
    console.error("Auth middleware error:", err);
    res.status(500).json({ message: "Auth error" });
  }
}

/**
 * Optional helper if you prefer to protect routes with role-check only:
 *
 * Usage:
 *   import { requireRole } from "../middleware/auth.js";
 *   router.post("/", auth, requireRole("owner"), handler);
 */
export function requireRole(requiredRole) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    if (req.user.role !== requiredRole) {
      return res.status(403).json({ message: "Forbidden — insufficient role" });
    }
    next();
  };
}
