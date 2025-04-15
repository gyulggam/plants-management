import { getServerSession } from "next-auth";
import { nextAuthOptions } from "./next-auth-options";

export async function getSession() {
  try {
    return await getServerSession(nextAuthOptions);
  } catch (error) {
    console.error("Error in getSession:", error);
    return null;
  }
}

export async function getCurrentUser() {
  try {
    const session = await getSession();
    return session?.user;
  } catch (error) {
    console.error("Error in getCurrentUser:", error);
    return null;
  }
}

export async function isAuthenticated() {
  try {
    const session = await getSession();
    return !!session;
  } catch (error) {
    console.error("Error in isAuthenticated:", error);
    return false;
  }
}
