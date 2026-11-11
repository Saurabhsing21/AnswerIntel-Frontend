// @cashfreepayments/cashfree-js ships without types; only what lib/billing/checkout.ts uses.
declare module "@cashfreepayments/cashfree-js" {
  type CheckoutResult = { error?: { message: string } };
  type Cashfree = {
    subscriptionsCheckout(options: { subsSessionId: string; redirectTarget?: "_self" | "_blank" | "_top" | "_modal" }): Promise<CheckoutResult>;
  };
  export function load(options: { mode: "sandbox" | "production" }): Promise<Cashfree | null>;
}
