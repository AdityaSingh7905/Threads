"use server";

import { revalidatePath } from "next/cache";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";

export async function updateUser(values: any, path: string) {
  const res = await fetch(`${BACKEND_URL}/user/update`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(values),
  });

  if (!res.ok) throw new Error("Update failed");

  revalidatePath(path);

  return await res.json();
}
