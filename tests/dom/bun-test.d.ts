/**
 * Minimal ambient types for the Bun test APIs the DOM suite uses.
 *
 * The full `@types/bun` package redeclares global `fetch`, which conflicts
 * with the `typeof fetch` doubles the existing adapter and security tests
 * already rely on. Only the surface actually imported here is declared, so
 * `bun run typecheck` stays honest for the whole repository.
 */

declare module "bun:test" {
  type TestFn = () => void | Promise<void>;

  export function describe(label: string, fn: () => void): void;
  export function it(label: string, fn: TestFn): void;
  export function test(label: string, fn: TestFn): void;
  export function beforeEach(fn: TestFn): void;
  export function afterEach(fn: TestFn): void;
  export function beforeAll(fn: TestFn): void;
  export function afterAll(fn: TestFn): void;

  export const mock: {
    module(specifier: string, factory: () => unknown): void;
  };

  export const jest: {
    useFakeTimers(): void;
    useRealTimers(): void;
    advanceTimersByTime(milliseconds: number): void;
  };
}
