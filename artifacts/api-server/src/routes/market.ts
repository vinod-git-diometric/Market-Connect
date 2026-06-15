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

    const nextMarketDate = getNextMarketDate();

    res.json({
      nextMarketDate,
      vendors: vendorsWithProducts,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get market page");
    res.status(500).json({ error: "Failed to load market data" });
  }
});

function getNextMarketDate(): string {
  const now = new Date();
  const day = now.getDay();
  const daysUntilSaturday = (4 - day + 7) % 7 || 7;
  const next = new Date(now);
  next.setDate(now.getDate() + daysUntilSaturday);
  return next.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export default router;
