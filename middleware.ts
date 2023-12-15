import { withAuth } from "next-auth/middleware";

export const config = { matcher: ["/app", "/app/plan", "/app/connect"] };
export default withAuth({
  callbacks: {
    authorized: async ({ token, req }) => {
      const t = req.cookies.get("next-auth.session-token")?.value;
      // TODO: check if token is valid
      console.log(t);
      console.log("token", token);
      return !!t;
    },
  },
});
