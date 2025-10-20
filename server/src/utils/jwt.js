import jwt from "jsonwebtoken";

const { JWT_SECRET, JWT_EXPIRES_IN } = process.env;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined. Please set it in the environment variables.");
}

export const signToken = (payload, options = {}) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN || "1d", ...options });
};

export const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};
