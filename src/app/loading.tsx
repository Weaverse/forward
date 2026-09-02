import { emptyState, eyebrow } from "@/lib/presentation/variants";

/** Loading state with the accepted system-state geometry. */
export default function Loading() {
  return (
    <div className={emptyState({ size: "page" })}>
      <div className="max-w-[560px]">
        <p className={eyebrow()} role="status">
          Forward field report / Loading…
        </p>
      </div>
    </div>
  );
}
