const express = require("express");
const {
  updateUser,
  fetchUser,
  fetchUsers,
  getUserActivity,
  fetchUserPosts,
} = require("./../controllers/user.controller");

const userRouter = express.Router();

userRouter.get("/activity/:id", getUserActivity);
userRouter.get("/posts/:id", fetchUserPosts);
userRouter.get("/users", fetchUsers);
userRouter.get("/details/:id", fetchUser);

userRouter.put("/update", updateUser);

module.exports = userRouter;
