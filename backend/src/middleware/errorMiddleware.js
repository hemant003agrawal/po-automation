function notFound(req, res, _next) {
  res.status(404).json({
    message: `Route not found: ${req.originalUrl}`
  });
}

function errorHandler(err, _req, res, _next) {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    message: err.message || "Internal Server Error"
  });
}

module.exports = {
  notFound,
  errorHandler
};
