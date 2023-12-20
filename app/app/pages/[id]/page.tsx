import ContentLayout from "@/app/components/ContentLayout";
import { StPage } from "../../../model/types";
import { auth } from "@/app/api/auth/[...nextauth]/auth";
import PageScene from "../PageScene";
import { notFound } from "next/navigation";
import Button from "@/app/components/Button";

type PpPage = {
  params: { id: string };
};

export default async function Page({ params }: PpPage) {
  const session = await auth();

  const fetchPage = async () => {
    const res = await fetch(
      `${process.env.API_ENDPOINT}/pages?id=${params.id}`,
      {
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
          ContentType: "application/json",
        },
        cache: "no-cache",
      }
    );
    return (await res.json()) as StPage;
  };

  const page = await fetchPage();

  if (!page) {
    return notFound();
  }

  return (
    <ContentLayout title={page?.username}>
      <div className="flex flex-row gap-2 mb-4">
        <Button href={`/app/pages/${page.id}/edit`} variant="secondary">
          Edit Details
        </Button>
        {/* <Button href={`/app/pages/${channel.id}/edit`} variant="secondary">
          Edit Details
        </Button> */}
      </div>

      <PageScene page={page} />
    </ContentLayout>
  );
}
