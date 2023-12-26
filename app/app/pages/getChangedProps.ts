import { StPage } from "@/app/model/types";

export async function getChangedProps(
  currPage: StPage,
  newPage: Partial<StPage>
): Promise<Partial<StPage>> {
  const changedProperties: Partial<StPage> = {};

  for (const key in newPage) {
    if (
      newPage.hasOwnProperty(key) &&
      (newPage as any)[key] !== (currPage as any)[key]
    ) {
      (changedProperties as any)[key] = (newPage as any)[key];
    }
  }

  return changedProperties;
}
