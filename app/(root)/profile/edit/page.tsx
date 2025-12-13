import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import AccountProfile from "@/components/forms/AccountProfile";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";

async function Page() {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  const res = await fetch(`${BACKEND_URL}/user/details/${user.id}`);
  if (!res.ok) {
    throw new Error("Failed to fetch user details...");
  }

  const userInfo = await res.json();
  if (!userInfo?.onboarded) redirect("/onBoarding");

  const userData = {
    id: user.id,
    objectId: userInfo?._id,
    username: userInfo ? userInfo?.username : user.username,
    name: userInfo ? userInfo?.name : user.firstName ?? "",
    bio: userInfo ? userInfo?.bio : "",
    image: userInfo ? userInfo?.image : user.imageUrl,
  };

  return (
    <>
      <h1 className="head-text">Edit Profile</h1>
      <p className="mt-3 text-base-regular text-light-2">Make any changes</p>

      <section className="mt-12">
        <AccountProfile user={userData} btnTitle="Continue" />
      </section>
    </>
  );
}

export default Page;
