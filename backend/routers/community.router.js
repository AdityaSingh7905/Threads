const express = require("express");
const {
  createCommunity,
  fetchCommunityDetails,
  fetchCommunityPosts,
  fetchCommunities,
  addMemberToCommunity,
  removeUserFromCommunity,
  updateCommunityInfo,
  deleteCommunity,
} = require("../controllers/community.controller");

const communityRouter = express.Router();

communityRouter.post("/create", createCommunity);
communityRouter.post("/member", addMemberToCommunity);

communityRouter.get("/details/:id", fetchCommunityDetails);
communityRouter.get("/communityPosts/:id", fetchCommunityPosts);
communityRouter.get("/community", fetchCommunities);

communityRouter.put("/update", updateCommunityInfo);

communityRouter.delete("/delete/:id", deleteCommunity);
communityRouter.delete("/remove", removeUserFromCommunity);

module.exports = communityRouter;
