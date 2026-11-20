export type CheckoutOrderPayload = {
  storeSlug: string;
  customer: {
    name: string;
    phone: string;
    governorate: string;
    address: string;
  };
  items: Array<{ productId: string | number; quantity: number }>;
};

export type CheckoutOrderResult = {
  orderNumber: string;
  demo: boolean;
  shippingRequiresApproval: boolean;
  shippingFee?: number;
};

const demoOrder: CheckoutOrderResult = {
  orderNumber: "#CF-2048",
  demo: true,
  shippingRequiresApproval: false,
};

function wait(milliseconds: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, milliseconds));
}

function isNetworkFailure(error: unknown): boolean {
  return error instanceof TypeError
    || (error instanceof DOMException && error.name === "AbortError");
}

export async function submitCheckoutOrder(
  payload: CheckoutOrderPayload,
  previewMode: boolean,
): Promise<CheckoutOrderResult> {
  if (previewMode) {
    await wait(600);
    return demoOrder;
  }

  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 5000);

  try {
    const response = await fetch("/api/checkout/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Checkout request failed (${response.status}).`);
    }

    const result: unknown = await response.json();
    if (
      typeof result !== "object"
      || result === null
      || !("orderNumber" in result)
      || typeof result.orderNumber !== "string"
    ) {
      throw new Error("Checkout response returned an invalid order number.");
    }

    return {
      orderNumber: result.orderNumber,
      demo: false,
      shippingRequiresApproval: "shippingRequiresApproval" in result
        && result.shippingRequiresApproval === true,
      shippingFee: "shippingFee" in result && typeof result.shippingFee === "string"
        ? Number(result.shippingFee)
        : undefined,
    };
  } catch (error) {
    if (!isNetworkFailure(error)) throw error;

    await wait(600);
    return demoOrder;
  } finally {
    window.clearTimeout(timeout);
  }
}
