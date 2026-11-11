/**
 * Vite+ tooling config: `vp lint` (Oxlint), `vp fmt` (Oxfmt) and `vp test`
 * (Vitest). Next.js never reads this file — `next dev` / `next build` stay the
 * app's dev server and bundler, and `vp dev` / `vp build` are not used.
 */
import { defineConfig } from "vite-plus";
import type { DummyRuleMap } from "vite-plus/lint";

// Former Biome `files.includes` exclusions. Gitignored paths are skipped by
// Oxlint/Oxfmt themselves.
const IGNORE = [
  ".next",
  "node_modules",
  "next-env.d.ts",
  "public",
  ".agents",
  ".weaverse",
  "**/*.md",
  "**/*.css",
];

// Biome `recommended` (+ `react` and `next` domains) mapped to Oxlint, same
// rule set Builder carried over from Biome. Errors fail `vp lint`, warnings
// never do — the severity Biome's recommended preset used.
const LINT_ERRORS = [
  // security
  "no-eval",
  "react/jsx-no-script-url",
  "react/jsx-no-target-blank",
  // correctness
  "constructor-super",
  "for-direction",
  "getter-return",
  "no-async-promise-executor",
  "no-case-declarations",
  "no-class-assign",
  "no-compare-neg-zero",
  "no-const-assign",
  "no-constant-condition",
  "no-constructor-return",
  "no-control-regex",
  "no-debugger",
  "no-dupe-class-members",
  "no-dupe-else-if",
  "no-dupe-keys",
  "no-duplicate-case",
  "no-empty-character-class",
  "no-empty-pattern",
  "no-fallthrough",
  "no-func-assign",
  "no-global-assign",
  "no-import-assign",
  "no-label-var",
  "no-loss-of-precision",
  "no-misleading-character-class",
  "no-new-native-nonconstructor",
  "no-nonoctal-decimal-escape",
  "no-obj-calls",
  "no-self-assign",
  "no-self-compare",
  "no-setter-return",
  "no-shadow-restricted-names",
  "no-sparse-arrays",
  "no-this-before-super",
  "no-unreachable",
  "no-unsafe-finally",
  "no-unsafe-negation",
  "no-unsafe-optional-chaining",
  "no-with",
  "require-yield",
  "use-isnan",
  "valid-typeof",
  "oxc/bad-min-max-func",
  "oxc/misrefactored-assign-op",
  "typescript/no-explicit-any",
  "typescript/no-misused-new",
  "typescript/no-non-null-asserted-optional-chain",
  "typescript/no-unsafe-declaration-merging",
  "typescript/prefer-namespace-keyword",
  "unicorn/no-thenable",
  // react domain
  "react/jsx-key",
  "react/jsx-no-comment-textnodes",
  "react/jsx-no-duplicate-props",
  "react/no-children-prop",
  "react/rules-of-hooks",
  "react/void-dom-elements-no-children",
  // next domain
  "nextjs/no-document-import-in-page",
  "nextjs/no-head-element",
  "nextjs/no-head-import-in-document",
  // a11y
  "jsx-a11y/alt-text",
  "jsx-a11y/anchor-has-content",
  "jsx-a11y/anchor-is-valid",
  "jsx-a11y/aria-activedescendant-has-tabindex",
  "jsx-a11y/aria-props",
  "jsx-a11y/aria-proptypes",
  "jsx-a11y/aria-role",
  "jsx-a11y/aria-unsupported-elements",
  "jsx-a11y/heading-has-content",
  "jsx-a11y/html-has-lang",
  "jsx-a11y/iframe-has-title",
  "jsx-a11y/lang",
  "jsx-a11y/media-has-caption",
  "jsx-a11y/no-access-key",
  "jsx-a11y/no-aria-hidden-on-focusable",
  "jsx-a11y/no-distracting-elements",
  "jsx-a11y/no-interactive-element-to-noninteractive-role",
  "jsx-a11y/no-noninteractive-element-to-interactive-role",
  "jsx-a11y/no-noninteractive-tabindex",
  "jsx-a11y/no-redundant-roles",
  "jsx-a11y/role-has-required-aria-props",
  "jsx-a11y/scope",
  "jsx-a11y/tabindex-no-positive",
];

const LINT_WARNINGS = [
  "no-unused-expressions",
  "no-useless-catch",
  "no-useless-constructor",
  "no-useless-rename",
  "react/exhaustive-deps",
  "react/jsx-no-useless-fragment",
  "nextjs/google-font-display",
  "nextjs/no-img-element",
  "jsx-a11y/img-redundant-alt",
  "jsx-a11y/label-has-associated-control",
];

// Former Biome `style.noRestrictedImports` (error).
const RESTRICTED_IMPORTS = [
  {
    name: "next/link",
    message: "Use the locale-aware `Link` from `@/components/link`.",
  },
  {
    name: "@weaverse/schema",
    message:
      "Import from `@weaverse/hydrogen/next`: it re-exports `@weaverse/schema`, which is not a dependency of this theme.",
  },
  {
    name: "@weaverse/react",
    message:
      "Import from `@weaverse/hydrogen/next`: `@weaverse/react` is not a dependency of this theme.",
  },
  {
    name: "@weaverse/core",
    message:
      "Import from `@weaverse/hydrogen/next`: `@weaverse/core` is not a dependency of this theme.",
  },
  {
    name: "@weaverse/next",
    message:
      "Import from `@weaverse/hydrogen/next` (or `@weaverse/hydrogen/next/server`): `@weaverse/next` is not a dependency of this theme.",
  },
  {
    name: "@weaverse/next/server",
    message:
      "Import from `@weaverse/hydrogen/next/server`: `@weaverse/next` is not a dependency of this theme.",
  },
  {
    name: "@weaverse/hydrogen/react-router",
    message:
      "Import from `@weaverse/hydrogen/next`: the React Router adapter is for Hydrogen React Router themes, not this Next.js app.",
  },
  {
    name: "@weaverse/hydrogen/next",
    importNames: ["useTranslation"],
    message:
      "Use `useT` or `<T>` from `@/lib/i18n/t`: they resolve through the theme's own-property-safe translator.",
  },
  {
    name: "next/navigation",
    importNames: ["usePathname"],
    message:
      "Use `usePathname` from `@/lib/i18n/locale-context`: Next reports the internal `/en-us` rewrite while rendering on the server.",
  },
];

const LINT_CONFIGURED: DummyRuleMap = {
  "no-restricted-imports": ["error", { paths: RESTRICTED_IMPORTS }],
  // Biome noUnusedVariables + noUnusedImports (warn); `_` names exempt.
  "no-unused-vars": [
    "warn",
    {
      args: "after-used",
      argsIgnorePattern: "^_",
      varsIgnorePattern: "^_",
      caughtErrors: "none",
      ignoreRestSiblings: true,
    },
  ],
  // Biome noDoubleEquals allowed `== null` / `!= null`.
  eqeqeq: ["error", "always", { null: "ignore" }],
  // Biome noInnerDeclarations allows block-level functions in ES modules.
  "no-inner-declarations": [
    "error",
    "functions",
    { blockScopedFunctions: "allow" },
  ],
  // Biome noAutofocus only checked DOM elements, not components.
  "jsx-a11y/no-autofocus": ["error", { ignoreNonDOM: true }],
  // Intentionally not mapped: `jsx-a11y/autocomplete-valid` (Oxlint rejects
  // valid WHATWG tokens such as `given-name` / `family-name`).
};

export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    // `@weaverse/next` imports extensionless `next/navigation`, which Node's
    // strict ESM loader cannot resolve (`next` has no exports map). Inlining
    // routes it through Vite's resolver. Bun's loader was lenient here.
    server: { deps: { inline: [/@weaverse\//] } },
    projects: [
      {
        extends: true,
        test: {
          name: "node",
          environment: "node",
          include: ["tests/**/*.test.ts"],
          exclude: ["tests/dom/**", "tests/browser/**"],
        },
      },
      {
        // No DOM globals in the node project: the Shopify and account env
        // readers refuse credentials whenever `document`/`window` exist.
        extends: true,
        test: {
          name: "dom",
          environment: "node",
          include: ["tests/dom/**/*.test.tsx"],
          setupFiles: ["./tests/dom/preload.ts"],
        },
      },
    ],
  },
  // Closest Oxfmt match to the former Biome formatter settings; import
  // sorting replaces Biome's organizeImports.
  fmt: {
    printWidth: 80,
    tabWidth: 2,
    useTabs: false,
    semi: true,
    singleQuote: false,
    trailingComma: "all",
    sortPackageJson: false,
    insertFinalNewline: true,
    sortImports: {
      partitionByNewline: true,
      newlinesBetween: false,
      internalPattern: ["@/"],
    },
    ignorePatterns: [...IGNORE, "**/*.{yml,yaml,toml,html}"],
  },
  lint: {
    // Category defaults off: only the mapped rules run, so the policy neither
    // grows nor shrinks with Oxlint releases.
    categories: {
      correctness: "off",
      suspicious: "off",
      pedantic: "off",
      perf: "off",
      style: "off",
      restriction: "off",
      nursery: "off",
    },
    plugins: [
      "eslint",
      "typescript",
      "unicorn",
      "oxc",
      "react",
      "jsx-a11y",
      "nextjs",
    ],
    ignorePatterns: IGNORE,
    rules: {
      ...Object.fromEntries(LINT_ERRORS.map((rule) => [rule, "error"])),
      ...Object.fromEntries(LINT_WARNINGS.map((rule) => [rule, "warn"])),
      ...LINT_CONFIGURED,
    },
    overrides: [
      {
        // The wrappers that own the restricted imports.
        files: [
          "src/components/link.tsx",
          "src/lib/i18n/locale-context.tsx",
          "src/lib/i18n/t.tsx",
        ],
        rules: { "no-restricted-imports": "off" },
      },
    ],
  },
});
