"use server";

import PostThread from "@/components/forms/PostThread";
import { fetchUser } from "@/lib/actions/user.actions";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

async function Page() {
  const user = await currentUser();
  if (!user) redirect("/sign-in");
  const userInfo = await fetchUser(user.id);
//   console.log(userInfo);
  if (!userInfo.onboarded) redirect("/onBoarding");
  return (
    <>
      <h1 className="head-text">Create Threads</h1>;
      <PostThread userId={userInfo._id} />
    </>
  );
}

export default Page;
