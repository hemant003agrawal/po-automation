const AppError = require("../utils/appError");

function authMiddleware(req, _res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new AppError("Unauthorized: Missing token", 401));
  }

  const token = authHeader.split(" ")[1];
  if (token !== "dummy-token") {
    return next(new AppError("Unauthorized: Invalid token", 401));
  }

  next();
}

module.exports = authMiddleware;
