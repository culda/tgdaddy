import { useSession } from "next-auth/react";
import Button from "./Button";
import { usePathname } from "next/navigation";

export default function AppButton() {
  const { data } = useSession();
  const pathname = usePathname();
  const isPlatformUser = data?.user?.platformLogin;

  return (
    <div className="flex">
      {isPlatformUser && !pathname.includes("/app") && (
        <Button href="/app">App</Button>
      )}
    </div>
  );
}
