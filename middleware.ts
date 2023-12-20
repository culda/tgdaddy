import { withAuth } from "next-auth/middleware";
// export { default } from "next-auth/middleware"

export const config = { matcher: ["/app/:path*", "/app"] };
export default withAuth({
  callbacks: {
    authorized: async ({ token, req }) => {
      const t = req.cookies.get("next-auth.session-token")?.value;
      const isAuthorized = !!t;
      // TODO: check if token is valid
      return isAuthorized;
    },
  },
});
