/**
 * Forward's Weaverse theme schema.
 *
 * The schema is composed from one file per setting group under `./settings/`,
 * so a group is edited in isolation and `./settings/types.ts` can derive the
 * `ThemeSettings` type straight from the same declarations.
 *
 * The contract makes Header and Footer settings-owned rather than
 * section-owned, which is why the global surfaces appear here as groups
 * instead of in the component registry.
 */

import type { WeaverseNextThemeSchema } from "@weaverse/next";

import { editorialImagerySettings } from "./settings/editorial-imagery";
import { footerSettings } from "./settings/footer";
import { headerSettings } from "./settings/header";
import { layoutSettings } from "./settings/layout";

export const themeSchema: WeaverseNextThemeSchema = {
  info: {
    name: "Forward",
    version: "0.1.0",
  },
  settings: [
    layoutSettings,
    headerSettings,
    footerSettings,
    editorialImagerySettings,
  ],
};

export type {
  EditorialImagerySettings,
  FooterSettings,
  HeaderSettings,
  ThemeSettings,
} from "./settings/types";
