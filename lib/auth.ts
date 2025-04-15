import { getServerSession } from "next-auth";
import { nextAuthOptions } from "./next-auth-options";

export async function getSession() {
  return await getServerSession(nextAuthOptions);
}

export async function getCurrentUser() {
  const session = await getSession();
  return session?.user;
}

export async function isAuthenticated() {
  const session = await getSession();
  return !!session;
}
