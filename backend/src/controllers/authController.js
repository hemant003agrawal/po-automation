const AppError = require("../utils/appError");

async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (email !== "test123@gmail.com" || password !== "123456") {
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
