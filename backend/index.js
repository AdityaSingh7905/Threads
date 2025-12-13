const express = require("express");
const dotenv = require("dotenv");
const path = require("path");
const cors = require("cors");
const morgan = require("morgan");

const userRouter = require("./routers/user.router");
const threadRouter = require("./routers/thread.router");
const communityRouter = require("./routers/community.router");
const { mongoConnect } = require("./db");

const app = express();
dotenv.config();

mongoConnect();

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://threads-sand.vercel.app",
      "https://threads-adityasingh7905s-projects.vercel.app",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.options("*", cors());
app.use(morgan("common")); // logging http requests details
app.use(express.json());

app.use("/user", userRouter);
app.use("/thread", threadRouter);
app.use("/community", communityRouter);

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
