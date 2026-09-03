/**
 * Shared presentation class-name extraction.
 *
 * The retired-class, important-modifier, Tailwind-utility, raw-colour,
 * arbitrary-value, and compiled-theme guards all need the same answer to
 * "which text in this file is a class list, and which call site owns it?".
 * A regex cannot answer that, so this walks the TypeScript AST and resolves
 * identifiers through real lexical scopes: a binding found in the nearest
 * enclosing scope wins, and a binding with no static initializer (a parameter,
 * an import, a destructured element) stops resolution instead of leaking
 * through to an outer declaration of the same name.
 *
 * Four roots count as class lists, and each one is a separate call site:
 * JSX `className` attributes, the `className` property of a JSX spread object,
 * `cva` recipe definitions, and exported recipes in a dedicated
 * `presentation.ts` owner. Everything else — copy, hrefs, ordinary string
 * constants, arguments of unrecognised helpers — stays out, so a guard failure
 * names a real class. Resolution is deliberately conservative: an expression
 * this cannot resolve statically contributes nothing rather than donating
 * unrelated strings.
 */

import ts from "typescript";

/** One class-list owner: a JSX attribute, JSX spread, or recipe definition. */
export interface ClassSite {
  file: string;
  /** 1-based line of the owning expression, so occurrences stay locatable. */
  line: number;
  classes: string;
}

/**
 * One authored class-list literal. A constant shared by several elements is
 * one literal at many call sites, which is what "become a reusable recipe"
 * means; two elements spelling the same value out are two literals.
 */
export interface ClassLiteral {
  file: string;
  line: number;
  column: number;
  classes: string;
}

interface Fragment {
  node: ts.Node;
  text: string;
}

const COMPOSERS = new Set(["cn", "clsx", "classNames", "cx", "twMerge"]);
/** Variants that re-target an arbitrary condition at another element. */
const RELATIONAL_PREFIX = /^(?:group|peer|in|has|not)-(?=.*\[)/;
/** A named group/peer reference (`group-aria-[…]/check`), not a value. */
const GROUP_NAME_SUFFIX = /\]\/[a-zA-Z][\w-]*$/;

/**
 * The arbitrary values a single class token declares, one per `[...]` segment
 * and free of its variant prefixes, so `gap-[5px]` and `max-xl:gap-[5px]`
 * are the same value at two call sites rather than two unrelated tokens.
 */
export function arbitraryValues(token: string): string[] {
  const segments: string[] = [];
  let depth = 0;
  let start = 0;
  for (let index = 0; index < token.length; index += 1) {
    const character = token[index];
    if (character === "[") depth += 1;
    else if (character === "]") depth -= 1;
    else if (character === ":" && depth === 0) {
      segments.push(token.slice(start, index));
      start = index + 1;
    }
  }
  segments.push(token.slice(start));

  return segments
    .filter((segment) => segment.includes("[") && segment.includes("]"))
    .map((segment) =>
      segment
        .replace(RELATIONAL_PREFIX, "")
        .replace(GROUP_NAME_SUFFIX, (match) => match.slice(0, 1)),
    );
}

function extract(
  source: string,
  fileName: string,
): { sites: ClassSite[]; literals: ClassLiteral[] } {
  const file = ts.createSourceFile(
    fileName,
    source,
    ts.ScriptTarget.Latest,
    true,
    fileName.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );
  const isPresentationModule = /(?:^|\/)presentation\.ts$/.test(fileName);
  const sites: ClassSite[] = [];
  const authored = new Map<ts.Node, string>();

  /* ---- lexical binding resolution ---------------------------------- */

  /** `null` marks a name that is bound here but has no static initializer. */
  const scopes = new Map<ts.Node, Map<string, ts.Expression | null>>();
  const composerAliases = new Set<string>();
  const composerNamespaces = new Set<string>();
  const recipeAliases = new Set<string>();

  function isScope(node: ts.Node): boolean {
    return (
      ts.isSourceFile(node) ||
      ts.isBlock(node) ||
      ts.isModuleBlock(node) ||
      ts.isCaseBlock(node) ||
      ts.isForStatement(node) ||
      ts.isForOfStatement(node) ||
      ts.isForInStatement(node) ||
      ts.isCatchClause(node) ||
      ts.isFunctionLike(node)
    );
  }

  function bindingsOf(scope: ts.Node): Map<string, ts.Expression | null> {
    const cached = scopes.get(scope);
    if (cached !== undefined) return cached;

    const bindings = new Map<string, ts.Expression | null>();
    const bind = (name: ts.BindingName, initializer?: ts.Expression) => {
      if (ts.isIdentifier(name)) {
        bindings.set(name.text, initializer ?? null);
        return;
      }
      if (!ts.isObjectBindingPattern(name) || initializer === undefined) return;
      for (const element of name.elements) {
        if (
          !ts.isIdentifier(element.name) ||
          element.dotDotDotToken !== undefined
        )
          continue;
        const key = element.propertyName ?? element.name;
        if (!ts.isIdentifier(key) && !ts.isStringLiteralLike(key)) continue;
        bindings.set(
          element.name.text,
          ts.factory.createElementAccessExpression(
            initializer,
            ts.factory.createStringLiteral(key.text),
          ),
        );
      }
    };
    const walk = (node: ts.Node): void => {
      if (isScope(node)) {
        /* A nested function still names itself in the enclosing scope. */
        if (ts.isFunctionDeclaration(node) && node.name !== undefined) {
          bind(node.name);
        }
        return;
      }
      if (ts.isVariableDeclaration(node)) {
        bind(node.name, node.initializer);
        return;
      } else if (ts.isBindingElement(node)) {
        /* A destructuring default is only the fallback, never the value. */
        bind(node.name);
      } else if (ts.isParameter(node) || ts.isClassDeclaration(node)) {
        if (node.name !== undefined) bind(node.name);
      } else if (
        ts.isImportClause(node) ||
        ts.isImportSpecifier(node) ||
        ts.isNamespaceImport(node)
      ) {
        if (node.name !== undefined) bind(node.name);
      }
      ts.forEachChild(node, walk);
    };
    ts.forEachChild(scope, walk);

    scopes.set(scope, bindings);
    return bindings;
  }

  function binding(identifier: ts.Identifier): {
    found: boolean;
    initializer: ts.Expression | null;
    scope?: ts.Node;
  } {
    for (
      let scope: ts.Node | undefined = identifier.parent;
      scope !== undefined;
      scope = scope.parent
    ) {
      if (!isScope(scope)) continue;
      const binding = bindingsOf(scope);
      if (binding.has(identifier.text)) {
        return {
          found: true,
          initializer: binding.get(identifier.text) ?? null,
          scope,
        };
      }
    }
    return { found: false, initializer: null };
  }

  function lookup(identifier: ts.Identifier): ts.Expression | undefined {
    return binding(identifier).initializer ?? undefined;
  }

  /* ---- static value resolution ------------------------------------- */

  /**
   * Every value an expression may statically take. Cycles terminate on the
   * recursion stack, so the same declaration can still be reached again from
   * an unrelated call site.
   */
  function values(node: ts.Expression, stack: Set<ts.Node>): ts.Expression[] {
    if (stack.has(node)) return [];
    stack.add(node);
    try {
      if (ts.isIdentifier(node)) {
        const initializer = lookup(node);
        return initializer === undefined ? [] : values(initializer, stack);
      }
      if (
        ts.isParenthesizedExpression(node) ||
        ts.isAsExpression(node) ||
        ts.isSatisfiesExpression(node) ||
        ts.isNonNullExpression(node)
      ) {
        return values(node.expression, stack);
      }
      if (ts.isConditionalExpression(node)) {
        return [
          ...values(node.whenTrue, stack),
          ...values(node.whenFalse, stack),
        ];
      }
      if (ts.isBinaryExpression(node)) {
        /* `active && "extra"`, `a ?? b`, and `"text-" + size` all put a class
         * list on one or both sides. */
        return [...values(node.left, stack), ...values(node.right, stack)];
      }
      if (ts.isPropertyAccessExpression(node)) {
        return properties(node.expression, node.name.text, stack);
      }
      if (ts.isElementAccessExpression(node)) {
        const key = literalText(node.argumentExpression, stack);
        /* A dynamic key such as `WORDMARKS[variant]` may select any entry. */
        return properties(node.expression, key, stack);
      }
      return [node];
    } finally {
      stack.delete(node);
    }
  }

  /** Property values of an object expression; every property when unnamed. */
  function properties(
    node: ts.Expression,
    name: string | undefined,
    stack: Set<ts.Node>,
  ): ts.Expression[] {
    const resolved: ts.Expression[] = [];
    for (const object of values(node, stack)) {
      if (!ts.isObjectLiteralExpression(object)) continue;
      for (const member of object.properties) {
        if (ts.isSpreadAssignment(member)) {
          resolved.push(...properties(member.expression, name, stack));
          continue;
        }
        const key = propertyName(member.name, stack);
        /* An unresolved key may be the requested one, so keep it. */
        if (name !== undefined && key !== undefined && key !== name) continue;
        if (ts.isPropertyAssignment(member)) {
          resolved.push(...values(member.initializer, stack));
        } else if (ts.isShorthandPropertyAssignment(member)) {
          resolved.push(...values(member.name, stack));
        }
      }
    }
    return resolved;
  }

  function literalText(
    node: ts.Expression | undefined,
    stack: Set<ts.Node>,
  ): string | undefined {
    if (node === undefined) return undefined;
    for (const value of values(node, stack)) {
      if (ts.isStringLiteralLike(value)) return value.text;
      if (ts.isTemplateExpression(value)) {
        let text = value.head.text;
        for (const span of value.templateSpans) {
          const expression = literalText(span.expression, stack);
          if (expression === undefined) return undefined;
          text += expression + span.literal.text;
        }
        return text;
      }
    }
    return undefined;
  }

  function propertyName(
    name: ts.PropertyName | undefined,
    stack: Set<ts.Node>,
  ): string | undefined {
    if (name === undefined) return undefined;
    if (ts.isComputedPropertyName(name))
      return literalText(name.expression, stack);
    return ts.isIdentifier(name) ||
      ts.isStringLiteralLike(name) ||
      ts.isNumericLiteral(name)
      ? name.text
      : undefined;
  }

  function isComposer(callee: ts.Expression): boolean {
    if (ts.isPropertyAccessExpression(callee)) {
      const namespace = ts.isIdentifier(callee.expression)
        ? binding(callee.expression)
        : undefined;
      return (
        ts.isIdentifier(callee.expression) &&
        composerNamespaces.has(callee.expression.text) &&
        namespace?.scope !== undefined &&
        ts.isSourceFile(namespace.scope) &&
        (callee.name.text === "default" || COMPOSERS.has(callee.name.text))
      );
    }
    if (!ts.isIdentifier(callee)) return false;
    const resolved = binding(callee);
    if (!resolved.found)
      return COMPOSERS.has(callee.text) || composerAliases.has(callee.text);
    if (
      composerAliases.has(callee.text) &&
      resolved.scope !== undefined &&
      ts.isSourceFile(resolved.scope)
    )
      return true;
    const initializer = resolved.initializer;
    return initializer !== null && ts.isIdentifier(initializer)
      ? isComposer(initializer)
      : false;
  }

  function isRecipeFactory(callee: ts.Expression): boolean {
    if (!ts.isIdentifier(callee)) return false;
    const resolved = binding(callee);
    if (!resolved.found) return callee.text === "cva";
    return (
      recipeAliases.has(callee.text) &&
      resolved.scope !== undefined &&
      ts.isSourceFile(resolved.scope)
    );
  }

  /* ---- class-list collection --------------------------------------- */

  function collect(
    node: ts.Expression,
    out: Fragment[],
    stack: Set<ts.Node>,
  ): void {
    for (const value of values(node, stack)) collectValue(value, out, stack);
  }

  function collectValue(
    value: ts.Expression,
    out: Fragment[],
    stack: Set<ts.Node>,
  ): void {
    if (ts.isStringLiteralLike(value)) {
      out.push({ node: value, text: value.text });
    } else if (ts.isTemplateExpression(value)) {
      out.push({ node: value.head, text: value.head.text });
      for (const span of value.templateSpans) {
        collect(span.expression, out, stack);
        out.push({ node: span.literal, text: span.literal.text });
      }
    } else if (ts.isArrayLiteralExpression(value)) {
      for (const element of value.elements) collect(element, out, stack);
    } else if (ts.isObjectLiteralExpression(value)) {
      /* A `cn`/`clsx` map states its class names as keys. */
      for (const member of value.properties) {
        if (ts.isSpreadAssignment(member)) {
          collect(member.expression, out, stack);
          continue;
        }
        const key = propertyName(member.name, stack);
        if (key !== undefined && member.name !== undefined) {
          out.push({ node: member.name, text: key });
        }
      }
    } else if (ts.isCallExpression(value) && isComposer(value.expression)) {
      for (const argument of value.arguments) collect(argument, out, stack);
    }
    /* Anything else — an unrecognised call, a JSX element, a number — is not
     * a statically known class list and contributes nothing. */
  }

  /** Class-bearing values of a `cva` definition, minus its selector keys. */
  function collectRecipe(
    node: ts.Expression,
    out: Fragment[],
    stack: Set<ts.Node>,
  ): void {
    for (const value of values(node, stack)) {
      if (ts.isArrayLiteralExpression(value)) {
        for (const element of value.elements) {
          collectRecipe(element, out, stack);
        }
        continue;
      }
      if (!ts.isObjectLiteralExpression(value)) {
        collectValue(value, out, stack);
        continue;
      }
      for (const member of value.properties) {
        if (ts.isSpreadAssignment(member)) {
          collectRecipe(member.expression, out, stack);
          continue;
        }
        const key = propertyName(member.name, stack);
        const child = ts.isPropertyAssignment(member)
          ? member.initializer
          : ts.isShorthandPropertyAssignment(member)
            ? member.name
            : undefined;
        if (child === undefined || key === "defaultVariants") continue;
        if (key === "compoundVariants") collectCompound(child, out, stack);
        else collectRecipe(child, out, stack);
      }
    }
  }

  /** Compound variants mix selector keys with `class`/`className` values. */
  function collectCompound(
    node: ts.Expression,
    out: Fragment[],
    stack: Set<ts.Node>,
  ): void {
    for (const value of values(node, stack)) {
      if (ts.isArrayLiteralExpression(value)) {
        for (const element of value.elements) {
          collectCompound(element, out, stack);
        }
        continue;
      }
      if (!ts.isObjectLiteralExpression(value)) continue;
      for (const member of value.properties) {
        if (ts.isSpreadAssignment(member)) {
          collectCompound(member.expression, out, stack);
          continue;
        }
        const key = propertyName(member.name, stack);
        if (key !== "class" && key !== "className") continue;
        if (ts.isPropertyAssignment(member)) {
          collect(member.initializer, out, stack);
        } else if (ts.isShorthandPropertyAssignment(member)) {
          collect(member.name, out, stack);
        }
      }
    }
  }

  function record(root: ts.Node, collector: (out: Fragment[]) => void): void {
    const out: Fragment[] = [];
    collector(out);
    for (const fragment of out) authored.set(fragment.node, fragment.text);
    const classes = out
      .map((fragment) => fragment.text)
      .join(" ")
      .trim();
    if (classes.length === 0) return;
    sites.push({
      file: fileName,
      line: file.getLineAndCharacterOfPosition(root.getStart(file)).line + 1,
      classes,
    });
  }

  function location(node: ts.Node): { line: number; column: number } {
    const position = file.getLineAndCharacterOfPosition(node.getStart(file));
    return { line: position.line + 1, column: position.character + 1 };
  }

  /* ---- roots -------------------------------------------------------- */

  function indexComposerImports(node: ts.Node): void {
    if (ts.isImportDeclaration(node) && node.importClause !== undefined) {
      const source = ts.isStringLiteralLike(node.moduleSpecifier)
        ? node.moduleSpecifier.text
        : "";
      const composerModule =
        source === "clsx" ||
        source === "classnames" ||
        source === "tailwind-merge" ||
        source === "@/lib/cn";
      if (composerModule && node.importClause.name !== undefined) {
        composerAliases.add(node.importClause.name.text);
      }
      const named = node.importClause.namedBindings;
      if (named !== undefined && ts.isNamedImports(named)) {
        for (const element of named.elements) {
          const original = (element.propertyName ?? element.name).text;
          if (composerModule && COMPOSERS.has(original)) {
            composerAliases.add(element.name.text);
          }
          if (source === "class-variance-authority" && original === "cva") {
            recipeAliases.add(element.name.text);
          }
        }
      } else if (
        composerModule &&
        named !== undefined &&
        ts.isNamespaceImport(named)
      ) {
        composerNamespaces.add(named.name.text);
      }
    }
    ts.forEachChild(node, indexComposerImports);
  }

  function visit(node: ts.Node): void {
    if (
      ts.isJsxAttribute(node) &&
      ts.isIdentifier(node.name) &&
      node.name.text === "className" &&
      node.initializer !== undefined
    ) {
      const initializer = node.initializer;
      record(node, (out) => {
        if (ts.isStringLiteralLike(initializer)) {
          out.push({ node: initializer, text: initializer.text });
        } else if (
          ts.isJsxExpression(initializer) &&
          initializer.expression !== undefined
        ) {
          collect(initializer.expression, out, new Set());
        }
      });
    } else if (ts.isJsxSpreadAttribute(node)) {
      record(node, (out) => {
        const stack = new Set<ts.Node>();
        for (const value of properties(node.expression, "className", stack)) {
          collectValue(value, out, stack);
        }
      });
    } else if (ts.isCallExpression(node) && isRecipeFactory(node.expression)) {
      record(node, (out) => {
        for (const argument of node.arguments) {
          collectRecipe(argument, out, new Set());
        }
      });
      return;
    } else if (
      isPresentationModule &&
      ts.isVariableDeclaration(node) &&
      node.initializer !== undefined &&
      isExported(node)
    ) {
      const initializer = node.initializer;
      record(node, (out) => collect(initializer, out, new Set()));
      return;
    }

    ts.forEachChild(node, visit);
  }

  function isExported(node: ts.VariableDeclaration): boolean {
    const statement = node.parent.parent;
    return (
      ts.isVariableStatement(statement) &&
      statement.modifiers?.some(
        (modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword,
      ) === true
    );
  }

  indexComposerImports(file);
  visit(file);

  return {
    sites,
    literals: [...authored].map(([node, classes]) => ({
      file: fileName,
      ...location(node),
      classes,
    })),
  };
}

/** Every class-list owner call site, shared constants counted once per use. */
/**
 * The standard utility that already expresses an arbitrary value, when one
 * exists. The spec allows arbitrary values only where no token or standard
 * utility can say the same thing, so anything this names must be replaced.
 */
export function standardEquivalent(value: string): string | undefined {
  const bracket = value.indexOf("[");
  const prefix = value.slice(0, bracket).replace(/-$/, "");
  const inner = value.slice(bracket + 1, value.lastIndexOf("]"));

  const cssVariable = /^var\((--[\w-]+)\)$/.exec(inner);
  if (cssVariable?.[1] !== undefined) {
    return `${prefix}-(${cssVariable[1]})`;
  }

  const percentage = /^(\d+)%$/.exec(inner);
  if (
    percentage?.[1] !== undefined &&
    /^-?(?:translate-[xy]|top|right|bottom|left|inset(?:-[xy])?)$/.test(prefix)
  ) {
    const numerator = Number(percentage[1]);
    let divisor = numerator;
    let remainder = 100;
    while (remainder !== 0) {
      [divisor, remainder] = [remainder, divisor % remainder];
    }
    return `${prefix}-${numerator / divisor}/${100 / divisor}`;
  }

  if (
    /^(?:#[0-9a-fA-F]{3,8}|(?:rgba?|hsla?|oklch|oklab|lab|lch|color)\(.*\))$/.test(
      inner,
    )
  ) {
    return `a semantic @theme colour instead of ${value}`;
  }
  /* `bg-black/[0.88]` — an opacity modifier Tailwind takes as a percentage. */
  const opacity = /^\/\[(0?\.\d+|1(?:\.0+)?)\]$/.exec(
    value.slice(value.indexOf("/")),
  );
  if (value.includes("/[") && opacity?.[1] !== undefined) {
    const percent = Number(opacity[1]) * 100;
    if (Number.isInteger(percent)) {
      return `${value.slice(0, value.indexOf("/"))}/${percent}`;
    }
  }
  if (
    /^(?:opacity|saturate|brightness|contrast|grayscale|sepia|invert)$/.test(
      prefix,
    )
  ) {
    const percent = Number(inner) * 100;
    if (/^0?\.\d+$/.test(inner) && Number.isInteger(percent)) {
      return `${prefix}-${percent}`;
    }
  }
  if (prefix === "duration" || prefix === "delay") {
    const milliseconds = /^(\d+)ms$/.exec(inner);
    if (milliseconds !== null) return `${prefix}-${milliseconds[1]}`;
  }
  if (
    /^(?:z|order|opacity|saturate|line-clamp)$/.test(prefix) &&
    /^\d+$/.test(inner)
  ) {
    return `${prefix}-${inner}`;
  }
  /* Widths and offsets whose bare number Tailwind already reads as pixels. */
  if (
    /^(?:outline|outline-offset|underline-offset|ring|ring-offset|border(?:-[trblxyse])?)$/.test(
      prefix,
    ) &&
    /^\d+px$/.test(inner)
  ) {
    return `${prefix}-${inner.slice(0, -2)}`;
  }
  if (value === "rounded-[50%]") return "rounded-full";
  if (value === "text-[16px]") return "text-base";

  /* Tailwind v4 accepts numeric spacing values in quarter-rem units. */
  if (
    /^-?(?:[mp](?:[trblxyse])?|gap(?:-[xy])?|(?:min-|max-)?[wh]|size|top|right|bottom|left|inset(?:-[xy])?|translate(?:-[xy])?)$/.test(
      prefix,
    )
  ) {
    const pixels = /^(-?\d+(?:\.\d+)?)px$/.exec(inner);
    if (pixels !== null) {
      const scaled = Number(pixels[1]) / 4;
      if (Number.isFinite(scaled)) return `${prefix}-${scaled}`;
    }
  }
  return undefined;
}

export function classNameSites(
  source: string,
  fileName = "presentation-owner.tsx",
): ClassSite[] {
  return extract(source, fileName).sites;
}

/** Every authored class-list literal, counted once however often it is used. */
export function classNameLiterals(
  source: string,
  fileName = "presentation-owner.tsx",
): ClassLiteral[] {
  return extract(source, fileName).literals;
}

export function classNameSource(
  source: string,
  fileName = "presentation-owner.tsx",
): string {
  return classNameSites(source, fileName)
    .map((site) => site.classes)
    .join("\n");
}
