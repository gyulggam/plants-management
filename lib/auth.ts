import { getServerSession } from "next-auth";
import { nextAuthOptions } from "./next-auth-options";

/**
 * 서버 컴포넌트에서 세션 정보를 가져옵니다.
 * 이 함수는 서버 컴포넌트에서만 사용해야 합니다.
 */
export async function getSession() {
  try {
    return await getServerSession(nextAuthOptions);
  } catch (error) {
    console.error("Error in getSession:", error);
    return null;
  }
}

/**
 * 현재 인증된 사용자 정보를 가져옵니다.
 * 이 함수는 서버 컴포넌트에서만 사용해야 합니다.
 */
export async function getCurrentUser() {
  try {
    const session = await getSession();
    return session?.user;
  } catch (error) {
    console.error("Error in getCurrentUser:", error);
    return null;
  }
}

/**
 * 사용자가 인증되었는지 확인합니다.
 * 이 함수는 서버 컴포넌트에서만 사용해야 합니다.
 */
export async function isAuthenticated() {
  try {
    const session = await getSession();
    return !!session;
  } catch (error) {
    console.error("Error in isAuthenticated:", error);
    return false;
  }
}
