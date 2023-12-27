import ContentLayout from "@/app/components/ContentLayout";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import PageSection from "../../PageSection";

type TpValues = {
    type: string;
    title: string;
    description: string;
}

const schema = yup.object().shape({
    type: yup.string().required(),
    title: yup.string().required("Please choose a title"),
    description: yup.string().required("Please choose a description")
})

export default function Page() {
    const { getValues, formState, register, handleSubmit } = useForm<TpValues>({
        resolver: yupResolver(schema),
        defaultValues: {
          type: 'telegramAccess',
        },
      });

    return (
        <ContentLayout title="Add Product">
            
            <PageSection title="Type">
            <select
            className="border border-zinc-300 text-black text-sm px-4 py-2.5 rounded-md shadow-sm  disabled:bg-neutral-100 appearance-none"
          >
            <option value='telegramAccess'>Telegram Access</option>
          </select>
            </PageSection>

            <PageSection title="Title">
            <select
            className="border border-zinc-300 text-black text-sm px-4 py-2.5 rounded-md shadow-sm  disabled:bg-neutral-100 appearance-none"
          >
            <option value='telegramAccess'>Telegram Access</option>
          </select>
            </PageSection>
        </ContentLayout>
    )
}