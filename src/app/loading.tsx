/** Loading state with the accepted system-state geometry. */
export default function Loading() {
  return (
    <div className="grid min-h-[60svh] place-items-center bg-surface-subtle px-page-gutter py-[clamp(60px,10vw,140px)] text-center">
      <div className="max-w-[560px]">
        <p
          className="mb-[14px] font-field-meta text-[11px] leading-[1.3] font-medium text-signal-strong tracking-field-meta uppercase"
          role="status"
        >
          Forward field report / Loading…
        </p>
      </div>
    </div>
  );
}
