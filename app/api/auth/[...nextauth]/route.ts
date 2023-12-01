import {
  GetServerSidePropsContext,
  NextApiRequest,
  NextApiResponse,
} from "next";
import NextAuth, { NextAuthOptions, getServerSession } from "next-auth";
import { encode } from "next-auth/jwt";
import Credentials from "next-auth/providers/credentials";

export const config = {
  providers: [
    Credentials({
      name: "Telegram",
      credentials: {
        id: { label: "User ID", type: "text" },
        username: { label: "Username", type: "text" },
        firstName: { label: "First Name", type: "text" },
        lastName: { label: "Last Name", type: "text" },
      },
      authorize: async (credentials) => {
        if (!credentials) return Promise.reject("no credentials");
        return {
          id: credentials.id,
          username: credentials.username,
          firstName: credentials.firstName,
          lastName: credentials.lastName,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    session: async ({ session, token }) => {
      session.accessToken = await encode({
        token,
        secret: Buffer.from(process.env.NEXTAUTH_SECRET as string),
      });

      // Attach user details from the JWT token to the session
      if (token.user) {
        session.user = token.user;
      }

      return session;
    },
    jwt: async ({ user, token }) => {
      if (user) {
        token.user = user; // Attach user details to the JWT token
      }
      return token;
    },
  },
} satisfies NextAuthOptions;

const handler = NextAuth(config);

export function auth(
  ...args:
    | [GetServerSidePropsContext["req"], GetServerSidePropsContext["res"]]
    | [NextApiRequest, NextApiResponse]
    | []
) {
  return getServerSession(...args, config);
}

export { handler as GET, handler as POST };
