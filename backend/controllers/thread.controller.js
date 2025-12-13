const { mongoConnect } = require("./../db");
const User = require("./../models/user.model");
const Thread = require("./../models/thread.model");
const Community = require("./../models/community.model");

async function createThread(req, res) {
  try {
    await mongoConnect();

    const { text, author, communityId } = req.body;
    const communityIdObject = await Community.findOne(
      {
        id: communityId,
      },
      {
        _id: 1,
      }
    );

    const createdThread = await Thread.create({
      text,
      author,
      community: communityIdObject,
    });

    // Update user model
    await User.findByIdAndUpdate(author, {
      $push: { threads: createdThread._id },
    });

    if (communityIdObject) {
      // Update Community model
      await Community.findByIdAndUpdate(communityIdObject, {
        $push: { threads: createdThread._id },
      });
    }

    return res.status(200).json(createdThread);
  } catch (error) {
    console.log(`Thread Creation failed: ${error.message}`);
    return res.status(500).json({
      error: "Internal Server Error...",
    });
  }
}

async function fetchThreads(req, res) {
  try {
    await mongoConnect();

    const pageNumber = req.query.pageNumber || 1;
    const pageSize = req.query.pageSize || 20;

    //Calculate number of pages to skip(Pagination)
    const skipAmount = (pageNumber - 1) * pageSize;

    //Fetch the posts that have no parents(top-level threads...)
    const postQuery = Thread.find({ parentId: { $in: [null, undefined] } })
      .sort({ createdAt: "desc" })
      .skip(skipAmount)
      .limit(pageSize)
      .populate({ path: "author", model: User })
      .populate({
        path: "community",
        model: Community,
      })
      .populate({
        path: "children",
        populate: {
          path: "author",
          model: User,
          select: "_id name parentId image",
        },
      });

    const totalPostCounts = await Thread.countDocuments({
      parentId: { $in: [null, undefined] },
    });
    const posts = await postQuery.exec();

    const isNext = totalPostCounts > skipAmount + posts.length;
    return res.status(200).json({ posts, isNext });
  } catch (err) {
    console.log(`Failed fetching threads: ${err.message}`);
    return res.status(500).json({
      error: "Internal Server Error...",
    });
  }
}

async function fetchThreadById(req, res) {
  try {
    await mongoConnect();

    const id = req.params.id;

    const thread = await Thread.findById(id)
      .populate({
        path: "author",
        model: User,
        select: "_id id name parentId image",
      })
      .populate({
        path: "community",
        model: Community,
        select: "_id id name image",
      })
      .populate({
        path: "children",
        populate: [
          {
            path: "author",
            model: User,
            select: "_id id name parentId image",
          },
          {
            path: "children",
            model: Thread,
            populate: {
              path: "author",
              model: User,
              select: "_id id name parentId image",
            },
          },
        ],
      })
      .exec();
    return res.status(200).json(thread);
  } catch (error) {
    console.log(`Error fetching thread: ${error.message}`);
    return res.status(500).json({
      error: "Internal Server Error...",
    });
  }
}

async function fetchAllChildThreads(req, res) {
  try {
    await mongoConnect();

    const threadId = req.query.threadId;

    const childThreads = await Thread.find({ parentId: threadId });
    const descendantThreads = [];

    for (const childThread of childThreads) {
      const descendants = await fetchAllChildThreads(childThread._id);
      descendantThreads.push(childThread, ...descendants);
    }

    return res.status(200).json(descendantThreads);
  } catch (err) {
    console.log(`Failed fetching child threads: ${err.message}`);
    return res.status(500).json({
      error: "Internal Server Error...",
    });
  }
}

async function addCommentToThread(req, res) {
  try {
    await mongoConnect();

    const { threadId, commentText, userId } = req.body;

    // Validate
    if (!threadId || !commentText || !userId) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const originalThread = await Thread.findById(threadId);
    if (!originalThread) {
      return res.status(404).json({ error: "Thread not found" });
    }

    // Create comment thread
    const commentThread = await Thread.create({
      text: commentText,
      author: userId,
      parentId: threadId,
    });

    // Push comment ID to parent
    originalThread.children.push(commentThread._id);
    await originalThread.save();

    return res.status(201).json(commentThread);
  } catch (error) {
    console.log(`Error adding comment to thread: ${error.message}`);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

async function getDescendantThreads(threadId) {
  await mongoConnect();

  const childThreads = await Thread.find({ parentId: threadId });
  const descendantThreads = [];

  for (const childThread of childThreads) {
    const descendants = await getDescendantThreads(childThread._id);
    descendantThreads.push(childThread, ...descendants);
  }

  return descendantThreads;
}

async function deleteThread(req, res) {
  try {
    await mongoConnect();

    const id = req.params.id;
    // console.log("Thread id: ", id);

    // console.log("Thread is getting deleted...");
    // Find the thread to be deleted
    const mainThread = await Thread.findById(id).populate("author community");
    if (!mainThread) {
      // console.log("Thread not found");
      return res.status(404).json({
        error: "Thread not found!!",
      });
    }

    // console.log("Main thread...");
    // Fetch all child threads and their descendants recursively
    const descendantThreads = await getDescendantThreads(id);
    // console.log("Descendant Threads...");

    // Get all descendants thread IDs including the main thread ID and child thread IDs
    const descendantThreadIds = [
      id,
      ...descendantThreads.map((thread) => thread._id),
    ];

    // Extract the authorIds and communityIds to update User and Community models respectively
    const uniqueAuthorIds = new Set(
      [
        ...descendantThreads.map((thread) => thread.author?._id?.toString()), // Use optional chaining to handle possible undefined values
        mainThread.author?._id?.toString(),
      ].filter((id) => id !== undefined)
    );

    const uniqueCommunityIds = new Set(
      [
        ...descendantThreads.map((thread) => thread.community?._id?.toString()), // Use optional chaining to handle possible undefined values
        mainThread.community?._id?.toString(),
      ].filter((id) => id !== undefined)
    );

    // Recursively delete child threads and their descendants
    await Thread.deleteMany({ _id: { $in: descendantThreadIds } });

    // Update User model
    await User.updateMany(
      { _id: { $in: Array.from(uniqueAuthorIds) } },
      { $pull: { threads: { $in: descendantThreadIds } } }
    );

    // Update Community model
    await Community.updateMany(
      { _id: { $in: Array.from(uniqueCommunityIds) } },
      { $pull: { threads: { $in: descendantThreadIds } } }
    );

    return res.status(200).json({
      message: "Thread deleted successfully...",
    });
  } catch (err) {
    console.log(`Failed to delete threads: ${err.message}`);
    return res.status(500).json({
      error: "Internal Server Error...",
    });
  }
}

module.exports = {
  createThread,
  fetchThreads,
  fetchThreadById,
  fetchAllChildThreads,
  addCommentToThread,
  deleteThread,
};
