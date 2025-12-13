"use server";
import PostThread from "@/components/forms/PostThread";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { BackgroundTaskOut } from "svix";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";

async function Page() {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  const res = await fetch(`${BACKEND_URL}/user/details/${user.id}`);
  if (!res.ok) {
    throw new Error("Error fetching user Details!!");
  }

  const userInfo = await res.json();
  if (!userInfo?.onboarded) redirect("/onBoarding");

  return (
    <>
      <h1 className="head-text">Create Threads</h1>;
      <PostThread userId={userInfo._id} />
    </>
  );
}

export default Page;
