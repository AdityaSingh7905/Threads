const { mongoConnect } = require("./../db");
const User = require("./../models/user.model");
const Thread = require("./../models/thread.model");
const Community = require("./../models/community.model");

async function updateUser(req, res) {
  try {
    await mongoConnect();

    const { userId, username, name, bio, image } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const updatedUser = await User.findOneAndUpdate(
      { id: userId },
      {
        username: username?.toLowerCase(),
        name,
        bio,
        image,
        onboarded: true,
      },
      {
        new: true, // return updated document but if false thn rturn old document
        upsert: true,
      }
    );

    return res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Error updating user:", error);
    return res.status(500).json({
      error: "Internal server error while updating user",
    });
  }
}

async function fetchUser(req, res) {
  try {
    await mongoConnect();

    const userId = req.params.id;
    // console.log("UserId: ", userId);

    const fetchedUser = await User.findOne({ id: userId });
    if (!fetchedUser) {
      return res.status(400).json({
        error: "Failed to fetch user",
      });
    }
    // console.log("Fetched User: ", fetchedUser);
    return res.status(200).json(fetchedUser);
  } catch (error) {
    console.log(`Failed to fetch user: ${error.message}`);
    return res.status(500).json({
      error: "Internal server error while fetching user",
    });
  }
}

async function fetchUsers(req, res) {
  try {
    await mongoConnect();

    // Extracting parameters with defaults
    const userId = req.query.userId;
    const searchString = req.query.searchString || "";
    const pageNumber = parseInt(req.query.pageNumber) || 1;
    const pageSize = parseInt(req.query.pageSize) || 20;
    const sortBy = req.query.sort === "asc" ? 1 : -1;

    // Pagination
    const skipAmount = (pageNumber - 1) * pageSize;

    // regular expression from searchString
    // to perform case-insensitive pattern matching
    const regex = new RegExp(searchString, "i");

    // Query setup
    const query = {
      id: { $ne: userId },
    };

    if (searchString.trim() !== "") {
      query.$or = [
        { username: { $regex: regex } },
        { name: { $regex: regex } },
      ];
    }

    const sortOptions = { createdAt: sortBy };

    // Query execution
    const usersQuery = User.find(query)
      .sort(sortOptions)
      .skip(skipAmount)
      .limit(pageSize);

    const totalUsersCount = await User.countDocuments(query);
    const users = await usersQuery.exec();

    const isNext = totalUsersCount > skipAmount + users.length;

    return res.status(200).json({ users, isNext });
  } catch (err) {
    console.log(`Failed to fetch users: ${err.message}`);
    return res.status(500).json({
      error: "Internal server error while fetching user",
    });
  }
}

async function getUserActivity(req, res) {
  try {
    await mongoConnect();

    const userId = req.params.id;

    // we will find all the threads created by the user
    const userThreads = await Thread.find({ author: userId });

    // Collect all the child thread ids (replies) from the children field
    const childThreadIds = userThreads.reduce((acc, userThread) => {
      return acc.concat(userThread.children);
    }, []);

    const replies = await Thread.find({
      _id: { $in: childThreadIds },
      author: { $ne: userId }, // author not logged in
    }).populate({
      path: "author",
      model: User,
      select: "name image _id",
    });

    return res.status(200).json(replies);
  } catch (err) {
    console.log(`Failed to fetch activity: ${err.message}`);
    return res.status(500).json({
      error: "Internal server error while geting user activity",
    });
  }
}

async function fetchUserPosts(req, res) {
  try {
    // Find all the threads authored by the user with the given userId
    const userId = req.params.id;

    const threads = await User.findOne({ id: userId }).populate({
      path: "threads",
      model: Thread,
      populate: [
        {
          path: "community",
          model: Community,
          select: "name image id",
        },
        {
          path: "children",
          model: Thread,
          populate: {
            path: "author",
            model: User,
            select: "name image id",
          },
        },
      ],
    });
    // console.log("Threads populated data: ", JSON.stringify(threads, null, 2));
    return res.status(200).json(threads);
  } catch (error) {
    console.log(`Error fetching user posts: ${error.message}`);
    return res.status(500).json({
      error: "Internal server error while fetching user's post'",
    });
  }
}

module.exports = {
  updateUser,
  fetchUser,
  fetchUsers,
  getUserActivity,
  fetchUserPosts,
};
