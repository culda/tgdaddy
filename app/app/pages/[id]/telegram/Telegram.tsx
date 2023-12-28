'use client';
import Button from '@/app/components/Button';
import ContentLayout from '@/app/components/ContentLayout';
import { useSnackbar } from '@/app/components/SnackbarProvider';
import TextField from '@/app/components/TextField';
import { StTelegramLinkCode, StTelegramProduct } from '@/app/model/types';
import { yupResolver } from '@hookform/resolvers/yup';
import { useSession } from 'next-auth/react';
import { useParams } from 'next/navigation';
import { Fragment, useState } from 'react';
import { useForm } from 'react-hook-form';
import { FaCheckCircle, FaCopy } from 'react-icons/fa';
import * as yup from 'yup';
import PageSection from '../../PageSection';

type TpValues = {
  type: string;
  title: string;
  description: string;
};

const schema = yup.object().shape({
  type: yup.string().required(),
  title: yup.string().required('Please choose a title'),
  description: yup.string().required('Please choose a description'),
});

const Telegram = ({
  product,
  isNew = false,
  edit = false,
}: {
  product: StTelegramProduct;
  isNew: boolean;
  edit: boolean;
}) => {
  const snack = useSnackbar();
  const session = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckLoading, setIsCheckLoading] = useState(false);
  const params = useParams<{ id: string }>();
  // const [connected, setConnected] = useState(false);
  const [pr, setPr] = useState<StTelegramProduct>(product);
  const { getValues, setValue, formState, register, handleSubmit } =
    useForm<TpValues>({
      resolver: yupResolver(schema),
      defaultValues: {
        type: 'channel',
      },
    });

  const checkTelegram = async () => {
    setIsCheckLoading(true);
    console.log('checking');
    const pageRes = await fetch(
      `${process.env.NEXT_PUBLIC_API_ENDPOINT}/telegramCode?code=${pr.activationCode}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.data?.accessToken}`,
        },
      }
    );

    const { channelId } = (await pageRes.json()) as StTelegramLinkCode;

    if (!!channelId) {
      setPr((prev) => ({ ...prev, channelId, active: true }));
    }

    setIsCheckLoading(false);
  };

  const copyActivationCode = () => {
    if (!pr?.activationCode) {
      return;
    }
    navigator.clipboard.writeText(pr.activationCode);
    snack({
      key: 'code-copied',
      text: 'Code copied',
      variant: 'success',
    });
  };

  const onSubmit = async (values: TpValues) => {
    setIsLoading(true);
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/pages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.data?.accessToken}`,
      },
      body: JSON.stringify({
        id: params.id,
        products: [pr],
      }),
    });

    if (!res.ok) {
      console.log(res);
      setIsLoading(false);
      return;
    }

    snack({
      key: 'product-created',
      text: 'Product created',
      variant: 'success',
    });

    setIsLoading(false);
  };

  return (
    <ContentLayout title="Add Telegram">
      <form onSubmit={handleSubmit(onSubmit)}>
        <PageSection title="Type" isFirstSection>
          <div className="mt-4">
            <Button
              active={pr.type === 'channel'}
              onClick={() => setValue('type', 'channel')}
            >
              Channel
            </Button>
            <Button
              active={pr.type === 'group'}
              onClick={() => setValue('type', 'group')}
            >
              Group
            </Button>
          </div>
        </PageSection>
        <PageSection title="Title" isFirstSection>
          <p>Pick a catchy title for your Telegram offering.</p>
          <div className="mt-4">
            <TextField
              registerProps={register('title')}
              errorMessage={formState.errors.title?.message}
              editMode
            />
          </div>
        </PageSection>

        <PageSection title="Description">
          <p>
            Describe what people can expect from joining your channel. Be as
            detailed as possible.
          </p>
          <div className="mt-4">
            <TextField
              registerProps={register('description')}
              errorMessage={formState.errors.description?.message}
              editMode
              textarea
            />
          </div>
        </PageSection>

        <PageSection
          title={
            !pr?.active ? (
              'Activation'
            ) : (
              <h2 className="font-bold title-font text-gray-900 mb-1 text-xl flex flex-row gap-2 items-center">
                Activated <FaCheckCircle className="text-green-500" />
              </h2>
            )
          }
          isLastSection
        >
          <div className="flex flex-col gap-2">
            {!pr?.active && (
              <Fragment>
                {' '}
                <p>
                  Make{' '}
                  <a href="https://t.me/tgdadybot" target="_blank">
                    <b>{process.env.NEXT_PUBLIC_BOT_USERNAME}</b>
                  </a>{' '}
                  an admin to your channel (default permissions are fine).
                </p>
                <p> Copy and paste the code below in your channel </p>
                <div className="relative text-black text-center text-sm rounded-md justify-center items-center border border-zinc-300 bg-neutral-50 grow py-2.5 border-solid px-1 md:px-5">
                  {pr?.activationCode}
                  <div className="absolute right-4 inset-y-0 flex items-center">
                    <button type="button" onClick={copyActivationCode}>
                      <FaCopy className="text-lg" />
                    </button>
                  </div>
                </div>
                <Button loading={isCheckLoading} onClick={checkTelegram}>
                  Check
                </Button>
              </Fragment>
            )}
          </div>
        </PageSection>
        {edit && (
          <div className="h-12 flex w-1/2 flex-row gap-2 justify-center mx-auto">
            <Button type="submit" loading={isLoading}>
              {isNew ? 'Create' : 'Save'}
            </Button>
            {edit && (
              <Button
                href={`/app/pages/${params.id}`}
                variant="text"
                type="button"
                loading={isLoading}
              >
                Cancel
              </Button>
            )}
          </div>
        )}
      </form>
    </ContentLayout>
  );
};

export default Telegram;
