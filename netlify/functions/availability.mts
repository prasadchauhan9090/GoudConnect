import type { Config, Context } from "@netlify/functions";
import { db } from "../../db/index.js";
import { availability, sellers } from "../../db/schema.js";
import { eq, and } from "drizzle-orm";

function todayDate(): string {
  return new Date().toISOString().split("T")[0];
}

export default async (req: Request, context: Context) => {
  const url = new URL(req.url);
  const pathname = url.pathname;

  // GET /api/availability/all-today
  if (req.method === "GET" && pathname.endsWith("/all-today")) {
    const today = todayDate();
    const rows = await db
      .select({
        id: availability.id,
        date: availability.date,
        morningAvailable: availability.morningAvailable,
        eveningAvailable: availability.eveningAvailable,
        stockCount: availability.stockCount,
        seller: {
          id: sellers.id,
          name: sellers.name,
          phone: sellers.phone,
          village: sellers.village,
          latitude: sellers.latitude,
          longitude: sellers.longitude,
          rating: sellers.rating,
          ratingCount: sellers.ratingCount,
        },
      })
      .from(availability)
      .innerJoin(sellers, eq(availability.sellerId, sellers.id))
      .where(eq(availability.date, today));

    return Response.json(rows, { status: 200 });
  }

  // GET /api/availability/today/:sellerId
  if (req.method === "GET" && pathname.match(/\/api\/availability\/today\/\d+$/)) {
    const sellerId = parseInt(context.params.sellerId);
    const today = todayDate();

    const [sellerRow] = await db.select().from(sellers).where(eq(sellers.id, sellerId));
    if (!sellerRow) {
      return Response.json({ message: "Seller not found" }, { status: 400 });
    }

    const [avail] = await db
      .select()
      .from(availability)
      .where(and(eq(availability.sellerId, sellerId), eq(availability.date, today)));

    if (avail) {
      return Response.json({
        id: avail.id,
        morningAvailable: avail.morningAvailable,
        eveningAvailable: avail.eveningAvailable,
        stockCount: avail.stockCount,
        date: avail.date,
        seller: { id: sellerRow.id },
      }, { status: 200 });
    }

    return Response.json({
      morningAvailable: false,
      eveningAvailable: false,
      stockCount: 0,
      date: today,
      seller: { id: sellerRow.id },
    }, { status: 200 });
  }

  // POST /api/availability/update
  if (req.method === "POST" && pathname.endsWith("/update")) {
    const body = await req.json();
    const { sellerId, morningAvailable, eveningAvailable, stockCount } = body;
    const today = todayDate();

    const [sellerRow] = await db.select().from(sellers).where(eq(sellers.id, sellerId));
    if (!sellerRow) {
      return Response.json({ message: "Seller not found" }, { status: 400 });
    }

    const [existing] = await db
      .select()
      .from(availability)
      .where(and(eq(availability.sellerId, sellerId), eq(availability.date, today)));

    let avail;
    if (existing) {
      [avail] = await db
        .update(availability)
        .set({ morningAvailable, eveningAvailable, stockCount })
        .where(eq(availability.id, existing.id))
        .returning();
    } else {
      [avail] = await db
        .insert(availability)
        .values({ sellerId, date: today, morningAvailable, eveningAvailable, stockCount })
        .returning();
    }

    return Response.json(avail, { status: 200 });
  }

  return new Response("Not found", { status: 404 });
};

export const config: Config = {
  path: ["/api/availability/all-today", "/api/availability/today/:sellerId", "/api/availability/update"],
};
