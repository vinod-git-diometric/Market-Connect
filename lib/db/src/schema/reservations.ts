import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";

export const reservationsTable = pgTable("reservations", {
  id: serial("id").primaryKey(),
  reservationCode: text("reservation_code").notNull(),
  productId: integer("product_id").notNull(),
  vendorId: integer("vendor_id").notNull(),
  shopperName: text("shopper_name").notNull(),
  shopperEmail: text("shopper_email").notNull(),
  shopperPhone: text("shopper_phone").notNull(),
  quantity: integer("quantity").notNull().default(1),
  note: text("note"),
  marketDate: text("market_date"),
  createdAt: timestamp("created_at").defaultNow(),
});

export type Reservation = typeof reservationsTable.$inferSelect;
export type InsertReservation = typeof reservationsTable.$inferInsert;
