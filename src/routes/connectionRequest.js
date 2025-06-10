const express = require("express");
const validateAuth = require("../middleware/auth");
const connRequest = require("../models/connectionRequest");
const user = require("../models/user");
const connectionRequestRouter = express.Router();

connectionRequestRouter.post(
  "/request/send/:status/:toUserId",
  validateAuth,
  async (req, res) => {
    try {
      const loggedInUser = req.user;
      const status = req.params.status;
      const toUserId = req.params.toUserId;
      const fromUserId = loggedInUser._id;
      const ALLOWED_STATUS = ["interested", "ignored"];
      if (!ALLOWED_STATUS.includes(status)) {
        return res.status(400).json({ message: "Invalid status type" });
      }
      //Dont send connection request to itself
      if (fromUserId.equals(toUserId)) {
        return res
          .status(400)
          .json({ message: "Cant sent connection request to itself" });
      }
      const findExistingConnectionRequest = await connRequest.findOne({
        $or: [
          { fromUserId, toUserId },
          { fromUserId: toUserId, toUserId: fromUserId },
        ],
      });
      if (findExistingConnectionRequest) {
        return res
          .status(409)
          .json({ message: "Connection request already exists" });
      }
      //Need to check if toUserId already exists in db
      const findUser = await user.findById(toUserId);
      if (!findUser) {
        return res.status(400).json({ message: "User not found" });
      }

      const connectionRequest = new connRequest({
        fromUserId,
        toUserId,
        status,
      });
      const data = await connectionRequest.save();
      return res
        .status(201)
        .json({ message: "Request send successfully", data: data });
    } catch (error) {
      console.log("error", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }
);

//Review Requests API
//validate the status
//Bharadwaj - Akshay 
//toUserId - accept it because its receivers end
//LoggedInUser - should be akshay = toUserId
//Two status - accepted,rejected - only after interested
//requestId should be in database and valid
connectionRequestRouter.post(
  "/request/review/:status/:requestId",
  validateAuth,
  async (req, res) => {
    try {
      const loggedInUser = req.user;
      const status = req.params.status;
      const requestId = req.params.requestId
      const ALLOWED_STATUS = ["accepted", "rejected"];
      if (!ALLOWED_STATUS.includes(status)) {
        return res.status(400).json({ message: "Invalid status sent" });
      }
      const reviewConnectionRequest = await connRequest.findOne({
        _id: requestId,
        toUserId: loggedInUser._id,
        status: "interested"
      })
      if (!reviewConnectionRequest) {
        return res.status(400).json({message: "Connection request was not found"})
      }
      reviewConnectionRequest.status = status
      const data = await reviewConnectionRequest.save();
      return res.status(201).json({message: "Connection request accepted successfully",data:data})
    } catch (error) {
      console.log("error", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }
);

module.exports = connectionRequestRouter;
