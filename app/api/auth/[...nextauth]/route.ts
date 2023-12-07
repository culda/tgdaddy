import {
  GetServerSidePropsContext,
  NextApiRequest,
  NextApiResponse,
} from "next";
import NextAuth, {
  CookiesOptions,
  NextAuthOptions,
  getServerSession,
} from "next-auth";
import { encode } from "next-auth/jwt";
import Credentials from "next-auth/providers/credentials";

const cookies: Partial<CookiesOptions> = {
  sessionToken: {
    name: `next-auth.session-token`,
    options: {
      httpOnly: true,
      sameSite: "none",
      path: "/",
      domain: process.env.NEXT_PUBLIC_DOMAIN,
      secure: true,
    },
  },
};

export const config = {
  cookies,
  providers: [
    Credentials({
      name: "Telegram",
      credentials: {
        id: { label: "User ID", type: "text" },
        username: { label: "Username", type: "text" },
        first_name: { label: "First Name", type: "text" },
        last_name: { label: "Last Name", type: "text" },
        photo_url: { label: "Photo URL", type: "text" },
        auth_date: { label: "Auth Date", type: "text" },
        hash: { label: "Hash", type: "text" },
      },
      authorize: async (credentials) => {
        console.log("got creds", credentials);

        if (!credentials) return Promise.reject("no credentials");
        const res = await fetch(`${process.env.API_ENDPOINT}/login`, {
          method: "POST",
          body: JSON.stringify({
            id: credentials.id,
            username: credentials.username,
            first_name: credentials.first_name,
            last_name: credentials.last_name,
            photo_url: credentials.photo_url,
            auth_date: credentials.auth_date,
            hash: credentials.hash,
          }),
        });

        const user = (await res.json()).data;
        console.log(user);

        return {
          id: user.id,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
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
