import { currentUser } from "@clerk/nextjs/server";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

const Page = async () => {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  const res = await fetch(`${BACKEND_URL}/user/details/${user.id}`);
  if (!res.ok) {
    throw new Error("Failed to fetch user details...");
  }

  const userInfo = await res.json();
  if (!userInfo?.onboarded) redirect("/onBoarding");

  const act = await fetch(`${BACKEND_URL}/user/activity/${userInfo._id}`);
  if (!act.ok) {
    throw new Error("Failed to fetch activity details...");
  }

  const activity = await act.json();
  return (
    <section>
      <h1 className="head-text mb-10">Activity</h1>

      <section>
        {activity.length > 0 ? (
          <>
            {activity.map((activity: any) => (
              <Link key={activity._id} href={`/thread/${activity.parentId}`}>
                <article className="activity-card mb-2">
                  <Image
                    src={activity.author.image}
                    alt="profile picture"
                    width={20}
                    height={20}
                    className="aspect-square rounded-full object-cover"
                  />
                  <p className="!text-small-regular text-gray-1">
                    <span className="mr-1 text-primary-500">
                      {activity.author.name}
                    </span>{" "}
                    replied to your thread
                  </p>
                </article>
              </Link>
            ))}
          </>
        ) : (
          <p className="!text-base-regular text-light-3">No activity yet.</p>
        )}
      </section>
    </section>
  );
};

export default Page;
