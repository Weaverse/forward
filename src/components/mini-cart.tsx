"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { Icon } from "@/components/icon";
import { subscribeToCartAdd } from "@/lib/cart/mini-cart-signal";
import {
  formatShopifyMoney,
  useShopifyCart,
  useShopifyCartMode,
} from "@/lib/cart/shopify-cart-react";
import { subtotal } from "@/lib/demo-cart/cart-logic";
import { useDemoCartLines } from "@/lib/demo-cart/use-demo-cart";
import { formatMoney } from "@/lib/storefront/format";

/** Long enough to read, short enough not to sit over the page. */
const AUTO_DISMISS_MS = 8000;

interface MiniCartImage {
  src: string;
  alt: string;
  width: number;
  height: number;
}

interface MiniCartLine {
  title: string;
  href: string;
  image: MiniCartImage | null;
  options: string;
  quantity: number;
}

interface MiniCartPresentation {
  variantId: string;
  eventId: number;
}

interface MiniCartBodyProps {
  checkoutUrl: string | null;
  line: MiniCartLine | null;
  subtotalLabel: string;
}

function MiniCartBody({ checkoutUrl, line, subtotalLabel }: MiniCartBodyProps) {
  return (
    <>
      {line === null ? (
        <p className="mini-cart-empty">Your cart was updated.</p>
      ) : (
        <article className="mini-cart-line">
          {line.image === null ? null : (
            <Image
              alt={line.image.alt}
              height={line.image.height}
              sizes="64px"
              src={line.image.src}
              width={line.image.width}
            />
          )}
          <div>
            <Link href={line.href}>{line.title}</Link>
            {line.options.length === 0 ? null : (
              <p className="mini-cart-options">{line.options}</p>
            )}
            <p className="mini-cart-quantity">Qty {line.quantity}</p>
          </div>
        </article>
      )}
      <p className="mini-cart-subtotal">
        <span>Subtotal</span>
        <strong>{subtotalLabel}</strong>
      </p>
      <Link className="button button-block" href="/cart">
        View cart
      </Link>
      {checkoutUrl === null ? null : (
        <a
          className="button button-signal button-block"
          href={checkoutUrl}
          rel="external nofollow"
        >
          Checkout
        </a>
      )}
    </>
  );
}

/** Static mode: the browser-local demo cart, read only. */
function DemoMiniCartBody({ variantId }: { variantId: string }) {
  const lines = useDemoCartLines();
  const line = lines.find((entry) => entry.variantId === variantId) ?? null;

  return (
    <MiniCartBody
      checkoutUrl={null}
      line={
        line === null
          ? null
          : {
              title: line.title,
              href: line.href,
              image: line.image,
              options: [
                line.colorwayName,
                ...Object.values(line.selectedOptions),
              ].join(" · "),
              quantity: line.quantity,
            }
      }
      subtotalLabel={formatMoney(subtotal(lines))}
    />
  );
}

/** Shopify mode: the server-owned cart, read only — never a second cart. */
function ShopifyMiniCartBody({ variantId }: { variantId: string }) {
  const cart = useShopifyCart((state) => state.data);
  const node =
    cart.lines.nodes.find((entry) => entry.merchandise?.id === variantId) ??
    null;
  const merchandise = node?.merchandise;
  const image = merchandise?.image;
  const handle = merchandise?.product.handle;
  const title = merchandise?.product.title ?? "Forward gear";

  return (
    <MiniCartBody
      checkoutUrl={cart.checkoutUrl ?? null}
      line={
        node === null
          ? null
          : {
              title,
              href: handle === undefined ? "/cart" : `/products/${handle}`,
              image:
                image === null || image === undefined
                  ? null
                  : {
                      src: image.url,
                      alt: image.altText ?? title,
                      width: image.width ?? 64,
                      height: image.height ?? 80,
                    },
              options:
                merchandise?.selectedOptions
                  ?.map(({ value }) => value)
                  .join(" · ") ?? "",
              quantity: node.quantity,
            }
      }
      subtotalLabel={formatShopifyMoney(cart.cost.subtotalAmount)}
    />
  );
}

/**
 * Compact top-right cart preview shown after an explicit add to cart.
 *
 * It reads whichever cart the storefront actually owns and never mutates it,
 * so exact cart identity and line merging stay with the cart itself. It also
 * never calls `focus()`: success is announced through a live region and the
 * panel dismisses on Escape, on an outside pointer, or on its own timer —
 * unless the visitor's focus is already inside it.
 */
export function MiniCart() {
  const shopifyMode = useShopifyCartMode();
  const [presentation, setPresentation] = useState<MiniCartPresentation | null>(
    null,
  );
  const [announcement, setAnnouncement] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(
    () =>
      subscribeToCartAdd((variantId) => {
        setPresentation((current) => ({
          variantId,
          eventId: (current?.eventId ?? 0) + 1,
        }));
        setAnnouncement((current) =>
          current === "Added to cart."
            ? "Item added to cart."
            : "Added to cart.",
        );
      }),
    [],
  );

  useEffect(() => {
    if (presentation === null) {
      return;
    }

    const root = rootRef.current;
    let timer: ReturnType<typeof setTimeout> | undefined;

    function close() {
      setPresentation(null);
      setAnnouncement("");
    }

    function scheduleDismiss() {
      if (timer !== undefined) {
        clearTimeout(timer);
      }
      timer = setTimeout(() => {
        /* Auto-dismiss must never pull focus out from under the visitor. */
        if (root?.contains(document.activeElement) === true) {
          scheduleDismiss();
          return;
        }
        close();
      }, AUTO_DISMISS_MS);
    }

    function handlePointerDown(event: PointerEvent) {
      if (
        event.target instanceof Node &&
        !rootRef.current?.contains(event.target)
      ) {
        close();
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        close();
      }
    }

    function handleFocusOut(event: FocusEvent) {
      if (
        event.relatedTarget instanceof Node &&
        root?.contains(event.relatedTarget) === true
      ) {
        return;
      }
      scheduleDismiss();
    }

    scheduleDismiss();
    root?.addEventListener("focusout", handleFocusOut);
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      if (timer !== undefined) {
        clearTimeout(timer);
      }
      root?.removeEventListener("focusout", handleFocusOut);
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [presentation]);

  return (
    <div ref={rootRef} className="mini-cart-mount">
      {presentation === null ? null : (
        <div aria-label="Cart updated" className="mini-cart" role="dialog">
          <p className="mini-cart-head">
            <Icon name="check-circle" size={16} />
            Added to cart
          </p>
          <button
            className="mini-cart-close"
            type="button"
            aria-label="Close cart preview"
            onClick={() => {
              setPresentation(null);
              setAnnouncement("");
            }}
          >
            <Icon name="x" size={16} />
          </button>
          {shopifyMode ? (
            <ShopifyMiniCartBody variantId={presentation.variantId} />
          ) : (
            <DemoMiniCartBody variantId={presentation.variantId} />
          )}
        </div>
      )}
      <p aria-live="polite" className="sr-only" role="status">
        {announcement}
      </p>
    </div>
  );
}
