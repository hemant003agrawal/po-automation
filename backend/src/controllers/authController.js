const AppError = require("../utils/appError");

async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    // Check credentials - updated to new admin credentials
    if (email !== "Admin123@gmail.com" || password !== "Admin@123") {
      throw new AppError("Invalid email or password", 401);
    }

    res.json({
      token: "dummy-token"
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  login
};
