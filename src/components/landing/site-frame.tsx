/**
 * SiteFrame — fixed top/left/right rails with rounded inner corners.
 * Matches the rbp-portfolio site-frame design.
 */
export function SiteFrame() {
  return (
    <>
      {/* Rails */}
      <span className="site-frame site-frame--top" aria-hidden="true" />
      <span className="site-frame site-frame--left" aria-hidden="true" />
      <span className="site-frame site-frame--right" aria-hidden="true" />
      {/* Corner cutouts */}
      <span className="site-corner site-corner--top-left" aria-hidden="true">
        <CornerSVG />
      </span>
      <span className="site-corner site-corner--top-right" aria-hidden="true">
        <CornerSVG />
      </span>
    </>
  );
}

function CornerSVG() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M20 0 Q0 0 0 20 L0 0 Z" fill="currentColor" />
    </svg>
  );
}
