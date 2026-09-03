/**
 * Reviewed one-off geometry and selector/content syntax with no stable Tailwind namespace.
 *
 * Each entry is pinned to the exact authored `file:line:column` locations.
 * Moving, duplicating, or deleting a literal requires an explicit inventory review.
 */
export const REVIEWED_ARBITRARY_VALUES: Record<string, string[]> = {
  "[--home-viewport-media:calc(100svh_-_2_*_var(--home-viewport-pad))]": [
    "src/app/page.tsx:30:3",
  ],
  "[--home-viewport-pad:clamp(48px,5vw,96px)]": ["src/app/page.tsx:30:3"],
  "[--home-viewport-pad:clamp(8px,2svh,16px)]": ["src/app/page.tsx:30:3"],
  "[&::-webkit-details-marker]": [
    "src/app/products/[productHandle]/page.tsx:54:28",
    "src/app/products/[productHandle]/page.tsx:67:28",
    "src/app/products/[productHandle]/page.tsx:85:28",
    "src/app/products/[productHandle]/page.tsx:97:28",
    "src/app/shop/page.tsx:106:30",
    "src/app/shop/page.tsx:260:32",
  ],
  "[&:nth-child(3n)]": [
    "src/components/site-header/field-index-header.tsx:196:173",
  ],
  "[&:nth-last-child(-n+3)]": [
    "src/components/site-header/field-index-header.tsx:196:173",
  ],
  "[&>a:hover]": ["src/components/site-footer.tsx:16:3"],
  "[&>a]": ["src/components/site-footer.tsx:16:3"],
  "[&>h2]": ["src/components/site-footer.tsx:16:3"],
  "[transition:background_var(--duration-fast)_var(--ease-standard),color_var(--duration-fast)_var(--ease-standard),border-color_var(--duration-fast)_var(--ease-standard),box-shadow_120ms_var(--ease-standard),transform_120ms_var(--ease-standard)]":
    ["src/lib/presentation/variants.ts:9:3"],
  "[transition:background-color_var(--duration-fast)_var(--ease-standard),color_var(--duration-fast)_var(--ease-standard),padding-inline_220ms_var(--ease-standard)]":
    ["src/components/site-header/field-index-header.tsx:26:3"],
  "[transition:border-color_var(--duration-fast)_var(--ease-standard),background_var(--duration-fast)_var(--ease-standard),color_var(--duration-fast)_var(--ease-standard)]":
    ["src/components/site-footer.tsx:90:29"],
  "aria-[current=page]": [
    "src/app/shop/page.tsx:113:27",
    "src/app/shop/page.tsx:118:29",
    "src/components/site-header/field-index-header.tsx:196:173",
    "src/components/site-header/field-index-header.tsx:33:3",
    "src/components/site-header/field-index-header.tsx:523:28",
    "src/components/site-header/field-index-header.tsx:540:28",
    "src/components/site-header/field-index-header.tsx:569:30",
    "src/components/site-header/field-index-header.tsx:596:30",
  ],
  "content-['']": [
    "src/app/field-testing/page.tsx:33:26",
    "src/app/page.tsx:183:25",
    "src/app/products/[productHandle]/product-detail.tsx:44:15",
    "src/components/site-header/field-index-header.tsx:138:27",
  ],
  "content-['→']": [
    "src/app/journal/page.tsx:61:29",
    "src/app/products/[productHandle]/page.tsx:103:23",
    "src/lib/presentation/variants.ts:61:3",
  ],
  "content-['+']": [
    "src/app/products/[productHandle]/page.tsx:54:28",
    "src/app/products/[productHandle]/page.tsx:67:28",
    "src/app/products/[productHandle]/page.tsx:85:28",
    "src/app/products/[productHandle]/page.tsx:97:28",
    "src/app/shop/page.tsx:106:30",
    "src/app/shop/page.tsx:260:32",
  ],
  "content-['−']": [
    "src/app/products/[productHandle]/page.tsx:54:28",
    "src/app/products/[productHandle]/page.tsx:67:28",
    "src/app/products/[productHandle]/page.tsx:85:28",
    "src/app/products/[productHandle]/page.tsx:97:28",
    "src/app/shop/page.tsx:106:30",
    "src/app/shop/page.tsx:260:32",
  ],
  "content-[attr(data-label)_':_']": [
    "src/app/account/orders/page.tsx:33:3",
    "src/app/account/page.tsx:34:3",
  ],
  "data-[active=true]": [
    "src/components/site-header/field-index-header.tsx:114:165",
    "src/components/site-header/field-index-header.tsx:128:34",
  ],
  "gap-[clamp(42px,8vw,120px)]": ["src/components/account-shell.tsx:61:22"],
  "gap-[clamp(50px,10vw,150px)]": [
    "src/app/shop/[collectionHandle]/page.tsx:93:24",
  ],
  "grid-cols-[0.55fr_1.45fr]": ["src/app/page.tsx:292:44"],
  "grid-cols-[0.8fr_1.2fr]": ["src/app/shop/[collectionHandle]/page.tsx:93:24"],
  "grid-cols-[1.15fr_0.85fr]": ["src/app/pages/[pageHandle]/page.tsx:75:26"],
  "grid-cols-[1.25fr_0.75fr]": [
    "src/app/products/[productHandle]/product-detail.tsx:273:19",
  ],
  "grid-cols-[1.2fr_repeat(2,minmax(0,1fr))]": [
    "src/components/site-footer.tsx:46:19",
  ],
  "grid-cols-[1.3fr_0.7fr]": ["src/app/shop/[collectionHandle]/page.tsx:61:26"],
  "grid-cols-[1.5fr_repeat(4,0.45fr)]": [
    "src/components/site-footer.tsx:46:19",
  ],
  "grid-cols-[112px_1fr]": [
    "src/app/products/[productHandle]/add-to-cart-form.tsx:29:3",
  ],
  "grid-cols-[1fr_auto_auto]": [
    "src/app/products/[productHandle]/product-detail.tsx:176:22",
  ],
  "grid-cols-[32px_minmax(0,1fr)_auto]": [
    "src/components/site-header/field-index-header.tsx:196:24",
  ],
  "grid-cols-[38px_1fr]": [
    "src/components/site-header/field-index-header.tsx:244:23",
  ],
  "grid-cols-[52px_minmax(0,1fr)_40px]": [
    "src/components/site-header/field-index-header.tsx:114:26",
  ],
  "grid-cols-[64px_minmax(0,1fr)]": [
    "src/components/site-header/mini-cart.tsx:68:28",
  ],
  "grid-cols-[65px_1fr]": ["src/app/field-testing/page.tsx:10:3"],
  "grid-cols-[minmax(0,1.18fr)_minmax(360px,0.82fr)]": [
    "src/components/site-header/field-index-header.tsx:105:22",
  ],
  "grid-cols-[minmax(0,1.25fr)_minmax(380px,0.75fr)]": [
    "src/app/page.tsx:214:44",
  ],
  "grid-cols-[minmax(155px,1fr)_auto_minmax(230px,1fr)]": [
    "src/components/site-header/field-index-header.tsx:507:19",
  ],
  "grid-cols-[minmax(180px,0.55fr)_minmax(220px,1fr)]": [
    "src/components/site-header/field-index-header.tsx:124:31",
  ],
  "grid-cols-[minmax(360px,0.88fr)_minmax(0,1.12fr)]": [
    "src/app/products/[productHandle]/product-detail.tsx:348:20",
  ],
  "grid-cols-[minmax(390px,0.78fr)_minmax(0,1.22fr)]": [
    "src/app/page.tsx:67:19",
  ],
  "grid-cols-[minmax(420px,0.72fr)_minmax(0,1.28fr)]": [
    "src/app/products/[productHandle]/product-detail.tsx:348:20",
  ],
  "grid-rows-[repeat(3,1fr)]": [
    "src/components/site-header/field-index-header.tsx:107:21",
  ],
  "h-[58svh]": ["src/app/page.tsx:281:21"],
  "h-[62svh]": ["src/app/field-testing/page.tsx:139:23"],
  "h-[calc(100svh-138px)]": [
    "src/app/products/[productHandle]/product-detail.tsx:193:22",
  ],
  "h-[calc(100svh-148px)]": [
    "src/app/products/[productHandle]/product-detail.tsx:193:22",
  ],

  "max-h-[55svh]": ["src/app/page.tsx:341:25"],
  "max-h-[calc(var(--home-viewport-media)_-_32px)]": [
    "src/app/page.tsx:306:29",
  ],
  "max-h-[calc(var(--home-viewport-media)_-_44px)]": [
    "src/app/page.tsx:306:29",
  ],
  "mb-[clamp(10px,2svh,18px)]": ["src/app/page.tsx:236:39"],
  "min-h-[50svh]": ["src/app/not-found.tsx:40:22"],
  "min-h-[55svh]": ["src/app/not-found.tsx:17:26"],
  "min-h-[66vh]": ["src/app/layout.tsx:76:23"],
  "min-h-[68svh]": ["src/app/page.tsx:114:24"],
  "min-h-[72svh]": ["src/app/not-found.tsx:16:20"],
  "min-h-[80vh]": [
    "src/app/products/[productHandle]/product-detail.tsx:348:20",
  ],
  "min-h-[90svh]": ["src/app/field-testing/page.tsx:33:26"],
  "min-h-[calc(100svh_-_var(--spacing-header-compact))]": [
    "src/app/page.tsx:67:19",
  ],
  "min-h-[calc(100svh_-_var(--spacing-header))]": ["src/app/page.tsx:67:19"],
  "ml-[-12vw]": ["src/app/journal/[articleHandle]/page.tsx:104:31"],
  "mr-[-8vw]": ["src/app/journal/[articleHandle]/page.tsx:104:31"],
  "my-[2.4em]": ["src/app/journal/[articleHandle]/page.tsx:104:31"],
  "my-[2em]": ["src/app/journal/[articleHandle]/page.tsx:110:26"],
  "my-[clamp(14px,2.5svh,24px)]": ["src/app/page.tsx:240:27"],
  "object-[56%_center]": ["src/app/pages/[pageHandle]/page.tsx:78:23"],
  "p-[clamp(34px,5vw,70px)]": ["src/app/pages/[pageHandle]/page.tsx:126:19"],
  "p-[clamp(35px,5vw,70px)]": ["src/app/page.tsx:325:28"],
  "p-[clamp(36px,5vw,80px)]": [
    "src/app/products/[productHandle]/product-detail.tsx:354:24",
  ],
  "p-[clamp(36px,6vw,90px)]": ["src/app/journal/page.tsx:52:26"],
  "p-[clamp(42px,6vw,92px)]": ["src/app/page.tsx:226:26"],
  "p-[clamp(45px,6vw,96px)]": ["src/app/pages/[pageHandle]/page.tsx:87:24"],
  "p-[clamp(48px,6vw,100px)]": ["src/app/page.tsx:69:24"],
  "p-[clamp(48px,7vw,110px)]": ["src/app/page.tsx:262:24"],
  "p-[clamp(50px,7vw,110px)]": ["src/app/field-testing/page.tsx:114:26"],
  "p-[clamp(70px,9vw,150px)]": ["src/app/field-testing/page.tsx:43:24"],
  "pl-[1.2em]": ["src/app/products/[productHandle]/page.tsx:88:23"],
  "pl-[12vw]": ["src/app/journal/[articleHandle]/page.tsx:104:31"],
  "pr-[8vw]": ["src/app/journal/[articleHandle]/page.tsx:104:31"],
  "px-[clamp(20px,3vw,36px)]": ["src/app/page.tsx:226:26"],
  "px-[clamp(28px,4vw,60px)]": ["src/app/page.tsx:226:26"],
  "py-[clamp(24px,4svh,48px)]": ["src/app/page.tsx:226:26"],
  "py-[clamp(3px,1svh,6px)]": ["src/app/page.tsx:244:29"],
  "py-[clamp(60px,10vw,140px)]": ["src/lib/presentation/variants.ts:71:13"],
  "py-[clamp(8px,1.7svh,14px)]": ["src/app/page.tsx:244:29"],

  "top-[calc(100%+12px)]": ["src/components/site-header/mini-cart.tsx:289:21"],
  "top-[calc(var(--spacing-header)+30px)]": [
    "src/app/products/[productHandle]/product-detail.tsx:354:24",
  ],
  "w-[clamp(280px,31vw,480px)]": ["src/components/wordmark.tsx:15:16"],
  "w-[min(330px,calc(100%_-_36px))]": ["src/app/page.tsx:126:25"],
  "w-[min(340px,calc(100vw-28px))]": [
    "src/components/site-header/mini-cart.tsx:289:21",
  ],
};
