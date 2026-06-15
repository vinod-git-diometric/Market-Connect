import { pgTable, serial, text, boolean, integer, timestamp } from "drizzle-orm/pg-core";

export const productsTable = pgTable("products", {
  id: serial("id").primaryKey(),
  vendorId: integer("vendor_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  price: text("price"),
  imageUrl: text("image_url"),
  reservationAllowed: boolean("reservation_allowed").notNull().default(false),
  pickupNote: text("pickup_note"),
  allergenNote: text("allergen_note"),
  quantityAvailable: integer("quantity_available"),
  maxPerReservation: integer("max_per_reservation"),
  status: text("status").notNull().default("draft"),
  createdAt: timestamp("created_at").defaultNow(),
});

export type Product = typeof productsTable.$inferSelect;
export type InsertProduct = typeof productsTable.$inferInsert;
