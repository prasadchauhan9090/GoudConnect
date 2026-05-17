import { pgTable, serial, text, integer, boolean, doublePrecision, timestamp, date, unique } from "drizzle-orm/pg-core";

export const sellers = pgTable("sellers", {
  id: serial().primaryKey(),
  name: text().notNull(),
  phone: text().notNull().unique(),
  password: text().notNull(),
  village: text().notNull(),
  latitude: doublePrecision("latitude"),
  longitude: doublePrecision("longitude"),
  rating: doublePrecision("rating").default(0),
  ratingCount: integer("rating_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const availability = pgTable("availability", {
  id: serial().primaryKey(),
  sellerId: integer("seller_id").notNull().references(() => sellers.id),
  date: date("date").notNull(),
  morningAvailable: boolean("morning_available").default(false),
  eveningAvailable: boolean("evening_available").default(false),
  stockCount: integer("stock_count").default(0),
}, (t) => [unique().on(t.sellerId, t.date)]);

export const bookings = pgTable("bookings", {
  id: serial().primaryKey(),
  sellerId: integer("seller_id").notNull().references(() => sellers.id),
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone").notNull(),
  quantity: integer("quantity").notNull(),
  pickupTime: text("pickup_time").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});
