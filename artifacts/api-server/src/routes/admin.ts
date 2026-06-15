import { Router } from "express";
import { db, reservationsTable, vendorsTable, productsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";

const router = Router();

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

export default router;
