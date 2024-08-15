import { UserButton } from "@clerk/nextjs";
import { Fragment } from "react";

function Page() {
  return (
    <Fragment>
      <h1 className="head-text text-left">Home Page</h1>
      <UserButton />
    </Fragment>
  );
}

export default Page;
