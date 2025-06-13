const express = require("express");
const validateAuth = require("../middleware/auth");
const connectionRequest = require("../models/connectionRequest");
const user = require("../models/user");
const userRouter = express.Router();

//Get all the pending / interested connection requests of the loggedinuser
userRouter.get("/user/requests/received", validateAuth, async (req, res) => {
  try {
    const loggedinuser = req.user;
    const getPendingConnectionRequests = await connectionRequest
      .find({
        toUserId: loggedinuser._id,
        status: "interested",
      })
      .populate("fromUserId", ["firstName", "lastName", "photoUrl"]);
    return res.status(200).json({
      message: "Requests fetched successfully",
      data: getPendingConnectionRequests,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

//Get all the connections received - like who is connected to me
//validateAuth
//find connection request toUserId: loggedInUser._id and fromtoUserId,status: "accepted"
userRouter.get("/user/connections", validateAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const getConnection = await connectionRequest
      .find({
        $or: [
          { fromUserId: loggedInUser._id, status: "accepted" },
          { toUserId: loggedInUser._id, status: "accepted" },
        ],
      })
      .populate("fromUserId", ["firstName", "lastName", "photoUrl"])
      .populate("toUserId", ["firstName", "lastName", "photoUrl"]);
    const data = getConnection.map((data) => {
      if (data.fromUserId._id.toString() === loggedInUser._id.toString()) {
        return data.toUserId;
      }
      return data.fromUserId;
    });
    return res
      .status(200)
      .json({ message: "Fetched all connections", data: data });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
});

//user/feed api

userRouter.get("/user/feed", validateAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.page) || 10;
    limit = limit > 50 ? 50 : limit;
    const skip = (page-1)*limit;
    //Find all the connection request send + received
    const findConnections = await connectionRequest
      .find({
        $or: [{ fromUserId: loggedInUser._id }, { toUserId: loggedInUser._id }],
      })
      .select("fromUserId toUserId");
    const hideConnections = new Set();
    findConnections.forEach((req) => {
      hideConnections.add(req.fromUserId.toString());
      hideConnections.add(req.toUserId.toString());
    });
    const users = await user.find({
      $and: [
        { _id: { $nin: Array.from(hideConnections) } },
        { _id: { $ne: loggedInUser._id } },
      ],
    }).skip(skip).limit(limit);
    return res.status(200).json({ data: users });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = userRouter;
