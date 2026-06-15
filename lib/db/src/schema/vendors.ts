import { pgTable, serial, text, boolean, integer, timestamp } from "drizzle-orm/pg-core";

export const vendorsTable = pgTable("vendors", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  contactName: text("contact_name"),
  email: text("email"),
  phone: text("phone"),
  description: text("description"),
  location: text("location"),
  website: text("website"),
  instagram: text("instagram"),
  facebook: text("facebook"),
  imageUrl: text("image_url"),
  launchMode: text("launch_mode").notNull().default("profile_only"),
  status: text("status").notNull().default("public_info_drafted"),
  marketDates: text("market_dates"),
  pickupInstructions: text("pickup_instructions"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type Vendor = typeof vendorsTable.$inferSelect;
export type InsertVendor = typeof vendorsTable.$inferInsert;
