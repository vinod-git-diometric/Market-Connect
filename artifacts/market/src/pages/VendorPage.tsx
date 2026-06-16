import { useState, useEffect } from "react";
import { useRoute, Link } from "wouter";
import { motion } from "framer-motion";
import { useGetVendor, getGetVendorQueryKey } from "@workspace/api-client-react";
import type { Product } from "@workspace/api-client-react";
import ReservationDrawer from "@/components/ReservationDrawer";
import UnitedMainHeader from "@/components/UnitedMainHeader";

import belliniImg from "@/assets/bellini-logo.png";
import delsurImg from "@/assets/vendor-delsur.png";
import honeybeeImg from "@/assets/vendor-honeybee.png";
import craveImg from "@/assets/crave-logo.jpeg";
import craveProductWaffle from "@/assets/crave-waffle-pistachio.jpeg";
import craveProductPancakes from "@/assets/crave-pancakes.jpeg";
import craveProductMocktail from "@/assets/crave-mocktail.jpeg";
import spiceweaselImg from "@/assets/vendor-spiceweasel.png";
import riverdaleImg from "@/assets/vendor-riverdale-real.jpg";
import riverdaleProductTomatoes from "@/assets/riverdale-tomatoes.jpg";
import riverdaleProductBlueberries from "@/assets/riverdale-blueberries.jpg";
import riverdaleProductPeppers from "@/assets/riverdale-peppers.jpg";
import riverdaleProductEggplant from "@/assets/riverdale-eggplant.jpg";
import riverdaleProductApples from "@/assets/riverdale-apples.jpg";
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

const productImages: Record<number, string> = {
  17: riverdaleProductTomatoes,
  18: riverdaleProductBlueberries,
  19: riverdaleProductPeppers,
  20: riverdaleProductEggplant,
  21: riverdaleProductApples,
  22: craveProductWaffle,
  23: craveProductPancakes,
  25: craveProductMocktail,
};

function getVendorImage(name: string, imageUrl?: string | null): string | undefined {
  if (imageUrl) return imageUrl;
  return vendorImages[name];
}

export default function VendorPage() {
  const [, params] = useRoute("/vendors/:id");
  const id = params?.id ? parseInt(params.id, 10) : null;

  const { data: vendor, isLoading, isError } = useGetVendor(
    id ?? 0,
    { query: { enabled: !!id, queryKey: getGetVendorQueryKey(id ?? 0) } }
  );

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  function handleReserve(product: Product) {
    setSelectedProduct(product);
    setDrawerOpen(true);
  }

  if (isLoading) return <VendorSkeleton />;

  if (isError || !vendor) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-5">
        <p className="font-serif text-xl italic text-foreground mb-2">Vendor not found</p>
        <Link href="/market" className="text-xs font-sans text-primary hover:underline mt-2">
          Back to market
        </Link>
      </div>
    );
  }

  const image = getVendorImage(vendor.name, vendor.imageUrl);
  const liveProducts = vendor.products.filter((p) => p.status === "live");
  const reservableProducts = liveProducts.filter((p) => p.reservationAllowed);
  const featuredProducts = liveProducts.filter((p) => !p.reservationAllowed);
  const isProfileOnly = vendor.launchMode === "profile_only";
  const canReserve = vendor.launchMode === "reserve_for_pickup";

  return (
    <div className="min-h-screen bg-background" data-testid={`vendor-page-${vendor.id}`}>
      <UnitedMainHeader />
      {/* Back nav */}
      <nav className="px-5 pt-4 pb-2 max-w-2xl mx-auto">
        <Link
          href="/market"
          data-testid="back-to-market"
          className="inline-flex items-center gap-1.5 text-[11px] font-sans uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
        >
          <span aria-hidden>←</span> Stoneham Farmers Market
        </Link>
      </nav>

      {/* Hero image */}
      {image && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="w-full h-[200px] md:h-[280px] overflow-hidden"
        >
          <img
            src={image}
            alt={vendor.name}
            className="w-full h-full object-cover object-center"
          />
        </motion.div>
      )}

      <div className="max-w-2xl mx-auto px-5">
        {/* Vendor identity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="pt-8 pb-6 border-b border-border"
        >
          {vendor.location && (
            <p className="text-[11px] font-sans uppercase tracking-widest text-muted-foreground mb-2">
              {vendor.location}
            </p>
          )}
          <h1 className="font-serif text-4xl md:text-5xl italic text-foreground leading-tight mb-4">
            {vendor.name}
          </h1>
          {vendor.description && (
            <p className="text-sm text-muted-foreground leading-relaxed mb-5">
              {vendor.description}
            </p>
          )}

          {/* Market date */}
          {vendor.marketDates && (
            <div className="inline-flex items-center gap-2 border border-border rounded-[4px] px-3 py-1.5 mb-4">
              <span className="text-[10px] font-sans uppercase tracking-widest text-muted-foreground">
                Next market
              </span>
              <span className="text-xs font-sans font-medium text-foreground">
                {vendor.marketDates}
              </span>
            </div>
          )}

          {/* Social / website links */}
          <div className="flex flex-wrap gap-4 mt-2">
            {vendor.website && (
              <a
                href={vendor.website}
                target="_blank"
                rel="noopener noreferrer"
                data-testid="vendor-website-link"
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
                data-testid="vendor-instagram-link"
                className="text-[11px] font-sans uppercase tracking-widest text-primary hover:underline"
              >
                Instagram
              </a>
            )}
            {vendor.facebook && (
              <a
                href={vendor.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] font-sans uppercase tracking-widest text-primary hover:underline"
              >
                Facebook
              </a>
            )}
          </div>
        </motion.div>

        {/* Products section */}
        {isProfileOnly ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="py-12 text-center"
          >
            <p className="font-serif text-xl italic text-muted-foreground mb-2">
              Still stocking their digital table.
            </p>
            <p className="text-sm text-muted-foreground">
              Check back as the market date approaches.
            </p>
          </motion.div>
        ) : liveProducts.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="py-8"
          >
            <p className="text-[11px] font-sans uppercase tracking-widest text-muted-foreground mb-5">
              {canReserve ? "Reserve for pickup" : "At the market this week"}
            </p>

            <div className="flex flex-col gap-4" data-testid="vendor-page-products">
              {liveProducts.map((product, i) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  canReserve={canReserve}
                  delay={i * 0.05}
                  onReserve={handleReserve}
                />
              ))}
            </div>

            {/* Pickup instructions */}
            {vendor.pickupInstructions && canReserve && (
              <div className="mt-8 border-l-2 border-primary/30 pl-4">
                <p className="text-[11px] font-sans uppercase tracking-widest text-muted-foreground mb-1">
                  Pickup instructions
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {vendor.pickupInstructions}
                </p>
              </div>
            )}
          </motion.div>
        ) : null}

        {/* Trust note */}
        {canReserve && reservableProducts.length > 0 && (
          <div className="border-t border-border py-8 mb-8">
            <p className="text-[11px] text-muted-foreground/70 italic text-center">
              Reservations are confirmed by email. Payment happens directly with {vendor.name} at the booth.
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-5 text-center mt-4">
        <Link
          href="/market"
          className="text-[11px] font-sans uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Back to all vendors
        </Link>
        <a
          href="https://unitedmain.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] font-sans text-muted-foreground/50 uppercase tracking-widest mt-3 block hover:text-primary transition-colors"
        >
          A United Main pilot &mdash; Stoneham, MA
        </a>
      </footer>

      <ReservationDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        product={selectedProduct}
        vendor={vendor as Parameters<typeof ReservationDrawer>[0]["vendor"]}
      />
    </div>
  );
}

function ProductCard({
  product,
  canReserve,
  delay,
  onReserve,
}: {
  product: Product;
  canReserve: boolean;
  delay: number;
  onReserve: (product: Product) => void;
}) {
  const productImg = product.imageUrl || productImages[product.id];
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] }}
      data-testid={`vendor-page-product-${product.id}`}
      className="border border-border rounded-[4px] bg-card overflow-hidden"
    >
      {productImg && (
        <div className="w-full h-40 overflow-hidden">
          <img
            src={productImg}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <p className="font-sans font-medium text-foreground leading-snug">{product.name}</p>
            {product.price && (
              <p className="text-sm text-primary mt-0.5 font-medium">{product.price}</p>
            )}
          </div>
          {canReserve && product.reservationAllowed && (
            <button
              onClick={() => onReserve(product)}
              data-testid={`reserve-btn-${product.id}`}
              className="flex-shrink-0 text-xs font-sans font-medium bg-primary text-primary-foreground rounded-[4px] px-4 py-2 hover:opacity-90 transition-opacity whitespace-nowrap"
            >
              Reserve
            </button>
          )}
        </div>
        {product.description && (
          <p className="text-sm text-muted-foreground leading-relaxed mt-2">{product.description}</p>
        )}
        {product.allergenNote && (
          <p className="text-[11px] text-muted-foreground/60 italic mt-2">{product.allergenNote}</p>
        )}
        {product.maxPerReservation && canReserve && product.reservationAllowed && (
          <p className="text-[11px] text-muted-foreground/60 mt-1">
            Max {product.maxPerReservation} per reservation
          </p>
        )}
      </div>
    </motion.div>
  );
}

function VendorSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="w-full aspect-[16/7] bg-muted animate-pulse" />
      <div className="max-w-2xl mx-auto px-5 pt-8 space-y-4">
        <div className="h-3 w-20 bg-muted rounded animate-pulse" />
        <div className="h-10 w-64 bg-muted rounded animate-pulse" />
        <div className="h-3 w-full bg-muted rounded animate-pulse" />
        <div className="h-3 w-4/5 bg-muted rounded animate-pulse" />
        <div className="h-3 w-3/5 bg-muted rounded animate-pulse" />
      </div>
    </div>
  );
}
