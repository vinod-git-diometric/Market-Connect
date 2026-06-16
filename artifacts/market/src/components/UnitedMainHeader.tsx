export default function UnitedMainHeader() {
  return (
    <header
      style={{ background: "hsl(30 55% 7%)" }}
      className="w-full border-b-2 border-b-[hsl(43_82%_50%)]"
    >
      <div className="flex items-center justify-between px-5 py-2.5 max-w-screen-xl mx-auto">
        <a
          href="https://unitedmain.com"
          className="flex items-center gap-2 group"
          aria-label="Return to United Main"
        >
          <span
            style={{ color: "hsl(43 82% 52%)" }}
            className="font-serif italic text-base leading-none tracking-wide group-hover:opacity-80 transition-opacity"
          >
            United Main
          </span>
          <span
            style={{ color: "hsl(40 20% 55%)" }}
            className="text-[10px] font-sans uppercase tracking-[0.18em] leading-none hidden sm:inline"
          >
            Stoneham Farmers Market
          </span>
        </a>

        <a
          href="https://unitedmain.com"
          style={{ color: "hsl(40 15% 62%)" }}
          className="text-[11px] font-sans tracking-widest uppercase hover:text-[hsl(43_82%_52%)] transition-colors flex items-center gap-1"
        >
          unitedmain.com <span aria-hidden>↗</span>
        </a>
      </div>
    </header>
  );
}
