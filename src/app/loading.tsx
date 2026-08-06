/**
 * Loading state. The canonical POC has no loading render function, so this
 * uses the canonical tokens and system-state geometry rather than a new art
 * direction.
 */
export default function Loading() {
  return (
    <div className="system-state">
      <div className="system-state-inner">
        <p className="eyebrow" role="status">
          Forward field report / Loading…
        </p>
      </div>
    </div>
  );
}
