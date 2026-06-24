import { Router, type Request, type Response, type NextFunction } from "express";
import { db, reservationsTable, vendorsTable, productsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";

const router = Router();

const ADMIN_PASSWORD = "farmerstogo";

function requireAdminAuth(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers["authorization"];
  if (!auth || auth !== `Bearer ${ADMIN_PASSWORD}`) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  next();
}

// ── Read routes (no auth required — data is non-sensitive) ──────────────────

router.get("/admin/reservations", async (req, res) => {
  try {
    const reservations = await db
      .select({
        id: reservationsTable.id,
        reservationCode: reservationsTable.reservationCode,
        productId: reservationsTable.productId,
        vendorId: reservationsTable.vendorId,
        vendorName: vendorsTable.name,
        productName: productsTable.name,
        shopperName: reservationsTable.shopperName,
        shopperEmail: reservationsTable.shopperEmail,
        shopperPhone: reservationsTable.shopperPhone,
        quantity: reservationsTable.quantity,
        note: reservationsTable.note,
        marketDate: reservationsTable.marketDate,
        createdAt: reservationsTable.createdAt,
      })
      .from(reservationsTable)
      .leftJoin(vendorsTable, eq(reservationsTable.vendorId, vendorsTable.id))
      .leftJoin(productsTable, eq(reservationsTable.productId, productsTable.id))
      .orderBy(sql`${reservationsTable.createdAt} desc`);

    res.json(
      reservations.map((r) => ({
        ...r,
        vendorName: r.vendorName ?? "Unknown",
        productName: r.productName ?? "Unknown",
        createdAt: r.createdAt?.toISOString() ?? new Date().toISOString(),
      }))
    );
  } catch (err) {
    req.log.error({ err }, "Failed to list admin reservations");
    res.status(500).json({ error: "Failed to load reservations" });
  }
});

router.get("/admin/vendors", async (req, res) => {
  try {
    const vendors = await db.select().from(vendorsTable);

    const productCounts = await db
      .select({
        vendorId: productsTable.vendorId,
        total: sql<number>`count(*)::int`,
        reservable: sql<number>`count(*) filter (where ${productsTable.reservationAllowed} = true)::int`,
      })
      .from(productsTable)
      .groupBy(productsTable.vendorId);

    const countMap: Record<number, { total: number; reservable: number }> = {};
    for (const row of productCounts) {
      countMap[row.vendorId] = { total: row.total, reservable: row.reservable };
    }

    res.json(
      vendors.map((v) => ({
        id: v.id,
        name: v.name,
        contactName: v.contactName,
        email: v.email,
        phone: v.phone,
        launchMode: v.launchMode,
        status: v.status,
        productCount: countMap[v.id]?.total ?? 0,
        reservableProductCount: countMap[v.id]?.reservable ?? 0,
      }))
    );
  } catch (err) {
    req.log.error({ err }, "Failed to list admin vendors");
    res.status(500).json({ error: "Failed to load vendors" });
  }
});

router.get("/admin/vendors/:id", async (req, res) => {
  try {
    const id = Number(req.params["id"]);
    const [vendor] = await db.select().from(vendorsTable).where(eq(vendorsTable.id, id));
    if (!vendor) { res.status(404).json({ error: "Vendor not found" }); return; }
    res.json(vendor);
  } catch (err) {
    req.log.error({ err }, "Failed to get vendor");
    res.status(500).json({ error: "Failed to get vendor" });
  }
});

router.get("/admin/vendors/:id/products", async (req, res) => {
  try {
    const vendorId = Number(req.params["id"]);
    const products = await db
      .select()
      .from(productsTable)
      .where(eq(productsTable.vendorId, vendorId))
      .orderBy(productsTable.id);
    res.json(products);
  } catch (err) {
    req.log.error({ err }, "Failed to get vendor products");
    res.status(500).json({ error: "Failed to get products" });
  }
});

// ── Write routes (auth required) ────────────────────────────────────────────

router.post("/admin/vendors", requireAdminAuth, async (req, res) => {
  try {
    const {
      name, contactName, email, phone, description, location,
      website, instagram, facebook, imageUrl, launchMode, status,
      marketDates, pickupInstructions,
    } = req.body as Record<string, string>;

    if (!name?.trim()) { res.status(400).json({ error: "Vendor name is required" }); return; }

    const [created] = await db.insert(vendorsTable).values({
      name: name.trim(),
      contactName: contactName || null,
      email: email || null,
      phone: phone || null,
      description: description || null,
      location: location || null,
      website: website || null,
      instagram: instagram || null,
      facebook: facebook || null,
      imageUrl: imageUrl || null,
      launchMode: launchMode || "profile_only",
      status: status || "draft",
      marketDates: marketDates || null,
      pickupInstructions: pickupInstructions || null,
    }).returning();

    res.status(201).json(created);
  } catch (err) {
    req.log.error({ err }, "Failed to create vendor");
    res.status(500).json({ error: "Failed to create vendor" });
  }
});

router.put("/admin/vendors/:id", requireAdminAuth, async (req, res) => {
  try {
    const id = Number(req.params["id"]);
    const {
      name, contactName, email, phone, description, location,
      website, instagram, facebook, imageUrl, launchMode, status,
      marketDates, pickupInstructions,
    } = req.body as Record<string, string>;

    if (!name?.trim()) { res.status(400).json({ error: "Vendor name is required" }); return; }

    const [updated] = await db
      .update(vendorsTable)
      .set({
        name: name.trim(),
        contactName: contactName || null,
        email: email || null,
        phone: phone || null,
        description: description || null,
        location: location || null,
        website: website || null,
        instagram: instagram || null,
        facebook: facebook || null,
        imageUrl: imageUrl || null,
        launchMode: launchMode || "profile_only",
        status: status || "draft",
        marketDates: marketDates || null,
        pickupInstructions: pickupInstructions || null,
        updatedAt: new Date(),
      })
      .where(eq(vendorsTable.id, id))
      .returning();

    if (!updated) { res.status(404).json({ error: "Vendor not found" }); return; }
    res.json(updated);
  } catch (err) {
    req.log.error({ err }, "Failed to update vendor");
    res.status(500).json({ error: "Failed to update vendor" });
  }
});

router.post("/admin/vendors/:id/products", requireAdminAuth, async (req, res) => {
  try {
    const vendorId = Number(req.params["id"]);
    const {
      name, description, price, imageUrl, reservationAllowed,
      quantityAvailable, maxPerReservation, status,
    } = req.body as Record<string, string>;

    if (!name?.trim()) { res.status(400).json({ error: "Product name is required" }); return; }

    const [created] = await db.insert(productsTable).values({
      vendorId,
      name: name.trim(),
      description: description || null,
      price: price || null,
      imageUrl: imageUrl || null,
      reservationAllowed: reservationAllowed === "true" || reservationAllowed === true as unknown as string,
      quantityAvailable: quantityAvailable ? Number(quantityAvailable) : null,
      maxPerReservation: maxPerReservation ? Number(maxPerReservation) : null,
      status: status || "draft",
    }).returning();

    res.status(201).json(created);
  } catch (err) {
    req.log.error({ err }, "Failed to create product");
    res.status(500).json({ error: "Failed to create product" });
  }
});

router.put("/admin/products/:id", requireAdminAuth, async (req, res) => {
  try {
    const id = Number(req.params["id"]);
    const {
      name, description, price, imageUrl, reservationAllowed,
      quantityAvailable, maxPerReservation, status,
    } = req.body as Record<string, string>;

    if (!name?.trim()) { res.status(400).json({ error: "Product name is required" }); return; }

    const [updated] = await db
      .update(productsTable)
      .set({
        name: name.trim(),
        description: description || null,
        price: price || null,
        imageUrl: imageUrl || null,
        reservationAllowed: reservationAllowed === "true" || reservationAllowed === true as unknown as string,
        quantityAvailable: quantityAvailable ? Number(quantityAvailable) : null,
        maxPerReservation: maxPerReservation ? Number(maxPerReservation) : null,
        status: status || "draft",
      })
      .where(eq(productsTable.id, id))
      .returning();

    if (!updated) { res.status(404).json({ error: "Product not found" }); return; }
    res.json(updated);
  } catch (err) {
    req.log.error({ err }, "Failed to update product");
    res.status(500).json({ error: "Failed to update product" });
  }
});

router.delete("/admin/products/:id", requireAdminAuth, async (req, res) => {
  try {
    const id = Number(req.params["id"]);
    await db.delete(productsTable).where(eq(productsTable.id, id));
    res.json({ success: true });
  } catch (err) {
    req.log.error({ err }, "Failed to delete product");
    res.status(500).json({ error: "Failed to delete product" });
  }
});

export default router;
