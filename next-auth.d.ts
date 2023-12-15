import NextAuth from "next-auth";
import { JWT } from "next-auth/jwt";
import { StConnectStatus } from "./app/model/types";

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    accessToken: string;
    user: User;
  }

  interface User {
    firstName?: string;
    lastName?: string;
    id?: string;
    username?: string;
    photoUrl?: string;
    platformLogin?: string;
  }
}

declare module "next-auth/jwt" {
  /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
  interface JWT {
    user: {
      firstName?: string;
      lastName?: string;
      id?: string;
      username?: string;
    };
    sub?: string;
    token: string;
    exp?: number;
    iat?: number;
    jti?: string;
  }
}
