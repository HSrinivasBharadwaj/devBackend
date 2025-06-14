require('dotenv').config()
const express = require("express");
const app = express();
const cors = require('cors')
const cookieParser = require('cookie-parser');
const authRouter = require('./routes/auth');
const profileRouter = require('./routes/profile');
const connectionRequestRouter = require('./routes/connectionRequest');
const userRouter = require('./routes/user');
const connectToDataBase = require("./config/database");
const port = process.env.PORT;


app.use(cors({
  origin: "http://localhost:5173",
  credentials:true
}))
app.use(express.json());
app.use(cookieParser())

app.use("/",authRouter);
app.use("/",profileRouter);
app.use("/",connectionRequestRouter);
app.use("/",userRouter);

connectToDataBase()
  .then(() => {
    app.listen(port, () => {
      console.log("Successfully connected to db and listening on port", port);
    });
  })
  .catch((error) => {
    console.log("error", error);
  });
