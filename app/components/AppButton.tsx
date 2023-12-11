import { useSession } from "next-auth/react";
import Button from "./Button";

export default function AppButton() {
  const { data } = useSession();
  const isPlatformUser = data?.user?.platformLogin;

  return (
    <div className="flex">
      {isPlatformUser && <Button href="/app">App</Button>}
    </div>
  );
}
