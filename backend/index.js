const express = require("express");
const dotenv = require("dotenv");
const path = require("path");
const cors = require("cors");
const morgan = require("morgan");

const userRouter = require("./routers/user.router");
const threadRouter = require("./routers/thread.router");
const communityRouter = require("./routers/community.router");

const app = express();
dotenv.config();

app.use(
  cors({
    origin: "http://localhost:3000",
  })
);
app.use(morgan("common")); // logging http requests details
app.use(express.json());

app.use("/user", userRouter);
app.use("/thread", threadRouter);
app.use("/community", communityRouter);

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
