# Forward

Forward is an open-source Shopify storefront theme built with Next.js App Router, Hydrogen and [Weaverse](https://weaverse.io). Build your storefront in React and let your team compose pages, customize theme settings and manage translations visually in Weaverse Studio.

[Live storefront](https://forward-sandy.vercel.app) · [Try the editor](https://weaverse.io/demo?theme=forward) · [Next.js documentation](https://weaverse.io/docs/nextjs/overview)

## Features

- Visual page composition with reusable sections, resource pickers and theme settings in Weaverse Studio.
- Product pages, collection browsing with filters, sorting and pagination, a collection list, and search.
- Shopify Cart API integration and checkout handoff.
- Customer Account sign-in, profile, order history and addresses when configured.
- Shopify Markets routing, localized prices and dates, and translation authoring in Studio.
- Custom pages, blogs, articles and store policies, with page metadata, robots and sitemap support.
- Next.js App Router, React, TypeScript and Tailwind CSS, with unit, DOM and browser tests.

Forward runs against a real Shopify store. There is no static demo mode or fallback catalog.

## Requirements

- **Node.js 22.18 or later.**
- **[Bun](https://bun.sh)** for dependencies and scripts. Use the version pinned in `package.json`.
- **A Shopify store** with the [Headless sales channel](https://apps.shopify.com/headless), Storefront API access and products published to that storefront.
- **A Weaverse project created from Forward** in the Weaverse app for your Shopify store.

## Getting started

### 1. Create your storefront

Create a Forward project in Weaverse and copy its Project ID. Then run:

```bash
npx @weaverse/cli@latest create --template forward --project-id YOUR_PROJECT_ID --project-name my-storefront
cd my-storefront
```

The CLI downloads the theme, writes your project ID to `.env` and installs dependencies with Bun.

### 2. Configure Shopify

Fill in the Storefront API credentials from your store's Headless channel in the generated `.env`:

```dotenv
PUBLIC_STORE_DOMAIN=your-shop.myshopify.com
PRIVATE_STOREFRONT_API_TOKEN=your-private-storefront-token
PUBLIC_STOREFRONT_API_TOKEN=your-public-storefront-token
WEAVERSE_PROJECT_ID=your-weaverse-project-id
```

The private token is used only on the server. The public token lets Studio resolve your store's products, collections and pages. Never commit `.env` or expose the private token to browser code.

See [`.env.example`](.env.example) for the full configuration. Customer Account is optional: to enable it, configure all four account variables together and register the appropriate callback and logout URLs in Shopify. Leave the entire account group empty if you do not need it.

### 3. Start developing

```bash
bun run dev
```

Open [http://localhost:3333](http://localhost:3333). In your Weaverse project's settings, set the preview URL to `http://localhost:3333`, then open Studio to customize your pages and theme settings. Publish your changes when they are ready for the live storefront.

For a guided walkthrough, see the [Next.js quickstart](https://weaverse.io/docs/nextjs/quickstart).

## Customizing your store

- **Shopify** owns your products, collections, menus, pages, blog content, policies and checkout. Configure the `main-menu` and `footer` menus for navigation; the header menu handle can be changed with `PUBLIC_MAIN_MENU_HANDLE`.
- **Weaverse Studio** owns page composition, section settings, theme settings and translations. Header and footer settings are available through theme settings; Cart and Account behavior stays in the theme code.
- **Your code** defines the available sections and their schemas in `src/sections/`, registered in `src/lib/weaverse/components.ts`.

Markets are declared in `src/lib/i18n/locales.ts`. Keep them aligned with your Shopify Markets configuration and author localized content in Studio. The default market uses unprefixed URLs; other markets use a locale prefix, such as `/de-de/shop`.

See [Studio integration](https://weaverse.io/docs/nextjs/studio) and [Markets and translations](https://weaverse.io/docs/nextjs/markets-translations) for more.

## Project structure

```text
src/
  app/                  Next.js routes, layouts and API handlers
    [locale]/           Market-aware storefront pages
  components/           Shared UI and commerce components
  sections/             Composable storefront sections and schemas
  lib/
    weaverse/           Component registry, theme settings and Studio integration
    storefront/         Shopify data access and storefront models
    i18n/               Market configuration and translation helpers
    cart/               Shopify cart integration
    account/            Customer Account integration
public/                 Static assets
scripts/                Build and verification tools
tests/                  Unit, DOM and browser coverage
```

## Commands

| Command | Description |
| --- | --- |
| `bun run dev` | Start the development server on port 3333. |
| `bun run build` | Create a production build; requires your Shopify and Weaverse configuration. |
| `bun run start` | Serve an existing production build. |
| `bun run typecheck` | Check TypeScript types. |
| `bun run lint` | Run Biome lint. |
| `bun run format` | Format files and organize imports. |
| `bun run format:check` | Check formatting without changing files. |
| `bun run test` | Run unit and DOM tests. |
| `bun run test:browser` | Run the live Playwright matrices; requires the corresponding credentials. |
| `bun run check` | Run types, lint, formatting, tests, GraphQL validation, build, theme and route checks. |

## Deploying to Vercel

1. Push your storefront to your own Git repository and import it into Vercel with the **Next.js** preset.
2. Use Bun for installation (`bun install --frozen-lockfile`) and `bun run build` for the build command. Select a supported Node.js version that meets the requirement above.
3. Add your Shopify and Weaverse environment variables in Vercel before building. Configure Preview and Production separately; do not commit an environment file.
4. If Customer Account is enabled, set `PUBLIC_STOREFRONT_ORIGIN` to that environment's storefront origin and register its callback and logout URLs in Shopify.
5. Deploy, add the deployed URL to your Weaverse project's preview URLs, and verify published pages, product selection, cart and checkout on your own store.

Follow the [Vercel deployment guide](https://weaverse.io/docs/guides/deployment/vercel) for the full setup.

## Documentation

- [Next.js overview](https://weaverse.io/docs/nextjs/overview)
- [Getting started](https://weaverse.io/docs/nextjs/quickstart)
- [Rendering pages](https://weaverse.io/docs/nextjs/rendering-pages)
- [Section data fetching](https://weaverse.io/docs/nextjs/data-fetching)
- [Studio integration](https://weaverse.io/docs/nextjs/studio)
- [Markets and translations](https://weaverse.io/docs/nextjs/markets-translations)
- [Report an issue](https://github.com/Weaverse/forward/issues)

## License

[MIT](LICENSE.md) — Copyright Weaverse JSC.
