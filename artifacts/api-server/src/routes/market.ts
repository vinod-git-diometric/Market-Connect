import { Router } from "express";
import { db, vendorsTable, productsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";

const router = Router();

router.get("/market", async (req, res) => {
  try {
    const vendors = await db
      .select()
      .from(vendorsTable)
      .where(eq(vendorsTable.status, "live"));

    const vendorIds = vendors.map((v) => v.id);

    const products =
      vendorIds.length > 0
        ? await db
            .select()
            .from(productsTable)
            .where(
              and(
                eq(productsTable.status, "live")
              )
            )
        : [];

    const productsByVendor: Record<number, typeof products> = {};
    for (const p of products) {
      if (!productsByVendor[p.vendorId]) productsByVendor[p.vendorId] = [];
      productsByVendor[p.vendorId].push(p);
    }

    // Sort: pinned vendors first, then alphabetical
    const PINNED_ORDER = ["Riverdale Farm", "Wilmington Honey Bee", "Crave Creations"];
    vendors.sort((a, b) => {
      const ai = PINNED_ORDER.indexOf(a.name);
      const bi = PINNED_ORDER.indexOf(b.name);
      if (ai !== -1 && bi !== -1) return ai - bi;
      if (ai !== -1) return -1;
      if (bi !== -1) return 1;
      return a.name.localeCompare(b.name);
    });

    const vendorsWithProducts = vendors.map((v) => ({
      id: v.id,
      name: v.name,
      description: v.description,
      location: v.location,
      website: v.website,
      instagram: v.instagram,
      facebook: v.facebook,
      imageUrl: v.imageUrl,
      launchMode: v.launchMode,
      status: v.status,
      marketDates: v.marketDates,
      pickupInstructions: v.pickupInstructions,
      products: (productsByVendor[v.id] || []).map((p) => ({
        id: p.id,
        vendorId: p.vendorId,
        name: p.name,
        description: p.description,
        price: p.price,
        imageUrl: p.imageUrl,
        reservationAllowed: p.reservationAllowed,
        pickupNote: p.pickupNote,
        allergenNote: p.allergenNote,
        quantityAvailable: p.quantityAvailable,
        maxPerReservation: p.maxPerReservation,
        status: p.status,
      })),
    }));

    // Derive next market date from vendor data (strip time portion if present)
    const rawDate = vendors[0]?.marketDates ?? "";
    const nextMarketDate = rawDate.split("·")[0].trim();

    res.json({
      nextMarketDate,
      vendors: vendorsWithProducts,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get market page");
    res.status(500).json({ error: "Failed to load market data" });
  }
})

export default router;
