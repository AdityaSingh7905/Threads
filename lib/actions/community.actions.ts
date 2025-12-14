"use server";
import { revalidatePath } from "next/cache";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

export async function createCommunity(
  id: string,
  name: string,
  username: string,
  image: string,
  bio: string,
  createdById: string // Change the parameter name to reflect it's an id
) {
  const res = await fetch(`${BACKEND_URL}/community/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id,
      name,
      username,
      image,
      bio,
      createdById,
    }),
  });
  if (!res.ok) {
    throw new Error("Failed to create community...");
  }

  revalidatePath("/");
  return await res.json();
}

export async function addMemberToCommunity(
  communityId: string,
  memberId: string
) {
  // console.log("community Id: ", communityId);
  // console.log("member Id: ", memberId);
  const res = await fetch(`${BACKEND_URL}/community/member`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      communityId,
      memberId,
    }),
  });

  if (!res.ok) {
    throw new Error("Failed to add member to community...");
  }

  revalidatePath("/");
  return await res.json();
}

export async function removeUserFromCommunity(
  userId: string,
  communityId: string
) {
  const res = await fetch(`${BACKEND_URL}/community/remove`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      userId,
      communityId,
    }),
  });

  if (!res.ok) {
    throw new Error("Failed to remove member from community...");
  }

  revalidatePath("/");
  return await res.json();
}

export async function updateCommunityInfo(
  communityId: string,
  name: string,
  username: string,
  image: string
) {
  const res = await fetch(`${BACKEND_URL}/community/update`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      communityId,
      name,
      username,
      image,
    }),
  });

  if (!res.ok) {
    throw new Error("Failed to update the community...");
  }

  revalidatePath("/");
  return await res.json();
}

export async function deleteCommunity(communityId: string) {
  // console.log("Community Id : ", communityId);
  const res = await fetch(`${BACKEND_URL}/community/delete/${communityId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    throw new Error("Failed to delete the community...");
  }

  revalidatePath("/");
  return res.json();
}
