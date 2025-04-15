import { NextAuthOptions, Session } from "next-auth";
import NextAuth from "next-auth/next";
import GoogleProvider from "next-auth/providers/google";
import { JWT } from "next-auth/jwt";

// 사용자 타입 정의
interface ExtendedUser {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  accessToken?: string;
}

// JWT 타입 확장
interface ExtendedToken extends JWT {
  accessToken?: string;
}

// 타입 확장 (전역에 영향을 주지 않는 로컬 타입만 사용)
const options: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    async session({
      session,
      token,
    }: {
      session: Session;
      token: ExtendedToken;
    }) {
      if (session.user) {
        (session.user as ExtendedUser).accessToken = token.accessToken;
      }
      return session;
    },
  },
};

const handler = NextAuth(options);

export { handler as GET, handler as POST };
