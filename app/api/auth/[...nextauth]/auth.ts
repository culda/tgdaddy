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
      id: "email",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        platformLogin: { label: "Platform Login", type: "text" },
        resetCode: { label: "Reset Code", type: "text" },
      },
      authorize: async (credentials) => {
        if (!credentials) return Promise.reject("no credentials");
        console.log("got credentials", credentials);
        const res = await fetch(`${process.env.API_ENDPOINT}/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: credentials.email,
            password: credentials.password,
            resetCode: credentials.resetCode,
            platformLogin: credentials.platformLogin === "true" ? true : false,
          }),
        });

        const user = await res.json();

        // Check if the response is successful and has a user
        if (res.ok && user) {
          return user;
        }

        // Return null if user data could not be retrieved
        throw new Error(user.message);
      },
    }),
    Credentials({
      id: "telegram",
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
        const res = await fetch(`${process.env.API_ENDPOINT}/loginTelegram`, {
          method: "POST",
          body: JSON.stringify({
            id: credentials.id,
            platformLogin: credentials.platformLogin === "true" ? true : false,
            username: credentials.username,
            first_name: credentials.first_name,
            last_name: credentials.last_name,
            photo_url: credentials.photo_url,
            auth_date: credentials.auth_date,
            hash: credentials.hash,
          }),
        });

        const user = await res.json();

        // Check if the response is successful and has a user
        if (res.ok && user) {
          return user;
        }

        // Return null if user data could not be retrieved
        throw new Error(user.message);
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
      const decodedToken = await decode({
        token,
        secret: Buffer.from(secret),
      });
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
