import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";

import UserCard from "../../../components/cards/UserCard";
import Searchbar from "../../../components/shared/SearchBar";
import Pagination from "../../../components/shared/Pagination";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";

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

  const userId = user.id;
  const searchString = searchParams.q || "";
  const pageNumber = searchParams?.page ? +searchParams.page : 1;
  const pageSize = 25;

  const result = await fetch(
    `${BACKEND_URL}/user/users?userId=${userId}&searchString=${searchString}&pageNumber=${pageNumber}&pageSize=${pageSize}`
  );
  if (!result.ok) {
    throw new Error("Failed to fetch users...");
  }

  const users = await result.json();
  // console.log("Users : ", users);

  return (
    <section>
      <h1 className="head-text mb-10">Search</h1>

      <Searchbar routeType="search" />

      <div className="mt-14 flex flex-col gap-9">
        {users.users.length === 0 ? (
          <p className="no-result">No Result</p>
        ) : (
          <>
            {users.users.map((person: any) => (
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
        )}
      </div>

      <Pagination
        path="search"
        pageNumber={searchParams?.page ? +searchParams.page : 1}
        isNext={users.isNext}
      />
    </section>
  );
}

export default Page;
