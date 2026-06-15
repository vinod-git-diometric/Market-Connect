import { Router } from "express";
import { db, reservationsTable, productsTable, vendorsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { sendReservationEmails } from "../lib/email";
import { CreateReservationBody } from "@workspace/api-zod";

const router = Router();

function generateReservationCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "UM-";
  for (let i = 0; i < 4; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

router.post("/reservations", async (req, res): Promise<void> => {
  const parsed = CreateReservationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid reservation data" });
    return;
  }

  const { productId, shopperName, shopperEmail, shopperPhone, quantity, note } = parsed.data;

  try {
    const [product] = await db
      .select()
      .from(productsTable)
      .where(eq(productsTable.id, productId))
      .limit(1);

    if (!product) { res.status(404).json({ error: "Product not found" }); return; }
    if (!product.reservationAllowed) {
      res.status(400).json({ error: "This product does not accept reservations" });
      return;
    }

    const [vendor] = await db
      .select()
      .from(vendorsTable)
      .where(eq(vendorsTable.id, product.vendorId))
      .limit(1);

    if (!vendor) { res.status(404).json({ error: "Vendor not found" }); return; }

    const reservationCode = generateReservationCode();
    const marketDate = vendor.marketDates || null;

    const [reservation] = await db
      .insert(reservationsTable)
      .values({
        reservationCode,
        productId,
        vendorId: product.vendorId,
        shopperName,
        shopperEmail,
        shopperPhone,
        quantity,
        note: note || null,
        marketDate,
      })
      .returning();

    sendReservationEmails({
      shopperName,
      shopperEmail,
      shopperPhone,
      vendorName: vendor.name,
      vendorEmail: vendor.email,
      productName: product.name,
      quantity,
      note: note || null,
      reservationCode,
      marketDate,
    }).catch((err) => req.log.error({ err }, "Email send failed"));

    res.status(201).json({
      id: reservation.id,
      reservationCode: reservation.reservationCode,
      productId: reservation.productId,
      vendorId: reservation.vendorId,
      shopperName: reservation.shopperName,
      shopperEmail: reservation.shopperEmail,
      shopperPhone: reservation.shopperPhone,
      quantity: reservation.quantity,
      note: reservation.note,
      marketDate: reservation.marketDate,
      createdAt: reservation.createdAt!.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to create reservation");
    res.status(500).json({ error: "Failed to create reservation" });
  }
});

export default router;
