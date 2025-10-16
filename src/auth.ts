import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        userId: { label: "User ID", type: "text" },
        managementNumber: { label: "Management Number", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.userId || !credentials?.managementNumber) {
          return null;
        }

        return {
          id: credentials.userId as string,
          name: `User ${credentials.userId}`,
        };
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
});
