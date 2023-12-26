import ContentLayout from "@/app/components/ContentLayout";
import { StPage, StPriceFrequency } from "@/app/model/types";
import { nanoid } from "nanoid";
import PageScene from "../PageScene";

type PpParams = {
  searchParams: { username?: string };
};

export default async function Page({ searchParams }: PpParams) {
  const page: StPage = {
    id: nanoid(10),
    username: searchParams.username?.toLowerCase() ?? "",
    telegramLinkCode: `LINK-${nanoid(4)}`,
    userId: "",
    products: [],
    pricing: [{
      id: nanoid(10),
      usd: 0,
      frequency: StPriceFrequency.Monthly
    }],
  };

  return (
    <ContentLayout title="Add Page">
      <PageScene edit isNew page={page} />
    </ContentLayout>
  );
}
