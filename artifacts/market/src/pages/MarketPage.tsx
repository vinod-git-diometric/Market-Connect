import { useState, useRef } from "react";
import { Link } from "wouter";
import { motion, useInView } from "framer-motion";
import { useGetMarketPage } from "@workspace/api-client-react";
import type { Vendor, Product } from "@workspace/api-client-react";
import ReservationDrawer from "@/components/ReservationDrawer";
import UnitedMainHeader from "@/components/UnitedMainHeader";

import heroImg from "@/assets/hero-market-real.jpg";
import belliniImg from "@/assets/bellini-logo.png";
import delsurImg from "@/assets/vendor-delsur.png";
import honeybeeImg from "@/assets/vendor-honeybee.png";
import craveImg from "@/assets/crave-logo.jpeg";
import spiceweaselImg from "@/assets/vendor-spiceweasel.png";
import riverdaleImg from "@/assets/vendor-riverdale-real.jpg";
import teresaImg from "@/assets/vendor-teresa.png";
import aaronapImg from "@/assets/vendor-aaronap.png";

import riverdaleProductTomatoes from "@/assets/riverdale-tomatoes.jpg";
import riverdaleProductBlueberries from "@/assets/riverdale-blueberries.jpg";
import riverdaleProductPeppers from "@/assets/riverdale-peppers.jpg";
import riverdaleProductEggplant from "@/assets/riverdale-eggplant.jpg";
import riverdaleProductApples from "@/assets/riverdale-apples.jpg";
import craveProductWaffle from "@/assets/crave-waffle-pistachio.jpeg";
import craveProductPancakes from "@/assets/crave-pancakes.jpeg";
import craveProductMocktail from "@/assets/crave-mocktail.jpeg";

const productImages: Record<number, string> = {
  19: riverdaleProductPeppers,
  20: riverdaleProductEggplant,
  22: craveProductWaffle,
  23: craveProductPancakes,
  25: craveProductMocktail,
};

const vendorImages: Record<string, string> = {
  "Bellini Baking Co.": belliniImg,
  "Del Sur Empanadas": delsurImg,
  "Wilmington Honey Bee": honeybeeImg,
  "Crave Creations": craveImg,
  "Spice Weasel Sauce": spiceweaselImg,
  "Riverdale Farm": riverdaleImg,
  "Teresa's Farm": teresaImg,
  "Aaronap Cellars": aaronapImg,
};

function getVendorImage(vendor: Vendor): string | undefined {
  if (vendor.imageUrl) return vendor.imageUrl;
  return vendorImages[vendor.name];
}

function FadeInSection({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

function ProductCard({
  product,
  launchMode,
  vendorName,
  onReserve,
}: {
  product: Product;
  launchMode: string;
  vendorName: string;
  onReserve: (product: Product) => void;
}) {
  const showReserve = launchMode === "reserve_for_pickup" && product.reservationAllowed;
  const image = product.imageUrl || productImages[product.id];

  return (
    <div
      className="border border-border rounded-[4px] bg-card overflow-hidden flex flex-row transition-all hover:border-primary hover:shadow-[4px_4px_0_hsl(var(--accent))]"
      data-testid={`product-card-${product.id}`}
    >
      <div className="p-4 flex flex-col gap-2 flex-1 min-w-0">
        <div className="flex-1 min-w-0">
          <p className="font-serif font-semibold text-base text-foreground leading-snug">{product.name}</p>
          {product.price && (
            <p className="text-xs text-accent font-semibold mt-0.5">{product.price}</p>
          )}
        </div>
        {product.description && (
          <p className="text-xs text-muted-foreground leading-relaxed">{product.description}</p>
        )}
        {product.allergenNote && (
          <p className="text-[11px] text-muted-foreground/70 italic">{product.allergenNote}</p>
        )}
        {showReserve && (
          <button
            onClick={() => onReserve(product)}
            data-testid={`reserve-btn-${product.id}`}
            aria-label={`Reserve ${product.name} from ${vendorName}`}
            className="mt-1 text-xs font-sans font-semibold border border-primary text-primary rounded-[4px] px-3 min-h-[44px] hover:bg-primary hover:text-primary-foreground transition-colors self-start uppercase tracking-wide"
          >
            Reserve for pickup
          </button>
        )}
      </div>
      {image && (
        <div className="w-28 shrink-0 self-stretch overflow-hidden">
          <img src={image} alt={product.name} className="w-full h-full object-cover" />
        </div>
      )}
    </div>
  );
}

function VendorSection({
  vendor,
  index,
  onReserve,
}: {
  vendor: Vendor;
  index: number;
  onReserve: (product: Product, vendor: Vendor) => void;
}) {
  const image = getVendorImage(vendor);
  const isEven = index % 2 === 0;
  const isProfileOnly = vendor.launchMode === "profile_only";
  const liveProducts = vendor.products.filter((p) => p.status === "live");

  return (
    <FadeInSection delay={0.05}>
      <section
        data-testid={`vendor-section-${vendor.id}`}
        className={`border-t border-border py-10 md:py-14 ${isEven ? "bg-background" : "bg-muted/40"}`}
      >
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          {/* At lg+: image and content side by side, alternating direction */}
          <div className={`lg:flex lg:gap-10 xl:gap-14 lg:items-start ${image && !isEven ? "lg:flex-row-reverse" : ""}`}>

            {/* Image column */}
            {image && (
              <div className="w-full lg:w-[38%] xl:w-[36%] flex-shrink-0 mb-6 lg:mb-0">
                <div className="w-full aspect-[16/7] lg:aspect-[4/3] overflow-hidden rounded-[4px]">
                  <img
                    src={image}
                    alt={vendor.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}

            {/* Content column */}
            <div className={image ? "lg:flex-1 min-w-0" : "max-w-2xl lg:max-w-none"}>
              <div className="flex flex-col gap-1 mb-2">
                {vendor.location && (
                  <p className="text-[11px] font-sans uppercase tracking-widest text-primary">
                    {vendor.location}
                  </p>
                )}
                <h2 className="font-display font-bold uppercase text-3xl md:text-4xl tracking-tight text-accent leading-[0.9]">
                  {vendor.name}
                </h2>
              </div>

              <div className="flex flex-wrap items-center gap-4 mb-5">
                <Link
                  href={`/vendors/${vendor.id}`}
                  data-testid={`vendor-page-link-${vendor.id}`}
                  className="text-[11px] font-sans font-semibold uppercase tracking-widest text-primary border border-primary rounded-[4px] px-3 py-1.5 hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  View full page
                </Link>
                {vendor.website && (
                  <a
                    href={vendor.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] font-sans uppercase tracking-widest text-accent hover:underline"
                  >
                    Website
                  </a>
                )}
                {vendor.instagram && (
                  <a
                    href={`https://instagram.com/${vendor.instagram.replace("@", "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] font-sans uppercase tracking-widest text-accent hover:underline"
                  >
                    Instagram
                  </a>
                )}
              </div>

              {vendor.description && (
                <p className="font-serif text-base text-muted-foreground leading-relaxed mb-5 max-w-2xl">{vendor.description}</p>
              )}

              {isProfileOnly ? (
                <p className="font-serif text-base text-muted-foreground/80 italic border-l-2 border-primary pl-3">
                  This vendor is still stocking their digital table. Check back soon.
                </p>
              ) : liveProducts.length > 0 ? (
                <>
                  {/* 2-column product grid at md+ */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3" data-testid={`vendor-products-${vendor.id}`}>
                    {liveProducts.slice(0, 3).map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        launchMode={vendor.launchMode}
                        vendorName={vendor.name}
                        onReserve={(p) => onReserve(p, vendor)}
                      />
                    ))}
                  </div>
                  {liveProducts.length > 3 && (
                  <Link
                      href={`/vendors/${vendor.id}`}
                      className="mt-4 inline-block text-xs font-sans font-semibold uppercase tracking-wide text-accent hover:underline underline-offset-2"
                    >
                      See everything {vendor.name} is bringing →
                    </Link>
                  )}
                </>
              ) : null}

              {vendor.pickupInstructions && vendor.launchMode === "reserve_for_pickup" && (
                <p className="mt-4 text-[11px] text-muted-foreground/70 italic">
                  Pickup: {vendor.pickupInstructions}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>
    </FadeInSection>
  );
}

const MARKET_OPEN_HOUR = 14.5;  // 2:30pm
const MARKET_CLOSE_HOUR = 18.5; // 6:30pm
const DIRECTIONS_URL = "https://maps.google.com/?q=340+Main+St,+Stoneham,+MA+02180";

function getMarketStatus(nextMarketDate: string): string {
  if (!nextMarketDate) return "";

  // Parse "Month Day" style strings into a Date (current year assumed)
  const parsed = new Date(`${nextMarketDate} ${new Date().getFullYear()}`);
  if (isNaN(parsed.getTime())) return `Next market: ${nextMarketDate} · 2:30–6:30pm`;

  const now = new Date();
  const nowHour = now.getHours() + now.getMinutes() / 60;

  // Check if today is market day
  const isMarketDay =
    parsed.getFullYear() === now.getFullYear() &&
    parsed.getMonth() === now.getMonth() &&
    parsed.getDate() === now.getDate();

  if (isMarketDay && nowHour >= MARKET_OPEN_HOUR && nowHour < MARKET_CLOSE_HOUR) {
    return "Happening now · Open until 6:30";
  }

  // Check if market is tomorrow
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const isTomorrow =
    parsed.getFullYear() === tomorrow.getFullYear() &&
    parsed.getMonth() === tomorrow.getMonth() &&
    parsed.getDate() === tomorrow.getDate();

  if (isTomorrow) {
    return "Tomorrow · 2:30–6:30pm";
  }

  return `Next market: ${nextMarketDate} · 2:30–6:30pm`;
}

function HeroSection({ nextMarketDate }: { nextMarketDate: string }) {
  const marketStatus = getMarketStatus(nextMarketDate);
  const isHappeningNow = marketStatus.startsWith("Happening now");

  return (
    <section
      data-testid="hero-section"
      className="border-b border-border bg-background overflow-hidden"
    >
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 min-h-[560px]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="px-5 sm:px-8 lg:px-12 xl:px-16 py-12 md:py-16 lg:py-20 flex flex-col justify-center"
        >
          <p className="text-[11px] font-sans font-semibold uppercase tracking-[0.2em] text-primary mb-3">
            Community and connection
          </p>
          <p className="text-[11px] font-sans font-semibold uppercase tracking-[0.22em] text-accent mb-5">
            FARMERS MARKET TO-GO!
          </p>
          <h1 className="font-display font-extrabold uppercase text-[clamp(3.35rem,8vw,7rem)] leading-[0.77] tracking-[-0.045em] text-accent">
            Stoneham
            <span className="block text-primary">Farmers<br />Market</span>
          </h1>
          <div className="w-24 h-1 bg-accent mt-7 mb-5" />
          <p className="font-serif text-xl md:text-2xl leading-tight text-foreground max-w-md">
            Real food. Real neighbors. Everything worth bringing home on Thursday.
          </p>
          <p className="font-script text-3xl md:text-4xl leading-none text-primary mt-6 -rotate-1">
            See it. Reserve it. Pick it up.
          </p>
          <div className="flex flex-wrap gap-3 mt-7">
            <a
              href="#vendors"
              data-testid="hero-cta"
              className="inline-flex items-center justify-center px-5 py-3 bg-primary text-primary-foreground font-sans text-xs font-semibold uppercase tracking-widest rounded-[4px] hover:bg-accent transition-colors"
            >
              Shop this week
            </a>
            <a
              href="#how-it-works"
              className="inline-flex items-center justify-center px-5 py-3 border border-primary text-primary font-sans text-xs font-semibold uppercase tracking-widest rounded-[4px] hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              How pickup works
            </a>
          </div>
          <div className="flex items-center gap-4 mt-9">
            <span className="font-display font-bold text-4xl leading-none text-accent uppercase">Thu</span>
            <div className="border-l border-border pl-4 text-sm leading-relaxed text-foreground">
              {marketStatus && (
                <p className={`font-sans font-semibold ${isHappeningNow ? "text-accent" : "text-foreground"}`}>
                  {marketStatus}
                </p>
              )}
              <p>
                Stoneham Town Common · 340 Main St ·{" "}
                <a
                  href={DIRECTIONS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline underline-offset-2 hover:text-accent transition-colors"
                >
                  Get directions
                </a>
              </p>
            </div>
          </div>
        </motion.div>
        <div className="relative min-h-[340px] lg:min-h-full overflow-hidden order-first lg:order-last">
          <img
            src={heroImg}
            alt="Fresh produce at the Stoneham Farmers Market"
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
          <div className="absolute inset-x-5 bottom-5 sm:inset-x-8 lg:inset-x-10 lg:bottom-10 bg-card border-2 border-primary px-4 py-3 max-w-xs -rotate-1">
            <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
              Fresh from nearby
            </p>
            <p className="font-script text-2xl leading-tight text-accent">
              Farmers to-go
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function WeekHighlightsSection({ vendors }: { vendors: Vendor[] }) {
  const featuredVendors = vendors;
  if (featuredVendors.length === 0) return null;

  return (
    <FadeInSection>
      <section className="py-8 px-5 border-t border-border bg-card/50">
        <div className="max-w-7xl mx-auto">
          <p className="text-[11px] font-sans font-semibold uppercase tracking-widest text-primary mb-3">
            This week at the market
          </p>
          <div className="flex flex-wrap gap-2">
            {featuredVendors.map((v) => (
              <Link
                key={v.id}
                href={`/vendors/${v.id}`}
                data-testid={`vendor-chip-link-${v.id}`}
                className="cursor-pointer text-xs font-sans font-semibold border border-primary rounded-[4px] px-3 py-1 text-primary bg-background underline-offset-2 hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                {v.name}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </FadeInSection>
  );
}

function TrustSection() {
  return (
    <FadeInSection>
      <section
        data-testid="trust-section"
        id="how-it-works"
        className="border-t-4 border-[hsl(43_82%_50%)] py-14 md:py-16 px-5 bg-accent text-accent-foreground"
      >
        <div className="max-w-7xl mx-auto">
          <p className="text-[11px] font-sans font-semibold uppercase tracking-widest text-[hsl(43_82%_72%)] mb-3">
            No lines. No guesswork.
          </p>
          <h3 className="font-display font-bold uppercase text-4xl md:text-6xl tracking-tight leading-[0.85] mb-8">
            Reserve your<br />Thursday.
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            {[
              {
                step: "01",
                title: "Reserve online",
                body: "Tell us what you want. Your spot is held until 5:45pm — no payment needed now.",
              },
              {
                step: "02",
                title: "Get a confirmation",
                body: "You'll receive an email with your reservation code to show at the booth.",
              },
              {
                step: "03",
                title: "Pay the vendor directly",
                body: "Payment happens at the booth during market hours — cash, card, Venmo, or however the vendor prefers.",
              },
            ].map((item) => (
              <div key={item.step} className="flex flex-col gap-2 border-t border-accent-foreground/50 pt-4">
                <p className="font-display text-5xl font-bold text-[hsl(43_82%_72%)] leading-none">{item.step}</p>
                <p className="font-serif font-semibold text-xl text-accent-foreground">{item.title}</p>
                <p className="text-sm text-accent-foreground/85 leading-relaxed max-w-xs">{item.body}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-accent-foreground/75 mt-10 italic">
            This is a pilot program by United Main. Reservations are confirmed by email and held until 5:45pm. Unclaimed reservations may be released after that time.
          </p>
        </div>
      </section>
    </FadeInSection>
  );
}

function SkeletonHero() {
  return (
    <section className="min-h-[60vh] flex items-center justify-center px-5">
      <div className="flex flex-col items-center gap-3 w-full max-w-sm">
        <div className="h-4 w-24 bg-muted rounded animate-pulse" />
        <div className="h-10 w-64 bg-muted rounded animate-pulse" />
        <div className="h-3 w-48 bg-muted rounded animate-pulse" />
        <div className="h-3 w-40 bg-muted rounded animate-pulse" />
      </div>
    </section>
  );
}

export default function MarketPage() {
  const { data, isLoading, isError } = useGetMarketPage();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  function handleReserve(product: Product, vendor: Vendor) {
    setSelectedProduct(product);
    setSelectedVendor(vendor);
    setDrawerOpen(true);
  }

  if (isLoading) return <SkeletonHero />;

  if (isError || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center px-5">
        <div className="text-center max-w-sm">
          <p className="font-serif text-xl italic text-foreground mb-2">
            Market data unavailable
          </p>
          <p className="text-sm text-muted-foreground">
            We couldn't load the market page right now. Please try again shortly.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" data-testid="market-page">
      <UnitedMainHeader />
      <HeroSection nextMarketDate={data.nextMarketDate} />
      <WeekHighlightsSection vendors={data.vendors} />

      <div className="lg:flex lg:items-start">
        {/* Sticky vendor index sidebar — visible at lg+ only */}
        <aside className="hidden lg:block lg:w-44 xl:w-52 flex-shrink-0 sticky top-0 self-start max-h-screen overflow-y-auto py-10 px-6 border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
          <p className="text-[10px] font-sans font-semibold uppercase tracking-widest text-[hsl(43_82%_72%)] mb-3">
            This week
          </p>
          <nav className="flex flex-col gap-0.5">
            {data.vendors.map((v) => (
              <a
                key={v.id}
                href={`#vendor-${v.id}`}
                className="text-xs font-sans text-sidebar-foreground/75 hover:text-sidebar-foreground py-1.5 transition-colors leading-snug"
              >
                {v.name}
              </a>
            ))}
          </nav>
        </aside>

        {/* Vendor sections */}
        <div id="vendors" className="flex-1 min-w-0">
          {data.vendors.map((vendor, index) => (
            <div key={vendor.id} id={`vendor-${vendor.id}`}>
              <VendorSection
                vendor={vendor}
                index={index}
                onReserve={handleReserve}
              />
            </div>
          ))}
        </div>
      </div>

      {data.vendors.length === 0 && (
          <section className="py-16 px-5 text-center bg-background">
            <p className="font-serif text-xl italic text-muted-foreground">
            Vendors are getting ready for market day.
          </p>
          <p className="text-sm text-muted-foreground mt-2">Check back soon.</p>
        </section>
      )}

      <TrustSection />

      <footer className="border-t-2 border-[hsl(43_82%_50%)] py-10 px-5 bg-[hsl(30_55%_7%)] text-[hsl(42_60%_96%)] text-center flex flex-col items-center gap-3">
        <Link
          href="/join"
          className="text-[11px] font-sans text-[hsl(42_60%_96%)] hover:text-[hsl(43_82%_60%)] transition-colors uppercase tracking-widest"
        >
          Interested in vending? Apply here →
        </Link>
        <a
          href="https://unitedmain.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[11px] font-sans text-[hsl(40_20%_60%)] uppercase tracking-widest hover:text-[hsl(43_82%_60%)] transition-colors"
        >
          A United Main pilot &mdash; Stoneham, MA
        </a>
      </footer>

      <ReservationDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        product={selectedProduct}
        vendor={selectedVendor}
        marketDate={data?.nextMarketDate}
      />
    </div>
  );
}
