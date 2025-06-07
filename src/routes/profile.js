const express = require("express");
const validateAuth = require("../middleware/auth");
const validator = require("validator");
const { validateEditProfileData } = require("../utils/validate");
const bcrypt = require("bcrypt");
const profileRouter = express.Router();

profileRouter.get("/profile/view", validateAuth, async (req, res, next) => {
  try {
    const loggedInUser = req.user;
    return res.status(200).json({ user: loggedInUser });
  } catch (error) {
    console.log("error", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

profileRouter.patch("/profile/edit", validateAuth, async (req, res, next) => {
  try {
    if (!(await validateEditProfileData(req.body))) {
      return res.status(400).json({ message: "Edit was not allowed" });
    }
    const loggedInUser = req.user;
    Object.keys(req.body).forEach(
      (field) => (loggedInUser[field] = req.body[field])
    );
    await loggedInUser.save();
    return res
      .status(201)
      .json({ message: "User Updated Successfully", data: loggedInUser });
  } catch (error) {
    console.log("error", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

profileRouter.patch(
  "/profile/forgotPassword",
  validateAuth,
  async (req, res) => {
    try {
      const { password } = req.body;
      const loggedInUser = req.user;
      const updatedPassword = password;
      if (!updatedPassword || !validator.isStrongPassword(updatedPassword)) {
        return res.status(400).json({
          message:
            "Password must be at least 8 characters long and contain at least one lowercase letter, one uppercase letter, one number, and one special symbol",
        });
      }
      const hashedPassword = await bcrypt.hash(updatedPassword, 10);
      loggedInUser.password = hashedPassword;
      await loggedInUser.save();
      return res.status(200).json({ message: "Password Updated Successfully" });
    } catch (error) {
      console.log("error", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }
);

module.exports = profileRouter;
