import { Router } from "express";
import { db, vendorsTable, productsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";

const router = Router();

router.get("/vendors", async (req, res) => {
  try {
    const vendors = await db
      .select()
      .from(vendorsTable)
      .where(eq(vendorsTable.status, "live"));

    const products = await db
      .select()
      .from(productsTable)
      .where(eq(productsTable.status, "live"));

    const productsByVendor: Record<number, typeof products> = {};
    for (const p of products) {
      if (!productsByVendor[p.vendorId]) productsByVendor[p.vendorId] = [];
      productsByVendor[p.vendorId].push(p);
    }

    const result = vendors.map((v) => ({
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

    res.json(result);
  } catch (err) {
    req.log.error({ err }, "Failed to list vendors");
    res.status(500).json({ error: "Failed to load vendors" });
  }
});

router.get("/vendors/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid vendor id" });
    return;
  }

  try {
    const [vendor] = await db
      .select()
      .from(vendorsTable)
      .where(eq(vendorsTable.id, id))
      .limit(1);

    if (!vendor) { res.status(404).json({ error: "Vendor not found" }); return; }

    const products = await db
      .select()
      .from(productsTable)
      .where(and(eq(productsTable.vendorId, id), eq(productsTable.status, "live")));

    res.json({
      id: vendor.id,
      name: vendor.name,
      description: vendor.description,
      location: vendor.location,
      website: vendor.website,
      instagram: vendor.instagram,
      facebook: vendor.facebook,
      imageUrl: vendor.imageUrl,
      launchMode: vendor.launchMode,
      status: vendor.status,
      marketDates: vendor.marketDates,
      pickupInstructions: vendor.pickupInstructions,
      products: products.map((p) => ({
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
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get vendor");
    res.status(500).json({ error: "Failed to load vendor" });
  }
});

export default router;
