const express = require("express");
const {
  createThread,
  fetchThreads,
  fetchThreadById,
  fetchAllChildThreads,
  deleteThread,
  addCommentToThread,
} = require("../controllers/thread.controller");

const threadRouter = express.Router();

threadRouter.post("/create", createThread);
threadRouter.post("/comment", addCommentToThread);

threadRouter.get("/threads/:id", fetchThreadById);
threadRouter.get("/threads/child", fetchAllChildThreads);
threadRouter.get("/threads", fetchThreads);

threadRouter.delete("/delete/:id", deleteThread);

module.exports = threadRouter;
