import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import Searchbar from "../../../components/shared/SearchBar";
import Pagination from "../../../components/shared/Pagination";
import CommunityCard from "../../../components/cards/CommunityCard";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

async function Page({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  const res = await fetch(`${BACKEND_URL}/user/details/${user.id}`);
  if (!res.ok) {
    throw new Error("Failed to fetch user details...");
  }

  const userInfo = await res.json();
  if (!userInfo?.onboarded) redirect("/onBoarding");

  const searchString = searchParams.q || "";
  const pageNumber = searchParams?.page ? +searchParams.page : 1;
  const pageSize = 25;

  const result = await fetch(
    `${BACKEND_URL}/community/community?searchString=${searchString}&pageNumber=${pageNumber}&pageSize=${pageSize}`
  );
  if (!result.ok) {
    throw new Error("Failed to fetch communities...");
  }

  const communities = await result.json();

  return (
    <>
      <h1 className="head-text">Communities</h1>
      <div className="mt-5">
        <Searchbar routeType="communities" />
      </div>
      <section className="mt-9 flex flex-wrap gap-4">
        {communities.communities.length === 0 ? (
          <p className="no-result mx-auto">No Result</p>
        ) : (
          <>
            {communities.communities.map((community: any) => (
              <CommunityCard
                key={community.id}
                id={community.id}
                name={community.name}
                username={community.username}
                imgUrl={community.image}
                bio={community.bio}
                members={community.members}
              />
            ))}
          </>
        )}
      </section>
      <Pagination
        path="communities"
        pageNumber={searchParams?.page ? +searchParams.page : 1}
        isNext={communities.isNext}
      />
    </>
  );
}

export default Page;
