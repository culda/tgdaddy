import { withAuth } from "next-auth/middleware";

export const config = { matcher: ["/app/:path*", "/app"] };
export default withAuth({
  callbacks: {
    authorized: async ({ token, req }) => {
      const t = req.cookies.get("next-auth.session-token")?.value;
      // TODO: check if token is valid
      return !!t;
    },
  },
});
