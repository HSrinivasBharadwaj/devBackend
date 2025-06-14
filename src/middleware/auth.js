const user = require("../models/user");
const jwt = require("jsonwebtoken");

const validateAuth = async (req, res, next) => {
  try {
    const cookies = req.cookies;
    const { token } = cookies;
    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const isTokenValid = jwt.verify(token, process.env.JWT_SECRET);
    const { _id } = isTokenValid;
    const loggedInUser = await user.findById({ _id: _id });
    if (!loggedInUser) {
      throw new Error("User not found");
    }
    req.user = loggedInUser
    next();
  } catch (error) {
    console.log("error", error);
    return res.status(500).send("Failed to authenticate the user");
  }
};

module.exports = validateAuth;
