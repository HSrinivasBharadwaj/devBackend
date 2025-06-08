const express = require("express");
const app = express();
const cookieParser = require('cookie-parser');
const authRouter = require('./routes/auth');
const profileRouter = require('./routes/profile');
const connectionRequestRouter = require('./routes/connectionRequest');
const connectToDataBase = require("./config/database");
const port = 7777;


app.use(express.json());
app.use(cookieParser())

app.use("/",authRouter);
app.use("/",profileRouter);
app.use("/",connectionRequestRouter)

connectToDataBase()
  .then(() => {
    app.listen(port, () => {
      console.log("Successfully connected to db and listening on port", port);
    });
  })
  .catch((error) => {
    console.log("error", error);
  });
