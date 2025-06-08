const express = require("express");
const authRouter = express.Router();
const bcrypt = require("bcrypt");
const {validateSignUpData} = require("../utils/validate");
const jwt = require("jsonwebtoken");
const user = require("../models/user");


authRouter.post("/signup", async (req, res) => {
  await validateSignUpData(req);
  try {
    const { firstName, lastName, email, password } = req.body;
    const findExistingUser = await user.findOne({ email: email });
    if (findExistingUser) {
      return res
        .status(400)
        .json({ message: "User with this email already exists." });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new user({
      firstName,
      lastName,
      password: hashedPassword,
      email,
    });
    const savedUser = await newUser.save();
    const { password: _, ...userData } = savedUser.toObject();
    return res
      .status(201)
      .json({ message: "User Created Successfully", data: userData });
  } catch (error) {
    console.log("error", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

authRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const findExistingUser = await user.findOne({ email: email });
    if (!findExistingUser) {
      return res
        .status(400)
        .json({ message: "User with this email does not exist." });
    }
    const isPasswordCorrect = await bcrypt.compare(
      password,
      findExistingUser.password
    );
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid Credentials" });
    } else {
      const token = jwt.sign({ _id: findExistingUser._id }, "Hullur9606@", {
        expiresIn: "1h",
      });

      res.cookie("token", token, {
        httpOnly: true,
        secure: false,
      });
      return res.status(200).json({ message: "User Logged in successfully" });
    }
  } catch (error) {
    console.log("error", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

authRouter.post("/logout", async (req, res) => {
   res.cookie("token",null,{
    expires: new Date(Date.now())
   })
   return res.status(200).json({message: "User Logged out successfully"})
});
module.exports = authRouter;
