import { Fragment } from "react";
import { currentUser } from "@clerk/nextjs/server";
import ThreadCard from "@/components/cards/ThreadCard";
import { redirect, useRouter } from "next/navigation";
import Pagination from "@/components/shared/Pagination";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";

async function Page({ searchParams }: any) {
  const user = await currentUser();

  // console.log("After currentUser");
  if (!user) {
    redirect("/sign-in");
  }
  // console.log("After currentUser");
  const res = await fetch(`${BACKEND_URL}/user/details/${user.id}`);
  if (!res.ok) {
    throw new Error("Error fetching user Details!!");
  }

  const userInfo = await res.json();
  if (!userInfo?.onboarded) redirect("/onBoarding");

  const pageNumber = searchParams?.page ? Number(searchParams.page) : 1;
  const pageSize = 20;

  const result = await fetch(
    `${BACKEND_URL}/thread/threads?pageNumber=${pageNumber}&pageSize=${pageSize}`
  );

  if (!result.ok) {
    throw new Error("Error fetching threads...");
  }

  const threads = await result.json();
  // console.log(threads);

  return (
    <Fragment>
      <h1 className="head-text text-left">Home Page</h1>

      <section className="mt-9 flex flex-col gap-10">
        {threads.posts.length === 0 ? (
          <p className="no-result">No threads found</p>
        ) : (
          <>
            {threads.posts.map((post: any) => (
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

      <Pagination
        path="/"
        pageNumber={searchParams?.page ? +searchParams.page : 1}
        isNext={threads.isNext}
      />
    </Fragment>
  );
}

export default Page;
