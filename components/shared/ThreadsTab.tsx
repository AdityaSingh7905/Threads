import { redirect } from "next/navigation";
import ThreadCard from "../cards/ThreadCard";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

interface Props {
  currentUserId: string;
  accountId: string;
  accountType: string;
}

const ThreadsTab = async ({ currentUserId, accountId, accountType }: Props) => {
  let result;
  if (accountType === "Community") {
    const res = await fetch(
      `${BACKEND_URL}/community/communityPosts/${accountId}`
    );
    if (!res.ok) {
      throw new Error("Failed to fetch community posts...");
    }

    result = await res.json();

    // console.log("community result: ", result);
  } else {
    const res = await fetch(`${BACKEND_URL}/user/posts/${accountId}`);
    if (!res.ok) {
      throw new Error("Failed to fetch user posts...");
    }

    result = await res.json();
    // console.log("user result: ", result);
  }

  if (!result) redirect("/");

  return (
    <section className="mt-9 flex flex-col gap-10">
      {result.threads.map((thread: any) => (
        <ThreadCard
          key={thread._id}
          id={thread._id}
          currentUserId={currentUserId}
          parentId={thread.parentId}
          content={thread.text}
          author={
            accountType === "User"
              ? { name: result.name, image: result.image, id: result.id }
              : {
                  name: thread.author.name,
                  image: thread.author.image,
                  id: thread.author.id,
                }
          }
          community={
            accountType === "Community"
              ? {
                  name: result.name,
                  id: result.id,
                  image: result.image,
                }
              : thread.community
              ? {
                  id: thread.community.id,
                  name: thread.community.name,
                  image: thread.community.image,
                }
              : null
          }
          createdAt={thread.createdAt}
          comments={thread.children}
        />
      ))}
    </section>
  );
};

export default ThreadsTab;
