import type { Config, Context } from "@netlify/functions";
import { db } from "../../db/index.js";
import { bookings, sellers } from "../../db/schema.js";
import { eq, desc } from "drizzle-orm";

export default async (req: Request, context: Context) => {
  const url = new URL(req.url);
  const pathname = url.pathname;

  // POST /api/bookings/create
  if (req.method === "POST" && pathname.endsWith("/create")) {
    const body = await req.json();
    const { sellerId, customerName, customerPhone, quantity, pickupTime } = body;

    const [seller] = await db.select().from(sellers).where(eq(sellers.id, sellerId));
    if (!seller) {
      return Response.json({ message: "Seller not found" }, { status: 400 });
    }

    const [booking] = await db
      .insert(bookings)
      .values({ sellerId, customerName, customerPhone, quantity: parseInt(quantity), pickupTime })
      .returning();

    return Response.json({ message: "Booking created successfully", booking }, { status: 200 });
  }

  // GET /api/bookings/seller/:sellerId
  if (req.method === "GET" && pathname.match(/\/api\/bookings\/seller\/\d+$/)) {
    const sellerId = parseInt(context.params.sellerId);

    const [seller] = await db.select().from(sellers).where(eq(sellers.id, sellerId));
    if (!seller) {
      return Response.json({ message: "Seller not found" }, { status: 400 });
    }

    const sellerBookings = await db
      .select()
      .from(bookings)
      .where(eq(bookings.sellerId, sellerId))
      .orderBy(desc(bookings.createdAt));

    return Response.json(sellerBookings, { status: 200 });
  }

  return new Response("Not found", { status: 404 });
};

export const config: Config = {
  path: ["/api/bookings/create", "/api/bookings/seller/:sellerId"],
};
