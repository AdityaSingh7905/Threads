import { fetchPosts } from "@/lib/actions/thread.actions";
import { Fragment } from "react";
import { currentUser } from "@clerk/nextjs/server";
import ThreadCard from "@/components/cards/ThreadCard";
async function Page() {
  const result = await fetchPosts(1, 30);
  console.log(result);
  const user = await currentUser();
  return (
    <Fragment>
      <h1 className="head-text text-left">Home Page</h1>

      <section className="mt-9 flex flex-col gap-10">
        {result.posts.length === 0 ? (
          <p className="no-result">No threads found</p>
        ) : (
          <>
            {result.posts.map((post) => (
              <ThreadCard
                key={post._id}
                id={post._id}
                currentUserId={user?.id || ""}
                parentId={post.parentId}
                content={post.text}
                author={post.author}
                community={post.community}
                createdAt={post.createdAt}
                comments={post.children}
              />
            ))}
          </>
        )}
      </section>
    </Fragment>
  );
}

export default Page;
