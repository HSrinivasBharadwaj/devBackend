const express = require("express");
const validateAuth = require("../middleware/auth");
const connectionRequest = require("../models/connectionRequest");
const userRouter = express.Router();

//Get all the pending / interested connection requests of the loggedinuser
userRouter.get("/user/requests/received", validateAuth, async (req, res) => {
  try {
    const loggedinuser = req.user;
    const getPendingConnectionRequests = await connectionRequest.find({
      toUserId: loggedinuser._id,
      status: "interested",
    }).populate("fromUserId",["firstName","lastName","photoUrl"]);
    return res
      .status(200)
      .json({
        message: "Requests fetched successfully",
        data: getPendingConnectionRequests,
      });
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = userRouter;
