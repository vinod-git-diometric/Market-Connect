import { useState, useRef } from "react";
import { Link } from "wouter";
import { motion, useInView } from "framer-motion";
import { useGetMarketPage } from "@workspace/api-client-react";
import type { Vendor, Product } from "@workspace/api-client-react";
import ReservationDrawer from "@/components/ReservationDrawer";

import belliniImg from "@/assets/vendor-bellini.png";
import delsurImg from "@/assets/vendor-delsur.png";
import honeybeeImg from "@/assets/vendor-honeybee.png";
import craveImg from "@/assets/vendor-crave.png";
import spiceweaselImg from "@/assets/vendor-spiceweasel.png";
import riverdaleImg from "@/assets/vendor-riverdale.png";
import teresaImg from "@/assets/vendor-teresa.png";
import aaronapImg from "@/assets/vendor-aaronap.png";

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
  onReserve,
}: {
  product: Product;
  launchMode: string;
  onReserve: (product: Product) => void;
}) {
  const showReserve = launchMode === "reserve_for_pickup" && product.reservationAllowed;

  return (
    <div
      className="border border-border rounded-[4px] bg-card p-4 flex flex-col gap-2"
      data-testid={`product-card-${product.id}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="font-sans font-medium text-sm text-foreground leading-snug">{product.name}</p>
          {product.price && (
            <p className="text-xs text-muted-foreground mt-0.5">{product.price}</p>
          )}
        </div>
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
          className="mt-1 text-xs font-sans font-medium border border-primary text-primary rounded-[4px] px-3 py-1.5 hover:bg-primary hover:text-primary-foreground transition-colors self-start"
        >
          Reserve for pickup
        </button>
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
        className={`border-t border-border py-10 md:py-14 ${isEven ? "" : "bg-muted/40"}`}
      >
        <div className="max-w-2xl mx-auto px-5">
          {image && (
            <div className="w-full aspect-[16/7] overflow-hidden rounded-[4px] mb-6">
              <img
                src={image}
                alt={vendor.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="flex flex-col gap-1 mb-4">
            {vendor.location && (
              <p className="text-[11px] font-sans uppercase tracking-widest text-muted-foreground">
                {vendor.location}
              </p>
            )}
            <h2 className="font-serif text-2xl md:text-3xl italic text-foreground leading-tight">
              {vendor.name}
            </h2>
          </div>

          {vendor.description && (
            <p className="text-sm text-muted-foreground leading-relaxed mb-5">{vendor.description}</p>
          )}

          {isProfileOnly ? (
            <p className="text-sm text-muted-foreground/60 italic border-l-2 border-border pl-3">
              This vendor is still stocking their digital table. Check back soon.
            </p>
          ) : liveProducts.length > 0 ? (
            <div className="flex flex-col gap-3" data-testid={`vendor-products-${vendor.id}`}>
              {liveProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  launchMode={vendor.launchMode}
                  onReserve={(p) => onReserve(p, vendor)}
                />
              ))}
            </div>
          ) : null}

          {vendor.pickupInstructions && vendor.launchMode === "reserve_for_pickup" && (
            <p className="mt-4 text-[11px] text-muted-foreground/70 italic">
              Pickup: {vendor.pickupInstructions}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-4 mt-5">
            <Link
              href={`/vendors/${vendor.id}`}
              data-testid={`vendor-page-link-${vendor.id}`}
              className="text-[11px] font-sans font-medium uppercase tracking-widest text-foreground border border-border rounded-[4px] px-3 py-1.5 hover:border-primary hover:text-primary transition-colors"
            >
              View full page
            </Link>
            {vendor.website && (
              <a
                href={vendor.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] font-sans uppercase tracking-widest text-primary hover:underline"
              >
                Website
              </a>
            )}
            {vendor.instagram && (
              <a
                href={`https://instagram.com/${vendor.instagram.replace("@", "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] font-sans uppercase tracking-widest text-primary hover:underline"
              >
                Instagram
              </a>
            )}
          </div>
        </div>
      </section>
    </FadeInSection>
  );
}

function HeroSection({ nextMarketDate }: { nextMarketDate: string }) {
  return (
    <section
      data-testid="hero-section"
      className="relative min-h-[42vh] md:min-h-[60vh] flex flex-col items-center justify-center px-5 pt-10 pb-7 md:pt-16 md:pb-12 text-center"
      style={{
        background:
          "radial-gradient(ellipse 80% 60% at 50% 0%, hsl(43 60% 30% / 0.25), transparent)",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-lg w-full"
      >
        <p className="text-[11px] font-sans uppercase tracking-widest text-primary mb-3">
          Stoneham, MA
        </p>
        <h1 className="font-serif text-3xl md:text-5xl italic leading-tight text-foreground mb-2 md:mb-3">
          The Stoneham<br />Farmers Market
        </h1>
        <div className="w-16 h-px bg-primary mx-auto my-3 md:my-4" />
        <p className="text-sm text-muted-foreground leading-relaxed mb-2">
          Real food. Real neighbors. Every Thursday afternoon.
        </p>
        {nextMarketDate && (
          <p className="text-sm font-sans font-medium text-foreground mt-1">
            Next market: {nextMarketDate}
          </p>
        )}
        <a
          href="#vendors"
          data-testid="hero-cta"
          className="inline-block mt-5 md:mt-8 px-6 py-2.5 bg-primary text-primary-foreground font-sans text-sm font-medium rounded-[4px] hover:opacity-90 transition-opacity tracking-wide"
        >
          Meet the vendors
        </a>
      </motion.div>
    </section>
  );
}

function WeekHighlightsSection({ vendors }: { vendors: Vendor[] }) {
  const featuredVendors = vendors;
  if (featuredVendors.length === 0) return null;

  return (
    <FadeInSection>
      <section className="py-8 px-5 border-t border-border">
        <div className="max-w-2xl mx-auto">
          <p className="text-[11px] font-sans uppercase tracking-widest text-muted-foreground mb-3">
            This week at the market
          </p>
          <div className="flex flex-wrap gap-2">
            {featuredVendors.map((v) => (
              <Link
                key={v.id}
                href={`/vendors/${v.id}`}
                data-testid={`vendor-chip-link-${v.id}`}
                className="cursor-pointer text-xs font-sans border border-primary/40 rounded-[4px] px-3 py-1 text-primary underline-offset-2 hover:underline hover:border-primary transition-colors"
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
        className="border-t border-border py-12 px-5 bg-muted/60"
      >
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-[11px] font-sans uppercase tracking-widest text-muted-foreground mb-4">
            How it works
          </p>
          <h3 className="font-serif text-xl italic text-foreground mb-4">
            Reserve. Pick up. Pay the farmer.
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left mt-6">
            {[
              {
                step: "01",
                title: "Reserve online",
                body: "Tell us what you want and we'll hold it for you. No payment needed now.",
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
              <div key={item.step} className="flex flex-col gap-2">
                <p className="font-serif text-3xl text-primary/40 leading-none">{item.step}</p>
                <p className="font-sans font-medium text-sm text-foreground">{item.title}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-muted-foreground/60 mt-8 italic">
            This is a pilot program by United Main. Reservations are confirmed by email. Pickup is not guaranteed if you arrive after market items sell out.
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
      <HeroSection nextMarketDate={data.nextMarketDate} />
      <WeekHighlightsSection vendors={data.vendors} />

      <div id="vendors">
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

      {data.vendors.length === 0 && (
        <section className="py-16 px-5 text-center">
          <p className="font-serif text-xl italic text-muted-foreground">
            Vendors are getting ready for market day.
          </p>
          <p className="text-sm text-muted-foreground mt-2">Check back soon.</p>
        </section>
      )}

      <TrustSection />

      <footer className="border-t border-border py-8 px-5 text-center">
        <a
          href="https://unitedmain.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[11px] font-sans text-muted-foreground/60 uppercase tracking-widest hover:text-primary transition-colors"
        >
          A United Main pilot &mdash; Stoneham, MA
        </a>
      </footer>

      <ReservationDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        product={selectedProduct}
        vendor={selectedVendor}
      />
    </div>
  );
}
