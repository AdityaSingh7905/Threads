"use server";

import { revalidatePath } from "next/cache";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";

export async function deleteThread(id: string, path: string) {
  const res = await fetch(`${BACKEND_URL}/thread/delete/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) {
    throw new Error("Failed to delete thread...");
  }

  revalidatePath(path);

  return await res.json();
}
