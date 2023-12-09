import { StPlan, StUser } from "@/app/model/types";
import { NextRequest, NextResponse } from "next/server";
import { client } from "../stripe";

export type TpPlanRequest = {
  user: StUser;
  plan: StPlan;
};

export type TpPlanResponse = {
  url: string;
};

export async function POST(req: NextRequest) {
  try {
    const { user, plan } = (await req.json()) as TpPlanRequest;

    const customerId = user.stripeCustomerId;
    const products = await client.products.list();
    const product = products.data[0];
    const prices = await client.prices.list({
      product: product.id,
    });
    const price = prices.data.find((p) => p.nickname === plan);

    if (!customerId) {
      if (!price) {
        return NextResponse.error();
      }
      const paymentLink = await client.paymentLinks.create({
        line_items: [
          {
            price: price.id,
            quantity: 1,
          },
        ],
        metadata: {
          userId: user.id,
          plan,
        },
        after_completion: {
          type: "redirect",
          redirect: {
            url: `${process.env.NEXT_PUBLIC_HOST}/app/plan`,
          },
        },
      });

      return NextResponse.json({ url: paymentLink.url });
    }

    const subscriptions = await client.subscriptions.list({
      customer: customerId,
      status: "active",
    });
    const currentSubscription = subscriptions.data[0];

    if (plan === StPlan.Starter) {
      if (currentSubscription) {
        await client.subscriptions.update(currentSubscription.id, {
          pause_collection: {
            behavior: "void",
          },
          metadata: {
            userId: user.id,
          },
        });
      }
      return NextResponse.json({
        success: true,
        message: "Subscription updated successfully",
      });
    }

    if (!price) {
      return NextResponse.error();
    }

    /**
     * A subscription plan was selected and there is an existing subscription
     */
    if (currentSubscription) {
      console.log("update current", currentSubscription);
      if (currentSubscription.pause_collection?.behavior === "void") {
        console.log("resuming first");
        await client.subscriptions.update(currentSubscription.id, {
          pause_collection: null,
        });
      }
      const update = await client.subscriptions.update(currentSubscription.id, {
        items: [
          {
            id: currentSubscription.items.data[0].id,
            price: price.id,
          },
        ],
        metadata: {
          userId: user.id,
        },
      });

      console.log(update);

      return NextResponse.json({
        success: true,
        message: "Subscription updated successfully",
      });
    }

    /**
     * A subscription plan was selected by an existing customer with NO active subscriptions
     */
    const session = await client.checkout.sessions.create({
      payment_method_types: ["card"],
      customer: customerId,
      line_items: [{ price: price.id, quantity: 1 }],
      mode: "subscription",
      success_url: `${process.env.NEXT_PUBLIC_HOST}/app/plan`,
      cancel_url: `${process.env.NEXT_PUBLIC_HOST}/app/plan`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.log(err);
    return NextResponse.error();
  }
}
