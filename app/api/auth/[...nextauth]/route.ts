import NextAuth from "next-auth/next";
import { nextAuthOptions } from "@/lib/next-auth-options";

// NextAuth 핸들러 생성
const handler = NextAuth(nextAuthOptions);

// GET 및 POST 핸들러 export
export { handler as GET, handler as POST };
