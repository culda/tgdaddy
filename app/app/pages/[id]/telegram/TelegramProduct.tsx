'use client';
import Button from '@/app/components/Button';
import { useSnackbar } from '@/app/components/SnackbarProvider';
import TextField from '@/app/components/TextField';
import {
  StProduct,
  StTelegramLinkCode,
  StTelegramProduct,
} from '@/app/model/types';
import { yupResolver } from '@hookform/resolvers/yup';
import { useSession } from 'next-auth/react';
import { useParams } from 'next/navigation';
import { Fragment, useState } from 'react';
import { useForm } from 'react-hook-form';
import { FaCheckCircle, FaCopy } from 'react-icons/fa';
import * as yup from 'yup';
import PageSection from '../../PageSection';
import { getChangedProps } from '../../getChangedProps';

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

const TelegramProduct = ({
  product,
  isNew = false,
  edit = false,
}: {
  product: StTelegramProduct;
  isNew?: boolean;
  edit?: boolean;
}) => {
  const snack = useSnackbar();
  const session = useSession();
  const [connected, setConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckLoading, setIsCheckLoading] = useState(false);
  const params = useParams<{ id: string }>();
  const { watch, setValue, formState, register, handleSubmit } =
    useForm<TpValues>({
      resolver: yupResolver(schema),
      defaultValues: {
        type: product.type,
        title: product.title,
        description: product.description,
      },
    });

  const type = watch('type');

  const checkTelegram = async () => {
    setIsCheckLoading(true);
    const pageRes = await fetch(
      `${process.env.NEXT_PUBLIC_API_ENDPOINT}/telegramCode?code=${product.activationCode}`,
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
      setConnected(true);
    }

    setIsCheckLoading(false);
  };

  const copyActivationCode = () => {
    if (!product?.activationCode) {
      return;
    }
    navigator.clipboard.writeText(product.activationCode);
    snack({
      key: 'code-copied',
      text: 'Code copied',
      variant: 'success',
    });
  };

  const onSubmit = async ({ title, description }: TpValues) => {
    setIsLoading(true);
    try {
      const changedProps = await getChangedProps(
        {
          title: product.title,
          description: product.description,
        },
        {
          title,
          description,
        }
      );

      let body;
      if (isNew) {
        body = {
          ...product,
          ...changedProps,
        };
      } else {
        body = {
          id: product.id,
          ...changedProps,
        };
      }

      if (Object.keys(changedProps).length === 0) {
        snack({
          key: 'page-create-failure',
          text: 'No changes detected',
          variant: 'error',
        });
        return;
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_ENDPOINT}/products`,
        {
          method: isNew ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.data?.accessToken}`,
          },
          body: JSON.stringify(body),
        }
      );

      if (!res.ok) {
        setIsLoading(false);
        return;
      }

      snack({
        key: 'product-created',
        text: 'Success',
        variant: 'success',
      });
      // we don't use router because we want to force a browser refetch to get the updated page
      // not sure how to use router.push to force a refetch
      window.location.href = `${process.env.NEXT_PUBLIC_HOST}/app/pages/${params.id}`;
    } catch (err) {
      snack({
        key: 'product-creation-failed',
        text: 'Something went wrong',
        variant: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form id="productForm" onSubmit={handleSubmit(onSubmit)}>
      <PageSection title="Type" isFirstSection>
        <div className="mt-4">
          <div className="flex flex-row gap-2">
            <Button
              variant="secondary"
              active={type === 'channel'}
              disabled={!isNew && type !== 'channel'}
              onClick={() => setValue('type', 'channel')}
            >
              Channel
            </Button>
            <Button
              variant="secondary"
              active={type === 'group'}
              disabled={!isNew && type !== 'group'}
              onClick={() => setValue('type', 'group')}
            >
              Group
            </Button>
          </div>
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

      <PageSection title="Description" isLastSection={!isNew}>
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

      {isNew && (
        <PageSection
          title={
            !connected ? (
              'Connect Telegram'
            ) : (
              <h2 className="font-bold title-font text-gray-900 mb-1 text-xl flex flex-row gap-2 items-center">
                Telegram Connected <FaCheckCircle className="text-green-500" />
              </h2>
            )
          }
          isLastSection={isNew}
        >
          <div className="flex flex-col gap-2">
            {!connected && (
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
                  {product?.activationCode}
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
      )}

      {edit && (
        <div className="h-12 flex w-1/2 flex-row gap-2 justify-center mx-auto">
          <Button
            type="submit"
            loading={isLoading}
            form="productForm"
            disabled={isNew && !connected}
          >
            {isNew ? 'Create' : 'Save'}
          </Button>
          {edit && (
            <Button
              type="button"
              href={`/app/pages/${params.id}`}
              variant="text"
              disabled={formState.isSubmitting}
            >
              Cancel
            </Button>
          )}
        </div>
      )}
    </form>
  );
};

export default TelegramProduct;
