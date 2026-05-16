/**
 * Honest checkout submission helper.
 *
 * The previous Checkout.tsx simulated a successful payment with a 2-second
 * setTimeout and flipped to "Order Complete!" regardless of whether anything
 * was sent — meaning every visitor who clicked "Complete Order" had their
 * payment data discarded, and felt like they had ordered. That's a worse
 * failure mode than not having a button at all.
 *
 * This helper does two real things:
 * - If VITE_CHECKOUT_ENDPOINT is configured, POST the order payload to it and
 *   surface real success / error states.
 * - Otherwise, open the visitor's mail client with a prefilled draft to
 *   orders@lineajewelry.com so the order intent is captured honestly. We
 *   deliberately exclude card details from the mailto body — only contact,
 *   shipping, and line items are included, so the user knows what's being
 *   sent.
 */
import { SITE_ORDERS_EMAIL } from "./site";

const CHECKOUT_ENDPOINT =
  (import.meta.env.VITE_CHECKOUT_ENDPOINT as string | undefined)?.trim() || "";

export const HAS_CHECKOUT_ENDPOINT = Boolean(CHECKOUT_ENDPOINT);

export interface OrderCustomer {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
}

export interface OrderAddress {
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface OrderLineItem {
  name: string;
  size?: string;
  quantity: number;
  unitPrice: string;
}

export interface OrderPayload {
  customer: OrderCustomer;
  shipping: OrderAddress;
  billing?: OrderAddress & Partial<OrderCustomer>;
  shippingOption: "standard" | "express" | "overnight";
  items: OrderLineItem[];
  subtotal: number;
  shippingCost: number;
  total: number;
}

export type OrderSubmitResult =
  | { ok: true; mode: "endpoint" | "mailto" }
  | { ok: false; error: string };

function buildMailtoBody(order: OrderPayload): string {
  const lines: string[] = [];
  lines.push(`Order request from ${order.customer.firstName} ${order.customer.lastName}`);
  lines.push("");
  lines.push("Contact");
  lines.push(`  Email: ${order.customer.email}`);
  if (order.customer.phone) lines.push(`  Phone: ${order.customer.phone}`);
  lines.push("");
  lines.push("Shipping address");
  lines.push(`  ${order.shipping.address}`);
  lines.push(
    `  ${order.shipping.city}, ${order.shipping.postalCode}, ${order.shipping.country}`,
  );
  lines.push(`  Method: ${order.shippingOption}`);
  if (order.billing) {
    lines.push("");
    lines.push("Billing address");
    lines.push(`  ${order.billing.address}`);
    lines.push(
      `  ${order.billing.city}, ${order.billing.postalCode}, ${order.billing.country}`,
    );
  }
  lines.push("");
  lines.push("Items");
  for (const item of order.items) {
    const sizePart = item.size ? ` (size ${item.size})` : "";
    lines.push(`  ${item.quantity} × ${item.name}${sizePart} — ${item.unitPrice}`);
  }
  lines.push("");
  lines.push(`Subtotal: €${order.subtotal.toLocaleString()}`);
  lines.push(
    `Shipping: ${order.shippingCost === 0 ? "Free" : `€${order.shippingCost}`}`,
  );
  lines.push(`Total: €${order.total.toLocaleString()}`);
  lines.push("");
  lines.push(
    "(Card details intentionally excluded from this email — your card was not charged.)",
  );
  return lines.join("\n");
}

export async function submitOrder(order: OrderPayload): Promise<OrderSubmitResult> {
  if (HAS_CHECKOUT_ENDPOINT) {
    try {
      const res = await fetch(CHECKOUT_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(order),
      });
      if (!res.ok) {
        return { ok: false, error: `Server returned ${res.status}` };
      }
      return { ok: true, mode: "endpoint" };
    } catch (err) {
      return {
        ok: false,
        error: err instanceof Error ? err.message : "Network error",
      };
    }
  }

  // Honest fallback: open a prefilled mailto draft with the order intent.
  try {
    const subject = encodeURIComponent(
      `Order request — ${order.customer.firstName} ${order.customer.lastName} — €${order.total.toLocaleString()}`,
    );
    const body = encodeURIComponent(buildMailtoBody(order));
    window.location.href = `mailto:${SITE_ORDERS_EMAIL}?subject=${subject}&body=${body}`;
    return { ok: true, mode: "mailto" };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Unable to open mail client",
    };
  }
}
