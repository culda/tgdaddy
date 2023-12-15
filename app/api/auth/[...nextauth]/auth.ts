import {
  GetServerSidePropsContext,
  NextApiRequest,
  NextApiResponse,
} from "next";
import { CookiesOptions, NextAuthOptions, getServerSession } from "next-auth";
import { decode, encode } from "next-auth/jwt";
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
  callbackUrl: {
    name: `next-auth.callback-url`,
    options: {},
  },
  csrfToken: {
    name: "next-auth.csrf-token",
    options: {},
  },
};

export const config = {
  cookies,
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      name: "Telegram",
      credentials: {
        id: { label: "User ID", type: "text" },
        platformLogin: { label: "Platform Login", type: "text" },
        username: { label: "Username", type: "text" },
        first_name: { label: "First Name", type: "text" },
        last_name: { label: "Last Name", type: "text" },
        photo_url: { label: "Photo URL", type: "text" },
        auth_date: { label: "Auth Date", type: "text" },
        hash: { label: "Hash", type: "text" },
      },
      authorize: async (credentials) => {
        console.log("got credentials", credentials);
        if (!credentials) return Promise.reject("no credentials");
        const res = await fetch(`${process.env.API_ENDPOINT}/login`, {
          method: "POST",
          body: JSON.stringify({
            id: credentials.id,
            platformLogin: credentials.platformLogin,
            username: credentials.username,
            first_name: credentials.first_name,
            last_name: credentials.last_name,
            photo_url: credentials.photo_url,
            auth_date: credentials.auth_date,
            hash: credentials.hash,
          }),
        });

        const user = await res.json();
        console.log("user", user);

        return {
          id: user.id,
          platformLogin: user.platformLogin,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          photoUrl: user.photoUrl,
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
  jwt: {
    encode: async ({ token, secret }) => {
      const encodedToken = await encode({
        token,
        secret: Buffer.from(secret),
      });
      return encodedToken;
    },
    decode: async ({ token, secret }) => {
      console.log("decoding", token, secret);
      const decodedToken = await decode({
        token,
        secret: Buffer.from(secret),
      });
      console.log("decoded", decodedToken);
      return decodedToken;
    },
  },
} satisfies NextAuthOptions;

export function auth(
  ...args:
    | [GetServerSidePropsContext["req"], GetServerSidePropsContext["res"]]
    | [NextApiRequest, NextApiResponse]
    | []
) {
  return getServerSession(...args, config);
}
