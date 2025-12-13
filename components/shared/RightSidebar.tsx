import { currentUser } from "@clerk/nextjs/server";

import UserCard from "../cards/UserCard";
import { redirect } from "next/navigation";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";

async function RightSidebar() {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  const userId = user.id;
  const pageSize = 4;

  const res = await fetch(
    `${BACKEND_URL}/user/users?userId=${userId}&pageSize=${pageSize}`
  );
  if (!res.ok) {
    throw new Error("Failed to fetch suggested users...");
  }

  const similarMinds = await res.json();

  const data = await fetch(
    `${BACKEND_URL}/community/community?pageSize=${pageSize}`
  );
  if (!data.ok) {
    throw new Error("Failed to fetch suggested communities...");
  }

  const suggestedCommunities = await data.json();

  return (
    <section className="custom-scrollbar rightsidebar">
      <div className="flex flex-1 flex-col justify-start">
        <h3 className="text-heading4-medium text-light-1">
          Suggested Communities
        </h3>

        <div className="mt-7 flex w-[350px] flex-col gap-9">
          {suggestedCommunities.communities.length > 0 ? (
            <>
              {suggestedCommunities.communities.map((community: any) => (
                <UserCard
                  key={community.id}
                  id={community.id}
                  name={community.name}
                  username={community.username}
                  imgUrl={community.image}
                  personType="Community"
                />
              ))}
            </>
          ) : (
            <p className="!text-base-regular text-light-3">
              No communities yet
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col justify-start">
        <h3 className="text-heading4-medium text-light-1">Similar Minds</h3>
        <div className="mt-7 flex w-[350px] flex-col gap-10">
          {similarMinds.users.length > 0 ? (
            <>
              {similarMinds.users.map((person: any) => (
                <UserCard
                  key={person.id}
                  id={person.id}
                  name={person.name}
                  username={person.username}
                  imgUrl={person.image}
                  personType="User"
                />
              ))}
            </>
          ) : (
            <p className="!text-base-regular text-light-3">No users yet</p>
          )}
        </div>
      </div>
    </section>
  );
}

export default RightSidebar;
