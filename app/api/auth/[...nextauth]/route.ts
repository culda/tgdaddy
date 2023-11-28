import NextAuth, { Session } from "next-auth";
import Credentials from "next-auth/providers/credentials";

const handler = NextAuth({
  // Configure one or more authentication providers
  providers: [
    Credentials({
      name: "Telegram",
      credentials: {
        // Define the credentials you expect to receive from your Telegram sign-in process
        hash: { label: "Hash", type: "text" },
        userData: { label: "User data", type: "text" },
      },
      authorize: async (credentials) => {
        console.log("auth", credentials);
        if (!credentials) return null;
        return { id: credentials.hash, user: credentials.userData };
      },
    }),
  ],
  callbacks: {
    session: async ({ session, token }) => {
      session.user = token.usr;
      return session;
    },
    jwt: async ({ user, token }) => {
      if (user) {
        token.usr = user.user;
      }
      return token;
    },
  },
  // Add any other NextAuth configuration here
});

export { handler as GET, handler as POST };
