import type { Config, Context } from "@netlify/functions";
import { db } from "../../db/index.js";
import { sellers } from "../../db/schema.js";
import { eq } from "drizzle-orm";

export default async (req: Request, context: Context) => {
  const url = new URL(req.url);
  const pathname = url.pathname;

  // POST /api/seller/register
  if (req.method === "POST" && pathname.endsWith("/register")) {
    const body = await req.json();
    const { name, phone, password, village, latitude, longitude } = body;

    const existing = await db.select().from(sellers).where(eq(sellers.phone, phone));
    if (existing.length > 0) {
      return Response.json({ message: "Phone number already registered" }, { status: 400 });
    }

    const [seller] = await db
      .insert(sellers)
      .values({ name, phone, password, village, latitude: latitude ?? null, longitude: longitude ?? null })
      .returning();

    const { password: _, ...safeSellerData } = seller;
    return Response.json(safeSellerData, { status: 200 });
  }

  // POST /api/seller/login
  if (req.method === "POST" && pathname.endsWith("/login")) {
    const body = await req.json();
    const { phone, password } = body;

    if (!phone || !password) {
      return Response.json({ message: "Phone and password are required" }, { status: 400 });
    }

    const [seller] = await db.select().from(sellers).where(eq(sellers.phone, phone));
    if (!seller || seller.password !== password) {
      return Response.json({ message: "Invalid credentials" }, { status: 401 });
    }

    const { password: _, ...safeSellerData } = seller;
    return Response.json(safeSellerData, { status: 200 });
  }

  // POST /api/seller/:id/rate
  if (req.method === "POST" && pathname.match(/\/api\/seller\/\d+\/rate$/)) {
    const id = parseInt(context.params.id);
    const body = await req.json();
    const { rating } = body;

    const [seller] = await db.select().from(sellers).where(eq(sellers.id, id));
    if (!seller) {
      return Response.json({ message: "Seller not found" }, { status: 400 });
    }

    const currentTotal = (seller.rating ?? 0) * (seller.ratingCount ?? 0);
    const newCount = (seller.ratingCount ?? 0) + 1;
    const newRating = Math.round(((currentTotal + rating) / newCount) * 10) / 10;

    const [updated] = await db
      .update(sellers)
      .set({ rating: newRating, ratingCount: newCount })
      .where(eq(sellers.id, id))
      .returning();

    const { password: _, ...safeSellerData } = updated;
    return Response.json(safeSellerData, { status: 200 });
  }

  // GET /api/seller/all
  if (req.method === "GET" && pathname.endsWith("/all")) {
    const allSellers = await db.select({
      id: sellers.id,
      name: sellers.name,
      phone: sellers.phone,
      village: sellers.village,
      latitude: sellers.latitude,
      longitude: sellers.longitude,
      rating: sellers.rating,
      ratingCount: sellers.ratingCount,
      createdAt: sellers.createdAt,
    }).from(sellers);
    return Response.json(allSellers, { status: 200 });
  }

  // GET /api/seller/profile/:id
  if (req.method === "GET" && pathname.match(/\/api\/seller\/profile\/\d+$/)) {
    const id = parseInt(context.params.id);
    const [seller] = await db.select({
      id: sellers.id,
      name: sellers.name,
      phone: sellers.phone,
      village: sellers.village,
      latitude: sellers.latitude,
      longitude: sellers.longitude,
      rating: sellers.rating,
      ratingCount: sellers.ratingCount,
      createdAt: sellers.createdAt,
    }).from(sellers).where(eq(sellers.id, id));

    if (!seller) {
      return new Response("Not found", { status: 404 });
    }
    return Response.json(seller, { status: 200 });
  }

  return new Response("Not found", { status: 404 });
};

export const config: Config = {
  path: ["/api/seller/all", "/api/seller/register", "/api/seller/login", "/api/seller/:id/rate", "/api/seller/profile/:id"],
};
