const { mongoConnect } = require("./../db");
const User = require("./../models/user.model");
const Thread = require("./../models/thread.model");
const Community = require("./../models/community.model");

async function createCommunity(req, res) {
  try {
    const { id, name, username, image, bio, createdById } = req.body;

    await mongoConnect();

    const user = await User.findOne({ id: createdById });
    if (!user) return res.status(404).json({ error: "User not found" });

    const newCommunity = new Community({
      id,
      name,
      username,
      image,
      bio,
      createdBy: user._id,
    });

    const createdCommunity = await newCommunity.save();

    user.communities.push(createdCommunity._id);
    await user.save();

    return res.json(createdCommunity);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error creating community" });
  }
}

async function fetchCommunityDetails(req, res) {
  try {
    const userId = req.params.id;

    await mongoConnect();

    const community = await Community.findOne({ id: userId }).populate([
      "createdBy",
      {
        path: "members",
        model: User,
        select: "name username image _id id",
      },
    ]);

    if (!community)
      return res.status(404).json({ error: "Community not found" });

    return res.json(community);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error fetching community details" });
  }
}

async function fetchCommunityPosts(req, res) {
  try {
    const userId = req.params.id;

    await mongoConnect();

    const posts = await Community.findById(userId).populate({
      path: "threads",
      model: Thread,
      populate: [
        {
          path: "author",
          model: User,
          select: "name image id",
        },
        {
          path: "children",
          model: Thread,
          populate: {
            path: "author",
            model: User,
            select: "image _id",
          },
        },
      ],
    });

    if (!posts) return res.status(404).json({ error: "Community not found" });

    return res.json(posts);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error fetching community posts" });
  }
}

async function fetchCommunities(req, res) {
  try {
    await mongoConnect();

    const {
      searchString = "",
      pageNumber = 1,
      pageSize = 20,
      sortBy = "desc",
    } = req.query;

    const skipAmount = (pageNumber - 1) * pageSize;
    const regex = new RegExp(searchString, "i");
    const query = {};

    if (searchString.trim() !== "") {
      query.$or = [{ username: regex }, { name: regex }];
    }

    const sortOptions = { createdAt: sortBy };

    const communities = await Community.find(query)
      .sort(sortOptions)
      .skip(skipAmount)
      .limit(Number(pageSize))
      .populate("members");

    const totalCount = await Community.countDocuments(query);
    const isNext = totalCount > skipAmount + communities.length;

    return res.json({ communities, isNext });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error fetching communities" });
  }
}

async function addMemberToCommunity(req, res) {
  try {
    const { communityId, memberId } = req.body;

    await mongoConnect();

    const community = await Community.findOne({ id: communityId });
    // console.log("Community: ", community);
    if (!community)
      return res.status(404).json({ error: "Community not found" });

    // console.log("Community is correct...");

    const user = await User.findOne({ id: memberId });
    if (!user) return res.status(404).json({ error: "User not found" });

    // console.log("User is correct...");

    if (community.members.includes(user._id)) {
      return res
        .status(400)
        .json({ error: "User already a member of the community" });
    }

    community.members.push(user._id);
    await community.save();

    user.communities.push(community._id);
    await user.save();

    return res.json(community);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error adding member" });
  }
}

async function removeUserFromCommunity(req, res) {
  try {
    const { userId, communityId } = req.body;

    await mongoConnect();

    const user = await User.findOne({ id: userId }, { _id: 1 });
    const community = await Community.findOne({ id: communityId }, { _id: 1 });

    if (!user || !community)
      return res.status(404).json({ error: "User or community not found" });

    await Community.updateOne(
      { _id: community._id },
      { $pull: { members: user._id } }
    );

    await User.updateOne(
      { _id: user._id },
      { $pull: { communities: community._id } }
    );

    return res.json({ success: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error removing user" });
  }
}

async function updateCommunityInfo(req, res) {
  try {
    const { communityId, name, username, image } = req.body;

    await mongoConnect();

    const updated = await Community.findOneAndUpdate(
      { id: communityId },
      { name, username, image }
    );

    if (!updated) return res.status(404).json({ error: "Community not found" });

    return res.json(updated);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error updating community" });
  }
}

async function deleteCommunity(req, res) {
  try {
    await mongoConnect();

    const communityId = req.params.id;
    // console.log("Community Id: ", communityId);
    const deleted = await Community.findOneAndDelete({ id: communityId });

    if (!deleted) return res.status(404).json({ error: "Community not found" });

    await Thread.deleteMany({ community: deleted._id });

    const members = await User.find({ communities: deleted._id });

    const updates = members.map((u) => {
      u.communities.pull(deleted._id);
      return u.save();
    });

    await Promise.all(updates);

    return res.json(deleted);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error deleting community" });
  }
}

module.exports = {
  createCommunity,
  fetchCommunities,
  fetchCommunityDetails,
  fetchCommunityPosts,
  addMemberToCommunity,
  removeUserFromCommunity,
  updateCommunityInfo,
  deleteCommunity,
};
