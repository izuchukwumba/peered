const jwt = require("jsonwebtoken");
const prisma = require("../prisma/prisma_client");
require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET;

const authMiddleware = async (req, res, next) => {
  const token = req.cookies.jwt;
  if (!token) {
    return res.status(401).json({
      message: "Token not found",
    });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });
    if (!user) {
      return res
        .status(401)
        .json({ error: "Failed to verify user authentication" });
    }

    req.user = { id: decoded.id };
    next();
  } catch (error) {
    res.status(401).json({ error: "Failed to authenticate token" });
  }
};

module.exports = authMiddleware;
