'use client';
import AddImage from '@/app/components/AddImage';
import Button from '@/app/components/Button';
import PriceInputs from '@/app/components/PriceInputs';
import { useSnackbar } from '@/app/components/SnackbarProvider';
import { truncatedText } from '@/utils';
import { yupResolver } from '@hookform/resolvers/yup';
import { nanoid } from 'nanoid';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import TextField from '../../components/TextField';
import {
  StPage,
  StPagePrice,
  StPriceFrequency,
  StProduct,
  StTelegramProduct,
} from '../../model/types';
import PageSection from './PageSection';
import { getChangedProps } from './getChangedProps';

type PpPage = {
  page: StPage;
  products: StProduct[];
  isNew?: boolean;
  edit?: boolean;
};

type TpImage = {
  fileBase64: string;
  fileType: string;
};

export type TpPageValues = {
  username: string;
  title: string;
  prices: StPagePrice[];
};

const schema = yup.object().shape({
  username: yup
    .string()
    .lowercase()
    .required('Username is required')
    .matches(
      /^[A-Za-z0-9\-\_]+$/,
      'Username can only contain letters, numbers, and the following characters: - _'
    ),
  title: yup.string().required('Title is required'),
  prices: yup
    .array()
    .of(
      yup.object().shape({
        id: yup.string().required(),
        usd: yup
          .number()
          .required()
          .typeError('Please enter a valid number')
          .moreThan(0)
          .test(
            'maxDecimals',
            'Price can have a maximum of 2 decimal places',
            (value) => {
              if (value) {
                const decimalCount =
                  value.toString().split('.')[1]?.length || 0;
                return decimalCount <= 2;
              }
              return true;
            }
          ),
        frequency: yup.string().required('Frequency is required'),
      })
    )
    .required()
    .test('uniqueFrequencies', 'Frequencies must be unique', (values) => {
      const frequencies = values?.map((item) => item.frequency);
      const uniqueFrequencies = [...new Set(frequencies)]; // Remove duplicates
      return uniqueFrequencies.length === frequencies?.length;
    }),
});

const getDefaultPrices = (
  prices: StPagePrice[],
  edit: boolean
): StPagePrice[] => {
  if (prices.length > 0) {
    return prices.map((p) => ({
      ...p,
      usd: p.usd / 100,
    }));
  }
  if (!edit) return [];
  return [
    {
      id: nanoid(10),
      usd: 0,
      frequency: StPriceFrequency.Month,
    },
  ];
};

const PageScene = ({ page, products, isNew = false, edit = false }: PpPage) => {
  const snack = useSnackbar();
  const session = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [image, setImage] = useState<TpImage | null>(null);
  const { getValues, watch, setValue, formState, register, handleSubmit } =
    useForm<TpPageValues>({
      resolver: yupResolver(schema) as any,
      defaultValues: {
        username: page?.username,
        title: page?.title,
        prices: getDefaultPrices(page.prices, edit),
      },
    });

  const prices = watch('prices');

  const onSubmit = async ({ title, username, prices }: TpPageValues) => {
    setIsLoading(true);

    try {
      const usdPrices = prices.map((p) => ({
        ...p,
        usd: p.usd * 100,
      }));

      const changedProps = await getChangedProps(
        {
          username: page.username,
          title: page.title,
          prices: page.prices,
        },
        {
          username,
          title,
          prices: usdPrices,
        }
      );

      if (!image && Object.keys(changedProps).length === 0) {
        snack({
          key: 'page-create-failure',
          text: 'No changes detected',
          variant: 'error',
        });
        return;
      }

      let body;
      if (isNew) {
        body = {
          ...page,
          ...changedProps,
        };
      } else {
        body = {
          id: page.id,
          ...changedProps,
        };
      }

      if (image) {
        Object.assign(body, {
          fileBase64: image?.fileBase64,
          fileType: image?.fileType,
        });
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/pages`, {
        method: isNew ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.data?.accessToken}`,
        },
        body: JSON.stringify(body),
      });

      if (res.status === 200) {
        snack({
          key: 'page-success',
          text: 'Success',
          variant: 'success',
        });
        // we don't use router because we want to force a browser refetch to get the updated page
        // not sure how to use router.push to force a refetch
        window.location.href = `${process.env.NEXT_PUBLIC_HOST}/app/pages/${page.id}`;
      } else if (res.status === 409) {
        snack({
          key: 'page-create-failure',
          text: 'Username already exists',
          variant: 'error',
        });
      } else {
        snack({
          key: 'page-create-failure',
          text: 'Something went wrong',
          variant: 'error',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="text-gray-600 body-font">
      <form
        id="pageForm"
        onSubmit={handleSubmit(onSubmit)}
        className="container pt-5 mx-auto flex flex-wrap"
      >
        <PageSection title="Username" isFirstSection>
          <p>This is the public URL of your page.</p>
          <div className="mt-4">
            <TextField
              registerProps={register('username')}
              errorMessage={formState.errors.username?.message}
              inputProps={{
                size: 1,
              }}
              editMode={edit}
              defaultValue={page?.username}
              pretext="members.page/"
              onCopy={() => {
                navigator.clipboard.writeText(
                  `https://members.page/${getValues('username')}`
                );
                snack({
                  key: 'code-copied',
                  text: 'URL copied',
                  variant: 'success',
                });
              }}
            />
          </div>
        </PageSection>
        <PageSection title="Title">
          <p>Sell your page with a catchy title</p>
          <div className="mt-4">
            <TextField
              errorMessage={formState.errors.title?.message}
              registerProps={register('title')}
              editMode={edit}
              defaultValue={page?.title}
            />
          </div>
        </PageSection>
        {!edit && (
          <PageSection title="Telegram">
            <p>Subscribers instantly gain access to these products.</p>
            <div className="mt-4">
              <div className="flex flex-col gap-2">
                {(
                  products.filter(
                    (pr) => pr.productType === 'telegramAccess'
                  ) as StTelegramProduct[]
                ).map((pr) => (
                  <Button
                    variant="text"
                    href={`/app/pages/${page.id}/telegram/${pr.id}/edit`}
                  >
                    <div className="flex flex-row gap-2 justify-center items-center">
                      <p className="font-bold">{truncatedText(pr.title, 5)}</p>
                      <span className="bg-orange-200 rounded-md px-2 py-1 text-sm">
                        {pr.type}
                      </span>
                    </div>
                  </Button>
                ))}
                <Button href={`/app/pages/${page.id}/telegram/add`}>
                  Add Telegram
                </Button>
              </div>
            </div>
          </PageSection>
        )}

        <PageSection title="Pricing">
          <p>
            You can update prices anytime. Current memberships are not affected
          </p>
          <PriceInputs
            edit={edit}
            register={register}
            setValue={setValue}
            prices={prices}
            errorMessage={formState.errors.prices}
          />
        </PageSection>

        <PageSection title="Photo" isLastSection>
          <p>Add a photo to showcase your page.</p>
          <div className="mt-4">
            <AddImage
              currentImagePath={page?.imagePath}
              onSave={setImage}
              editMode={edit}
            />
          </div>
        </PageSection>

        {edit && (
          <div className="h-12 flex w-1/2 flex-row gap-2 justify-center mx-auto">
            <Button type="submit" loading={isLoading} form="pageForm">
              {isNew ? 'Create' : 'Save'}
            </Button>
            {edit && (
              <Button
                href={`/app/pages/${page.id}`}
                variant="text"
                type="button"
                disabled={formState.isSubmitting}
              >
                Cancel
              </Button>
            )}
          </div>
        )}
      </form>
    </div>
  );
};

export default PageScene;
